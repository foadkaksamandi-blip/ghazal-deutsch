(function(){
  "use strict";
  const E=window.GhazalExerciseEngine,A=window.GhazalAdvancedContent,C=window.GhazalContentSystem,H=window.GhazalHumanAudio,O=window.GhazalOfflineCoach,view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!E||!A||!C||!view||!modal||!box)return;
  const OS_KEY="ghazal_deutsch_os_v1",R10_KEY="ghazal_stage2_r10_v1",LEVELS=["A1","A2","B1","B2","C1","C2"];
  let level="A1",type="",current=null,audio=null,pack="idioms",packLevel="A1",speechMode="",previousSpeech=window.onSpeechResult;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){current=null;audio=null;speechMode="";try{window.GhazalAndroid&&window.GhazalAndroid.stopSpeaking&&window.GhazalAndroid.stopSpeaking();}catch(_){}modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";}
  function head(tag,title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r10="close">×</button></div>';}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function state(){try{return JSON.parse(localStorage.getItem(R10_KEY)||"{}")||{};}catch(_){return{};}}
  function saveState(s){localStorage.setItem(R10_KEY,JSON.stringify(s));}
  function setResume(type,id,step){const s=state();s.resume=C.makeResume({type,id,step:step||0,level});saveState(s);}
  function getResume(){return state().resume||null;}
  function log(kind,score,id){const s=state();s.attempts=s.attempts||[];s.attempts.push({kind,score,id,at:new Date().toISOString()});if(s.attempts.length>500)s.attempts=s.attempts.slice(-500);saveState(s);let os={};try{os=JSON.parse(localStorage.getItem(OS_KEY)||"{}")||{};}catch(_){}os.skills=os.skills||{};const k=os.skills[kind]||{attempts:0,total:0,best:0};k.attempts=(k.attempts||0)+1;k.total=(k.total||0)+score;k.best=Math.max(k.best||0,score);k.lastAt=new Date().toISOString();os.skills[kind]=k;localStorage.setItem(OS_KEY,JSON.stringify(os));}

  function hub(){
    const q=C.audit(),s=E.summary();
    const resume=getResume();
    open(head("Stage 2","تکمیل محتوای آموزشی","تمرین انبوه، زبان طبیعی، Listening پیشرفته، تلفظ، جستجوی کامل و QA.")+
      (resume&&resume.type?'<button class="r10-card" style="width:100%;margin-bottom:9px" data-r10="resume"><strong>↩ ادامه آخرین فعالیت</strong><small>'+h(resume.type+" · "+resume.id)+'</small></button>':'')+
      '<div class="r10-kpis"><div class="r10-kpi"><b>'+s.total+'</b><span>تمرین اجرایی</span></div><div class="r10-kpi"><b>'+q.counts.educationalUnits+'</b><span>واحد آموزشی</span></div><div class="r10-kpi"><b>'+q.counts.index+'</b><span>رکورد جستجو</span></div></div>'+
      '<div class="r10-grid" style="margin-top:10px">'+
      '<button class="r10-card" data-r10="practice"><strong>⚡ Smart Practice</strong><small>تمرین واقعی از کل محتوای A1 تا C2.</small></button>'+
      '<button class="r10-card" data-r10="packs"><strong>💬 Natural German</strong><small>Idioms، تلفن، دیجیتال، اداری، دانشگاه و حرفه‌ای.</small></button>'+
      '<button class="r10-card" data-r10="audio"><strong>🎧 Advanced Audio</strong><small>Micro-listening، Dictation، Segmentation و Shadowing.</small></button>'+
      '<button class="r10-card" data-r10="human-audio"><strong>🎙 Human Native Pack</strong><small>'+(H&&H.clips?H.clips.length:0)+' کلیپ واقعی با مجوز و Attribution.</small></button>'+
      '<button class="r10-card" data-r10="pron"><strong>🗣 Pronunciation</strong><small>۲۴ الگوی تلفظ، Stress، Rhythm و Intonation.</small></button>'+
      '<button class="r10-card" data-r10="search"><strong>🔎 Global Search</strong><small>جستجو در درس، لغت، Grammar، Scenario و Exam.</small></button>'+
      '<button class="r10-card" data-r10="writing-coach"><strong>✍️ Writing Coach</strong><small>تحلیل آفلاین ساختار، پیوستگی، Register و خطاهای پرتکرار.</small></button>'+
      '<button class="r10-card" data-r10="mock-center"><strong>🏆 Mock Center</strong><small>Mock تمرینی چندمهارتی + شاخص داخلی TestDaF readiness.</small></button>'+
      '<button class="r10-card" data-r10="qa"><strong>✅ Content QA</strong><small>'+(q.pass?"تمام معیارهای خودکار Stage 2 پاس شده‌اند.":"مواردی برای اصلاح باقی مانده.")+'</small></button>'+
      '</div>');
  }

  function practice(){
    const types=Object.keys(E.summary().byType).sort(),items=E.list({level,type});
    current=items.length?items[Math.floor(Date.now()/1000)%items.length]:null;if(current)setResume("exercise",current.id,0);
    open(head("Smart Practice","بانک تمرین یکپارچه","سطح و نوع را انتخاب کن؛ پاسخ‌ها از محتوای واقعی برنامه ساخته می‌شوند.")+
      '<div class="r10-toolbar"><select id="r10-level">'+LEVELS.map(x=>'<option '+(x===level?"selected":"")+'>'+x+'</option>').join("")+'</select><select id="r10-type"><option value="">همه نوع‌ها</option>'+types.map(x=>'<option value="'+h(x)+'" '+(x===type?"selected":"")+'>'+h(x)+'</option>').join("")+'</select><button data-r10="practice">سؤال بعد</button></div>'+
      (current?renderExercise(current):'<div class="r10-box">تمرینی برای این فیلتر وجود ندارد.</div>'));
  }
  function renderExercise(x){
    let html='<div class="r10-box"><span class="r10-chip">'+h(x.level)+'</span><span class="r10-chip">'+h(x.type)+'</span>'+(x.context?'<div style="margin-top:8px" class="r10-de">'+h(x.context)+'</div>':'')+'<b style="margin-top:8px">'+h(x.prompt)+'</b></div>';
    if(x.type==="dictation")html+='<button class="secondary-button" style="margin-top:8px" data-r10="speak-current">🔊 پخش</button>';
    if(Array.isArray(x.options)&&x.options.length)html+='<div id="r10-options">'+x.options.map(o=>'<button class="r10-option" data-r10="option" data-value="'+encodeURIComponent(o)+'">'+h(o)+'</button>').join("")+'</div>';
    else if(x.answer==="free")html+='<textarea id="r10-answer" class="r10-textarea" placeholder="پاسخ آزاد…"></textarea><button class="primary-button" style="margin-top:8px" data-r10="free-done">ثبت تلاش</button>';
    else html+='<input id="r10-answer" class="r10-input" style="margin-top:8px" placeholder="پاسخ…"><button class="primary-button" style="margin-top:8px" data-r10="check">بررسی</button>';
    html+='<div id="r10-result"></div>';return html;
  }
  function checkAnswer(value){if(!current)return;const score=E.compare(value,current.answer),r=document.getElementById("r10-result");log(current.type,score,current.id);if(r)r.innerHTML='<div class="r10-box" style="margin-top:8px"><b>'+score+'%</b>پاسخ هدف: <span dir="ltr">'+h(current.answer)+'</span>'+(current.explain?'<br>'+h(current.explain):'')+'</div>';}

  function packs(){
    const names=Object.keys(A.packs),p=A.packs[pack],items=(p.items||[]).filter(x=>x.level===packLevel);
    open(head("Natural German",p.fa,p.title)+
      '<div class="r10-segment">'+names.map(k=>'<button class="'+(k===pack?"on":"")+'" data-r10="pack" data-pack="'+k+'">'+h(A.packs[k].fa)+'</button>').join("")+'</div>'+
      '<div class="r10-toolbar">'+LEVELS.map(l=>'<button class="'+(l===packLevel?"on":"")+'" data-r10="pack-level" data-level="'+l+'">'+l+'</button>').join("")+'</div>'+
      '<div class="r10-list">'+items.map(x=>'<button class="r10-item" data-r10="pack-item" data-id="'+x.id+'"><strong dir="ltr">'+h(x.de)+'</strong><small>'+h(x.fa)+' · '+h(x.register)+'</small></button>').join("")+'</div>');
  }
  function packItem(id){const all=Object.values(A.packs).flatMap(p=>p.items||[]),x=all.find(y=>y.id===id);if(!x)return;setResume("pack",id,0);open(head(x.level,x.de,x.fa)+'<div class="r10-box" dir="ltr"><b>Beispiel</b>'+h(x.example)+'</div><button class="secondary-button" style="margin-top:8px" data-r10="speak-text" data-text="'+encodeURIComponent(x.example)+'">🔊 شنیدن</button><textarea class="r10-textarea" style="margin-top:8px" placeholder="یک جمله شخصی با این عبارت بنویس…"></textarea>');}

  function audioLab(){
    const items=A.audio.filter(x=>x.level===level);
    open(head("Advanced Audio","Listening & Shadowing","صوت این بخش از TTS آفلاین دستگاه استفاده می‌کند؛ صدای انسان Native شبیه‌سازی نمی‌شود.")+
      '<div class="r10-toolbar">'+LEVELS.map(l=>'<button class="'+(l===level?"on":"")+'" data-r10="audio-level" data-level="'+l+'">'+l+'</button>').join("")+'</div>'+
      '<div class="r10-list">'+items.map(x=>'<button class="r10-item" data-r10="audio-item" data-id="'+x.id+'"><strong>'+h(x.voice==="female"?"Voice B":"Voice A")+' · '+h(x.level)+'</strong><small>'+h(x.text)+'</small></button>').join("")+'</div>');
  }
  function audioItem(id){audio=A.audio.find(x=>x.id===id);if(!audio)return;setResume("audio",id,0);open(head(audio.level,"Micro Listening","گوش‌دادن → قطعه‌بندی → Dictation → Shadowing")+
    '<div class="r10-box"><b>Diagnostics</b>'+audio.diagnostics.map(x=>'<span class="r10-chip">'+h(x)+'</span>').join("")+'</div>'+
    '<div class="button-row" style="margin-top:8px"><button class="secondary-button" data-r10="audio-play" data-rate="0.68">🐢 آهسته</button><button class="secondary-button" data-r10="audio-play" data-rate="0.9">🔊 عادی</button></div>'+
    '<div class="section-title"><h2>Segmentation</h2></div><div class="r10-box" dir="ltr">'+audio.segments.map(x=>h(x)).join(" | ")+'</div>'+
    '<div class="section-title"><h2>Dictation</h2></div><textarea id="r10-dict" class="r10-textarea" placeholder="آنچه شنیدی…"></textarea><button class="primary-button" style="margin-top:8px" data-r10="dict-check">بررسی Dictation</button><div id="r10-audio-result"></div>'+
    '<div class="section-title"><h2>Shadowing</h2></div><button class="primary-button" data-r10="shadow">🎙 تکرار و ثبت</button>');
  }

  function humanAudio(){
    const clips=H&&Array.isArray(H.clips)?H.clips:[];
    open(head("Human Native","صدای واقعی گویندگان آلمانی","فایل‌ها در Build رسمی از منابع دارای مجوز دریافت، Hash-verify و داخل APK قرار می‌گیرند.")+
      '<div class="r10-list">'+clips.map(x=>'<div class="r10-item"><strong dir="ltr">'+h(x.text)+'</strong><small>'+h(x.voice+" · "+x.region+" · "+x.license)+'</small><div class="button-row" style="margin-top:7px"><button class="secondary-button" data-r10="human-play" data-file="'+encodeURIComponent(x.file)+'">▶ پخش</button><button class="secondary-button" data-r10="human-shadow" data-text="'+encodeURIComponent(x.text)+'">🎙 تکرار</button></div></div>').join("")+'</div>'+
      '<div class="r10-box" style="margin-top:10px">Attribution و مجوزها در docs/HUMAN_AUDIO_CREDITS.md نگهداری می‌شوند. این فایل‌ها صدای انسان واقعی‌اند و با TTS اشتباه معرفی نمی‌شوند.</div>');
  }

  function pronunciation(){
    const items=A.pronunciation.filter(x=>x.level===level);
    open(head("Pronunciation","تلفظ، Stress و Rhythm","راهنمای آفلاین + مدل TTS + Speech Recognition؛ این بخش تحلیل فونمی آزمایشگاهی نیست.")+
      '<div class="r10-toolbar">'+LEVELS.map(l=>'<button class="'+(l===level?"on":"")+'" data-r10="pron-level" data-level="'+l+'">'+l+'</button>').join("")+'</div>'+
      '<div class="r10-list">'+items.map(x=>'<button class="r10-item" data-r10="pron-item" data-id="'+x.id+'"><strong>'+h(x.feature)+'</strong><small>'+h(x.examples)+'</small></button>').join("")+'</div>');
  }
  function pronItem(id){const x=A.pronunciation.find(y=>y.id===id);if(!x)return;setResume("pron",id,0);open(head(x.level,x.feature,x.tip)+'<div class="r10-box" dir="ltr">'+h(x.examples)+'</div><div class="button-row" style="margin-top:8px"><button class="secondary-button" data-r10="speak-text" data-text="'+encodeURIComponent(x.examples)+'">🔊 مدل</button><button class="primary-button" data-r10="pron-speak">🎙 تمرین</button></div>');}

  function writingCoach(){
    setResume("writing-coach","offline",0);open(head("Offline Coach","Writing Diagnostics","تحلیل واقعی آفلاین مبتنی بر قواعد؛ جایگزین تصحیح مدرس یا AI آنلاین نیست.")+
      '<div class="r10-toolbar"><select id="r10-write-level">'+LEVELS.map(l=>'<option '+(l===level?"selected":"")+'>'+l+'</option>').join("")+'</select></div>'+
      '<input id="r10-write-prompt" class="r10-input" placeholder="موضوع/نوع متن، مثلاً formelle E-Mail">'+
      '<textarea id="r10-write-text" class="r10-textarea" style="margin-top:8px" placeholder="Deutsch schreiben…"></textarea>'+
      '<button class="primary-button" style="margin-top:8px" data-r10="analyze-writing">تحلیل Writing</button><div id="r10-write-result"></div>');
  }
  function analyzeWriting(){
    if(!O)return;const lv=document.getElementById("r10-write-level")?.value||level,prompt=document.getElementById("r10-write-prompt")?.value||"",txt=document.getElementById("r10-write-text")?.value||"",r=O.analyze(txt,lv,prompt),el=document.getElementById("r10-write-result");log("writing",r.total,"offline-coach");
    if(el)el.innerHTML='<div class="r10-kpis" style="margin-top:8px"><div class="r10-kpi"><b>'+r.total+'%</b><span>کل</span></div><div class="r10-kpi"><b>'+r.wordCount+'</b><span>واژه</span></div><div class="r10-kpi"><b>'+r.connectorHits+'</b><span>Connector</span></div></div><div class="r10-box" style="margin-top:8px"><b>Register: '+h(r.register)+'</b>'+r.suggestions.map(x=>'• '+h(x)).join('<br>')+'</div><div class="r10-box" style="margin-top:8px"><small>'+h(r.limitations)+'</small></div>';
  }
  function mockCenter(){
    if(!O)return;setResume("mock-center","practice",0);let os={};try{os=JSON.parse(localStorage.getItem(OS_KEY)||"{}")||{};}catch(_){}const rd=O.testdafReadiness(os.skills||{});
    open(head("Mock Center","آزمون تمرینی چندمهارتی","تمرین شبیه‌سازی داخلی است؛ آزمون یا نمره رسمی مؤسسات نیست.")+
      '<div class="r10-toolbar"><select id="r10-mock-exam"><option>Goethe</option><option>telc</option><option>TestDaF</option><option>ÖSD</option></select><select id="r10-mock-level">'+LEVELS.map(l=>'<option '+(l===level?"selected":"")+'>'+l+'</option>').join("")+'</select><button data-r10="build-mock">ساخت Mock</button></div>'+
      '<div class="r10-box"><b>TestDaF Practice Readiness</b>'+h(rd.band)+' · میانگین '+rd.avg+'% · حداقل مهارت '+rd.min+'%<br><small>'+h(rd.note)+'</small></div><div id="r10-mock-result"></div>');
  }
  function buildMock(){
    if(!O)return;const exam=document.getElementById("r10-mock-exam")?.value||"Goethe",lv=document.getElementById("r10-mock-level")?.value||level,m=O.buildMock(exam,lv),el=document.getElementById("r10-mock-result");
    if(el)el.innerHTML='<div class="r10-box" style="margin-top:8px"><b>'+h(m.exam)+' · '+h(m.level)+' · '+m.totalMinutes+' دقیقه</b>'+m.sections.map((s,i)=>'<div style="margin-top:8px"><span class="r10-chip">'+h(s.skill)+'</span> '+(s.item?h(s.item.task||s.item.prompt||"تمرین داخلی"):"تمرین داخلی این مهارت")+' · '+s.minutes+' دقیقه</div>').join("")+'<br><small>'+h(m.note)+'</small></div>';
  }

  function search(){
    open(head("Global Search","جستجوی کل مدرسه","درس، Dictionary، Grammar، Redemittel، Reading، Listening، Scenario و Exam.")+'<input id="r10-search" class="r10-search" placeholder="Deutsch / فارسی …"><div id="r10-search-results" class="r10-list"></div>');
  }
  function renderSearch(q){const r=C.search(q,{});return r.slice(0,50).map(x=>'<div class="r10-item"><strong>'+h(x.title)+'</strong><small>'+h(x.level+" · "+x.type+" · "+x.text.slice(0,100))+'</small></div>').join("")||'<div class="r10-box">نتیجه‌ای نیست.</div>';}

  function qa(){
    const q=C.audit(),c=q.counts,skills=(()=>{try{return JSON.parse(localStorage.getItem(OS_KEY)||"{}").skills||{};}catch(_){return{};}})(),report=C.weeklyReport(skills),monthly=C.monthlyReport(skills);
    open(head(q.pass?"QA PASS":"QA CHECK","Stage 2 Content QA","آزمون خودکار پوشش محتوا؛ تست واقعی گوشی در مرحله QA نهایی محصول جدا انجام می‌شود.")+
      '<div class="r10-kpis"><div class="r10-kpi"><b>'+c.educationalUnits+'</b><span>واحد آموزشی</span></div><div class="r10-kpi"><b>'+c.exercises+'</b><span>تمرین</span></div><div class="r10-kpi"><b>'+c.dictionary+'</b><span>واژه ایندکس‌شده</span></div><div class="r10-kpi"><b>'+c.grammar+'</b><span>Grammar</span></div><div class="r10-kpi"><b>'+c.contrasts+'</b><span>Contrast</span></div><div class="r10-kpi"><b>'+c.advancedPackItems+'</b><span>Natural German</span></div></div>'+
      '<div class="r10-box" style="margin-top:9px"><b>نتیجه Audit</b>'+(q.pass?"✅ تمام Thresholdهای خودکار Stage 2 پاس شده.":"⚠ "+h(q.issues.join(", ")))+'</div>'+
      '<div class="r10-box" style="margin-top:9px"><b>Evidence Report</b>تعداد تلاش‌های ثبت‌شده: '+report.totalAttempts+'<br>Weakest: '+h(report.weakest.map(x=>x.id+" "+x.avg+"%").join(" · ")||"هنوز داده کافی نیست")+'<br>پیشنهاد: '+h(report.recommendations.map(x=>x.action).slice(0,2).join(" / ")||"تمرین بیشتری ثبت کن")+'<br>Monthly evidence window: '+monthly.periodDays+' روز.</div>');
  }

  window.onSpeechResult=function(text){
    if(speechMode==="shadow"&&audio){const score=E.compare(text,audio.text);log("shadowing",score,audio.id);const el=document.getElementById("r10-audio-result");if(el)el.innerHTML='<div class="r10-box" style="margin-top:8px"><b>Shadowing '+score+'%</b><span dir="ltr">'+h(text)+'</span></div>';speechMode="";return;}
    if(speechMode==="human-shadow"&&audio){const score=E.compare(text,audio.text);log("human-shadowing",score,audio.id);speechMode="";native("toast","Native shadowing: "+score+"%");return;}
    if(speechMode==="pron"){log("pronunciation",70,"pron");speechMode="";return;}
    if(typeof previousSpeech==="function")previousSpeech(text);
  };

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r10]");if(!t)return;const a=t.dataset.r10;
    if(a==="close")close(); else if(a==="hub")hub(); else if(a==="resume"){const r=getResume();if(!r)return;if(r.type==="exercise"){current=E.exercises.find(x=>x.id===r.id)||null;current?open(head("Resume",current.level,current.type)+renderExercise(current)):practice();}else if(r.type==="pack")packItem(r.id);else if(r.type==="audio")audioItem(r.id);else if(r.type==="pron")pronItem(r.id);else if(r.type==="writing-coach")writingCoach();else if(r.type==="mock-center")mockCenter();else hub();} else if(a==="practice")practice();
    else if(a==="option")checkAnswer(decodeURIComponent(t.dataset.value||""));
    else if(a==="check")checkAnswer(document.getElementById("r10-answer")?.value||"");
    else if(a==="free-done"){log(current?.type||"production",75,current?.id||"");document.getElementById("r10-result").innerHTML='<div class="r10-box" style="margin-top:8px">✅ تلاش ثبت شد. پاسخ آزاد در مرحله AI آنلاین آینده می‌تواند عمیق‌تر تصحیح شود.</div>';}
    else if(a==="speak-current"&&current?.audioText){native("setSpeechRate",0.85);native("speak",current.audioText);}
    else if(a==="packs")packs(); else if(a==="pack"){pack=t.dataset.pack;packs();} else if(a==="pack-level"){packLevel=t.dataset.level;packs();} else if(a==="pack-item")packItem(t.dataset.id);
    else if(a==="speak-text"){native("setSpeechRate",0.88);native("speak",decodeURIComponent(t.dataset.text||""));}
    else if(a==="audio")audioLab(); else if(a==="audio-level"){level=t.dataset.level;audioLab();} else if(a==="audio-item")audioItem(t.dataset.id);
    else if(a==="human-audio")humanAudio();
    else if(a==="human-play"){const src=decodeURIComponent(t.dataset.file||"");const player=new Audio(src);player.play().catch(()=>native("toast","فایل صوتی در این Build موجود نیست"));}
    else if(a==="human-shadow"){speechMode="human-shadow";audio={text:decodeURIComponent(t.dataset.text||""),id:"human"};native("startSpeechRecognition","Native shadowing");}
    else if(a==="audio-play"&&audio){native("setSpeechRate",Number(t.dataset.rate)||0.9);native("speak",audio.text);}
    else if(a==="dict-check"&&audio){const score=E.compare(document.getElementById("r10-dict")?.value||"",audio.text);log("dictation",score,audio.id);document.getElementById("r10-audio-result").innerHTML='<div class="r10-box" style="margin-top:8px"><b>'+score+'%</b><span dir="ltr">'+h(audio.text)+'</span></div>';}
    else if(a==="shadow"&&audio){speechMode="shadow";native("startSpeechRecognition","Shadowing auf Deutsch");}
    else if(a==="pron")pronunciation(); else if(a==="pron-level"){level=t.dataset.level;pronunciation();} else if(a==="pron-item")pronItem(t.dataset.id); else if(a==="pron-speak"){speechMode="pron";native("startSpeechRecognition","Aussprache üben");}
    else if(a==="search")search();
    else if(a==="writing-coach")writingCoach();
    else if(a==="analyze-writing")analyzeWriting();
    else if(a==="mock-center")mockCenter();
    else if(a==="build-mock")buildMock();
    else if(a==="qa")qa();
  });
  document.addEventListener("change",e=>{if(e.target.id==="r10-level"||e.target.id==="r10-type"){level=document.getElementById("r10-level")?.value||"A1";type=document.getElementById("r10-type")?.value||"";practice();}});
  document.addEventListener("input",e=>{if(e.target.id==="r10-search"){const el=document.getElementById("r10-search-results");if(el)el.innerHTML=renderSearch(e.target.value);}});

  function inject(){const grid=view.querySelector(".skill-grid");if(grid&&!view.querySelector("[data-r10='hub']"))grid.insertAdjacentHTML("beforeend",'<button class="card skill-card os-accent" data-r10="hub"><span class="big-icon">🏁</span><strong>Stage 2 · Complete Candidate</strong><small>تمرین انبوه، زبان طبیعی، Audio، Pronunciation، Search و QA.</small></button>');}
  const obs=new MutationObserver(inject);obs.observe(view,{childList:true,subtree:true});setTimeout(inject,400);
})();