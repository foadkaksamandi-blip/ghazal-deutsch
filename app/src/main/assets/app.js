(function () {
  "use strict";

  const Core = window.GhazalCore;
  const Data = window.GhazalData;
  const STORAGE_KEY = "ghazal_deutsch_state_v1";
  const SCHEMA_VERSION = 1;

  const view = document.getElementById("view");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  const toast = document.getElementById("toast");
  const backupFile = document.getElementById("backup-file");

  let state = loadState();
  let currentView = "home";
  let selectedLevel = state.profile.level || "A1";
  let activeLessonId = null;
  let lessonResult = null;
  let quickQuestion = null;
  let quickResult = null;
  let reviewQueue = [];
  let reviewIndex = 0;
  let reviewRevealed = false;
  let placementQuestions = [];
  let placementIndex = 0;
  let placementScore = 0;
  let placementLevel = "A1";
  let placementSelf = {};
  let listeningRevealed = false;
  let activeListeningLesson = null;
  let toastTimer = null;

  function defaultState() {
    return {
      schema: SCHEMA_VERSION,
      onboardingDone: false,
      profile: { name: "غزل", level: "A1", goal: "migration", mode: "normal" },
      progress: {
        completedLessons: [],
        xp: 0,
        streak: 0,
        lastStudyDate: null,
        daily: { date: Core.dateKey(), lessons: 0, cards: 0, quizzes: 0 }
      },
      reviews: {},
      errors: [],
      assessment: { placementScore: null, placementTotal: null, self: {} },
      settings: { reminderEnabled: false, reminderTime: "19:00" }
    };
  }

  function normalizeState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== "object") return base;
    return {
      ...base,
      ...raw,
      schema: SCHEMA_VERSION,
      profile: { ...base.profile, ...(raw.profile || {}) },
      progress: {
        ...base.progress,
        ...(raw.progress || {}),
        daily: { ...base.progress.daily, ...((raw.progress && raw.progress.daily) || {}) },
        completedLessons: Array.isArray(raw.progress && raw.progress.completedLessons)
          ? raw.progress.completedLessons.filter(id => typeof id === "string")
          : []
      },
      reviews: raw.reviews && typeof raw.reviews === "object" ? raw.reviews : {},
      errors: Array.isArray(raw.errors) ? raw.errors.slice(0, 100) : [],
      assessment: { ...base.assessment, ...(raw.assessment || {}), self: { ...((raw.assessment && raw.assessment.self) || {}) } },
      settings: { ...base.settings, ...(raw.settings || {}) }
    };
  }

  function loadState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch (_) {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function h(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function fa(value) {
    try { return new Intl.NumberFormat("fa-IR").format(value); }
    catch (_) { return String(value); }
  }

  function todayLabel() {
    try {
      return new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
    } catch (_) {
      return "برنامه امروز";
    }
  }

  function safeNative(method, ...args) {
    try {
      if (window.GhazalAndroid && typeof window.GhazalAndroid[method] === "function") {
        return window.GhazalAndroid[method](...args);
      }
    } catch (_) {}
    return undefined;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }

  function openModal(html, locked) {
    modalContent.innerHTML = html;
    modal.dataset.locked = locked ? "true" : "false";
    modal.hidden = false;
    modalContent.scrollTop = 0;
  }

  function closeModal(force) {
    if (!force && modal.dataset.locked === "true") return;
    safeNative("stopSpeaking");
    modal.hidden = true;
    modalContent.innerHTML = "";
    modal.dataset.locked = "false";
    activeLessonId = null;
    lessonResult = null;
  }

  function navigate(name) {
    currentView = name;
    document.querySelectorAll("[data-nav]").forEach(button => {
      button.classList.toggle("active", button.dataset.nav === name);
    });
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    ensureDailyState();
    if (currentView === "path") renderPath();
    else if (currentView === "practice") renderPractice();
    else if (currentView === "migration") renderMigration();
    else if (currentView === "profile") renderProfile();
    else renderHome();
  }

  function ensureDailyState() {
    const today = Core.dateKey();
    if (state.progress.daily.date !== today) {
      state.progress.daily = { date: today, lessons: 0, cards: 0, quizzes: 0 };
      saveState();
    }
  }

  function allCards() {
    const cards = [];
    Data.lessons.forEach(lesson => {
      lesson.words.forEach((word, index) => {
        cards.push({ id: `${lesson.id}-w${index}`, lessonId: lesson.id, level: lesson.level, de: word[0], fa: word[1], example: word[2] });
      });
    });
    return cards;
  }

  function dueCards() {
    const now = Date.now();
    return allCards().filter(card => Core.isDue(state.reviews[card.id], now));
  }

  function levelProgress(level) {
    const lessons = Data.lessons.filter(item => item.level === level);
    const completed = lessons.filter(item => state.progress.completedLessons.includes(item.id)).length;
    return { completed, total: lessons.length, percent: Core.progressPercent(completed, lessons.length) };
  }

  function nextLesson() {
    const currentLevelLessons = Data.lessons.filter(item => item.level === state.profile.level);
    return currentLevelLessons.find(item => !state.progress.completedLessons.includes(item.id))
      || Data.lessons.find(item => !state.progress.completedLessons.includes(item.id))
      || Data.lessons[0];
  }

  function markStudy(xp, kind) {
    const today = Core.dateKey();
    state.progress.streak = Core.updateStreak(state.progress.lastStudyDate, state.progress.streak, Date.now());
    state.progress.lastStudyDate = today;
    state.progress.xp = Math.max(0, Number(state.progress.xp) || 0) + (Number(xp) || 0);
    ensureDailyState();
    if (kind && Object.prototype.hasOwnProperty.call(state.progress.daily, kind)) {
      state.progress.daily[kind] += 1;
    }
    saveState();
  }

  function renderHome() {
    const due = dueCards().length;
    const remaining = Data.lessons.length - state.progress.completedLessons.length;
    const plan = Core.dailyPlan(state.profile.mode, due, remaining);
    const daily = state.progress.daily;
    const targetTotal = plan.lessons + plan.cards + plan.quiz;
    const doneTotal = Math.min(plan.lessons, daily.lessons) + Math.min(plan.cards, daily.cards) + Math.min(plan.quiz, daily.quizzes);
    const dailyPercent = Core.progressPercent(doneTotal, targetTotal || 1);
    const coursePercent = Core.progressPercent(state.progress.completedLessons.length, Data.lessons.length);
    const next = nextLesson();

    view.innerHTML = `
      <section class="hero">
        <span class="eyebrow">${h(todayLabel())} · مسیر مهاجرت</span>
        <h1>سلام ${h(state.profile.name)}!</h1>
        <p>هر روز یک قدم واقعی؛ از جمله‌های ضروری تا تسلط حرفه‌ای آلمانی.</p>
        <div class="hero-stats">
          <div class="hero-stat"><strong>${h(state.profile.level)}</strong><span>سطح فعلی</span></div>
          <div class="hero-stat"><strong>${fa(state.progress.streak)}</strong><span>روز پیوسته</span></div>
          <div class="hero-stat"><strong>${fa(state.progress.xp)}</strong><span>امتیاز</span></div>
        </div>
      </section>

      <div class="section-title"><h2>برنامه امروز</h2><span class="pill">${fa(plan.minutes)} دقیقه</span></div>
      <section class="card plan-card">
        <div class="plan-head"><strong>${dailyPercent === 100 ? "آفرین؛ برنامه امروز کامل شد" : "قدم‌های کوچک، نتیجه ماندگار"}</strong><span>${fa(dailyPercent)}٪</span></div>
        <div class="progress-track"><span style="width:${dailyPercent}%"></span></div>
        <div class="task-list">
          ${plan.lessons ? `<button class="task" data-action="open-lesson" data-id="${h(next.id)}"><span class="task-icon">▤</span><span class="task-copy"><strong>درس امروز</strong><small>${h(next.de)} · ${fa(next.minutes)} دقیقه</small></span><span class="task-arrow">‹</span></button>` : ""}
          <button class="task" data-action="start-review"><span class="task-icon">◈</span><span class="task-copy"><strong>مرور واژگان</strong><small>${fa(Math.min(plan.cards || 5, due))} کارت آماده مرور</small></span><span class="task-arrow">‹</span></button>
          <button class="task" data-action="quick-quiz"><span class="task-icon">✓</span><span class="task-copy"><strong>آزمون کوتاه</strong><small>سنجش فعال و ثبت اشتباه‌ها</small></span><span class="task-arrow">‹</span></button>
        </div>
      </section>

      <div class="section-title"><h2>ادامه مسیر</h2><button data-action="go-path">مشاهده همه</button></div>
      <section class="card next-card">
        <div><span class="level-badge">${h(next.level)} · ${fa(coursePercent)}٪ کل مسیر</span><h3>${h(next.title)}</h3><p>${h(next.goal)}</p></div>
        <button class="round-action" data-action="open-lesson" data-id="${h(next.id)}" aria-label="شروع درس">▶</button>
      </section>

      <div class="section-title"><h2>ضروری مهاجرت</h2><button data-action="go-migration">همه بسته‌ها</button></div>
      <button class="survival-card" data-action="open-pack" data-id="arrival">
        <span class="survival-icon">🧳</span><span><strong>۷۲ ساعت اول در آلمان</strong><small>عبارت‌های فوری ورود، مسیر و کمک</small></span><span>‹</span>
      </button>
    `;
  }

  function renderPath() {
    const level = Data.levels.find(item => item.id === selectedLevel) || Data.levels[0];
    const lessons = Data.lessons.filter(item => item.level === level.id);
    view.innerHTML = `
      <div class="page-title"><div><h1>مسیر تسلط</h1><p>از A1 تا C2 با یادگیری مرحله‌ای</p></div><span class="pill">سطح فعلی ${h(state.profile.level)}</span></div>
      <div class="level-grid">
        ${Data.levels.map(item => {
          const progress = levelProgress(item.id);
          return `<button class="card level-card" data-action="select-level" data-id="${item.id}">
            <span class="level-top"><span class="level-code" style="background:${item.color}">${item.id}</span><span class="level-copy"><strong>${h(item.fa)}</strong><small>${h(item.description)}</small></span><span class="level-percent">${fa(progress.percent)}%</span></span>
            <span class="progress-track"><span style="width:${progress.percent}%;background:${item.color}"></span></span>
          </button>`;
        }).join("")}
      </div>
      <div class="section-title"><h2>${h(level.id)} · ${h(level.fa)}</h2><span class="pill">${fa(lessons.length)} درس</span></div>
      <div class="lesson-list">
        ${lessons.map((lesson, index) => {
          const done = state.progress.completedLessons.includes(lesson.id);
          return `<button class="lesson-row ${done ? "done" : ""}" data-action="open-lesson" data-id="${h(lesson.id)}"><span class="lesson-index">${done ? "✓" : fa(index + 1)}</span><span><strong>${h(lesson.title)}</strong><small>${h(lesson.de)}</small></span><span class="lesson-time">${fa(lesson.minutes)} دقیقه</span></button>`;
        }).join("")}
      </div>
    `;
  }

  function renderPractice() {
    const due = dueCards().length;
    view.innerHTML = `
      <div class="page-title"><div><h1>تمرین فعال</h1><p>یادآوری، آزمون و اصلاح اشتباه‌ها</p></div><span class="pill">${fa(due)} مرور</span></div>
      <div class="skill-grid">
        <button class="card skill-card" data-action="start-review"><span class="big-icon">◈</span><strong>مرور هوشمند</strong><small>واژه‌ها دقیقاً زمانی برمی‌گردند که احتمال فراموشی است.</small></button>
        <button class="card skill-card" data-action="quick-quiz"><span class="big-icon">✓</span><strong>آزمون کوتاه</strong><small>سؤال تصادفی از سطح‌ها و ثبت خودکار خطاها.</small></button>
        <button class="card skill-card" data-action="start-listening"><span class="big-icon">♬</span><strong>شنیداری</strong><small>گوش‌دادن به جمله و سپس کنترل متن و معنی.</small></button>
        <button class="card skill-card" data-action="show-errors"><span class="big-icon">↺</span><strong>بانک اشتباه</strong><small>${fa(state.errors.length)} مورد برای بازبینی هدفمند.</small></button>
      </div>

      <div class="section-title"><h2>شش مهارت</h2><button data-action="retake-assessment">ارزیابی دوباره</button></div>
      <section class="card settings-card">
        ${Data.selfAssessment.map(skill => `<div class="setting-row"><div class="setting-copy"><strong>${h(skill.title)}</strong><small>${h(skill.prompt)}</small></div><span class="pill">${selfLabel(state.assessment.self[skill.id])}</span></div>`).join("")}
      </section>
    `;
  }

  function renderMigration() {
    view.innerHTML = `
      <div class="page-title"><div><h1>بسته مهاجرت</h1><p>عبارت‌های حیاتی زندگی واقعی؛ همیشه آفلاین</p></div><span class="pill">${fa(Data.survivalPacks.length)} موقعیت</span></div>
      <div class="survival-list">
        ${Data.survivalPacks.map(pack => `<button class="survival-card" data-action="open-pack" data-id="${h(pack.id)}"><span class="survival-icon">${pack.icon}</span><span><strong>${h(pack.title)}</strong><small>${h(pack.subtitle)}</small></span><span>‹</span></button>`).join("")}
      </div>
      <div class="signature">FOAD</div>
    `;
  }

  function renderProfile() {
    const coursePercent = Core.progressPercent(state.progress.completedLessons.length, Data.lessons.length);
    const reminderText = state.settings.reminderEnabled ? `هر روز ${h(state.settings.reminderTime)}` : "خاموش";
    let version = safeNative("getAppVersion") || "1.0.0";
    view.innerHTML = `
      <div class="page-title"><div><h1>پیشرفت غزل</h1><p>اطلاعات فقط روی همین گوشی ذخیره می‌شود</p></div><span class="pill">${h(state.profile.level)}</span></div>
      <div class="metric-grid">
        <div class="card metric"><strong>${fa(coursePercent)}٪</strong><span>کل مسیر آموزشی</span></div>
        <div class="card metric"><strong>${fa(state.progress.streak)}</strong><span>روز پیوسته</span></div>
        <div class="card metric"><strong>${fa(state.progress.xp)}</strong><span>امتیاز یادگیری</span></div>
        <div class="card metric"><strong>${fa(state.errors.length)}</strong><span>خطای ذخیره‌شده</span></div>
      </div>

      <div class="section-title"><h2>برنامه روزانه</h2><span class="pill">${reminderText}</span></div>
      <section class="card settings-card">
        <div class="setting-row"><div class="setting-copy"><strong>حالت مطالعه</strong><small>حجم برنامه روزانه را انتخاب کن.</small></div><select id="study-mode"><option value="minimum" ${state.profile.mode === "minimum" ? "selected" : ""}>کمینه · ۱۰ دقیقه</option><option value="normal" ${state.profile.mode === "normal" ? "selected" : ""}>عادی · ۲۵ دقیقه</option><option value="intensive" ${state.profile.mode === "intensive" ? "selected" : ""}>فشرده · ۴۵ دقیقه</option></select></div>
        <div class="setting-row"><div class="setting-copy"><strong>اعلان روزانه آفلاین</strong><small>حتی وقتی برنامه بسته و اینترنت خاموش است.</small></div><label class="switch"><input id="reminder-toggle" type="checkbox" ${state.settings.reminderEnabled ? "checked" : ""}><span class="slider"></span></label></div>
        <div class="setting-row"><div class="setting-copy"><strong>ساعت یادآوری</strong><small>زمان مناسب تمرین روزانه</small></div><input id="reminder-time" type="time" value="${h(state.settings.reminderTime)}"></div>
      </section>

      <div class="section-title"><h2>اطلاعات و پشتیبان</h2></div>
      <section class="card settings-card">
        <div class="setting-row"><div class="setting-copy"><strong>خروجی پشتیبان</strong><small>پیشرفت، خطاها و تنظیمات را در یک فایل ذخیره کن.</small></div><button class="icon-button" data-action="export-backup">⇩</button></div>
        <div class="setting-row"><div class="setting-copy"><strong>بازیابی پشتیبان</strong><small>فایل قبلی را روی همین گوشی برگردان.</small></div><button class="icon-button" data-action="import-backup">⇧</button></div>
        <div class="setting-row"><div class="setting-copy"><strong>ارزیابی دوباره سطح</strong><small>سطح اولیه و شش مهارت را دوباره بسنج.</small></div><button class="icon-button" data-action="retake-assessment">◎</button></div>
      </section>

      <button class="danger-button" style="margin-top:18px" data-action="ask-reset">پاک‌کردن همه اطلاعات</button>
      <div class="signature">FOAD · v${h(version)}</div>
    `;
  }

  function lessonModal(lesson) {
    const result = lessonResult;
    const words = lesson.words.map(word => `<div class="word-card"><div><strong class="de">${h(word[0])}</strong><span>${h(word[1])}</span><small class="de">${h(word[2])}</small></div><button class="speak-button" data-action="speak" data-text="${encodeURIComponent(word[0] + ". " + word[2])}">🔊</button></div>`).join("");
    const dialogue = lesson.dialogue.map(line => `<div class="dialogue-line"><strong>${h(line[0])}</strong><span>${h(line[1])}</span></div>`).join("");
    const options = lesson.quiz.options.map((option, index) => {
      let cls = "option";
      if (result && index === lesson.quiz.answer) cls += " correct";
      if (result && result.selected === index && !result.correct) cls += " wrong";
      return `<button class="${cls}" data-action="answer-lesson" data-index="${index}" ${result ? "disabled" : ""}>${h(option)}</button>`;
    }).join("");
    const done = state.progress.completedLessons.includes(lesson.id);

    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span class="level-badge">${h(lesson.level)} · ${fa(lesson.minutes)} دقیقه</span><h2>${h(lesson.title)}</h2><p class="de">${h(lesson.de)}</p></div><button class="close-button" data-action="close-modal">×</button></div>
      <p style="color:var(--muted);font-size:12px;line-height:1.8">هدف: ${h(lesson.goal)}</p>
      <div class="section-title"><h2>واژه‌های فعال</h2><button data-action="speak" data-text="${encodeURIComponent(lesson.words.map(word => word[0] + ". " + word[2]).join(" "))}">پخش همه</button></div>
      <div class="word-list">${words}</div>
      <div class="pattern-box"><strong>${h(lesson.pattern.de)}</strong><span>${h(lesson.pattern.fa)}</span></div>
      <div class="section-title"><h2>گفت‌وگوی واقعی</h2><button data-action="play-dialogue" data-id="${h(lesson.id)}">شنیدن</button></div>
      <div class="dialogue">${dialogue}</div>
      <div class="quiz-box"><h3>${h(lesson.quiz.q)}</h3><div class="options">${options}</div>${result ? `<div class="feedback">${result.correct ? "پاسخ درست بود. " : "این پاسخ درست نبود و در بانک اشتباه ذخیره شد. "}${h(lesson.quiz.explain)}</div>` : ""}</div>
      ${result && !done ? `<button class="primary-button" style="margin-top:13px" data-action="complete-lesson">ثبت پایان درس</button>` : ""}
      ${done ? `<div class="feedback" style="color:var(--green);text-align:center">این درس تکمیل شده است.</div>` : ""}
    `, false);
  }

  function openLesson(id) {
    const lesson = Data.lessons.find(item => item.id === id);
    if (!lesson) return;
    activeLessonId = lesson.id;
    lessonResult = null;
    lessonModal(lesson);
  }

  function answerLesson(index) {
    const lesson = Data.lessons.find(item => item.id === activeLessonId);
    if (!lesson || lessonResult) return;
    const selected = Number(index);
    const correct = selected === lesson.quiz.answer;
    lessonResult = { selected, correct };
    if (!correct) recordError(lesson, selected);
    else markStudy(5, null);
    lessonModal(lesson);
  }

  function recordError(lesson, selected) {
    state.errors.unshift({
      id: `${lesson.id}-${Date.now()}`,
      lessonId: lesson.id,
      level: lesson.level,
      question: lesson.quiz.q,
      selected: lesson.quiz.options[selected] || "—",
      answer: lesson.quiz.options[lesson.quiz.answer],
      explanation: lesson.quiz.explain,
      date: Core.dateKey()
    });
    state.errors = state.errors.slice(0, 100);
    saveState();
  }

  function completeActiveLesson() {
    const lesson = Data.lessons.find(item => item.id === activeLessonId);
    if (!lesson) return;
    if (!state.progress.completedLessons.includes(lesson.id)) {
      state.progress.completedLessons.push(lesson.id);
      markStudy(25, "lessons");
    }
    state.profile.level = lesson.level;
    saveState();
    closeModal(true);
    showToast("درس با موفقیت ثبت شد");
    render();
  }

  function openPack(id) {
    const pack = Data.survivalPacks.find(item => item.id === id);
    if (!pack) return;
    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span style="font-size:28px">${pack.icon}</span><h2>${h(pack.title)}</h2><p>${h(pack.subtitle)}</p></div><button class="close-button" data-action="close-modal">×</button></div>
      <div class="word-list">
        ${pack.phrases.map(pair => `<div class="word-card"><div><strong class="de">${h(pair[0])}</strong><span>${h(pair[1])}</span></div><button class="speak-button" data-action="speak" data-text="${encodeURIComponent(pair[0])}">🔊</button></div>`).join("")}
      </div>
      <button class="secondary-button" style="margin-top:13px" data-action="speak" data-text="${encodeURIComponent(pack.phrases.map(pair => pair[0]).join(". "))}">پخش همه عبارت‌ها</button>
    `, false);
  }

  function startReview() {
    const due = dueCards();
    reviewQueue = (due.length ? due : allCards()).slice(0, 10);
    reviewIndex = 0;
    reviewRevealed = false;
    renderReviewCard();
  }

  function renderReviewCard() {
    if (!reviewQueue.length || reviewIndex >= reviewQueue.length) {
      openModal(`
        <div class="sheet-handle"></div><div class="onboarding"><div class="onboarding-mark">✓</div><h1>مرور تمام شد</h1><p>${fa(reviewIndex)} کارت مرور شد و زمان مرور بعدی روی گوشی ذخیره شد.</p><button class="primary-button" data-action="close-modal">بستن</button></div>
      `, false);
      return;
    }
    const card = reviewQueue[reviewIndex];
    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><h2>مرور هوشمند</h2><p>کارت ${fa(reviewIndex + 1)} از ${fa(reviewQueue.length)}</p></div><button class="close-button" data-action="close-modal">×</button></div>
      <div class="flashcard" data-action="reveal-card">
        <div><div class="front">${h(card.de)}</div>${reviewRevealed ? `<div class="back">${h(card.fa)}</div><div class="example">${h(card.example)}</div>` : `<div class="back" style="font-size:12px;color:rgba(255,255,255,.7)">برای دیدن معنی لمس کن</div>`}</div>
      </div>
      <button class="secondary-button" style="margin-top:10px" data-action="speak" data-text="${encodeURIComponent(card.de + ". " + card.example)}">🔊 شنیدن تلفظ</button>
      ${reviewRevealed ? `<div class="rating-row"><button class="rate-again" data-action="rate-card" data-rating="again">دوباره</button><button class="rate-hard" data-action="rate-card" data-rating="hard">سخت</button><button class="rate-good" data-action="rate-card" data-rating="good">خوب</button><button class="rate-easy" data-action="rate-card" data-rating="easy">آسان</button></div>` : ""}
    `, false);
  }

  function rateCard(rating) {
    const card = reviewQueue[reviewIndex];
    if (!card) return;
    state.reviews[card.id] = Core.nextReview(state.reviews[card.id], rating, Date.now());
    markStudy(rating === "easy" ? 4 : 2, "cards");
    reviewIndex += 1;
    reviewRevealed = false;
    renderReviewCard();
  }

  function shuffledQuestion(quiz, source) {
    const mapped = quiz.options.map((text, index) => ({ text, correct: index === quiz.answer }));
    for (let i = mapped.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
    }
    return { q: quiz.q, options: mapped.map(item => item.text), answer: mapped.findIndex(item => item.correct), explain: quiz.explain || "", source };
  }

  function startQuickQuiz() {
    const pool = Data.lessons.filter(item => item.level === state.profile.level);
    const lesson = (pool.length ? pool : Data.lessons)[Math.floor(Math.random() * (pool.length || Data.lessons.length))];
    quickQuestion = shuffledQuestion(lesson.quiz, lesson);
    quickResult = null;
    renderQuickQuiz();
  }

  function renderQuickQuiz() {
    if (!quickQuestion) return;
    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span class="level-badge">${h(quickQuestion.source.level)}</span><h2>آزمون کوتاه</h2><p>${h(quickQuestion.source.title)}</p></div><button class="close-button" data-action="close-modal">×</button></div>
      <div class="quiz-box"><h3>${h(quickQuestion.q)}</h3><div class="options">${quickQuestion.options.map((option,index) => {
        let cls = "option";
        if (quickResult && index === quickQuestion.answer) cls += " correct";
        if (quickResult && quickResult.selected === index && !quickResult.correct) cls += " wrong";
        return `<button class="${cls}" data-action="answer-quick" data-index="${index}" ${quickResult ? "disabled" : ""}>${h(option)}</button>`;
      }).join("")}</div>${quickResult ? `<div class="feedback">${quickResult.correct ? "درست بود؛ عالی!" : "پاسخ درست مشخص شد و این مورد در بانک اشتباه ثبت شد."} ${h(quickQuestion.explain)}</div>` : ""}</div>
      ${quickResult ? `<button class="primary-button" style="margin-top:12px" data-action="next-quick">سؤال بعدی</button>` : ""}
    `, false);
  }

  function answerQuick(index) {
    if (!quickQuestion || quickResult) return;
    const selected = Number(index);
    const correct = selected === quickQuestion.answer;
    quickResult = { selected, correct };
    if (!correct) {
      const source = quickQuestion.source;
      state.errors.unshift({ id: `quick-${Date.now()}`, lessonId: source.id, level: source.level, question: quickQuestion.q, selected: quickQuestion.options[selected], answer: quickQuestion.options[quickQuestion.answer], explanation: quickQuestion.explain, date: Core.dateKey() });
      state.errors = state.errors.slice(0, 100);
    }
    markStudy(correct ? 8 : 2, "quizzes");
    renderQuickQuiz();
  }

  function startListening() {
    const pool = Data.lessons.filter(item => item.level === state.profile.level);
    activeListeningLesson = (pool.length ? pool : Data.lessons)[Math.floor(Math.random() * (pool.length || Data.lessons.length))];
    listeningRevealed = false;
    renderListening();
    setTimeout(() => safeNative("speak", activeListeningLesson.dialogue.map(line => line[0]).join(". ")), 250);
  }

  function renderListening() {
    const lesson = activeListeningLesson;
    if (!lesson) return;
    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span class="level-badge">${h(lesson.level)}</span><h2>تمرین شنیداری</h2><p>اول گوش کن؛ سپس متن را ببین.</p></div><button class="close-button" data-action="close-modal">×</button></div>
      <div class="flashcard"><div><div style="font-size:42px">♬</div><div class="back">${listeningRevealed ? h(lesson.title) : "بدون نگاه‌کردن به متن گوش کن"}</div></div></div>
      <div class="button-row"><button class="secondary-button" data-action="replay-listening">پخش دوباره</button><button class="primary-button" data-action="reveal-listening">نمایش متن</button></div>
      ${listeningRevealed ? `<div class="dialogue" style="margin-top:13px">${lesson.dialogue.map(line => `<div class="dialogue-line"><strong>${h(line[0])}</strong><span>${h(line[1])}</span></div>`).join("")}</div>` : ""}
    `, false);
  }

  function showErrors() {
    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><h2>بانک اشتباه</h2><p>خطاها برای مرور هدفمند نگه‌داری می‌شوند.</p></div><button class="close-button" data-action="close-modal">×</button></div>
      ${state.errors.length ? `<div class="word-list">${state.errors.map(error => `<div class="word-card"><div><strong style="font-family:inherit;font-size:13px">${h(error.question)}</strong><span style="color:var(--red)">پاسخ تو: ${h(error.selected)}</span><small style="font-family:inherit;direction:rtl;text-align:right;color:var(--green)">درست: ${h(error.answer)}</small></div><span class="level-badge">${h(error.level)}</span></div>`).join("")}</div>` : `<div class="empty-state"><strong>هنوز خطایی ثبت نشده</strong>با آزمون‌های کوتاه، نقاط ضعف واقعی مشخص می‌شوند.</div>`}
    `, false);
  }

  function selfLabel(value) {
    if (Number(value) === 2) return "خوب";
    if (Number(value) === 1) return "متوسط";
    if (Number(value) === 0) return "نیازمند تمرین";
    return "ارزیابی نشده";
  }

  function bindWelcomeButtons() {
    const start = modalContent.querySelector("[data-action='start-placement']");
    const skip = modalContent.querySelector("[data-action='skip-placement']");
    let handledAt = 0;
    function bind(button, fn) {
      if (!button) return;
      const run = event => {
        const now = Date.now();
        if (now - handledAt < 450) return;
        handledAt = now;
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        fn();
      };
      button.addEventListener("click", run, { passive: false });
      button.addEventListener("touchend", run, { passive: false });
      button.addEventListener("pointerup", run, { passive: false });
    }
    bind(start, startPlacement);
    bind(skip, () => finishOnboarding(true));
  }

  function showWelcome() {
    openModal(`
      <div class="sheet-handle"></div>
      <div class="onboarding">
        <div class="onboarding-mark">G</div>
        <h1>آلمانی برای غزل</h1>
        <p>مسیر شخصی یادگیری برای مهاجرت، زندگی واقعی، کار، دانشگاه و آمادگی آزمون؛ کاملاً آفلاین روی همین گوشی.</p>
        <div class="feature-points"><div class="feature-point">✓ ارزیابی اولیه و مسیر A1 تا C2</div><div class="feature-point">✓ مرور هوشمند و بانک اشتباه‌ها</div><div class="feature-point">✓ بسته فوری زندگی در آلمان</div><div class="feature-point">✓ ذخیره اطلاعات و اعلان روی خود گوشی</div></div>
        <button id="ghz-start-placement" class="primary-button welcome-action" type="button" data-action="start-placement">شروع ارزیابی اولیه</button>
        <button id="ghz-skip-placement" class="secondary-button welcome-action" type="button" style="margin-top:9px" data-action="skip-placement">شروع مستقیم از A1</button>
        <p class="welcome-build">نسخه 14.0.2 · Touch Fix 2</p>
      </div>
      <div class="signature">FOAD</div>
    `, true);
    requestAnimationFrame(bindWelcomeButtons);
    setTimeout(bindWelcomeButtons, 120);
  }

  function startPlacement() {
    placementQuestions = Data.placement.map(item => shuffledQuestion(item, item));
    placementIndex = 0;
    placementScore = 0;
    placementSelf = {};
    renderPlacementQuestion();
  }

  function renderPlacementQuestion() {
    const question = placementQuestions[placementIndex];
    if (!question) {
      placementLevel = Core.placementLevel(placementScore, placementQuestions.length);
      renderSelfAssessment();
      return;
    }
    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span class="placement-count">${placementIndex + 1} / ${placementQuestions.length}</span><h2>تخمین سطح اولیه</h2><p>اگر مطمئن نیستی، بهترین حدست را انتخاب کن.</p></div></div>
      <div class="progress-track"><span style="width:${Core.progressPercent(placementIndex, placementQuestions.length)}%"></span></div>
      <div class="quiz-box"><h3 class="de">${h(question.q)}</h3><div class="options">${question.options.map((option,index) => `<button class="option" data-action="answer-placement" data-index="${index}">${h(option)}</button>`).join("")}</div></div>
    `, true);
  }

  function renderSelfAssessment() {
    openModal(`
      <div class="sheet-handle"></div>
      <div class="sheet-head"><div><span class="level-badge">سطح پیشنهادی ${h(placementLevel)}</span><h2>ارزیابی شش مهارت</h2><p>برای هر مهارت نزدیک‌ترین وضعیت را انتخاب کن.</p></div></div>
      <div class="word-list">
        ${Data.selfAssessment.map(skill => `<div class="word-card" style="display:block"><strong style="font-family:inherit;font-size:14px">${h(skill.title)}</strong><span>${h(skill.prompt)}</span><div class="self-scale"><button class="${placementSelf[skill.id] === 0 ? "selected" : ""}" data-action="self-rate" data-id="${skill.id}" data-value="0">ضعیف</button><button class="${placementSelf[skill.id] === 1 ? "selected" : ""}" data-action="self-rate" data-id="${skill.id}" data-value="1">متوسط</button><button class="${placementSelf[skill.id] === 2 ? "selected" : ""}" data-action="self-rate" data-id="${skill.id}" data-value="2">خوب</button></div></div>`).join("")}
      </div>
      <button class="primary-button" style="margin-top:13px" data-action="finish-onboarding">ثبت و ورود به برنامه</button>
      <p style="font-size:10px;color:var(--muted);line-height:1.6;text-align:center">این ارزیابی تشخیصی داخلی است و جایگزین مدرک رسمی زبان نیست.</p>
    `, true);
  }

  function finishOnboarding(skip) {
    state.onboardingDone = true;
    state.profile.level = skip ? "A1" : placementLevel;
    selectedLevel = state.profile.level;
    state.assessment.placementScore = skip ? null : placementScore;
    state.assessment.placementTotal = skip ? null : placementQuestions.length;
    state.assessment.self = skip ? {} : { ...placementSelf };
    saveState();
    closeModal(true);
    render();
    setTimeout(() => showReminderOffer(), 300);
  }

  function showReminderOffer() {
    openModal(`
      <div class="sheet-handle"></div>
      <div class="onboarding"><div class="onboarding-mark">⏰</div><h1>یادآوری روزانه</h1><p>یک زمان ثابت انتخاب کن تا خود گوشی، حتی بدون اینترنت، زمان تمرین را یادآوری کند.</p><input id="onboarding-time" type="time" value="${h(state.settings.reminderTime)}" style="font-size:18px;margin:10px auto 18px"><button class="primary-button" data-action="enable-onboarding-reminder">فعال‌کردن اعلان</button><button class="secondary-button" style="margin-top:9px" data-action="close-modal">فعلاً نه</button></div>
    `, false);
  }

  function scheduleReminder() {
    const parts = String(state.settings.reminderTime || "19:00").split(":");
    const hour = Number(parts[0]) || 19;
    const minute = Number(parts[1]) || 0;
    safeNative("scheduleDailyReminder", hour, minute, "GHAZAL", "غزل، زمان تمرین کوتاه آلمانی رسیده است.");
  }

  function exportBackup() {
    const payload = JSON.stringify({ kind: "ghazal-deutsch-backup", version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), state });
    if (window.GhazalAndroid) {
      safeNative("exportBackup", payload);
    } else {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "GHAZAL-backup.json";
      anchor.click();
      URL.revokeObjectURL(url);
    }
  }

  function importBackup() {
    if (window.GhazalAndroid) safeNative("importBackup");
    else backupFile.click();
  }

  function receiveImportedBackup(text) {
    try {
      const payload = JSON.parse(text);
      if (!payload || payload.kind !== "ghazal-deutsch-backup" || !payload.state) throw new Error("invalid");
      state = normalizeState(payload.state);
      selectedLevel = state.profile.level;
      saveState();
      closeModal(true);
      render();
      scheduleReminderIfEnabled();
      showToast("پشتیبان با موفقیت بازیابی شد");
    } catch (_) {
      showToast("فایل پشتیبان معتبر نیست");
    }
  }

  function scheduleReminderIfEnabled() {
    if (state.settings.reminderEnabled) scheduleReminder();
  }

  function askReset() {
    openModal(`<div class="sheet-handle"></div><div class="sheet-head"><div><h2>پاک‌کردن همه اطلاعات؟</h2><p>پیشرفت، مرورها، خطاها و تنظیمات از این گوشی حذف می‌شوند.</p></div><button class="close-button" data-action="close-modal">×</button></div><button class="danger-button" data-action="confirm-reset">بله، همه‌چیز پاک شود</button><button class="secondary-button" style="margin-top:9px" data-action="close-modal">انصراف</button>`, false);
  }

  document.addEventListener("click", event => {
    const nav = event.target.closest("[data-nav]");
    if (nav) { navigate(nav.dataset.nav); return; }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "open-settings") navigate("profile");
    else if (action === "go-path") navigate("path");
    else if (action === "go-migration") navigate("migration");
    else if (action === "close-modal") closeModal(false);
    else if (action === "open-lesson") openLesson(target.dataset.id);
    else if (action === "select-level") { selectedLevel = target.dataset.id; renderPath(); }
    else if (action === "answer-lesson") answerLesson(target.dataset.index);
    else if (action === "complete-lesson") completeActiveLesson();
    else if (action === "speak") safeNative("speak", decodeURIComponent(target.dataset.text || ""));
    else if (action === "play-dialogue") {
      const lesson = Data.lessons.find(item => item.id === target.dataset.id);
      if (lesson) safeNative("speak", lesson.dialogue.map(line => line[0]).join(". "));
    }
    else if (action === "open-pack") openPack(target.dataset.id);
    else if (action === "start-review") startReview();
    else if (action === "reveal-card") { reviewRevealed = true; renderReviewCard(); }
    else if (action === "rate-card") rateCard(target.dataset.rating);
    else if (action === "quick-quiz" || action === "next-quick") startQuickQuiz();
    else if (action === "answer-quick") answerQuick(target.dataset.index);
    else if (action === "start-listening") startListening();
    else if (action === "replay-listening" && activeListeningLesson) safeNative("speak", activeListeningLesson.dialogue.map(line => line[0]).join(". "));
    else if (action === "reveal-listening") { listeningRevealed = true; renderListening(); markStudy(5, null); }
    else if (action === "show-errors") showErrors();
    else if (action === "start-placement" || action === "retake-assessment") startPlacement();
    else if (action === "skip-placement") finishOnboarding(true);
    else if (action === "answer-placement") {
      if (Number(target.dataset.index) === placementQuestions[placementIndex].answer) placementScore += 1;
      placementIndex += 1;
      renderPlacementQuestion();
    }
    else if (action === "self-rate") { placementSelf[target.dataset.id] = Number(target.dataset.value); renderSelfAssessment(); }
    else if (action === "finish-onboarding") finishOnboarding(false);
    else if (action === "enable-onboarding-reminder") {
      const input = document.getElementById("onboarding-time");
      state.settings.reminderTime = input ? input.value : "19:00";
      state.settings.reminderEnabled = true;
      saveState();
      safeNative("requestNotificationPermission");
      scheduleReminder();
      closeModal(true);
      showToast("یادآوری روزانه فعال شد");
    }
    else if (action === "export-backup") exportBackup();
    else if (action === "import-backup") importBackup();
    else if (action === "ask-reset") askReset();
    else if (action === "confirm-reset") {
      safeNative("cancelDailyReminder");
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      selectedLevel = "A1";
      closeModal(true);
      render();
      showWelcome();
    }
  });

  document.addEventListener("change", event => {
    if (event.target.id === "study-mode") {
      state.profile.mode = event.target.value;
      saveState();
      renderProfile();
    } else if (event.target.id === "reminder-time") {
      state.settings.reminderTime = event.target.value || "19:00";
      saveState();
      scheduleReminderIfEnabled();
      renderProfile();
      showToast("ساعت یادآوری ذخیره شد");
    } else if (event.target.id === "reminder-toggle") {
      state.settings.reminderEnabled = event.target.checked;
      saveState();
      if (event.target.checked) {
        safeNative("requestNotificationPermission");
        scheduleReminder();
        showToast("اعلان روزانه فعال شد");
      } else {
        safeNative("cancelDailyReminder");
        showToast("اعلان روزانه خاموش شد");
      }
      renderProfile();
    }
  });

  backupFile.addEventListener("change", event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => receiveImportedBackup(String(reader.result || ""));
    reader.readAsText(file);
    event.target.value = "";
  });

  window.receiveImportedBackup = receiveImportedBackup;
  window.onNotificationPermissionChanged = function (granted) {
    if (!granted) {
      state.settings.reminderEnabled = false;
      saveState();
      if (currentView === "profile") renderProfile();
      showToast("برای اعلان باید اجازه Notifications فعال باشد");
    } else {
      scheduleReminderIfEnabled();
    }
  };
  window.androidBack = function () {
    if (!modal.hidden) {
      closeModal(false);
      return true;
    }
    if (currentView !== "home") {
      navigate("home");
      return true;
    }
    return false;
  };

  render();
  scheduleReminderIfEnabled();
  if (!state.onboardingDone) setTimeout(showWelcome, 120);
})();
