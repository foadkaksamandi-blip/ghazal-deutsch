(function(){
  "use strict";
  const D=window.GhazalDictionary,Deep=window.GhazalDeepLibrary,L=window.GhazalLibrary,view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!D||!Deep||!view||!modal||!box)return;
  const LEVELS=["A1","A2","B1","B2","C1","C2"],FAV_KEY="ghazal_dictionary_favorites_v1",OS_KEY="ghazal_deutsch_os_v1";
  let dictLevel="",deepLevel="A1",deepType="reading",examName="",examLevel="",examSkill="",activeExam=null,timerId=null,timerEnds=0;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){if(timerId){clearInterval(timerId);timerId=null;}activeExam=null;modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";}
  function head(tag,title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r8="close">×</button></div>';}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function favs(){try{return new Set(JSON.parse(localStorage.getItem(FAV_KEY)||"[]"));}catch(_){return new Set();}}
  function saveFavs(set){localStorage.setItem(FAV_KEY,JSON.stringify(Array.from(set)));}
  function logSkill(id,score){let os={};try{os=JSON.parse(localStorage.getItem(OS_KEY)||"{}")||{};}catch(_){}os.skills=os.skills||{};const s=os.skills[id]||{attempts:0,total:0,best:0};const n=Math.max(0,Math.min(100,Number(score)||0));s.attempts=(s.attempts||0)+1;s.total=(s.total||0)+n;s.best=Math.max(s.best||0,n);s.lastAt=new Date().toISOString();os.skills[id]=s;localStorage.setItem(OS_KEY,JSON.stringify(os));}

  function showHub(){
    open(head("Stage 2","عمق محتوای آموزشی","دیکشنری، Contrast Lab، تمرین عمیق و بانک آزمون؛ همگی آفلاین.")+
      '<div class="r6-grid">'+
      '<button class="r6-card" data-r8="dictionary"><strong>📖 دیکشنری داخلی</strong><small>'+D.all.length+' مدخل از واژگان غنی و لغات واقعی درس‌ها.</small></button>'+
      '<button class="r6-card" data-r8="contrasts"><strong>⚖ Contrast Lab</strong><small>'+Deep.contrasts.length+' تفاوت مهم گرامری و معنایی A1–C2.</small></button>'+
      '<button class="r6-card" data-r8="deep"><strong>🧠 تمرین عمیق</strong><small>Reading، Listening، Writing و Speaking اضافه.</small></button>'+
      '<button class="r6-card" data-r8="exams"><strong>⏱ بانک آزمون</strong><small>'+Deep.exams.length+' Task برای Goethe، telc، TestDaF و ÖSD.</small></button>'+
      '</div>');
  }

  function dictToolbar(){
    return '<div class="r8-toolbar"><button class="'+(!dictLevel?"on":"")+'" data-r8="dict-level" data-level="">همه</button>'+LEVELS.map(x=>'<button class="'+(dictLevel===x?"on":"")+'" data-r8="dict-level" data-level="'+x+'">'+x+'</button>').join("")+'<button data-r8="dict-favs">★ شخصی</button></div>';
  }
  function renderDictResults(q,onlyFav){
    const set=favs();let results=D.search(q||"",dictLevel,120);if(onlyFav)results=results.filter(x=>set.has(x.id));
    if(!results.length)return '<div class="r6-empty">نتیجه‌ای پیدا نشد.</div>';
    return results.map(x=>'<button class="r8-item" data-r8="dict-detail" data-id="'+h(x.id)+'"><strong class="r8-de">'+h(x.lemma)+'</strong><small>'+h(x.meaning)+(x.example?" · "+h(x.example):"")+'</small><div class="r8-meta"><span class="r8-chip">'+h(x.level)+'</span><span class="r8-chip">'+h(x.pos)+'</span>'+(set.has(x.id)?'<span class="r8-chip">★ ذخیره</span>':"")+'</div></button>').join("");
  }
  function showDictionary(q,onlyFav){
    open(head("Offline Dictionary","دیکشنری داخلی GHAZAL","جستجو در مدخل‌های غنی و واژه‌های استخراج‌شده از همه درس‌ها.")+
      '<input id="r8-dict-q" class="r8-search" value="'+h(q||"")+'" placeholder="Deutsch / فارسی / مثال…">'+dictToolbar()+
      '<div id="r8-dict-results" class="r8-list">'+renderDictResults(q||"",!!onlyFav)+'</div>');
    const input=document.getElementById("r8-dict-q");if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
  }
  function showWord(id){
    const x=D.all.find(y=>y.id===id);if(!x)return;const set=favs(),isFav=set.has(id);
    open(head(x.level,x.lemma,x.meaning)+
      '<div class="r8-detail">'+
      '<div class="r8-box"><b>نوع واژه</b>'+h(x.pos)+'</div>'+
      (x.plural?'<div class="r8-box r8-de"><b>Plural</b>'+h(x.plural)+'</div>':"")+
      (x.grammar?'<div class="r8-box"><b>Grammar / Präposition</b>'+h(x.grammar)+'</div>':"")+
      (x.collocation?'<div class="r8-box r8-de"><b>Collocation</b>'+h(x.collocation)+'</div>':"")+
      (x.example?'<div class="r8-box r8-de"><b>Beispiel</b>'+h(x.example)+'</div>':"")+
      '<div class="button-row"><button class="secondary-button" data-r8="speak-word" data-text="'+encodeURIComponent(x.lemma+(x.example?". "+x.example:""))+'">🔊 شنیدن</button><button class="primary-button" data-r8="toggle-fav" data-id="'+h(id)+'">'+(isFav?"★ حذف از شخصی":"☆ افزودن به شخصی")+'</button></div>'+
      '<button class="secondary-button" data-r8="dictionary" style="margin-top:8px">برگشت به دیکشنری</button></div>');
  }

  function showContrasts(){
    const list=Deep.contrasts.filter(x=>x.level===deepLevel);
    open(head("Contrast Lab","تفاوت‌های مهم","برای جلوگیری از خطاهای ماندگار، دو ساختار نزدیک را کنار هم ببین.")+
      '<div class="r7-levels">'+LEVELS.map(x=>'<button class="'+(deepLevel===x?"on":"")+'" data-r8="contrast-level" data-level="'+x+'">'+x+'</button>').join("")+'</div>'+
      '<div class="r8-list">'+list.map(x=>'<button class="r8-item" data-r8="contrast-detail" data-id="'+x.id+'"><strong>'+h(x.title)+'</strong><small>'+h(x.explanation)+'</small></button>').join("")+'</div>');
  }
  function showContrast(id){const x=Deep.contrasts.find(y=>y.id===id);if(!x)return;open(head(x.level,x.title,"مقایسه + مثال + دام رایج")+'<div class="r8-detail"><div class="r8-box"><b>تفاوت</b>'+h(x.explanation)+'</div><div class="r8-box r8-de"><b>Beispiel</b>'+h(x.example)+'</div><div class="r8-box"><b>⚠ دام رایج</b>'+h(x.trap)+'</div><button class="secondary-button" data-r8="contrasts">برگشت</button></div>');}

  function deepItems(){
    if(deepType==="reading")return Deep.reading.filter(x=>x.level===deepLevel);
    if(deepType==="listening")return Deep.listening.filter(x=>x.level===deepLevel);
    if(deepType==="writing")return Deep.writing.filter(x=>x.level===deepLevel);
    return Deep.speaking.filter(x=>x.level===deepLevel);
  }
  function showDeep(){
    const items=deepItems();
    open(head("Deep Practice","تمرین عمیق","بانک اضافه برای انتقال مهارت به موقعیت جدید.")+
      '<div class="r7-levels">'+LEVELS.map(x=>'<button class="'+(deepLevel===x?"on":"")+'" data-r8="deep-level" data-level="'+x+'">'+x+'</button>').join("")+'</div>'+
      '<div class="r8-segment">'+[["reading","Reading"],["listening","Listening"],["writing","Writing"],["speaking","Speaking"]].map(x=>'<button class="'+(deepType===x[0]?"on":"")+'" data-r8="deep-type" data-type="'+x[0]+'">'+x[1]+'</button>').join("")+'</div>'+
      '<div class="r8-list">'+items.map(x=>'<button class="r8-item" data-r8="deep-detail" data-id="'+x.id+'"><strong>'+h(x.title||deepType.toUpperCase())+'</strong><small>'+h(x.text||x.script||x.prompt||"")+'</small></button>').join("")+'</div>');
  }
  function showDeepDetail(id){
    const all=[...Deep.reading,...Deep.listening,...Deep.writing,...Deep.speaking],x=all.find(y=>y.id===id);if(!x)return;
    if(x.text){
      open(head(x.level,x.title,"متن را بخوان و پاسخ را بدون ترجمه خط‌به‌خط تولید کن.")+'<div class="r8-box r8-de">'+h(x.text)+'</div>'+x.questions.map((q,i)=>'<div class="r7-question"><b>'+h((i+1)+". "+q)+'</b><textarea class="r8-answer" style="min-height:70px"></textarea></div>').join("")+'<button class="primary-button" data-r8="finish-deep" data-skill="reading">ثبت تمرین</button>');
    }else if(x.script){
      open(head(x.level,x.title,"اول گوش کن، سپس Transcript را باز کن.")+'<div class="r8-box"><b>Focus</b>'+x.focus.map(f=>'<span class="r8-chip">'+h(f)+'</span>').join(" ")+'</div><div class="button-row" style="margin-top:10px"><button class="secondary-button" data-r8="play-deep" data-id="'+x.id+'">🔊 پخش</button><button class="primary-button" data-r8="show-transcript" data-id="'+x.id+'">Transcript</button></div><div id="r8-transcript"></div>');
    }else{
      const skill=id.includes("write")?"writing":"speaking";
      open(head(x.level,skill==="writing"?"Writing Task":"Speaking Task","تولید آزاد در موضوع جدید.")+'<div class="r8-box">'+h(x.prompt)+'</div>'+(skill==="writing"?'<textarea id="r8-deep-answer" class="r8-answer" placeholder="Deutsch schreiben…"></textarea><button class="primary-button" style="margin-top:8px" data-r8="finish-deep" data-skill="writing">ثبت Writing</button>':'<button class="primary-button" style="margin-top:8px" data-r8="deep-speak">🎙 شروع Speaking</button><div class="r8-box" style="margin-top:8px">این Task برای تولید آزاد است؛ Speech Recognition دستگاه برای ثبت پاسخ استفاده می‌شود.</div>'));
    }
  }

  function examFilters(){
    const exams=["","Goethe","telc","TestDaF","ÖSD"],skills=["","Sprechen","Schreiben","Lesen","Hören"];
    return '<div class="r8-toolbar"><select id="r8-exam-name">'+exams.map(x=>'<option value="'+x+'" '+(examName===x?"selected":"")+'>'+(x||"همه آزمون‌ها")+'</option>').join("")+'</select><select id="r8-exam-level"><option value="">همه سطح‌ها</option>'+LEVELS.map(x=>'<option value="'+x+'" '+(examLevel===x?"selected":"")+'>'+x+'</option>').join("")+'</select><select id="r8-exam-skill">'+skills.map(x=>'<option value="'+x+'" '+(examSkill===x?"selected":"")+'>'+(x||"همه مهارت‌ها")+'</option>').join("")+'</select></div>';
  }
  function showExams(){
    let items=Deep.exams.filter(x=>(!examName||x.exam===examName)&&(!examLevel||x.level===examLevel)&&(!examSkill||x.skill===examSkill));
    open(head("Exam Bank","بانک تمرین آزمون","Taskهای تمرینی مستقل؛ قالب رسمی هر آزمون در زمان انتشار باید با منبع رسمی همان سال دوباره تطبیق داده شود.")+
      examFilters()+'<div class="r8-list">'+items.map(x=>'<button class="r8-item" data-r8="exam-detail" data-id="'+x.id+'"><strong>'+h(x.exam+" · "+x.level+" · "+x.skill)+'</strong><small>'+h(x.title+" — "+x.task)+'</small><div class="r8-meta"><span class="r8-chip">'+x.minutes+' دقیقه</span></div></button>').join("")+'</div>');
  }
  function showExamTask(id){
    const x=Deep.exams.find(y=>y.id===id);if(!x)return;activeExam=x;
    open(head(x.exam+" · "+x.level,x.title,x.skill)+'<div class="r8-box">'+h(x.task)+'</div><div id="r8-timer" class="r8-timer">'+String(x.minutes).padStart(2,"0")+':00</div><button class="primary-button" data-r8="start-timer">شروع تایمر</button><textarea id="r8-exam-answer" class="r8-answer" style="margin-top:10px" placeholder="یادداشت/پاسخ تمرینی…"></textarea><button class="secondary-button" style="margin-top:8px" data-r8="finish-exam">پایان و ثبت تمرین</button>');
  }
  function startTimer(){
    if(!activeExam||timerId)return;timerEnds=Date.now()+activeExam.minutes*60000;const el=document.getElementById("r8-timer");
    const tick=()=>{const left=Math.max(0,timerEnds-Date.now()),m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);if(el)el.textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");if(left<=0){clearInterval(timerId);timerId=null;}};
    tick();timerId=setInterval(tick,500);
  }

  function inject(){
    const grid=view.querySelector(".skill-grid");
    if(grid&&!view.querySelector("[data-r8='hub']"))grid.insertAdjacentHTML("beforeend",'<button class="card skill-card os-accent" data-r8="hub"><span class="big-icon">🧩</span><strong>Stage 2 · عمق محتوا</strong><small>Dictionary، Contrast، Deep Practice و Exam Bank.</small></button>');
  }

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r8]");if(!t)return;const a=t.dataset.r8;
    if(a==="close")close();
    else if(a==="hub")showHub();
    else if(a==="dictionary")showDictionary("",false);
    else if(a==="dict-level"){dictLevel=t.dataset.level||"";showDictionary(document.getElementById("r8-dict-q")?.value||"",false);}
    else if(a==="dict-favs")showDictionary("",true);
    else if(a==="dict-detail")showWord(t.dataset.id);
    else if(a==="speak-word")native("speak",decodeURIComponent(t.dataset.text||""));
    else if(a==="toggle-fav"){const set=favs();set.has(t.dataset.id)?set.delete(t.dataset.id):set.add(t.dataset.id);saveFavs(set);showWord(t.dataset.id);}
    else if(a==="contrasts")showContrasts();
    else if(a==="contrast-level"){deepLevel=t.dataset.level;showContrasts();}
    else if(a==="contrast-detail")showContrast(t.dataset.id);
    else if(a==="deep")showDeep();
    else if(a==="deep-level"){deepLevel=t.dataset.level;showDeep();}
    else if(a==="deep-type"){deepType=t.dataset.type;showDeep();}
    else if(a==="deep-detail")showDeepDetail(t.dataset.id);
    else if(a==="play-deep"){const x=Deep.listening.find(y=>y.id===t.dataset.id);if(x)native("speak",x.script);}
    else if(a==="show-transcript"){const x=Deep.listening.find(y=>y.id===t.dataset.id),el=document.getElementById("r8-transcript");if(x&&el){el.innerHTML='<div class="r8-box r8-de" style="margin-top:10px">'+h(x.script)+'</div>';logSkill("listening",70);}}
    else if(a==="finish-deep"){logSkill(t.dataset.skill||"transfer",75);close();}
    else if(a==="deep-speak"){native("startSpeechRecognition","Deutsch sprechen");logSkill("speaking",70);}
    else if(a==="exams")showExams();
    else if(a==="exam-detail")showExamTask(t.dataset.id);
    else if(a==="start-timer")startTimer();
    else if(a==="finish-exam"){if(activeExam)logSkill("exam-"+activeExam.exam.toLowerCase(),75);close();}
  });
  document.addEventListener("input",e=>{if(e.target&&e.target.id==="r8-dict-q"){const el=document.getElementById("r8-dict-results");if(el)el.innerHTML=renderDictResults(e.target.value,false);}});
  document.addEventListener("change",e=>{if(e.target.id==="r8-exam-name"||e.target.id==="r8-exam-level"||e.target.id==="r8-exam-skill"){examName=document.getElementById("r8-exam-name")?.value||"";examLevel=document.getElementById("r8-exam-level")?.value||"";examSkill=document.getElementById("r8-exam-skill")?.value||"";showExams();}});
  document.addEventListener("ghazal:ui-changed",inject);setTimeout(inject,350);
})();