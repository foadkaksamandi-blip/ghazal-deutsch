(function () {
  "use strict";

  const OS_KEY = "ghazal_deutsch_os_v1";
  const APP_KEY = "ghazal_deutsch_state_v1";
  const view = document.getElementById("view");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  let activeSpeech = null;
  let activeWriting = null;

  const SKILLS = [
    ["listening", "Hören", "شنیدن"],
    ["reading", "Lesen", "خواندن"],
    ["writing", "Schreiben", "نوشتن"],
    ["speaking", "Sprechen", "مکالمه"],
    ["grammar", "Grammatik", "گرامر"],
    ["vocabulary", "Wortschatz", "واژگان"],
    ["pronunciation", "Aussprache", "تلفظ"],
    ["migration", "Migration", "مهاجرت"],
    ["career", "Beruf", "کار"],
    ["university", "Universität", "دانشگاه"],
    ["exam", "Prüfung", "آزمون"]
  ];

  function h(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function native(method, ...args) {
    try {
      if (window.GhazalAndroid && typeof window.GhazalAndroid[method] === "function") {
        return window.GhazalAndroid[method](...args);
      }
    } catch (_) {}
    return undefined;
  }

  function appState() {
    try { return JSON.parse(localStorage.getItem(APP_KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function defaultOsState() {
    const skills = {};
    SKILLS.forEach(([id]) => {
      skills[id] = { attempts: 0, total: 0, best: 0, lastAt: null };
    });
    return { version: 1, skills };
  }

  function osState() {
    const base = defaultOsState();
    try {
      const raw = JSON.parse(localStorage.getItem(OS_KEY) || "{}");
      SKILLS.forEach(([id]) => {
        base.skills[id] = { ...base.skills[id], ...((raw.skills && raw.skills[id]) || {}) };
      });
      return { ...base, ...raw, skills: base.skills };
    } catch (_) {
      return base;
    }
  }

  function saveOs(state) {
    localStorage.setItem(OS_KEY, JSON.stringify(state));
  }

  function logSkill(id, score) {
    const state = osState();
    const skill = state.skills[id] || { attempts: 0, total: 0, best: 0, lastAt: null };
    const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
    skill.attempts += 1;
    skill.total += safeScore;
    skill.best = Math.max(skill.best || 0, safeScore);
    skill.lastAt = new Date().toISOString();
    state.skills[id] = skill;
    saveOs(state);
  }

  function mastery(skill) {
    const attempts = Number(skill.attempts) || 0;
    const avg = attempts ? (Number(skill.total) || 0) / attempts : 0;
    if (!attempts) return ["New", 0];
    if (attempts < 3) return ["Learning", Math.round(avg)];
    if (attempts < 6) return ["Developing", Math.round(avg)];
    if (attempts >= 12 && avg >= 90) return ["Mastered", Math.round(avg)];
    if (attempts >= 8 && avg >= 82) return ["Strong", Math.round(avg)];
    if (avg >= 68) return ["Functional", Math.round(avg)];
    return ["Needs Review", Math.round(avg)];
  }

  function currentLevel() {
    const state = appState();
    return state.profile && state.profile.level ? state.profile.level : "A1";
  }

  function lessonPool() {
    const data = window.GhazalData;
    if (!data || !Array.isArray(data.lessons)) return [];
    const level = currentLevel();
    const same = data.lessons.filter(item => item.level === level);
    return same.length ? same : data.lessons;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function pickDialogue() {
    const lesson = randomItem(lessonPool());
    if (!lesson || !Array.isArray(lesson.dialogue) || !lesson.dialogue.length) return null;
    const pair = randomItem(lesson.dialogue);
    return { lesson, de: pair[0], fa: pair[1] };
  }

  function normalize(text) {
    return String(text || "")
      .toLocaleLowerCase("de-DE")
      .replace(/[.,!?;:„“"'()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function levenshtein(a, b) {
    const s = normalize(a);
    const t = normalize(b);
    const rows = s.length + 1;
    const cols = t.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i += 1) dp[i][0] = i;
    for (let j = 0; j < cols; j += 1) dp[0][j] = j;
    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        const cost = s[i - 1] === t[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[s.length][t.length];
  }

  function similarity(a, b) {
    const aa = normalize(a);
    const bb = normalize(b);
    if (!aa && !bb) return 100;
    const longest = Math.max(aa.length, bb.length, 1);
    return Math.max(0, Math.round((1 - levenshtein(aa, bb) / longest) * 100));
  }

  function openOsModal(html) {
    if (!modal || !modalContent) return;
    modalContent.innerHTML = html;
    modal.dataset.locked = "false";
    modal.hidden = false;
    modalContent.scrollTop = 0;
  }

  function closeOsModal() {
    if (!modal || !modalContent) return;
    native("stopSpeaking");
    modal.hidden = true;
    modalContent.innerHTML = "";
    activeSpeech = null;
    activeWriting = null;
  }

  function showSpeaking() {
    activeSpeech = pickDialogue();
    if (!activeSpeech) return;
    openOsModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span class="level-badge">${h(activeSpeech.lesson.level)} · Speaking</span><h2>مکالمه و تلفظ</h2><p>جمله را بدون نگاه‌کردن به جواب آلمانی بگو.</p></div><button class="close-button" data-os-action="close">×</button></div>
      <div class="os-mission"><span>موقعیت</span><strong>${h(activeSpeech.fa)}</strong></div>
      <button class="primary-button" data-os-action="record-speech">🎙 شروع صحبت</button>
      <button class="secondary-button" style="margin-top:9px" data-os-action="hear-model">🔊 شنیدن نمونه</button>
      <div id="os-speech-result" class="os-result" hidden></div>
      <p class="os-note">برای کار آفلاین بهتر، بسته تشخیص گفتار آلمانی را در تنظیمات زبان گوشی دانلود کن. این سنجش، تشخیص گفتار است و جای ارزیابی تخصصی آواشناسی را نمی‌گیرد.</p>
    `);
  }

  function showWriting() {
    activeWriting = pickDialogue();
    if (!activeWriting) return;
    openOsModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span class="level-badge">${h(activeWriting.lesson.level)} · Writing</span><h2>نوشتن فعال</h2><p>ترجمه حفظی نزن؛ جمله را خودت بساز.</p></div><button class="close-button" data-os-action="close">×</button></div>
      <div class="os-mission"><span>به آلمانی بنویس</span><strong>${h(activeWriting.fa)}</strong></div>
      <textarea id="os-writing-input" class="os-textarea" rows="4" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="پاسخ آلمانی را اینجا بنویس..."></textarea>
      <button class="primary-button" data-os-action="check-writing">بررسی پاسخ</button>
      <div id="os-writing-result" class="os-result" hidden></div>
    `);
    setTimeout(() => {
      const input = document.getElementById("os-writing-input");
      if (input) input.focus();
    }, 150);
  }

  function checkWriting() {
    const input = document.getElementById("os-writing-input");
    const box = document.getElementById("os-writing-result");
    if (!input || !box || !activeWriting) return;
    const answer = input.value.trim();
    if (!answer) {
      box.hidden = false;
      box.innerHTML = "اول پاسخ خودت را بنویس.";
      return;
    }
    const score = similarity(answer, activeWriting.de);
    logSkill("writing", score);
    logSkill("grammar", Math.max(35, score - 5));
    logSkill("vocabulary", score);
    box.hidden = false;
    box.innerHTML = `
      <strong>${score >= 88 ? "خیلی خوب" : score >= 70 ? "قابل قبول؛ یک بار بهترش کن" : "نیاز به بازنویسی دارد"} · ${score}%</strong>
      <span>پاسخ تو: ${h(answer)}</span>
      <span class="de">نمونه طبیعی: ${h(activeWriting.de)}</span>
      <button class="secondary-button" style="margin-top:9px" data-os-action="hear-writing">🔊 شنیدن نمونه</button>
    `;
    injectCurrentView();
  }

  function startSpeech() {
    const box = document.getElementById("os-speech-result");
    if (box) {
      box.hidden = false;
      box.innerHTML = "در حال گوش‌دادن… جمله را کامل بگو.";
    }
    native("startSpeechRecognition", "Deutsch sprechen");
  }

  window.onSpeechResult = function (text) {
    const box = document.getElementById("os-speech-result");
    if (!box || !activeSpeech) return;
    const score = similarity(text, activeSpeech.de);
    logSkill("speaking", score);
    logSkill("pronunciation", Math.max(30, score - 5));
    box.hidden = false;
    box.innerHTML = `
      <strong>${score >= 88 ? "عالی" : score >= 70 ? "خوب؛ دوباره روان‌تر بگو" : "یک بار دیگر تمرین کن"} · ${score}%</strong>
      <span>گوشی شنید: ${h(text || "—")}</span>
      <span class="de">نمونه: ${h(activeSpeech.de)}</span>
      <button class="secondary-button" style="margin-top:9px" data-os-action="record-speech">🎙 تلاش دوباره</button>
    `;
    injectCurrentView();
  };

  window.onSpeechError = function (message) {
    const box = document.getElementById("os-speech-result");
    if (!box) return;
    box.hidden = false;
    box.innerHTML = h(message || "تشخیص گفتار انجام نشد");
  };

  function injectPractice() {
    if (!view || !view.querySelector(".skill-grid") || view.querySelector("[data-os-action='speaking']")) return;
    const grid = view.querySelector(".skill-grid");
    grid.insertAdjacentHTML("beforeend", `
      <button class="card skill-card os-accent" data-os-action="speaking"><span class="big-icon">🎙</span><strong>مکالمه و گفتار</strong><small>جمله را بگو، صدای آلمانی تشخیص داده شود و دوباره اصلاحش کن.</small></button>
      <button class="card skill-card os-accent" data-os-action="writing"><span class="big-icon">✍</span><strong>نوشتن فعال</strong><small>از فارسی به آلمانی بنویس؛ ساخت جمله، املا و دقت را تمرین کن.</small></button>
    `);
  }

  function injectProfile() {
    if (!view || !view.querySelector(".metric-grid") || view.querySelector("#os-security-section")) return;
    const danger = view.querySelector(".danger-button");
    if (!danger) return;
    const state = osState();
    const lockEnabled = native("isAppLockEnabled") !== false;
    const privacyEnabled = native("isPrivacyScreenEnabled") === true;
    const securityAvailable = native("isDeviceSecurityAvailable") !== false;
    const skillsHtml = SKILLS.map(([id, de, fa]) => {
      const [status, avg] = mastery(state.skills[id]);
      return `<div class="os-skill-row"><span><strong>${h(de)}</strong><small>${h(fa)} · ${h(status)}</small></span><b>${avg}%</b></div>`;
    }).join("");

    danger.insertAdjacentHTML("beforebegin", `
      <div id="os-security-section">
        <div class="section-title"><h2>امنیت GHAZAL</h2><span class="pill">${securityAvailable ? "Device Security" : "نیاز به قفل گوشی"}</span></div>
        <section class="card settings-card">
          <div class="setting-row"><div class="setting-copy"><strong>قفل ورود با امنیت گوشی</strong><small>اثر انگشت، قفل دستگاه یا روش امن پشتیبانی‌شده.</small></div><label class="switch"><input id="os-lock-toggle" type="checkbox" ${lockEnabled ? "checked" : ""}><span class="slider"></span></label></div>
          <div class="setting-row"><div class="setting-copy"><strong>Privacy Screen</strong><small>در حالت روشن، اسکرین‌شات و پیش‌نمایش Recent Apps مسدود می‌شود.</small></div><label class="switch"><input id="os-privacy-toggle" type="checkbox" ${privacyEnabled ? "checked" : ""}><span class="slider"></span></label></div>
          <div class="setting-row"><div class="setting-copy"><strong>قفل همین حالا</strong><small>برای تست قفل امن برنامه.</small></div><button class="icon-button" data-os-action="lock-now">🔒</button></div>
        </section>

        <div class="section-title"><h2>German OS · مهارت‌ها</h2><span class="pill">A1 → C2</span></div>
        <section class="card os-dashboard">${skillsHtml}</section>
        <p class="os-note">این داشبورد با تمرین واقعی پر می‌شود؛ XP به‌تنهایی به معنی تسلط نیست.</p>
      </div>
    `);
  }

  function injectCurrentView() {
    injectPractice();
    injectProfile();
  }

  document.addEventListener("click", event => {
    const target = event.target.closest("[data-os-action]");
    if (!target) return;
    const action = target.dataset.osAction;
    if (action === "speaking") showSpeaking();
    else if (action === "writing") showWriting();
    else if (action === "close") closeOsModal();
    else if (action === "record-speech") startSpeech();
    else if (action === "hear-model" && activeSpeech) native("speak", activeSpeech.de);
    else if (action === "hear-writing" && activeWriting) native("speak", activeWriting.de);
    else if (action === "check-writing") checkWriting();
    else if (action === "lock-now") native("lockNow");
  });

  document.addEventListener("change", event => {
    if (event.target.id === "os-lock-toggle") {
      native("setAppLockEnabled", event.target.checked);
    } else if (event.target.id === "os-privacy-toggle") {
      native("setPrivacyScreenEnabled", event.target.checked);
    }
  });

  document.addEventListener("ghazal:ui-changed", injectCurrentView);
  setTimeout(injectCurrentView, 250);
})();
