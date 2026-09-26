(function(){
  "use strict";
  const S=window.GhazalStage5,T=window.GhazalStage4Tutor;
  const view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!S||!view||!modal||!box)return;

  let selectedBrand="goethe",selectedLevel="",currentPath="migration",pathLevel="",activePathModule=null;
  let speechTarget=null,timerHandle=null;
  const previousSpeech=window.onSpeechResult,previousSpeechError=window.onSpeechError;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function base(){try{return JSON.parse(localStorage.getItem("ghazal_deutsch_state_v1")||"{}")||{};}catch(_){return{};}}
  function level(){const x=base();return x&&x.profile&&S.LEVELS.includes(x.profile.level)?x.profile.level:"B1";}
  function state(){return S.readStorage(localStorage,"device",level());}
  function save(s){return S.writeStorage(localStorage,s);}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function stopTimer(){if(timerHandle){clearInterval(timerHandle);timerHandle=null;}}
  function open(html){stopTimer();modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){stopTimer();speechTarget=null;activePathModule=null;modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";native("stopSpeaking");}
  function head(tag,title,sub,home){
    return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div>'+
      '<button class="close-button" data-s5="'+(home?"hub":"close")+'">'+(home?"⌂":"×")+'</button></div>';
  }
  function skillFa(k){return S.SKILL_FA[k]||k;}
  function resultBadge(n){return n>=80?"قوی":n>=65?"خوب":n>=50?"در حال تثبیت":"نیازمند تقویت";}

  function hub(){
    const st=state(),rec=S.nextRecommendation(st,(window.GhazalStage4Tutor&&function(){try{return window.GhazalStage4Tutor.readStorage(localStorage,"device",level()).learnerProfile;}catch(_){return null;}})());
    const resume=st.activeSession?'<button class="s5-card s5-resume" data-s5="resume"><strong>▶ ادامه Mock نیمه‌تمام</strong><small>'+h(st.activeSession.brandName+" · "+st.activeSession.level+" · سؤال "+(st.activeSession.index+1)+" از "+st.activeSession.items.length)+'</small></button>':"";
    open(head("مرحله ۵","آزمون‌ها و مسیرهای تخصصی","چهار آزمون + Mock زمان‌دار + مسیر مهاجرت، دانشگاه، کار و زندگی واقعی.",false)+
      resume+
      '<div class="s5-grid">'+
        '<button class="s5-card" data-s5="exam-center"><strong>🏅 Exam Center</strong><small>Goethe · telc · TestDaF · ÖSD با آزمون سریع، هفتگی و جامع.</small></button>'+
        '<button class="s5-card" data-s5="path-center"><strong>🧭 مسیرهای هدف‌محور</strong><small>مهاجرت · دانشگاه · کار · زندگی واقعی در آلمان.</small></button>'+
        '<button class="s5-card" data-s5="results"><strong>📈 نتایج و ضعف‌ها</strong><small>امتیازهای داخلی، مهارت‌های ضعیف و TestDaF Readiness.</small></button>'+
        '<button class="s5-card" data-s5="techniques"><strong>🧠 تکنیک و تله آزمون</strong><small>راهبردهای کاربردی و خطاهای رایج برای هر آزمون.</small></button>'+
      '</div>'+
      '<div class="s5-note"><b>پیشنهاد فعلی:</b> '+h(rec.title)+' — '+h(rec.detail||"")+'</div>'+
      '<div class="s5-note s5-legal">'+h(S.SCORE_NOTE)+'<br>'+h(S.RIGHTS_NOTE)+'</div>');
  }

  function examCenter(){
    const st=state();
    open(head("Exam Center","چهار مسیر آزمون","سطح و نوع Mock را انتخاب کن. ساختار این بخش برای تمرین است، نه شبیه‌سازی رسمی دارای مجوز.",true)+
      '<div class="s5-grid">'+Object.values(S.EXAMS).map(ex=>{
        const levels=S.availableLevels(ex.id),count=S.examTasks(ex.id).length,last=[...st.history].reverse().find(x=>x.brand===ex.id);
        return '<button class="s5-card" data-s5="exam-brand" data-brand="'+ex.id+'"><strong>'+h(ex.name)+' · '+h(ex.fa)+'</strong><small>'+h(ex.focus)+'</small><span class="s5-meta">'+levels.join(" · ")+' · '+count+' تمرین سبک آزمون'+(last?' · آخرین '+last.result.score+'%':"")+'</span></button>';
      }).join("")+'</div>');
  }

  function examBrand(brand){
    selectedBrand=S.brandId(brand);const ex=S.EXAMS[selectedBrand];if(!ex)return examCenter();
    const levels=S.availableLevels(selectedBrand);if(!selectedLevel||!levels.includes(selectedLevel))selectedLevel=levels.includes(level())?level():levels[0];
    const tasks=S.examTasks(selectedBrand,selectedLevel),str=S.STRATEGIES[selectedBrand];
    open(head(ex.name,ex.fa+" · "+selectedLevel,ex.focus,true)+
      '<div class="s5-levels">'+levels.map(l=>'<button class="'+(l===selectedLevel?"on":"")+'" data-s5="exam-level" data-level="'+l+'">'+l+'</button>').join("")+'</div>'+
      '<div class="s5-mode-grid">'+Object.values(S.MODE).map(m=>'<button class="s5-mode" data-s5="start-mock" data-mode="'+m.id+'"><b>'+h(m.fa)+'</b><span>'+m.minutes+' دقیقه · تا '+m.count+' سؤال/فعالیت</span></button>').join("")+'</div>'+
      '<div class="s5-section"><h3>نمونه تمرین‌های تألیفی این مسیر</h3><div class="s5-list">'+
        tasks.slice(0,8).map(x=>'<button class="s5-item" data-s5="task" data-id="'+h(x.id)+'"><strong>'+h(skillFa(x.skill))+' · '+h(x.title)+'</strong><small>'+h(x.prompt)+'</small></button>').join("")+
        (tasks.length?"":'<div class="s5-note">برای این سطح تمرین اختصاصی برند کم است؛ Mock از تمرین‌های واقعی سطح و مهارت‌های همان سطح استفاده می‌کند.</div>')+
      '</div></div>'+
      '<div class="s5-note"><b>سه اصل:</b> '+str.before.map(h).join(" · ")+'</div>');
  }

  function taskPage(id){
    const item=S.examTasks(selectedBrand,selectedLevel).find(x=>x.id===id)||S.examTasks(selectedBrand).find(x=>x.id===id);if(!item)return examBrand(selectedBrand);
    activePathModule=null;
    let action="";
    if(item.skill==="writing")action='<textarea id="s5-task-answer" class="s5-answer" placeholder="Deutsch schreiben…"></textarea><button class="primary-button" style="width:100%;margin-top:8px" data-s5="score-task">ارزیابی تمرینی Writing</button><div id="s5-task-result"></div>';
    else if(item.skill==="speaking")action='<button class="primary-button" style="width:100%;margin-top:8px" data-s5="speak-task">🎙 شروع پاسخ Speaking</button><textarea id="s5-task-answer" class="s5-answer" placeholder="Transcript…" style="margin-top:8px"></textarea><button class="secondary-button" style="width:100%;margin-top:8px" data-s5="score-task">ارزیابی Transcript</button><div id="s5-task-result"></div>';
    else action='<div class="s5-note">این فعالیت برای تمرین آزاد است. امتیاز خودکار فقط جایی نمایش داده می‌شود که پاسخ مرجع یا Rubric داخلی قابل اتکا وجود دارد.</div>';
    box.innerHTML=head(item.level,item.exam+" · "+item.title,item.minutes+" دقیقه پیشنهادی",true)+'<div class="s5-prompt"><b>'+h(skillFa(item.skill))+'</b><p>'+h(item.prompt)+'</p></div>'+action;
    box.dataset.s5Task=id;
  }

  function scoreTask(){
    const id=box.dataset.s5Task,item=S.examTasks(selectedBrand).find(x=>x.id===id);if(!item)return;
    const text=document.getElementById("s5-task-answer")?.value||"",r=S.scoreItem({...item,source:"brand-exam-style",answer:"free"},text),el=document.getElementById("s5-task-result");
    if(el)el.innerHTML='<div class="s5-result"><h3>'+r.score+' / 100</h3><b>'+h(resultBadge(r.score))+'</b><small>'+h(r.limitations||S.SCORE_NOTE)+'</small></div>';
  }

  function startMock(mode){
    let st=state();st=S.startMock(st,selectedBrand,selectedLevel,mode,Date.now()%100000,Date.now());save(st);mockPage();
  }
  function resumeMock(){const st=state();if(!st.activeSession)return hub();selectedBrand=st.activeSession.brand;selectedLevel=st.activeSession.level;mockPage();}
  function currentItem(st){return st.activeSession&&st.activeSession.items[st.activeSession.index];}
  function answerValue(st,item){return st.activeSession&&st.activeSession.answers&&st.activeSession.answers[item.id]?st.activeSession.answers[item.id].value:"";}

  function mockPage(){
    let st=state(),s=st.activeSession;if(!s)return hub();
    if(S.remainingSec(s,Date.now())<=0){st=S.finishMock(st,Date.now());save(st);return resultPage(st.history[st.history.length-1]);}
    const item=currentItem(st),value=answerValue(st,item);
    let input="";
    if(item.source==="core-objective"&&Array.isArray(item.options)&&item.options.length){
      input='<div class="s5-options">'+item.options.map(o=>'<button class="'+(String(o)===String(value)?"on":"")+'" data-s5="mock-answer" data-value="'+encodeURIComponent(o)+'">'+h(o)+'</button>').join("")+'</div>';
    }else{
      input='<textarea id="s5-mock-answer" class="s5-answer" placeholder="'+(item.skill==="speaking"?"Transcript پاسخ گفتاری…":"پاسخ خود را بنویس…")+'">'+h(value)+'</textarea>'+
        (item.skill==="speaking"?'<button class="secondary-button" style="width:100%;margin-top:8px" data-s5="mock-speak">🎙 پاسخ گفتاری</button>':"");
    }
    open(head(s.brandName,s.level+" · "+(S.MODE[s.mode]&&S.MODE[s.mode].fa||s.mode),S.SCORE_NOTE,false)+
      '<div class="s5-exam-top"><span>سؤال '+(s.index+1)+' از '+s.items.length+'</span><strong id="s5-timer">--:--</strong></div>'+
      '<div class="s5-progress"><span style="width:'+Math.round((s.index+1)/s.items.length*100)+'%"></span></div>'+
      (item.context?'<div class="s5-context de" dir="ltr">'+h(item.context)+'</div>':"")+
      (item.audioText?'<button class="secondary-button" style="width:100%;margin:8px 0" data-s5="mock-play">🔊 پخش شنیداری</button>':"")+
      '<div class="s5-prompt"><b>'+h(skillFa(item.skill))+' · '+h(item.title)+'</b><p>'+h(item.prompt)+'</p></div>'+input+
      '<div class="s5-nav"><button data-s5="mock-prev" '+(s.index===0?"disabled":"")+'>قبلی</button><button data-s5="'+(s.index===s.items.length-1?"mock-finish":"mock-next")+'">'+(s.index===s.items.length-1?"پایان و نتیجه":"بعدی")+'</button></div>');
    startTimer();
  }

  function persistTextarea(){
    const st=state(),s=st.activeSession;if(!s)return st;const item=currentItem(st),el=document.getElementById("s5-mock-answer");
    if(item&&el){const next=S.saveMockAnswer(st,item.id,el.value||"");save(next);return next;}return st;
  }
  function move(delta){let st=persistTextarea(),s=st.activeSession;if(!s)return;st=S.moveMock(st,s.index+delta);save(st);mockPage();}
  function finishCurrent(){let st=persistTextarea();if(!st.activeSession)return;st=S.finishMock(st,Date.now());save(st);resultPage(st.history[st.history.length-1]);}
  function startTimer(){
    stopTimer();
    const tick=()=>{
      const st=state(),s=st.activeSession,el=document.getElementById("s5-timer");if(!s||!el){stopTimer();return;}
      const sec=S.remainingSec(s,Date.now());el.textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
      if(sec<=0){stopTimer();finishCurrent();}
    };
    tick();timerHandle=setInterval(tick,1000);
  }

  function resultPage(row){
    if(!row)return results();
    const r=row.result||{},sections=r.sections||{};
    open(head("نتیجه Mock",(S.EXAMS[row.brand]&&S.EXAMS[row.brand].name||row.brand)+" · "+row.level,(S.MODE[row.mode]&&S.MODE[row.mode].fa||row.mode),true)+
      '<div class="s5-kpis"><div><b>'+Number(r.score||0)+'%</b><span>امتیاز داخلی</span></div><div><b>'+Number(r.completion||0)+'%</b><span>تکمیل</span></div><div><b>'+Number(r.answered||0)+'/'+Number(r.total||0)+'</b><span>پاسخ‌داده‌شده</span></div></div>'+
      '<div class="s5-section"><h3>مهارت‌ها</h3>'+Object.entries(sections).map(([k,v])=>'<div class="s5-skill"><span>'+h(skillFa(k))+'</span><div class="s5-bar"><i style="width:'+clampCss(v)+'%"></i></div><b>'+Math.round(v)+'%</b></div>').join("")+'</div>'+
      '<div class="s5-note"><b>تمرکز بعدی:</b> '+((r.weakSkills||[]).map(x=>h(x.label+" "+x.score+"%")).join(" · ")||"داده بیشتری لازم است")+'</div>'+
      '<div class="s5-note s5-legal">'+h(r.note||S.SCORE_NOTE)+'</div>');
  }
  function clampCss(v){return Math.max(0,Math.min(100,Number(v)||0));}

  function results(){
    const st=state(),sum=S.historySummary(st.history),ready=S.testdafReadiness(st.history,(function(){try{return T&&T.readStorage?T.readStorage(localStorage,"device",level()).learnerProfile:null;}catch(_){return null;}})());
    open(head("نتایج و تحلیل","Mockهای ثبت‌شده: "+sum.attempts,S.SCORE_NOTE,true)+
      '<div class="s5-kpis"><div><b>'+sum.average+'%</b><span>میانگین ۱۰ آزمون اخیر</span></div><div><b>'+ready.score+'%</b><span>TestDaF Readiness</span></div><div><b>'+sum.recent+'</b><span>نمونه اخیر</span></div></div>'+
      '<div class="s5-note"><b>TestDaF:</b> '+h(ready.label)+' · '+h(ready.note)+'</div>'+
      '<div class="s5-section"><h3>ضعف‌های فعلی</h3>'+(sum.weak.length?sum.weak.map(x=>'<div class="s5-skill"><span>'+h(x.label)+'</span><div class="s5-bar"><i style="width:'+clampCss(x.score)+'%"></i></div><b>'+x.score+'%</b></div>').join(""):'<div class="s5-note">هنوز Mock کافی برای تحلیل مهارتی وجود ندارد.</div>')+'</div>'+
      '<div class="s5-list">'+[...st.history].reverse().slice(0,8).map((x,i)=>'<button class="s5-item" data-s5="history-row" data-index="'+i+'"><strong>'+h((S.EXAMS[x.brand]&&S.EXAMS[x.brand].name||x.brand)+" · "+x.level+" · "+x.result.score+"%")+'</strong><small>'+h((S.MODE[x.mode]&&S.MODE[x.mode].fa||x.mode)+" · "+x.result.completion+"% تکمیل")+'</small></button>').join("")+'</div>');
  }

  function techniques(){
    open(head("Exam Strategy","تکنیک‌ها و تله‌ها","راهبردها برای تمرین‌اند؛ دستورالعمل رسمی روز آزمون را همیشه از برگزارکننده همان آزمون بگیر.",true)+
      '<div class="s5-grid">'+Object.values(S.EXAMS).map(x=>'<button class="s5-card" data-s5="tech-brand" data-brand="'+x.id+'"><strong>'+h(x.name)+'</strong><small>'+h(x.focus)+'</small></button>').join("")+'</div>');
  }
  function techniqueBrand(b){
    const ex=S.EXAMS[b],s=S.STRATEGIES[b];if(!ex||!s)return techniques();
    open(head(ex.name,"تکنیک و تله",ex.focus,true)+
      '<div class="s5-columns"><div class="s5-note"><b>قبل و حین پاسخ</b><ol>'+s.before.map(x=>'<li>'+h(x)+'</li>').join("")+'</ol></div><div class="s5-note"><b>تله‌های رایج</b><ol>'+s.traps.map(x=>'<li>'+h(x)+'</li>').join("")+'</ol></div></div>');
  }

  function pathCenter(){
    const st=state(),paths=S.pathways();
    open(head("مسیرهای هدف‌محور","برای هدف واقعی یاد بگیر","هر ماژول Writing و Speaking واقعی دارد و تکمیل بر اساس شواهد ثبت می‌شود.",true)+
      '<div class="s5-grid">'+paths.map(p=>{const q=S.pathwayStats(st,p.id);return '<button class="s5-card" data-s5="path" data-path="'+p.id+'"><strong>'+p.icon+' '+h(p.fa)+'</strong><small>'+q.done+' از '+q.total+' ماژول مسلط</small><div class="s5-progress"><span style="width:'+q.percent+'%"></span></div></button>';}).join("")+'</div>');
  }
  function showPath(id){
    currentPath=id;const p=S.pathways().find(x=>x.id===id);if(!p)return pathCenter();
    const levels=[...new Set(p.modules.map(x=>x.level))];if(pathLevel&&!levels.includes(pathLevel))pathLevel="";
    const mods=p.modules.filter(x=>!pathLevel||x.level===pathLevel),st=state();
    open(head(p.icon,p.fa,p.title,true)+
      '<div class="s5-levels"><button class="'+(!pathLevel?"on":"")+'" data-s5="path-level" data-level="">همه</button>'+levels.map(l=>'<button class="'+(pathLevel===l?"on":"")+'" data-s5="path-level" data-level="'+l+'">'+l+'</button>').join("")+'</div>'+
      '<div class="s5-list">'+mods.map(m=>{const x=st.pathwayProgress[id+"|"+m.id]||{};return '<button class="s5-item" data-s5="path-module" data-id="'+h(m.id)+'"><strong>'+h(m.level+" · "+m.fa)+'</strong><small>'+h(m.title+" — "+m.goal)+'</small><span class="s5-meta">'+(x.done?"✓ تسلط تمرینی":"Writing "+(x.writing||0)+"% · Speaking "+(x.speaking||0)+"%")+'</span></button>';}).join("")+'</div>');
  }
  function pathModule(id){
    const m=S.pathwayModules(currentPath).find(x=>x.id===id);if(!m)return showPath(currentPath);activePathModule=m;
    const st=state(),x=st.pathwayProgress[currentPath+"|"+m.id]||{};
    open(head(m.level,m.fa,m.title,true)+
      '<div class="s5-prompt"><b>هدف</b><p>'+h(m.goal)+'</p></div>'+
      '<div class="s5-vocab">'+(m.vocabulary||[]).map(v=>'<div><b class="de" dir="ltr">'+h(v.de)+'</b><span>'+h(v.fa)+'</span></div>').join("")+'</div>'+
      '<div class="s5-note"><b>عبارت‌های کاربردی</b>'+(m.phrases||[]).map(p=>'<p class="de" dir="ltr">'+h(p)+'</p>').join("")+'<button class="secondary-button" style="width:100%" data-s5="path-listen">🔊 شنیدن عبارت‌ها</button></div>'+
      '<div class="s5-section"><h3>Writing</h3><div class="s5-note">'+h(m.writing)+'</div><textarea id="s5-path-writing" class="s5-answer"></textarea><button class="primary-button" style="width:100%;margin-top:8px" data-s5="path-writing-score">ارزیابی Writing</button><div id="s5-path-writing-result"></div></div>'+
      '<div class="s5-section"><h3>Speaking</h3><div class="s5-note">'+h(m.speaking)+'</div><button class="primary-button" style="width:100%" data-s5="path-speaking">🎙 شروع Speaking</button><textarea id="s5-path-speaking" class="s5-answer" placeholder="Transcript…" style="margin-top:8px"></textarea><button class="secondary-button" style="width:100%;margin-top:8px" data-s5="path-speaking-score">ارزیابی Transcript</button><div id="s5-path-speaking-result"></div></div>'+
      '<div class="s5-note"><b>وضعیت:</b> Writing '+(x.writing||0)+'% · Speaking '+(x.speaking||0)+'%'+(x.done?' · ✅ تسلط تمرینی':'')+'</div>');
  }
  function pathScore(skill){
    if(!activePathModule||!T)return;
    const id=skill==="writing"?"s5-path-writing":"s5-path-speaking",text=document.getElementById(id)?.value||"";
    const r=skill==="writing"?T.evaluateWriting(text,activePathModule.level,activePathModule.writing):T.evaluateSpeaking(text,activePathModule.level,activePathModule.speaking);
    let st=S.markPathway(state(),currentPath,activePathModule.id,skill,r.total);save(st);
    const el=document.getElementById(id+"-result");if(el)el.innerHTML='<div class="s5-result"><h3>'+r.total+' / 100</h3><small>'+h(r.limitations||S.SCORE_NOTE)+'</small></div>';
  }

  window.onSpeechResult=function(text){
    if(speechTarget==="s5-mock"){
      speechTarget=null;let st=state(),item=currentItem(st);if(item){st=S.saveMockAnswer(st,item.id,text);save(st);const el=document.getElementById("s5-mock-answer");if(el)el.value=text;}return;
    }
    if(speechTarget==="s5-task"){
      speechTarget=null;const el=document.getElementById("s5-task-answer");if(el)el.value=text;scoreTask();return;
    }
    if(speechTarget==="s5-path"){
      speechTarget=null;const el=document.getElementById("s5-path-speaking");if(el)el.value=text;pathScore("speaking");return;
    }
    if(typeof previousSpeech==="function")previousSpeech(text);
  };
  window.onSpeechError=function(msg){
    if(speechTarget&&speechTarget.startsWith("s5-")){speechTarget=null;const el=document.getElementById("s5-task-result")||document.getElementById("s5-path-speaking-result");if(el)el.innerHTML='<div class="s5-note">'+h(msg)+'</div>';return;}
    if(typeof previousSpeechError==="function")previousSpeechError(msg);
  };

  document.addEventListener("input",e=>{
    if(e.target&&e.target.id==="s5-mock-answer"){
      const st=state(),item=currentItem(st);if(item)save(S.saveMockAnswer(st,item.id,e.target.value||""));
    }
  });
  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-s5]");if(!t)return;const a=t.dataset.s5;
    if(a==="close")close();else if(a==="hub")hub();
    else if(a==="exam-center")examCenter();else if(a==="exam-brand")examBrand(t.dataset.brand);
    else if(a==="exam-level"){selectedLevel=t.dataset.level;examBrand(selectedBrand);}else if(a==="start-mock")startMock(t.dataset.mode);
    else if(a==="resume")resumeMock();else if(a==="task")taskPage(t.dataset.id);else if(a==="score-task")scoreTask();
    else if(a==="speak-task"){speechTarget="s5-task";native("startSpeechRecognition","Stage 5 exam speaking");}
    else if(a==="mock-answer"){let st=state(),item=currentItem(st);if(item){st=S.saveMockAnswer(st,item.id,decodeURIComponent(t.dataset.value||""));save(st);mockPage();}}
    else if(a==="mock-play"){const st=state(),item=currentItem(st);if(item&&item.audioText)native("speak",item.audioText);}
    else if(a==="mock-speak"){speechTarget="s5-mock";native("startSpeechRecognition","Stage 5 mock speaking");}
    else if(a==="mock-prev")move(-1);else if(a==="mock-next")move(1);else if(a==="mock-finish")finishCurrent();
    else if(a==="results")results();else if(a==="history-row"){const st=state(),rows=[...st.history].reverse();resultPage(rows[Number(t.dataset.index)||0]);}
    else if(a==="techniques")techniques();else if(a==="tech-brand")techniqueBrand(t.dataset.brand);
    else if(a==="path-center")pathCenter();else if(a==="path")showPath(t.dataset.path);
    else if(a==="path-level"){pathLevel=t.dataset.level||"";showPath(currentPath);}else if(a==="path-module")pathModule(t.dataset.id);
    else if(a==="path-listen"&&activePathModule)native("speak",(activePathModule.phrases||[]).join(". "));
    else if(a==="path-writing-score")pathScore("writing");else if(a==="path-speaking"){speechTarget="s5-path";native("startSpeechRecognition","Stage 5 pathway speaking");}
    else if(a==="path-speaking-score")pathScore("speaking");
  });

  function inject(){
    const grid=view.querySelector(".skill-grid");if(!grid||view.querySelector("[data-s5='hub']"))return;
    const html='<button class="card skill-card s5-entry" data-s5="hub"><span class="big-icon">🏅</span><strong>مرحله ۵ · آزمون‌ها و مسیرهای تخصصی</strong><small>Goethe، telc، TestDaF، ÖSD + Mock زمان‌دار + مهاجرت، دانشگاه، کار و زندگی واقعی.</small></button>';
    const anchor=view.querySelector("[data-s4='hub']")||view.querySelector("[data-r11='checkpoint']")||view.querySelector("[data-r11='learning']");
    if(anchor)anchor.insertAdjacentHTML("afterend",html);else grid.insertAdjacentHTML("beforeend",html);
  }
  document.addEventListener("ghazal:ui-changed",inject);setTimeout(inject,550);
})();