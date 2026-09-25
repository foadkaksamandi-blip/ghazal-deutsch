(function(){
  "use strict";
  const T=window.GhazalStage4Tutor,E=window.GhazalExerciseEngine,B=window.GhazalLearningBridge;
  const view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!T||!E||!B||!view||!modal||!box)return;
  let speechTarget=null,activeExercise=null,activeBaselineIndex=0,previousSpeech=window.onSpeechResult,previousSpeechError=window.onSpeechError;
  const LEVELS=T.LEVELS;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function learning(){try{return B.state()||{};}catch(_){return{};}}
  function tutor(){const l=learning();return T.readStorage(localStorage,l.profileId||"local",l.currentLevel||"A1");}
  function save(s){return T.writeStorage(localStorage,s);}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){speechTarget=null;modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";}
  function head(title,sub,back){
    return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">مرحله ۴</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="'+(back?"r11-back-button":"close-button")+'" data-s4="'+(back?"hub":"close")+'">'+(back?"‹ برگشت":"×")+'</button></div>';
  }
  function skillFa(k){return T.SKILL_FA[k]||k;}
  function last(a){return Array.isArray(a)&&a.length?a[a.length-1]:null;}
  function recompute(s){
    const l=learning(),w=last(s.writingHistory),sp=last(s.speakingHistory);
    return T.applyAssessment(s,l,s.baseline,w,sp);
  }
  function recordLearning(ex,score,answer){try{B.record(ex,score,{answer:answer||"",confidence:score,transfer:true});}catch(_){}}

  function hub(){
    let s=recompute(tutor());s=save(s);const p=s.learnerProfile,c=T.completion(p),err=T.errorProfile(learning(),s),weak=(p.weakest||[])[0];
    open(head("مربی خصوصی و ارزیابی","کاملاً آفلاین؛ بر اساس شواهد واقعی استفاده تو از برنامه.",false)+
      '<div class="r11-kpis"><div class="r11-kpi"><b>'+h(p.level)+'</b><span>سطح پیشنهادی</span></div><div class="r11-kpi"><b>'+p.overall+'%</b><span>میانگین مهارتی</span></div><div class="r11-kpi"><b>'+c.percent+'%</b><span>کامل بودن پروفایل</span></div></div>'+
      (weak?'<div class="s4-focus"><b>اولویت فعلی: '+h(skillFa(weak.skill))+'</b><span>امتیاز '+weak.score+' از ۱۰۰ · '+h(weak.label)+'</span></div>':'')+
      '<div class="r11-grid" style="margin-top:10px">'+
        '<button class="r11-card s4-primary" data-s4="baseline"><strong>🧭 ارزیابی پایه و تعیین سطح</strong><small>واژگان، گرامر، خواندن و شنیدن از A1 تا C2.</small></button>'+
        '<button class="r11-card" data-s4="tutor"><strong>🧠 مربی خصوصی آفلاین</strong><small>راهنمایی بر اساس ضعف‌ها و محتوای واقعی داخل اپ.</small></button>'+
        '<button class="r11-card" data-s4="writing"><strong>✍️ ارزیابی Writing</strong><small>ساختار، گرامر، واژگان، انسجام و Register.</small></button>'+
        '<button class="r11-card" data-s4="speaking"><strong>🎙 ارزیابی Speaking</strong><small>Transcript، پوشش پاسخ، انسجام، واژگان و دقت.</small></button>'+
        '<button class="r11-card" data-s4="pronunciation"><strong>🔊 تمرین تلفظ تقریبی</strong><small>مقایسه Transcript با جمله هدف؛ بدون ادعای تحلیل Phoneme.</small></button>'+
        '<button class="r11-card" data-s4="errors"><strong>🧯 پروفایل خطا و ضعف</strong><small>'+err.active+' خطای فعال و اولویت‌های ترمیمی.</small></button>'+
        '<button class="r11-card" data-s4="adaptive"><strong>🗺 مسیر شخصی امروز</strong><small>برنامه تمرینی بر اساس ضعیف‌ترین مهارت‌ها و خطاها.</small></button>'+
        '<button class="r11-card" data-s4="profile"><strong>📊 Learner Profile</strong><small>شش مهارت با امتیاز، شواهد و Confidence مستقل.</small></button>'+
      '</div>'+
      '<div class="r11-box s4-note" style="margin-top:10px"><b>محدودیت شفاف:</b> Writing و Tutor آفلاین Rule-Based هستند و Speaking از تشخیص گفتار دستگاه استفاده می‌کند؛ این بخش جایگزین ارزیابی انسانی یا AI آنلاین نیست.</div>');
  }

  function baselineStart(){
    let s=tutor();s._baselineSession=T.buildBaselineAssessment(Date.now()%10000);s._baselineAnswers=[];s=T.setResume(s,{kind:"baseline",id:s._baselineSession.id,step:0});save(s);baselineQuestion(0);
  }
  function baselineQuestion(index){
    let s=tutor(),session=s._baselineSession;if(!session)return baselineStart();
    const item=session.items[index];activeBaselineIndex=index;
    if(!item){
      const result=T.scoreBaseline(session,s._baselineAnswers||[]);s.baseline=result;s.currentLevel=result.suggestedLevel;s=T.clearResume(s);s=recompute(s);save(s);
      return open(head("نتیجه ارزیابی پایه","این سطح داخلی برای شخصی‌سازی است و مدرک رسمی CEFR نیست.",true)+
        '<div class="r11-kpis"><div class="r11-kpi"><b>'+result.suggestedLevel+'</b><span>سطح پیشنهادی</span></div><div class="r11-kpi"><b>'+result.overall+'%</b><span>میانگین</span></div><div class="r11-kpi"><b>'+result.confidence+'%</b><span>Confidence</span></div></div>'+
        '<div class="r11-box" style="margin-top:10px">'+Object.entries(result.skillScores).filter(([k])=>["vocabulary","grammar","reading","listening"].includes(k)).map(([k,v])=>'<span class="r11-chip">'+h(skillFa(k))+' '+v+'%</span>').join("")+'</div>'+
        '<div class="r11-grid" style="margin-top:10px"><button class="r11-card" data-s4="writing"><strong>✍️ تکمیل با Writing</strong><small>برای کامل شدن پروفایل ۶ مهارتی.</small></button><button class="r11-card" data-s4="speaking"><strong>🎙 تکمیل با Speaking</strong><small>ارزیابی گفتار با Transcript دستگاه.</small></button></div>');
    }
    s=T.setResume(s,{kind:"baseline",id:session.id,step:index});save(s);
    let html=head("ارزیابی پایه · سؤال "+(index+1)+" از "+session.items.length,item.diagnosticLevel+" · "+skillFa(item.diagnosticSkill),true);
    if(item.context)html+='<div class="r11-box de" dir="ltr">'+h(item.context)+'</div>';
    if(item.type==="diagnostic-listening")html+='<button class="secondary-button" style="width:100%;margin-bottom:8px" data-s4="baseline-play">🔊 پخش متن شنیداری</button>';
    html+='<div class="r11-box"><b>'+h(item.prompt)+'</b></div>';
    if(Array.isArray(item.options)&&item.options.length)html+='<div class="s4-options">'+item.options.map(o=>'<button data-s4="baseline-option" data-value="'+encodeURIComponent(o)+'">'+h(o)+'</button>').join("")+'</div>';
    else html+='<input id="s4-baseline-answer" class="r11-input" style="margin-top:8px" placeholder="پاسخ…"><button class="primary-button" style="width:100%;margin-top:8px" data-s4="baseline-check">ثبت و بعدی</button>';
    open(html);
  }
  function baselineSave(answer){
    let s=tutor(),session=s._baselineSession;if(!session)return;const arr=Array.isArray(s._baselineAnswers)?s._baselineAnswers:[];arr[activeBaselineIndex]={answer:String(answer||"")};s._baselineAnswers=arr;save(s);baselineQuestion(activeBaselineIndex+1);
  }

  function writing(){
    let s=tutor(),p=s.learnerProfile||{},prod=T.buildProductionAssessment(p.level||s.currentLevel),ex=prod.writing,draft=s.resume&&s.resume.kind==="writing"&&s.resume.id===ex.id?s.resume.payload&&s.resume.payload.draft||"":"";
    activeExercise=ex;s=T.setResume(s,{kind:"writing",id:ex.id,step:0,payload:{draft}});save(s);
    open(head("ارزیابی Writing",ex.level+" · بازخورد آفلاین ساختاریافته",true)+
      '<div class="r11-box"><b>موضوع:</b><br>'+h(ex.prompt)+'</div>'+
      '<textarea id="s4-writing-text" class="r11-textarea" style="min-height:180px;margin-top:8px" placeholder="Deutsch schreiben…">'+h(draft)+'</textarea>'+
      '<button class="primary-button" style="width:100%;margin-top:8px" data-s4="writing-evaluate">ارزیابی پاسخ</button><div id="s4-writing-result"></div>');
  }
  function evaluateWriting(){
    const text=document.getElementById("s4-writing-text")?.value||"",ex=activeExercise;if(!ex)return;
    let s=tutor(),r=T.evaluateWriting(text,ex.level,ex.prompt);s=T.recordWriting(s,r);s=T.clearResume(s);recordLearning(ex,r.total,text);s=recompute(s);save(s);
    const el=document.getElementById("s4-writing-result");if(el)el.innerHTML='<div class="s4-result"><h3>'+r.total+' / 100</h3>'+
      '<div class="s4-rubric">'+Object.entries(r.rubric).map(([k,v])=>'<div><span>'+h(({task:"انجام وظیفه",grammar:"گرامر",vocabulary:"واژگان",cohesion:"انسجام",register:"Register"})[k]||k)+'</span><b>'+v+'%</b></div>').join("")+'</div>'+
      '<ul>'+r.feedback.map(x=>'<li>'+h(x)+'</li>').join("")+'</ul><small>'+h(r.limitations)+'</small></div>';
  }

  function speaking(){
    let s=tutor(),p=s.learnerProfile||{},ex=T.buildProductionAssessment(p.level||s.currentLevel).speaking;activeExercise=ex;
    open(head("ارزیابی Speaking",ex.level+" · تشخیص گفتار آفلاین دستگاه",true)+
      '<div class="r11-box"><b>موضوع:</b><br>'+h(ex.prompt)+'</div>'+
      '<button class="primary-button" style="width:100%;margin-top:10px" data-s4="speaking-start">🎙 شروع صحبت</button>'+
      '<div id="s4-speaking-result" style="margin-top:8px"><div class="r11-box">بعد از پایان صحبت، Transcript و ارزیابی اینجا نمایش داده می‌شود.</div></div>');
  }
  function handleSpeaking(text){
    const ex=activeExercise;if(!ex)return;let s=tutor(),r=T.evaluateSpeaking(text,ex.level,ex.prompt);s=T.recordSpeaking(s,r);recordLearning(ex,r.total,text);s=recompute(s);save(s);
    const el=document.getElementById("s4-speaking-result");if(el)el.innerHTML='<div class="s4-result"><h3>'+r.total+' / 100</h3><div class="r11-box de" dir="ltr">'+h(r.transcript)+'</div>'+
      '<div class="s4-rubric">'+Object.entries(r.rubric).map(([k,v])=>'<div><span>'+h(({completion:"پوشش پاسخ",coherence:"انسجام",grammar:"گرامر",vocabulary:"واژگان",recognizability:"قابل تشخیص بودن"})[k]||k)+'</span><b>'+v+'%</b></div>').join("")+'</div>'+
      '<ul>'+r.feedback.map(x=>'<li>'+h(x)+'</li>').join("")+'</ul><small>'+h(r.limitations)+'</small></div>';
  }

  function pronunciation(){
    const level=tutor().learnerProfile.level||"A1",targets={
      A1:"Ich möchte einen Termin vereinbaren.",
      A2:"Könnten wir den Termin auf Freitag verschieben?",
      B1:"Ich möchte mich nach dem Bearbeitungsstand meines Antrags erkundigen.",
      B2:"Wenn ich Sie richtig verstanden habe, priorisieren wir zuerst die kritischen Aufgaben.",
      C1:"Unter Berücksichtigung dieser Einschränkung sollten die Befunde vorsichtig interpretiert werden.",
      C2:"Nach heutigem Kenntnisstand ist diese Erklärung plausibel, aber keineswegs alternativlos."
    };
    activeExercise={id:"s4-pron-"+level,type:"pronunciation",level,prompt:targets[level],answer:targets[level]};
    open(head("تمرین تلفظ تقریبی",level+" · Transcript Proxy",true)+
      '<div class="r11-box de" dir="ltr"><b>'+h(targets[level])+'</b></div>'+
      '<div class="r11-toolbar"><button data-s4="pron-play">🔊 شنیدن نمونه</button><button data-s4="pron-start">🎙 گفتن جمله</button></div>'+
      '<div id="s4-pron-result"><div class="r11-box">این ارزیابی کیفیت آکوستیکی صدا را نمی‌سنجد؛ فقط Transcript را با جمله هدف مقایسه می‌کند.</div></div>');
  }
  function handlePronunciation(text){
    const ex=activeExercise;if(!ex)return;let s=tutor(),r=T.evaluatePronunciation(text,ex.answer,ex.level);s=T.recordPronunciation(s,r);save(s);
    const el=document.getElementById("s4-pron-result");if(el)el.innerHTML='<div class="s4-result"><h3>'+r.total+' / 100</h3><p>پوشش واژه‌ها: '+r.coverage+'% · ترتیب: '+r.order+'%</p><div class="r11-box de" dir="ltr">'+h(r.transcript)+'</div><small>'+h(r.limitations)+'</small></div>';
  }

  function tutorPage(){
    const p=tutor().learnerProfile;
    open(head("مربی خصوصی آفلاین","سؤال یا موضوعت را بنویس؛ پاسخ از پروفایل و محتوای داخل اپ ساخته می‌شود.",true)+
      '<div class="s4-quick"><button data-s4="tutor-quick" data-q="از کجا شروع کنم؟">از کجا شروع کنم؟</button><button data-s4="tutor-quick" data-q="گرامر">گرامر</button><button data-s4="tutor-quick" data-q="نوشتن">نوشتن</button><button data-s4="tutor-quick" data-q="صحبت کردن">صحبت کردن</button></div>'+
      '<textarea id="s4-tutor-question" class="r11-textarea" placeholder="مثلاً: برای بهتر شدن گرامرم امروز چه کار کنم؟"></textarea>'+
      '<button class="primary-button" style="width:100%;margin-top:8px" data-s4="tutor-ask">پاسخ مربی</button><div id="s4-tutor-result"></div>');
  }
  function askTutor(q){
    const question=q==null?(document.getElementById("s4-tutor-question")?.value||""):q;let s=tutor(),r=T.tutorAdvice(question,s.learnerProfile,learning());s=T.recordTutor(s,r);save(s);
    const el=document.getElementById("s4-tutor-result");if(el)el.innerHTML='<div class="s4-result"><h3>'+h(r.focusFa)+'</h3><p>'+h(r.answer)+'</p>'+
      (r.sources.length?'<div class="r11-box"><b>منابع داخل اپ:</b>'+r.sources.map(x=>'<span class="r11-chip">'+h(x.level+" · "+x.title)+'</span>').join("")+'</div>':'')+'<small>Offline Tutor · بدون اتصال سرور</small></div>';
  }

  function errors(){
    const r=T.errorProfile(learning(),tutor());
    open(head("پروفایل خطا و ضعف",r.active+" خطای فعال",true)+
      '<div class="r11-box">'+(r.priorities.length?r.priorities.map(x=>'<div class="r11-skill"><span>'+h(skillFa(x.skill))+'</span><b>'+x.count+' مورد</b></div>').join(""):'هنوز خطای کافی برای تحلیل ثبت نشده است.')+'</div>'+
      (r.recurring.length?'<div class="r11-list" style="margin-top:8px">'+r.recurring.map(x=>'<div class="r11-item"><strong>'+h(x.prompt||x.exerciseId)+'</strong><small>'+h(skillFa(x.skill))+' · '+(x.count||0)+' بار</small></div>').join("")+'</div>':''));
  }

  function adaptive(){
    let s=recompute(tutor()),plan=T.buildAdaptivePlan(s.learnerProfile,learning(),25);s=T.recordPlan(s,plan);save(s);
    open(head("مسیر شخصی امروز",plan.level+" · "+plan.estimatedMinutes+" دقیقه از ۲۵ دقیقه",true)+
      '<div class="r11-box"><b>تمرکز:</b> '+plan.weakSkills.map(skillFa).map(h).join(" · ")+'</div>'+
      '<div class="r11-list" style="margin-top:8px">'+plan.items.map((x,i)=>'<button class="r11-item" data-s4="adaptive-item" data-id="'+h(x.exercise.id)+'"><strong>'+(i+1)+'. '+h(skillFa((window.GhazalLearningEngine&&window.GhazalLearningEngine.skillOf)?window.GhazalLearningEngine.skillOf(x.exercise):x.exercise.type))+'</strong><small>'+h(x.reason)+' · '+x.minutes+' دقیقه</small></button>').join("")+'</div>');
  }
  function adaptiveItem(id){
    const ex=E.exercises.find(x=>x.id===id);if(!ex)return;activeExercise=ex;
    if(ex.type==="writing")return writingFor(ex);
    if(ex.type==="speaking")return speakingFor(ex);
    let html=head("تمرین شخصی",ex.level+" · "+skillFa((window.GhazalLearningEngine&&window.GhazalLearningEngine.skillOf)?window.GhazalLearningEngine.skillOf(ex):ex.type),true);
    if(ex.context)html+='<div class="r11-box de" dir="ltr">'+h(ex.context)+'</div>';
    if(ex.audioText)html+='<button class="secondary-button" style="width:100%;margin-bottom:8px" data-s4="adaptive-play">🔊 پخش</button>';
    html+='<div class="r11-box"><b>'+h(ex.prompt)+'</b></div>';
    if(Array.isArray(ex.options)&&ex.options.length)html+='<div class="s4-options">'+ex.options.map(o=>'<button data-s4="adaptive-answer" data-value="'+encodeURIComponent(o)+'">'+h(o)+'</button>').join("")+'</div>';
    else html+='<input id="s4-adaptive-answer" class="r11-input" style="margin-top:8px"><button class="primary-button" style="width:100%;margin-top:8px" data-s4="adaptive-check">بررسی</button>';
    html+='<div id="s4-adaptive-result"></div>';open(html);
  }
  function scoreAdaptive(value){
    const ex=activeExercise;if(!ex)return;const score=E.compare(value,ex.answer),r=T.explainExercise(ex,value,score>=70?1:2);recordLearning(ex,score,value);
    const el=document.getElementById("s4-adaptive-result");if(el)el.innerHTML='<div class="s4-result"><h3>'+score+' / 100</h3>'+r.hints.map(x=>'<p>'+h(x)+'</p>').join("")+'</div>';
  }
  function writingFor(ex){activeExercise=ex;open(head("Writing شخصی",ex.level,true)+'<div class="r11-box">'+h(ex.prompt)+'</div><textarea id="s4-writing-text" class="r11-textarea" style="min-height:180px"></textarea><button class="primary-button" style="width:100%;margin-top:8px" data-s4="writing-evaluate">ارزیابی پاسخ</button><div id="s4-writing-result"></div>');}
  function speakingFor(ex){activeExercise=ex;open(head("Speaking شخصی",ex.level,true)+'<div class="r11-box">'+h(ex.prompt)+'</div><button class="primary-button" style="width:100%;margin-top:8px" data-s4="speaking-start">🎙 شروع صحبت</button><div id="s4-speaking-result"></div>');}

  function profile(){
    let s=recompute(tutor());save(s);const p=s.learnerProfile,c=T.completion(p);
    open(head("Learner Profile",p.level+" · "+c.done+" از ۶ مهارت دارای شواهد",true)+
      '<div class="r11-kpis"><div class="r11-kpi"><b>'+p.overall+'%</b><span>Overall</span></div><div class="r11-kpi"><b>'+p.confidence+'%</b><span>Confidence</span></div><div class="r11-kpi"><b>'+c.percent+'%</b><span>پروفایل کامل</span></div></div>'+
      '<div class="r11-box" style="margin-top:10px">'+T.CORE_SKILLS.map(k=>{const x=p.skills[k];return '<div class="s4-skill"><div><b>'+h(skillFa(k))+'</b><small>'+h(x.label)+' · '+x.evidence+' شاهد</small><div class="r11-bar"><span style="width:'+x.score+'%"></span></div></div><strong>'+x.score+'%</strong></div>';}).join("")+'</div>');
  }

  window.onSpeechResult=function(text){
    if(speechTarget==="stage4-speaking"){speechTarget=null;handleSpeaking(text);return;}
    if(speechTarget==="stage4-pron"){speechTarget=null;handlePronunciation(text);return;}
    if(typeof previousSpeech==="function")previousSpeech(text);
  };
  window.onSpeechError=function(msg){
    if(speechTarget==="stage4-speaking"||speechTarget==="stage4-pron"){speechTarget=null;const el=document.getElementById("s4-speaking-result")||document.getElementById("s4-pron-result");if(el)el.innerHTML='<div class="r11-box">'+h(msg)+'</div>';return;}
    if(typeof previousSpeechError==="function")previousSpeechError(msg);
  };

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-s4]");if(!t)return;const a=t.dataset.s4;
    if(a==="close")close();else if(a==="hub")hub();else if(a==="baseline")baselineStart();else if(a==="baseline-play"){const s=tutor(),it=s._baselineSession&&s._baselineSession.items[activeBaselineIndex];if(it&&it.audioText)native("speak",it.audioText);}
    else if(a==="baseline-option")baselineSave(decodeURIComponent(t.dataset.value||""));else if(a==="baseline-check")baselineSave(document.getElementById("s4-baseline-answer")?.value||"");
    else if(a==="writing")writing();else if(a==="writing-evaluate")evaluateWriting();else if(a==="speaking")speaking();else if(a==="speaking-start"){speechTarget="stage4-speaking";native("startSpeechRecognition",activeExercise&&activeExercise.prompt||"Speaking");}
    else if(a==="pronunciation")pronunciation();else if(a==="pron-play"){if(activeExercise)native("speak",activeExercise.answer);}else if(a==="pron-start"){speechTarget="stage4-pron";native("startSpeechRecognition",activeExercise&&activeExercise.answer||"Pronunciation");}
    else if(a==="tutor")tutorPage();else if(a==="tutor-ask")askTutor();else if(a==="tutor-quick"){const q=t.dataset.q||"";const el=document.getElementById("s4-tutor-question");if(el)el.value=q;askTutor(q);}
    else if(a==="errors")errors();else if(a==="adaptive")adaptive();else if(a==="adaptive-item")adaptiveItem(t.dataset.id);else if(a==="adaptive-play"){if(activeExercise&&activeExercise.audioText)native("speak",activeExercise.audioText);}
    else if(a==="adaptive-answer")scoreAdaptive(decodeURIComponent(t.dataset.value||""));else if(a==="adaptive-check")scoreAdaptive(document.getElementById("s4-adaptive-answer")?.value||"");else if(a==="profile")profile();
  });

  document.addEventListener("input",e=>{
    if(e.target&&e.target.id==="s4-writing-text"){
      let s=tutor();if(s.resume&&s.resume.kind==="writing"&&activeExercise)s=T.setResume(s,{kind:"writing",id:activeExercise.id,step:0,payload:{draft:e.target.value}});save(s);
    }
  });

  function inject(){
    const grid=view.querySelector(".skill-grid");if(!grid||view.querySelector("[data-s4='hub']"))return;
    const html='<button class="card skill-card s4-entry" data-s4="hub"><span class="big-icon">🎓</span><strong>مرحله ۴ · مربی خصوصی و ارزیابی</strong><small>تعیین سطح، Tutor، Writing، Speaking، پروفایل خطا و مسیر شخصی.</small></button>';
    const lockedAnchor=view.querySelector("[data-r11='checkpoint']")||view.querySelector("[data-r11='learning']");
    if(lockedAnchor)lockedAnchor.insertAdjacentHTML("afterend",html);
    else grid.insertAdjacentHTML("beforeend",html);
  }
  document.addEventListener("ghazal:ui-changed",inject);setTimeout(inject,500);
})();