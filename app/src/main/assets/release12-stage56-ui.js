(function(){
  "use strict";
  const P=window.GhazalProductCore,S=window.GhazalSecurityCore,C=window.GhazalContentSystem,D=window.GhazalDictionary,Data=window.GhazalData;
  const view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!P||!S||!view||!modal||!box)return;
  let state=P.readStorage(localStorage),previousSecureImport=window.onSecureBackupImported,deleteArmed=false;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){deleteArmed=false;modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";}
  function head(tag,title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r12="close">×</button></div>';}
  function save(){state=P.writeStorage(localStorage,state);}
  function toast(msg){native("toast",msg);}
  function applyAccessibility(){const a=state.accessibility||{};document.body.classList.toggle("r12-high-contrast",!!a.highContrast);document.body.classList.toggle("r12-reduced-motion",!!a.reducedMotion);document.body.classList.toggle("r12-large-targets",!!a.largeTargets);native("setTextZoom",Math.round((Number(a.fontScale)||1)*100));native("setSpeechRate",Number(a.speechRate)||.88);}
  function platformState(){try{return JSON.parse(localStorage.getItem("ghazal_platform_v1")||"{}")||{};}catch(_){return{};}}
  function activeProfile(){const p=platformState();return (p.profiles||[]).find(x=>x.id===p.activeProfileId)||null;}

  window.GhazalProductBridge={
    setResume:function(input){state=P.setResume(state,input||{});save();return state.resume;},
    getResume:function(){return state.resume;},
    clearResume:function(){state=P.clearResume(state);save();}
  };

  function hub(){
    const arch=P.architecture(),sec=S.evaluate(localStorage),packs=P.contentPackStatus(state),installed=packs.filter(x=>x.installed).length;
    open(head("Stage 5 + 6","Professional Product + Security","محصول حرفه‌ای آفلاین، آماده اتصال سرور و سخت‌سازی‌شده برای Release.")+
      '<div class="r12-kpis"><div class="r12-kpi"><b>'+P.PRODUCT_VERSION+'</b><span>Version</span></div><div class="r12-kpi"><b>'+installed+'</b><span>Offline Packs</span></div><div class="r12-kpi"><b>'+sec.score+'%</b><span>Security Score</span></div></div>'+
      '<div class="r12-grid" style="margin-top:10px">'+
      '<button class="r12-card" data-r12="product"><strong>🧰 Stage 5 · Product Pro</strong><small>Dictionary، Search، Packs، Backup، PDF، Accessibility، Notification، Offline Manager و Settings.</small></button>'+
      '<button class="r12-card" data-r12="security"><strong>🛡 Stage 6 · Security</strong><small>Biometric/PIN، Encryption، Integrity، Root/Hook، Obfuscation و Release Gate.</small></button>'+
      '</div><div class="r12-box" style="margin-top:10px"><b>Client Architecture</b><div class="r12-arch"><div><b>Android</b><small>'+h(arch.clients.android.status)+'</small></div><div><b>Web</b><small>'+h(arch.clients.web.status)+'</small></div><div><b>iOS</b><small>'+h(arch.clients.ios.status)+'</small></div></div></div>');
  }

  function productHub(){
    const p=activeProfile(),resume=state.resume,arch=P.architecture();
    open(head("Stage 5","امکانات محصول حرفه‌ای","تمام قابلیت‌های اصلی بدون سرور هم کار می‌کنند؛ Online بعداً روی همین قراردادها سوار می‌شود.")+
      (resume&&resume.route?'<button class="r12-card" style="width:100%;margin-bottom:9px" data-r12="resume"><strong>↩ ادامه آخرین فعالیت</strong><small>'+h(resume.route+" · "+resume.action+" · "+resume.id)+'</small></button>':'')+
      '<div class="r12-grid">'+
      '<button class="r12-card" data-r12="search"><strong>🔎 Global Search</strong><small>جستجو در کل جهان آموزشی.</small></button>'+
      '<button class="r12-card" data-r12="dictionary"><strong>📖 Internal Dictionary</strong><small>واژه، معنی، مثال و Register.</small></button>'+
      '<button class="r12-card" data-r12="offline"><strong>📦 Offline Manager</strong><small>وضعیت Packها و پذیرش Airplane Mode.</small></button>'+
      '<button class="r12-card" data-r12="packs"><strong>🧩 Content Packs</strong><small>Import امن JSON بدون HTML/JS اجرایی.</small></button>'+
      '<button class="r12-card" data-r12="backup"><strong>🔐 Backup / Restore</strong><small>Full-state رمزگذاری‌شده با Integrity Check.</small></button>'+
      '<button class="r12-card" data-r12="report"><strong>📄 PDF Report</strong><small>گزارش پیشرفت قابل خروجی.</small></button>'+
      '<button class="r12-card" data-r12="access"><strong>♿ Accessibility</strong><small>Text Zoom، Contrast، Reduced Motion و Speech Rate.</small></button>'+
      '<button class="r12-card" data-r12="reminder"><strong>🔔 Notifications</strong><small>یادآوری روزانه آفلاین.</small></button>'+
      '<button class="r12-card" data-r12="settings"><strong>⚙ Professional Settings</strong><small>نسخه، Privacy، Data Control و معماری.</small></button>'+
      '<button class="r12-card" data-r12="architecture"><strong>🔌 Server-ready Contracts</strong><small>Android/Web/iOS + Auth/Sync/CMS/Classroom/AI contracts.</small></button>'+
      '</div><div class="r12-box" style="margin-top:10px">پروفایل فعال: <b>'+h(p?.displayName||"Local Learner")+'</b> · Online account: <b>هنوز متصل نشده</b></div>');
  }

  function searchHub(){
    state=P.setResume(state,{route:"stage5",action:"search",id:"global"});save();
    open(head("Global Search","جستجوی کل GHAZAL","درس، لغت، Grammar، Scenario، Exam و Module.")+'<input id="r12-search" class="r12-search" placeholder="Deutsch / فارسی …"><div id="r12-search-results" class="r12-list"></div>');
  }
  function renderSearch(q){const r=C&&C.search?C.search(q,{}):[];return r.slice(0,60).map(x=>'<div class="r12-item"><strong>'+h(x.title)+'</strong><small>'+h(x.level+" · "+x.type+" · "+String(x.text||"").slice(0,120))+'</small></div>').join("")||'<div class="r12-box">نتیجه‌ای نیست.</div>';}

  function dictionary(){
    state=P.setResume(state,{route:"stage5",action:"dictionary",id:"internal"});save();
    open(head("Internal Dictionary","دیکشنری داخلی","آفلاین و مستقل از سرویس بیرونی.")+'<input id="r12-dict" class="r12-search" placeholder="واژه آلمانی یا معنی فارسی"><div id="r12-dict-results" class="r12-list"></div>');
  }
  function renderDict(q){let r=[];try{r=D&&D.search?D.search(q,"",60):(D?.all||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(String(q).toLowerCase())).slice(0,60);}catch(_){}return r.map(x=>'<div class="r12-item"><strong dir="ltr">'+h(x.lemma||x.de||"")+'</strong><small>'+h(x.meaning||x.fa||"")+(x.level?" · "+h(x.level):"")+(x.register?" · "+h(x.register):"")+'</small>'+(x.example?'<div dir="ltr" style="margin-top:5px">'+h(x.example)+'</div>':'')+'</div>').join("")||'<div class="r12-box">نتیجه‌ای نیست.</div>';}

  function offline(){
    const audit=P.offlineAudit(state,{tts:native("isTextToSpeechReady"),speech:native("isSpeechRecognitionAvailable"),storage:typeof localStorage!=="undefined"});state=audit.state;save();const packs=P.contentPackStatus(state);
    open(head("Offline Manager",audit.pass?"AIRPLANE READY":"CHECK REQUIRED","هسته آموزش بدون شبکه کار می‌کند؛ Speech Recognition به پشتیبانی آفلاین گوشی وابسته است.")+
      '<div class="r12-list">'+packs.map(x=>'<div class="r12-item"><strong>'+h(x.title)+'</strong><small>'+h(x.source+" · "+x.version+" · "+x.trust)+'</small><span class="r12-chip">'+(x.installed?"Installed":"Missing")+'</span></div>').join("")+'</div>'+
      '<div class="section-title"><h2>Offline Acceptance</h2></div><div class="r12-box">'+audit.checks.map(x=>'<div class="r12-row"><span>'+h(x.label)+'</span><b class="'+(x.pass?"r12-pass":"r12-fail")+'">'+(x.pass?"PASS":"CHECK")+'</b></div>').join("")+'</div>');
  }

  function packs(){
    const ps=P.contentPackStatus(state);
    open(head("Content Packs","مدیریت بسته‌های آموزشی","بسته محلی فقط JSON داده‌ای است؛ HTML/JavaScript یا فایل اجرایی رد می‌شود.")+
      '<div class="r12-warning">Packهای بدون امضای معتبر به‌عنوان <b>local-untrusted</b> علامت می‌خورند. برای انتشار عمومی، CMS باید Pack امضاشده تولید کند.</div>'+
      '<button class="primary-button" style="margin-top:9px" data-r12="import-pack">Import JSON Pack</button>'+
      '<div class="r12-list" style="margin-top:10px">'+ps.filter(x=>x.source==="local").map(x=>'<div class="r12-item"><strong>'+h(x.title)+'</strong><small>'+h(x.version+" · "+x.trust)+'</small></div>').join("")+'</div>');
  }
  function importPack(){
    const input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.onchange=()=>{const file=input.files&&input.files[0];if(!file)return;if(file.size>2_000_000)return toast("Pack بیش از حد بزرگ است");const reader=new FileReader();reader.onload=()=>{try{const pack=JSON.parse(String(reader.result||"{}")),v=P.validatePack(pack,P.PRODUCT_VERSION);if(!v.valid)throw new Error(v.errors.join(", "));state=P.installPack(state,pack,P.PRODUCT_VERSION);save();(pack.lessons||[]).forEach(l=>{if(!Data.lessons.some(x=>x.id===l.id))Data.lessons.push(l);});toast("Pack نصب شد؛ برای ایندکس و تمرین کامل یک‌بار برنامه را باز و بسته کن");packs();}catch(err){toast("Pack معتبر نیست: "+err.message);}};reader.readAsText(file);};input.click();
  }

  function backup(){
    open(head("Secure Backup","پشتیبان کامل محصول","تمام کلیدهای GHAZAL جمع‌آوری، SHA-256 می‌شوند و سپس با AES-GCM رمزگذاری می‌شوند.")+
      '<label class="r6-label">رمز حداقل ۸ کاراکتر</label><input id="r12-backup-pass" type="password" class="r12-input" autocomplete="new-password">'+
      '<div class="r12-grid" style="margin-top:9px"><button class="r12-card" data-r12="export-backup"><strong>⬆ Export Secure</strong><small>فرمت .ghz</small></button><button class="r12-card" data-r12="import-backup"><strong>⬇ Restore Secure</strong><small>Integrity قبل از Restore بررسی می‌شود.</small></button></div>');
  }
  async function exportBackup(){const pass=document.getElementById("r12-backup-pass")?.value||"";if(pass.length<8)return toast("رمز حداقل ۸ کاراکتر");const payload=await P.buildBackup(localStorage,{profile:activeProfile()?.id||"local"});native("exportSecureBackup",JSON.stringify(payload),pass);}
  function importBackup(){const pass=document.getElementById("r12-backup-pass")?.value||"";if(pass.length<8)return toast("رمز حداقل ۸ کاراکتر");native("importSecureBackup",pass);}
  window.onSecureBackupImported=async function(text){try{const payload=JSON.parse(text),v=await P.verifyBackup(payload);if(!v.valid){if(typeof previousSecureImport==="function")return previousSecureImport(text);throw new Error(v.reason);}const r=await P.restoreBackup(localStorage,payload);toast(r.restored+" بخش بازیابی شد");setTimeout(()=>location.reload(),500);}catch(err){if(typeof previousSecureImport==="function")try{return previousSecureImport(text);}catch(_){}toast("Backup معتبر نیست");}};

  function report(){const r=P.buildReport(localStorage);open(head("PDF Report","گزارش پیشرفت","گزارش از داده واقعی همین دستگاه ساخته می‌شود.")+'<div class="r12-box"><b>'+h(r.profile.name)+'</b>'+h(r.profile.level+" · "+r.profile.role)+'<br>Completed lessons: '+r.progress.completedLessons+' · XP: '+r.progress.xp+' · Streak: '+r.progress.streak+'<br>Active errors: '+r.errors.length+' · Classes: '+r.classes.length+'</div><button class="primary-button" style="margin-top:9px" data-r12="export-pdf">ذخیره PDF</button>');}

  function accessibility(){
    const a=state.accessibility;
    open(head("Accessibility","خوانایی و دسترسی","تغییرات بلافاصله روی برنامه اعمال می‌شوند.")+
      '<label class="r6-label">Text Zoom</label><input id="r12-font" type="range" min="85" max="140" value="'+Math.round(a.fontScale*100)+'" class="r12-input">'+
      '<label class="r6-label">Speech Rate</label><input id="r12-rate" type="range" min="55" max="135" value="'+Math.round(a.speechRate*100)+'" class="r12-input">'+
      '<div class="r12-box"><label class="r12-switch"><span>High Contrast</span><input id="r12-contrast" type="checkbox" '+(a.highContrast?"checked":"")+'></label><label class="r12-switch"><span>Reduced Motion</span><input id="r12-motion" type="checkbox" '+(a.reducedMotion?"checked":"")+'></label><label class="r12-switch"><span>Large Touch Targets</span><input id="r12-targets" type="checkbox" '+(a.largeTargets?"checked":"")+'></label></div><button class="primary-button" style="margin-top:9px" data-r12="save-access">اعمال و ذخیره</button>');
  }
  function saveAccess(){state.accessibility.fontScale=(Number(document.getElementById("r12-font")?.value)||100)/100;state.accessibility.speechRate=(Number(document.getElementById("r12-rate")?.value)||88)/100;state.accessibility.highContrast=!!document.getElementById("r12-contrast")?.checked;state.accessibility.reducedMotion=!!document.getElementById("r12-motion")?.checked;state.accessibility.largeTargets=!!document.getElementById("r12-targets")?.checked;save();applyAccessibility();toast("Accessibility ذخیره شد");}

  function reminder(){
    const r=state.reminder;
    open(head("Notifications","یادآوری آفلاین","اعلان روزانه از Android Scheduler استفاده می‌کند و برای کارکرد روزانه به اینترنت نیاز ندارد.")+
      '<div class="r12-box"><label class="r12-switch"><span>فعال</span><input id="r12-rem-enabled" type="checkbox" '+(r.enabled?"checked":"")+'></label><label class="r6-label">زمان</label><input id="r12-rem-time" type="time" class="r12-input" value="'+h(r.time)+'"><label class="r6-label">متن</label><input id="r12-rem-body" class="r12-input" value="'+h(r.body)+'"></div><button class="primary-button" style="margin-top:9px" data-r12="save-reminder">ذخیره یادآوری</button>');
  }
  function saveReminder(){const en=!!document.getElementById("r12-rem-enabled")?.checked,time=document.getElementById("r12-rem-time")?.value||"19:00",body=document.getElementById("r12-rem-body")?.value||"وقت تمرین آلمانی است.";state.reminder={...state.reminder,enabled:en,time,body};save();if(en){native("requestNotificationPermission");const parts=time.split(":");native("scheduleDailyReminder",Number(parts[0])||19,Number(parts[1])||0,"GHAZAL",body);}else native("cancelDailyReminder");toast("یادآوری ذخیره شد");}

  function settings(){
    const arch=P.architecture(),p=state.privacy;
    open(head("Professional Settings","تنظیمات محصول","Offline-first و Privacy-first.")+
      '<div class="r12-box"><div class="r12-row"><span>App Version</span><b>'+h(native("getAppVersion")||P.PRODUCT_VERSION)+'</b></div><div class="r12-row"><span>Market</span><b>IRAN-FIRST</b></div><div class="r12-row"><span>Core mode</span><b>Offline-first</b></div><label class="r12-switch"><span>Analytics Opt-in<br><small>تا Backend وجود ندارد هیچ رویدادی ارسال نمی‌شود.</small></span><input id="r12-analytics" type="checkbox" '+(p.analyticsOptIn?"checked":"")+'></label></div>'+
      '<button class="secondary-button" style="margin-top:9px" data-r12="save-settings">ذخیره Settings</button><button class="secondary-button" style="margin-top:9px" data-r12="delete-data">'+(deleteArmed?"تأیید حذف همه داده‌های محلی":"حذف داده‌های شخصی")+'</button>');
  }
  function architecture(){
    const a=P.architecture();
    open(head("Server-ready","قرارداد چندکلاینت","Backend آینده بدون بازنویسی هسته آموزشی به این Contractها متصل می‌شود.")+
      '<div class="r12-arch"><div><b>Android</b><small>'+h(a.clients.android.status)+'</small></div><div><b>Web</b><small>'+h(a.clients.web.status)+'</small></div><div><b>iOS</b><small>'+h(a.clients.ios.status)+'</small></div></div>'+
      '<div class="r12-list" style="margin-top:9px">'+Object.entries(a.api).map(([k,v])=>'<div class="r12-item"><strong>'+h(k)+'</strong><small>v'+v.version+' · '+v.endpoints.length+' endpoints</small></div>').join("")+'</div><div class="r12-warning" style="margin-top:9px">Online-only قابلیت‌ها تا زمان Backend واقعی خاموش می‌مانند؛ هیچ Login/Sync/AI آنلاین جعلی ساخته نشده.</div>');
  }

  function security(){
    const e=S.evaluate(localStorage),n=e.native,g=S.releaseGate(localStorage);
    open(head("Stage 6","Security & Anti-Tamper",e.pass?"Runtime security checks passed":"یک یا چند کنترل نیاز به توجه دارد")+
      '<div class="r12-kpis"><div class="r12-kpi"><b>'+e.score+'%</b><span>Security Score</span></div><div class="r12-kpi"><b>'+(n.assetIntegrity?"PASS":"FAIL")+'</b><span>Asset Integrity</span></div><div class="r12-kpi"><b>'+(n.productionSigned?"YES":"NO")+'</b><span>Production Signed</span></div></div>'+
      '<div class="r12-box" style="margin-top:9px">'+e.checks.map(x=>'<div class="r12-row"><span>'+h(x.label)+'</span><b class="'+(x.pass?"r12-pass":"r12-fail")+'">'+(x.pass?"PASS":"CHECK")+'</b></div>').join("")+'</div>'+
      '<div class="r12-grid" style="margin-top:9px"><button class="r12-card" data-r12="seal"><strong>🔏 Seal State</strong><small>نسخه رمزگذاری‌شده داخل Android Keystore.</small></button><button class="r12-card" data-r12="verify-seal"><strong>✅ Verify Seal</strong><small>Integrity Snapshot را بررسی کن.</small></button><button class="r12-card" data-r12="lock"><strong>🔒 Lock Now</strong><small>Biometric/PIN دستگاه.</small></button><button class="r12-card" data-r12="release-gate"><strong>🚦 Release Gate</strong><small>'+h(g.ready?"READY":"BLOCKED")+'</small></button></div>'+
      '<div class="r12-box" style="margin-top:9px"><b>Signing SHA-256</b><div class="r12-fingerprint">'+h(n.signingSha256||"unavailable")+'</div><small>Installer: '+h(n.installer||"unknown")+' · Debuggable: '+h(String(!!n.debuggable))+'</small></div>');
  }
  async function seal(){const r=await S.sealProductState(localStorage);toast(r.ok?"Secure snapshot sealed":"Seal failed: "+r.reason);security();}
  async function verifySeal(){const r=await S.verifySealedState();toast(r.ok?"Snapshot integrity PASS":"Snapshot check: "+r.reason);}
  function releaseGate(){const g=S.releaseGate(localStorage);open(head("Release Gate",g.ready?"READY":"BLOCKED","Public release فقط با Production Signing دائمی مجاز است.")+'<div class="r12-box">'+(g.blockers.length?g.blockers.map(x=>'• '+h(x)).join("<br>"):'✅ همه Gateها پاس شده')+'</div><div class="r12-warning" style="margin-top:9px">QA key یا Debug key هرگز Production Signing محسوب نمی‌شود. کلید خصوصی باید بیرون Repository و داخل GitHub Secrets/Store امن نگهداری شود.</div>');}

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r12]");if(!t)return;const a=t.dataset.r12;
    if(a==="close")close();else if(a==="hub")hub();else if(a==="product")productHub();else if(a==="security")security();
    else if(a==="search")searchHub();else if(a==="dictionary")dictionary();else if(a==="offline")offline();else if(a==="packs")packs();else if(a==="import-pack")importPack();
    else if(a==="backup")backup();else if(a==="export-backup")exportBackup();else if(a==="import-backup")importBackup();else if(a==="report")report();else if(a==="export-pdf")native("exportProgressPdf",JSON.stringify(P.buildReport(localStorage)));
    else if(a==="access")accessibility();else if(a==="save-access")saveAccess();else if(a==="reminder")reminder();else if(a==="save-reminder")saveReminder();else if(a==="settings")settings();else if(a==="save-settings"){state.privacy.analyticsOptIn=!!document.getElementById("r12-analytics")?.checked;save();toast("Settings ذخیره شد");settings();}
    else if(a==="architecture")architecture();else if(a==="seal")seal();else if(a==="verify-seal")verifySeal();else if(a==="lock")native("lockNow");else if(a==="release-gate")releaseGate();
    else if(a==="delete-data"){if(!deleteArmed){deleteArmed=true;settings();}else{const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("ghazal_"))keys.push(k);}keys.forEach(k=>localStorage.removeItem(k));native("clearSecureSnapshot");toast("داده‌های محلی حذف شد");setTimeout(()=>location.reload(),500);}}
    else if(a==="resume"){const r=state.resume;if(!r)return;if(r.action==="search")searchHub();else if(r.action==="dictionary")dictionary();else productHub();}
  });
  document.addEventListener("input",e=>{if(e.target.id==="r12-search"){const el=document.getElementById("r12-search-results");if(el)el.innerHTML=renderSearch(e.target.value);}else if(e.target.id==="r12-dict"){const el=document.getElementById("r12-dict-results");if(el)el.innerHTML=renderDict(e.target.value);}});

  function inject(){
    const grid=view.querySelector(".skill-grid");if(grid&&!view.querySelector("[data-r12='hub']"))grid.insertAdjacentHTML("beforeend",'<button class="card skill-card os-accent" data-r12="hub"><span class="big-icon">🧰</span><strong>Stage 5 + 6</strong><small>Product Pro و Security Center.</small></button>');
    const profile=view.querySelector(".settings-card");if(profile&&!view.querySelector("[data-r12='security']"))profile.insertAdjacentHTML("beforebegin",'<button class="card skill-card" style="width:100%;margin-bottom:10px" data-r12="security"><span class="big-icon">🛡</span><strong>Security Center</strong><small>Integrity، Encryption، App Lock و Release Gate.</small></button>');
  }
  applyAccessibility();const obs=new MutationObserver(inject);obs.observe(view,{childList:true,subtree:true});setTimeout(inject,500);
})();