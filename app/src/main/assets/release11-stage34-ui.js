(function(){
  "use strict";
  const L=window.GhazalLearningEngine,CC=window.GhazalClassroomCore,P=window.GhazalPlatformCore,D=window.GhazalData,E=window.GhazalExerciseEngine,C=window.GhazalContentSystem;
  const view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!L||!CC||!P||!D||!E||!view||!modal||!box)return;
  const PLATFORM_KEY="ghazal_platform_v1",LEVELS=["A1","A2","B1","B2","C1","C2"];
  let mode="learning",learningScreen="",selectedClass="",activeAssignment=null,activeItem=null,activeQuizIndex=0,speechTarget=null,previousSpeech=window.onSpeechResult;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){
    speechTarget=null;try{window.GhazalAndroid&&window.GhazalAndroid.stopSpeaking&&window.GhazalAndroid.stopSpeaking();}catch(_){}
    if(learningScreen&&learningScreen!=="root"&&learningScreen!=="hub"){return learningHub();}
    if(learningScreen==="hub"){return hub();}
    learningScreen="";
    modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";
  }
  function head(tag,title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r11="close">×</button></div>';}
  function toast(msg){try{window.GhazalAndroid&&window.GhazalAndroid.toast&&window.GhazalAndroid.toast(msg);}catch(_){}}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function platform(){try{return CC.normalizeState(JSON.parse(localStorage.getItem(PLATFORM_KEY)||"{}"));}catch(_){return CC.normalizeState({});}}
  function savePlatform(s){localStorage.setItem(PLATFORM_KEY,JSON.stringify(CC.normalizeState(s)));}
  function activeProfile(){const s=platform();return s.profiles.find(p=>p.id===s.activeProfileId)||null;}
  function learningKey(){const p=activeProfile();return "ghazal_learning_v2_"+(p?p.id:"local");}
  function learning(){try{return L.normalizeState(JSON.parse(localStorage.getItem(learningKey())||"{}"),activeProfile()?.id||"local");}catch(_){return L.initialState(activeProfile()?.id||"local");}}
  function saveLearning(s){localStorage.setItem(learningKey(),JSON.stringify(L.normalizeState(s,activeProfile()?.id||"local")));}
  function resumeDraft(s,kind,id,step){const r=s&&s.resume;if(!r||r.kind!==kind||String(r.id||"")!==String(id||"")||Number(r.step||0)!==Number(step||0))return"";return String(r.payload&&r.payload.draft||"");}
  function saveResumeDraft(value){let s=learning(),r=s.resume;if(!r||!r.kind)return;s=L.setResume(s,{kind:r.kind,id:r.id,step:r.step,level:r.level,payload:{...(r.payload||{}),draft:String(value||"")}});saveLearning(s);}
  function roleFa(r){return r==="teacher"?"استاد":r==="student"?"زبان‌آموز":r==="admin"?"مدیر":"مهمان";}
  function skillFa(k){return({vocabulary:"واژگان",grammar:"گرامر",reading:"خواندن",listening:"شنیدن",writing:"نوشتن",speaking:"صحبت‌کردن",pronunciation:"تلفظ",transfer:"کاربرد در موقعیت جدید"})[k]||k;}

  window.GhazalLearningBridge={
    record:function(ex,score,meta){try{let s=learning();s=L.recordAttempt(s,ex,score,meta||{});saveLearning(s);return s;}catch(_){return null;}},
    state:function(){return learning();}
  };

  function hub(){
    learningScreen="root";const p=activeProfile();
    open(head("یادگیری","یادگیری و کلاس","موتور یادگیری آفلاین و بخش کلاس/استاد.")+
      '<div class="r11-kpis"><div class="r11-kpi"><b>'+(p?h(p.displayName):"—")+'</b><span>پروفایل فعال</span></div><div class="r11-kpi"><b>'+(p?roleFa(p.role):"بدون پروفایل")+'</b><span>نقش</span></div><div class="r11-kpi"><b>'+h(learning().currentLevel)+'</b><span>سطح موتور</span></div></div>'+
      '<div class="r11-grid" style="margin-top:10px">'+
      '<button class="r11-card" data-r11="learning"><strong>🧠 مرحله ۲ · موتور یادگیری آفلاین</strong><small>برنامه روزانه، مرور هوشمند، آزمون، بانک اشتباه، تعیین سطح و ادامه دقیق فعالیت.</small></button>'+
      '<button class="r11-card" data-r11="classroom"><strong>🏫 کلاس و استاد</strong><small>کلاس، تکلیف، نوشتن، صحبت‌کردن، تحویل، نمره و گزارش.</small></button>'+
      '</div>');
  }

  function learningHub(){
    learningScreen="hub";const s=learning(),weak=L.weakestSkills(s),due=L.dueReviews(s,999).length,gate=L.masteryGate(s,s.currentLevel),weekly=L.missionProgress(s,"weekly"),monthly=L.missionProgress(s,"monthly");
    open(head("مرحله ۲","موتور یادگیری آفلاین","همه بخش‌های این صفحه بدون اینترنت کار می‌کنند و پیشرفت روی گوشی ذخیره می‌شود.")+
      (s.resume&&s.resume.kind?'<button class="r11-card" style="width:100%;margin-bottom:10px" data-r11="resume-learning"><strong>↩ ادامه دقیق فعالیت</strong><small>'+h("آخرین فعالیت ذخیره شده · مرحله "+(Number(s.resume.step||0)+1))+'</small></button>':'')+
      '<div class="r11-kpis"><div class="r11-kpi"><b>'+due+'</b><span>مرور موعددار</span></div><div class="r11-kpi"><b>'+gate.evidence.attempts+'</b><span>شواهد سطح</span></div><div class="r11-kpi"><b>'+(gate.pass?"آماده":"قفل")+'</b><span>عبور از سطح</span></div></div>'+
      '<div class="r11-grid" style="margin-top:10px">'+
      '<button class="r11-card" data-r11="daily-plan"><strong>📅 برنامه امروز</strong><small>بر اساس مرور موعددار و ضعیف‌ترین مهارت‌ها.</small></button>'+
      '<button class="r11-card" data-r11="checkpoint"><strong>🧪 آزمون مرحله‌ای</strong><small>آزمون آفلاین از مهارت‌های ضعیف‌تر برای سنجش واقعی پیشرفت.</small></button>'+
      '<button class="r11-card" data-r11="skill-model"><strong>📊 وضعیت مهارت‌ها</strong><small>امتیاز جداگانه واژگان، گرامر، خواندن، شنیدن، نوشتن و صحبت‌کردن.</small></button>'+
      '<button class="r11-card" data-r11="error-bank"><strong>🧯 بانک اشتباه‌ها</strong><small>اشتباه‌ها تا دو پاسخ درست بعدی در فهرست می‌مانند.</small></button>'+
      '<button class="r11-card" data-r11="mastery"><strong>🔐 شرط عبور از سطح</strong><small>نشان می‌دهد برای رفتن به سطح بعد چه چیزهایی هنوز کم است.</small></button>'+
      '<button class="r11-card" data-r11="unknown"><strong>🎲 موقعیت جدید</strong><small>تمرین روی موضوعی که قبلاً ندیده‌ای تا کاربرد واقعی سنجیده شود.</small></button>'+
      '<button class="r11-card" data-r11="placement"><strong>🧭 تعیین سطح</strong><small>آزمون تشخیصی از A1 تا C2 برای پیشنهاد سطح مناسب.</small></button>'+
      '<button class="r11-card" data-r11="missions"><strong>🏁 هدف‌های هفتگی و ماهانه</strong><small>هدف تمرین، رفع اشتباه و کاربرد مهارت‌ها.</small></button>'+
      '<button class="r11-card" data-r11="immersion"><strong>🇩🇪 میزان استفاده از زبان آلمانی</strong><small>هرچه سطح بالاتر می‌رود، متن‌های آموزشی بیشتر آلمانی می‌شوند.</small></button>'+
      '</div>'+
      '<div class="r11-box" style="margin-top:10px"><b>ضعیف‌ترین مهارت‌ها</b>'+weak.slice(0,3).map(x=>'<span class="r11-chip">'+h(skillFa(x.id))+' '+x.score+'%</span>').join("")+'<br><b style="margin-top:7px">هدف‌ها</b>هفتگی '+weekly.progress.attempts+'/'+weekly.targets.attempts+' · ماهانه '+monthly.progress.attempts+'/'+monthly.targets.attempts+'</div>');
  }

  function dailyPlan(){
    learningScreen="daily-plan";let s=learning(),result=L.buildDailyPlan(s,s.dailyMinutes,s.currentLevel);s=result.state;s=L.setResume(s,{kind:"daily-plan",id:result.plan.date,step:0,level:result.plan.level});saveLearning(s);const p=result.plan;
    open(head("برنامه روزانه",p.level,p.budgetMinutes+" دقیقه انتخاب‌شده · "+p.estimatedMinutes+" دقیقه برنامه‌ریزی‌شده")+
      '<div class="r11-box"><b>۱) سطح را انتخاب کن</b><select id="r11-plan-level" class="r11-select" style="margin-top:7px">'+LEVELS.map(x=>'<option '+(x===p.level?"selected":"")+'>'+x+'</option>').join("")+'</select><b style="margin-top:10px">۲) زمان تمرین را انتخاب کن</b><select id="r11-minutes" class="r11-select" style="margin-top:7px">'+[10,15,20,25,30,45,60,90].map(x=>'<option value="'+x+'" '+(x===p.budgetMinutes?"selected":"")+'>'+x+' دقیقه</option>').join("")+'</select><button class="primary-button" style="margin-top:10px;width:100%" data-r11="rebuild-plan">ساخت برنامه با این تنظیمات</button></div>'+
      '<div class="r11-list">'+p.items.map((x,i)=>'<button class="r11-item" data-r11="plan-item" data-id="'+h(x.exercise.id)+'"><strong>'+(i+1)+'. '+h(x.exercise.type)+' · '+h(x.exercise.prompt).slice(0,90)+'</strong><small>'+h(x.reason)+' · '+x.minutes+' دقیقه</small></button>').join("")+'</div>');
  }
  function runExercise(id){
    learningScreen="exercise";const ex=E.exercises.find(x=>x.id===id);if(!ex)return;activeItem=ex;let rs=learning(),draft=resumeDraft(rs,"exercise",ex.id,0);rs=L.setResume(rs,{kind:"exercise",id:ex.id,step:0,level:ex.level,payload:{draft}});saveLearning(rs);
    let html=head(ex.level,"تمرین تطبیقی",skillFa(L.skillOf(ex)))+'<div class="r11-box">'+(ex.context?'<div dir="ltr">'+h(ex.context)+'</div>':'')+'<b>'+h(ex.prompt)+'</b></div>';
    if(ex.type==="dictation")html+='<button class="secondary-button" data-r11="play-exercise" style="margin-top:8px">🔊 پخش</button>';
    if(ex.answer==="free")html+='<textarea id="r11-answer" class="r11-textarea" placeholder="پاسخ آزاد…">'+h(draft)+'</textarea><div class="r11-toolbar"><button data-r11="free-score" data-score="60">نیاز به کار</button><button data-r11="free-score" data-score="75">قابل قبول</button><button data-r11="free-score" data-score="90">قوی</button></div>';
    else if(Array.isArray(ex.options)&&ex.options.length)html+=ex.options.map(o=>'<button class="r10-option" data-r11="objective-answer" data-value="'+encodeURIComponent(o)+'">'+h(o)+'</button>').join("");
    else html+='<input id="r11-answer" class="r11-input" style="margin-top:8px" value="'+h(draft)+'"><div class="button-row" style="margin-top:8px"><button class="primary-button" data-r11="check-objective">بررسی</button><button class="secondary-button" data-r11="rescue">راهنمای کمکی</button></div><div id="r11-rescue"></div>';
    html+='<div id="r11-result"></div>';open(html);
  }
  function scoreObjective(value){
    if(!activeItem)return;const score=E.compare(value,activeItem.answer),confidence=score>=90?90:score>=70?70:45;let s=learning();s=L.recordAttempt(s,activeItem,score,{answer:value,confidence,transfer:["contrast","reading","dictation","writing","speaking"].includes(activeItem.type)});s=L.clearResume(s);saveLearning(s);const el=document.getElementById("r11-result");if(el)el.innerHTML='<div class="r11-box" style="margin-top:8px"><b>'+score+'%</b>هدف: <span dir="ltr">'+h(activeItem.answer)+'</span></div>';
  }

  function skillModel(){
    learningScreen="skill-model";const s=learning(),weak=L.weakestSkills(s);
    open(head("وضعیت مهارت‌ها",s.currentLevel,"امتیاز هر مهارت مستقل از بقیه نگهداری می‌شود.")+
      '<div class="r11-box">'+weak.map(x=>{const sk=s.skills[x.id]||{};return '<div class="r11-skill"><div><strong>'+h(x.id)+'</strong><small>Avg '+(sk.avg||0)+' · Confidence '+(sk.confidence||0)+' · Mastery '+(sk.mastery||0)+'</small><div class="r11-bar"><span style="width:'+Math.max(0,Math.min(100,x.score))+'%"></span></div></div><b>'+x.score+'%</b></div>';}).join("")+'</div>');
  }
  function errorBank(){
    learningScreen="error-bank";const s=learning(),errors=L.errorBank(s,{resolved:false});
    open(head("بانک اشتباه‌ها","اشتباه‌های فعال",errors.length+" اشتباه حل‌نشده")+(errors.length?'<div class="r11-list">'+errors.map(e=>'<button class="r11-item r11-error" data-r11="retry-error" data-id="'+h(e.exerciseId)+'"><strong>'+h(e.level+" · "+e.skill+" · ×"+e.count)+'</strong><small>'+h(e.prompt).slice(0,110)+'</small></button>').join("")+'</div>':'<div class="r11-box">فعلاً خطای فعالی ثبت نشده.</div>'));
  }
  function mastery(){
    learningScreen="mastery";const s=learning(),g=L.masteryGate(s,s.currentLevel),n=L.nextLevel(s);
    open(head("شرط عبور از سطح",g.level,g.pass?"شرایط عبور کامل شده":"هنوز بعضی شرط‌ها کامل نشده")+
      '<div class="r11-kpis"><div class="r11-kpi"><b>'+g.evidence.attempts+'</b><span>تلاش / '+g.requirements.attempts+'</span></div><div class="r11-kpi"><b>'+g.evidence.objectiveMin+'%</b><span>حداقل مهارت‌های تستی</span></div><div class="r11-kpi"><b>'+g.evidence.productionMin+'%</b><span>حداقل نوشتن و صحبت‌کردن</span></div><div class="r11-kpi"><b>'+g.evidence.transferPasses+'</b><span>کاربرد در موقعیت جدید / '+g.requirements.transferPasses+'</span></div><div class="r11-kpi"><b>'+g.evidence.unresolvedRecurringErrors+'</b><span>اشتباه‌های تکراری</span></div><div class="r11-kpi"><b>'+h(n.next)+'</b><span>سطح بعد</span></div></div>');
  }
  function unknown(){
    learningScreen="unknown";const ch=L.unknownChallenge(learning(),learning().currentLevel);
    open(head("موقعیت جدید",ch.level,"بدون راهنما شروع کن؛ راهنمای کمکی بعد از تلاش اول باز می‌شود.")+'<div class="r11-list">'+ch.items.map((x,i)=>'<button class="r11-item" data-r11="plan-item" data-id="'+h(x.id)+'"><strong>'+(i+1)+'. '+h(x.type)+'</strong><small>'+h(x.prompt).slice(0,110)+'</small></button>').join("")+'</div>');
  }
  function missions(){
    learningScreen="missions";const s=learning(),w=L.missionProgress(s,"weekly"),m=L.missionProgress(s,"monthly");
    const card=x=>'<div class="r11-box"><b>'+h(x.period.toUpperCase())+(x.completed?" ✅":"")+'</b>Attempts '+x.progress.attempts+'/'+x.targets.attempts+' · Transfer '+x.progress.transfer+'/'+x.targets.transfer+' · Errors resolved '+x.progress.errorsResolved+'/'+x.targets.errorsResolved+'<br>Focus: '+h(x.focus.join(" · "))+'</div>';
    open(head("هدف‌های تمرینی","هفتگی و ماهانه","پیشرفت بر اساس تلاش واقعی و رفع اشتباه ثبت می‌شود.")+card(w)+'<div style="height:8px"></div>'+card(m));
  }
  function immersion(){
    learningScreen="immersion";const s=learning(),im=L.immersion(s.currentLevel);
    open(head("میزان استفاده از زبان آلمانی",im.level,"نسبت پیشنهادی فارسی و آلمانی در این سطح")+'<div class="r11-kpis"><div class="r11-kpi"><b>'+im.de+'%</b><span>Deutsch</span></div><div class="r11-kpi"><b>'+im.fa+'%</b><span>فارسی</span></div></div><div class="r11-box" style="margin-top:9px">A1 فارسی بیشتر دارد؛ از B2 به بعد محیط تا حد زیادی آلمانی می‌شود و در C1/C2 ترجمه فقط برای نجات آموزشی باقی می‌ماند.</div>');
  }
  function placement(){
    learningScreen="placement";const sess=L.placementSession();let s=learning();s._placementSession=sess;s=L.setResume(s,{kind:"placement",id:sess.id,step:0,level:s.currentLevel});saveLearning(s);
    open(head("تعیین سطح","آزمون تشخیصی","این آزمون برای پیشنهاد سطح مناسب داخل برنامه است و مدرک رسمی نیست.")+'<div class="r11-box">'+sess.items.length+' سؤال از A1 تا C2 در Meaning، Grammar، Reading و Listening آماده شده.</div><button class="primary-button" style="margin-top:8px" data-r11="placement-start">شروع تعیین سطح</button>');
  }
  function placementQuestion(index){
    learningScreen="placement";let s=learning(),sess=s._placementSession;if(!sess)return placement();const ex=sess.items[index];if(!ex){const result=L.scorePlacement(sess,sess.answers||[]);s.placement=result;s.currentLevel=result.suggestedLevel;s=L.clearResume(s);saveLearning(s);return open(head("نتیجه تعیین سطح",result.suggestedLevel,"سطح پیشنهادی بر اساس پاسخ‌های همین آزمون")+'<div class="r11-box">'+Object.entries(result.skillScores).map(([k,v])=>'<span class="r11-chip">'+h(k)+' '+v+'%</span>').join("")+'<br><small>'+h(result.note)+'</small></div>');}
    const draft=resumeDraft(s,"placement",sess.id,index);s=L.setResume(s,{kind:"placement",id:sess.id,step:index,level:ex.level,payload:{draft}});saveLearning(s);activeItem=ex;open(head("تعیین سطح · سؤال "+(index+1)+" از "+sess.items.length,ex.level,skillFa(L.skillOf(ex)))+'<div class="r11-box">'+(ex.context?'<div dir="ltr">'+h(ex.context)+'</div>':'')+'<b>'+h(ex.prompt)+'</b></div>'+(ex.type==="dictation"?'<button class="secondary-button" style="margin-top:8px" data-r11="play-exercise">🔊 پخش</button>':'')+'<input id="r11-placement-answer" class="r11-input" style="margin-top:8px" value="'+h(draft)+'"><button class="primary-button" style="margin-top:8px" data-r11="placement-answer" data-index="'+index+'">ثبت و بعدی</button>');
  }

  function checkpoint(){
    learningScreen="quiz";let s=learning(),sess=L.buildQuizSession(s,{level:s.currentLevel,count:12});s._quizSession=sess;s._quizAnswers=[];s=L.setResume(s,{kind:"quiz",id:sess.id,step:0,level:sess.level});saveLearning(s);activeQuizIndex=0;quizQuestion(0);
  }
  function quizQuestion(index){
    learningScreen="quiz";let s=learning(),sess=s._quizSession;if(!sess)return checkpoint();const ex=sess.items[index];
    if(!ex){
      const result=L.scoreQuizSession(sess,s._quizAnswers||[]);s.lastQuiz=result;s=L.clearResume(s);saveLearning(s);
      return open(head("نتیجه آزمون مرحله‌ای",result.level,result.pass?"قبول":"نیاز به مرور بیشتر")+'<div class="r11-kpis"><div class="r11-kpi"><b>'+result.overall+'%</b><span>میانگین</span></div><div class="r11-kpi"><b>'+(result.pass?"قبول":"مرور")+'</b><span>نتیجه</span></div></div><div class="r11-box" style="margin-top:9px">'+Object.entries(result.skillScores).map(([k,v])=>'<span class="r11-chip">'+h(k)+' '+v+'%</span>').join("")+'<br><small>'+h(result.note)+'</small></div>');
    }
    activeQuizIndex=index;activeItem=ex;const draft=resumeDraft(s,"quiz",sess.id,index);s=L.setResume(s,{kind:"quiz",id:sess.id,step:index,level:sess.level,payload:{draft}});saveLearning(s);
    let body=head("آزمون مرحله‌ای · سؤال "+(index+1)+" از "+sess.items.length,ex.level,skillFa(L.skillOf(ex)))+'<div class="r11-box">'+(ex.context?'<div dir="ltr">'+h(ex.context)+'</div>':'')+'<b>'+h(ex.prompt)+'</b></div>';
    if(ex.type==="dictation")body+='<button class="secondary-button" style="margin-top:8px" data-r11="play-exercise">🔊 پخش</button>';
    if(ex.answer==="free")body+='<textarea id="r11-quiz-answer" class="r11-textarea" placeholder="پاسخ آزاد…">'+h(draft)+'</textarea><div class="r11-toolbar"><button data-r11="quiz-manual" data-score="60">نیاز به کار</button><button data-r11="quiz-manual" data-score="75">قابل قبول</button><button data-r11="quiz-manual" data-score="90">قوی</button></div>';
    else if(Array.isArray(ex.options)&&ex.options.length)body+=ex.options.map(o=>'<button class="r10-option" data-r11="quiz-objective" data-value="'+encodeURIComponent(o)+'">'+h(o)+'</button>').join("");
    else body+='<input id="r11-quiz-answer" class="r11-input" style="margin-top:8px" value="'+h(draft)+'"><button class="primary-button" style="margin-top:8px" data-r11="quiz-check">ثبت و بعدی</button>';
    open(body);
  }
  function saveQuizAnswer(payload){
    let s=learning(),sess=s._quizSession;if(!sess||!sess.items[activeQuizIndex])return;const answers=Array.isArray(s._quizAnswers)?s._quizAnswers:[];answers[activeQuizIndex]=payload;s._quizAnswers=answers;saveLearning(s);quizQuestion(activeQuizIndex+1);
  }
  function resumeLearning(){
    const s=learning(),r=s.resume;if(!r||!r.kind)return learningHub();
    if(r.kind==="exercise"&&r.id)return runExercise(r.id);
    if(r.kind==="placement")return placementQuestion(r.step||0);
    if(r.kind==="quiz")return quizQuestion(r.step||0);
    if(r.kind==="daily-plan")return dailyPlan();
    learningHub();
  }

  function classroomHub(){
    learningScreen="";const p=activeProfile();
    if(!p)return open(head("Stage 4","پروفایل لازم است","از بخش «حساب محلی، کلاس و استاد» یک پروفایل استاد یا زبان‌آموز بساز."));
    const s=platform();
    if(p.role==="teacher")return teacherHome(s,p);
    if(p.role==="student")return studentHome(s,p);
    open(head("Stage 4","نقش پشتیبانی‌نشده","برای Classroom Pro نقش استاد یا زبان‌آموز لازم است."));
  }
  function teacherHome(s,p){
    const d=CC.teacherDashboard(s,p.id),classes=d.classes;if(!selectedClass&&classes[0])selectedClass=classes[0].id;const report=selectedClass?CC.classReport(s,selectedClass):null;
    open(head("Teacher Workspace",p.displayName,"کلاس و داده‌ها فعلاً محلی‌اند؛ مدل Sync سرور از قبل نسخه‌بندی شده.")+
      '<div class="r11-kpis"><div class="r11-kpi"><b>'+classes.length+'</b><span>کلاس</span></div><div class="r11-kpi"><b>'+d.students.length+'</b><span>زبان‌آموز</span></div><div class="r11-kpi"><b>'+d.enhancedAssignments.length+'</b><span>تکلیف پیشرفته</span></div></div>'+
      '<div class="r11-grid" style="margin-top:10px"><button class="r11-card" data-r11="assignment-builder"><strong>➕ ساخت تکلیف</strong><small>Lesson / Exercise / Writing / Speaking</small></button><button class="r11-card" data-r11="review-submissions"><strong>📝 بررسی تحویل‌ها</strong><small>نمره، Rubric و Comment استاد.</small></button><button class="r11-card" data-r11="class-report"><strong>📈 گزارش کلاس</strong><small>Completion، Average و PDF Export.</small></button><button class="r11-card" data-r11="announcements"><strong>📣 اعلان کلاس</strong><small>پیام داخلی برای زبان‌آموزان.</small></button></div>'+
      '<div class="section-title"><h2>کلاس فعال</h2></div><select id="r11-class-select" class="r11-select">'+classes.map(c=>'<option value="'+h(c.id)+'" '+(c.id===selectedClass?"selected":"")+'>'+h(c.name+" · "+c.code)+'</option>').join("")+'</select>'+
      (report?'<div class="r11-box" style="margin-top:8px">Completion '+report.completionRate+'% · Average '+(report.averageGrade==null?"—":report.averageGrade+"%")+' · '+report.students.length+' student</div>':'<div class="r11-box" style="margin-top:8px">اول از پنل قبلی یک کلاس بساز.</div>'));
  }
  function assignmentBuilder(){
    const s=platform(),p=activeProfile(),classes=s.classes.filter(c=>c.teacherId===p.id&&!c.archived);if(!classes.length)return open(head("Assignment Builder","کلاس لازم است","ابتدا در بخش کلاس یک کلاس بساز."));
    const lessons=D.lessons.slice().sort((a,b)=>a.level.localeCompare(b.level)||a.title.localeCompare(b.title));
    open(head("Assignment Builder","تکلیف چندنوعی","یک Assignment می‌تواند همزمان Lesson، Exercise، Writing و Speaking داشته باشد.")+
      '<label class="r6-label">کلاس</label><select id="r11-asg-class" class="r11-select">'+classes.map(c=>'<option value="'+h(c.id)+'">'+h(c.name)+'</option>').join("")+'</select>'+
      '<label class="r6-label">عنوان</label><input id="r11-asg-title" class="r11-input" placeholder="مثلاً هفته ۳ · Wohnung">'+
      '<label class="r6-label">مهلت</label><input id="r11-asg-due" class="r11-input" type="date">'+
      '<label class="r6-label">راهنما</label><textarea id="r11-asg-note" class="r11-textarea" style="min-height:70px"></textarea>'+
      '<div class="section-title"><h2>آیتم ۱ · Lesson</h2></div><select id="r11-asg-lesson" class="r11-select">'+lessons.map(l=>'<option value="'+h(l.id)+'">'+h(l.level+" · "+l.title)+'</option>').join("")+'</select>'+
      '<div class="section-title"><h2>آیتم ۲ · Writing</h2></div><input id="r11-asg-writing" class="r11-input" placeholder="Prompt نوشتاری اختیاری">'+
      '<div class="section-title"><h2>آیتم ۳ · Speaking</h2></div><input id="r11-asg-speaking" class="r11-input" placeholder="Prompt گفتاری اختیاری">'+
      '<div class="section-title"><h2>آیتم ۴ · Exercise</h2></div><select id="r11-asg-level" class="r11-select">'+LEVELS.map(x=>'<option>'+x+'</option>').join("")+'</select><select id="r11-asg-type" class="r11-select" style="margin-top:7px"><option value="meaning">Vocabulary</option><option value="cloze">Grammar</option><option value="reading">Reading</option><option value="dictation">Listening</option></select>'+
      '<button class="primary-button" style="margin-top:10px" data-r11="create-enhanced-assignment">ثبت و انتشار تکلیف</button>');
  }
  function createEnhancedAssignment(){
    let s=platform(),p=activeProfile(),items=[{kind:"lesson",refId:document.getElementById("r11-asg-lesson")?.value,required:true}],w=document.getElementById("r11-asg-writing")?.value?.trim(),sp=document.getElementById("r11-asg-speaking")?.value?.trim(),lv=document.getElementById("r11-asg-level")?.value||"A1",tp=document.getElementById("r11-asg-type")?.value||"meaning";
    if(w)items.push({kind:"writing",prompt:w,required:true});if(sp)items.push({kind:"speaking",prompt:sp,required:true});const ex=E.exercises.find(x=>x.level===lv&&x.type===tp);if(ex)items.push({kind:"exercise",refId:ex.id,required:true});
    try{s=CC.createAssignment(s,{teacherId:p.id,classId:document.getElementById("r11-asg-class")?.value,title:document.getElementById("r11-asg-title")?.value,instructions:document.getElementById("r11-asg-note")?.value,dueDate:document.getElementById("r11-asg-due")?.value,items});savePlatform(s);toast("تکلیف منتشر شد");teacherHome(s,p);}catch(err){toast("خطا: "+err.message);}
  }
  function reviewSubmissions(){
    const s=platform(),p=activeProfile(),d=CC.teacherDashboard(s,p.id),subs=d.enhancedSubmissions.filter(x=>["submitted","graded"].includes(x.status));
    open(head("Submissions","تحویل‌های کلاس",subs.length+" تحویل")+(subs.length?'<div class="r11-list">'+subs.map(sub=>{const a=d.enhancedAssignments.find(x=>x.id===sub.assignmentId),st=s.profiles.find(x=>x.id===sub.studentId);return '<button class="r11-item" data-r11="grade-submission" data-id="'+h(sub.id)+'"><strong>'+h(st?.displayName||"Student")+' · '+h(a?.title||"Assignment")+'</strong><small>'+h(sub.status)+(sub.grade!=null?" · "+sub.grade+"%":"")+'</small></button>';}).join("")+'</div>':'<div class="r11-box">هنوز تحویلی ثبت نشده.</div>'));
  }
  function gradeSubmission(id){
    const s=platform(),sub=s.enhancedSubmissions.find(x=>x.id===id),a=sub&&s.enhancedAssignments.find(x=>x.id===sub.assignmentId),st=sub&&s.profiles?.find?.(()=>false);if(!sub||!a)return;activeAssignment=sub;
    const answers=Object.entries(sub.answers||{}).map(([itemId,ans])=>{const item=a.items.find(x=>x.id===itemId);return '<div class="r11-box"><b>'+h(item?.kind||"item")+'</b>'+(ans.text?'<div>'+h(ans.text)+'</div>':'')+(ans.transcript?'<div dir="ltr">'+h(ans.transcript)+'</div>':'')+(ans.score!=null?'<small>Auto/self score '+ans.score+'%</small>':'')+'</div>';}).join('<div style="height:7px"></div>');
    open(head("Teacher Review",a.title,"Rubric نمره نهایی را به‌صورت واقعی ذخیره می‌کند.")+answers+
      '<div class="section-title"><h2>Rubric</h2></div>'+["task","grammar","vocabulary","cohesion","fluency","pronunciation","register"].map(k=>'<div class="r11-rubric"><label>'+h(k)+'</label><input class="r11-input r11-rubric-input" data-key="'+k+'" type="number" min="0" max="100" placeholder="0-100"></div>').join("")+
      '<textarea id="r11-teacher-comment" class="r11-textarea" placeholder="Comment استاد…"></textarea><button class="primary-button" style="margin-top:8px" data-r11="save-grade">ثبت نمره و بازخورد</button>');
  }
  function saveGrade(){
    let s=platform(),p=activeProfile(),rubric={};document.querySelectorAll(".r11-rubric-input").forEach(el=>{if(el.value!=="")rubric[el.dataset.key]=Number(el.value);});try{s=CC.gradeSubmission(s,{teacherId:p.id,submissionId:activeAssignment.id,rubric,comment:document.getElementById("r11-teacher-comment")?.value});savePlatform(s);toast("نمره ثبت شد");reviewSubmissions();}catch(err){toast("خطا: "+err.message);}
  }
  function classReport(){
    const s=platform(),p=activeProfile(),classes=s.classes.filter(c=>c.teacherId===p.id&&!c.archived);if(!selectedClass&&classes[0])selectedClass=classes[0].id;const r=selectedClass?CC.classReport(s,selectedClass):null;if(!r)return open(head("Class Report","کلاس لازم است",""));
    open(head("Class Report",r.class.name,"گزارش محلی کلاس")+'<div class="r11-kpis"><div class="r11-kpi"><b>'+r.students.length+'</b><span>Students</span></div><div class="r11-kpi"><b>'+r.assignmentCount+'</b><span>Assignments</span></div><div class="r11-kpi"><b>'+r.completionRate+'%</b><span>Completion</span></div><div class="r11-kpi"><b>'+(r.averageGrade==null?"—":r.averageGrade+"%")+'</b><span>Average</span></div></div><div class="r11-list" style="margin-top:10px">'+r.students.map(x=>'<div class="r11-item"><strong>'+h(x.name)+'</strong><small>'+x.submitted+'/'+x.assignments+' · Completion '+x.completionRate+'% · Grade '+(x.averageGrade==null?"—":x.averageGrade+"%")+'</small></div>').join("")+'</div><button class="secondary-button" style="margin-top:9px" data-r11="export-class-pdf">خروجی PDF گزارش</button>');
  }
  function announcements(){
    const s=platform(),p=activeProfile(),classes=s.classes.filter(c=>c.teacherId===p.id&&!c.archived);if(!classes.length)return open(head("Announcement","کلاس لازم است",""));
    open(head("Class Announcement","اعلان داخلی","در نسخه آفلاین روی همین دستگاه ذخیره می‌شود؛ بعداً Sync سرور همان مدل را استفاده می‌کند.")+'<select id="r11-ann-class" class="r11-select">'+classes.map(c=>'<option value="'+h(c.id)+'">'+h(c.name)+'</option>').join("")+'</select><input id="r11-ann-title" class="r11-input" style="margin-top:7px" placeholder="عنوان"><textarea id="r11-ann-body" class="r11-textarea" style="margin-top:7px" placeholder="متن اعلان…"></textarea><button class="primary-button" style="margin-top:8px" data-r11="save-announcement">انتشار داخلی</button>');
  }

  function studentHome(s,p){
    const d=CC.studentDashboard(s,p.id),assignments=d.enhancedAssignments;
    open(head("Student Classroom",p.displayName,"تکلیف‌ها و بازخورد استاد")+
      (d.announcements.length?'<div class="section-title"><h2>اعلان‌ها</h2></div>'+d.announcements.slice(0,5).map(x=>'<div class="r11-announcement"><strong>'+h(x.title)+'</strong><small>'+h(x.body)+'</small></div>').join(""):'')+
      '<div class="section-title"><h2>تکلیف‌ها</h2></div>'+(assignments.length?'<div class="r11-list">'+assignments.map(a=>'<button class="r11-item" data-r11="student-assignment" data-id="'+h(a.id)+'"><strong>'+h(a.title)+'</strong><small>'+h(CC.assignmentStatus(a,a.submission))+(a.submission?.grade!=null?" · Grade "+a.submission.grade+"%":"")+'</small></button>').join("")+'</div>':'<div class="r11-box">فعلاً تکلیف پیشرفته‌ای نداری.</div>'));
  }
  function studentAssignment(id){
    const s=platform(),p=activeProfile(),a=CC.assignmentsForStudent(s,p.id).find(x=>x.id===id);if(!a)return;activeAssignment=a;
    open(head("Assignment",a.title,a.instructions||"")+'<div class="r11-list">'+a.items.map((it,i)=>{const ans=a.submission?.answers?.[it.id],label=it.kind==="lesson"?(D.lessons.find(l=>l.id===it.refId)?.title||it.refId):it.kind==="exercise"?(E.exercises.find(x=>x.id===it.refId)?.prompt||it.refId):it.prompt;return '<button class="r11-item" data-r11="assignment-item" data-id="'+h(it.id)+'"><strong>'+(i+1)+'. '+h(it.kind)+(ans?" ✅":"")+'</strong><small>'+h(label).slice(0,120)+'</small></button>';}).join("")+'</div><button class="primary-button" style="margin-top:9px" data-r11="submit-enhanced-assignment">تحویل نهایی</button>'+(a.submission?.teacherComment?'<div class="r11-box" style="margin-top:9px"><b>بازخورد استاد</b>'+h(a.submission.teacherComment)+'</div>':''));
  }
  function assignmentItem(itemId){
    const s=platform(),p=activeProfile(),a=CC.assignmentsForStudent(s,p.id).find(x=>x.id===activeAssignment.id),it=a&&a.items.find(x=>x.id===itemId);if(!it)return;activeItem=it;
    if(it.kind==="lesson"){const l=D.lessons.find(x=>x.id===it.refId);open(head("Lesson Task",l?.level||"",l?.title||it.refId)+'<div class="r11-box">'+h(l?.goal||"درس را کامل کن.")+'</div><button class="secondary-button" style="margin-top:8px" data-action="open-lesson" data-id="'+h(it.refId)+'">باز کردن درس</button><button class="primary-button" style="margin-top:8px" data-r11="mark-class-item">ثبت انجام درس</button>');}
    else if(it.kind==="exercise"){const ex=E.exercises.find(x=>x.id===it.refId);if(!ex)return;open(head("Exercise Task",ex.level,ex.type)+'<div class="r11-box">'+h(ex.prompt)+'</div>'+(ex.type==="dictation"?'<button class="secondary-button" style="margin-top:8px" data-r11="play-class-exercise">🔊 پخش</button>':'')+'<input id="r11-class-answer" class="r11-input" style="margin-top:8px"><button class="primary-button" style="margin-top:8px" data-r11="check-class-exercise">بررسی و ثبت</button>');}
    else if(it.kind==="writing")open(head("Writing Assignment","Writing",it.prompt)+'<textarea id="r11-class-writing" class="r11-textarea" placeholder="Deutsch schreiben…"></textarea><button class="primary-button" style="margin-top:8px" data-r11="save-class-writing">ذخیره پاسخ</button>');
    else if(it.kind==="speaking")open(head("Speaking Assignment","Speaking",it.prompt)+'<button class="primary-button" data-r11="start-class-speaking">🎙 شروع پاسخ</button><div id="r11-class-speaking-result"></div>');
  }
  function updateStudentItem(payload){
    let s=platform(),p=activeProfile();try{s=CC.upsertSubmission(s,{studentId:p.id,assignmentId:activeAssignment.id,itemId:activeItem.id,...payload});savePlatform(s);toast("پاسخ ذخیره شد");studentAssignment(activeAssignment.id);}catch(err){toast("خطا: "+err.message);}
  }

  window.onSpeechResult=function(text){
    if(speechTarget==="class-speaking"&&activeItem){const words=String(text||"").trim().split(/\s+/).filter(Boolean),score=Math.min(100,Math.round(words.length*4));speechTarget=null;updateStudentItem({transcript:text,score,completed:true});return;}
    if(typeof previousSpeech==="function")previousSpeech(text);
  };

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r11]");if(!t)return;const a=t.dataset.r11;
    if(a==="close")close();else if(a==="hub")hub();else if(a==="learning")learningHub();else if(a==="resume-learning")resumeLearning();else if(a==="daily-plan")dailyPlan();else if(a==="checkpoint")checkpoint();else if(a==="rebuild-plan"){let s=learning();s.dailyMinutes=Number(document.getElementById("r11-minutes")?.value)||25;s.currentLevel=document.getElementById("r11-plan-level")?.value||s.currentLevel;saveLearning(s);dailyPlan();}else if(a==="plan-item")runExercise(t.dataset.id);else if(a==="objective-answer")scoreObjective(decodeURIComponent(t.dataset.value||""));else if(a==="check-objective")scoreObjective(document.getElementById("r11-answer")?.value||"");else if(a==="free-score"){let s=learning();s=L.recordAttempt(s,activeItem,Number(t.dataset.score)||70,{answer:document.getElementById("r11-answer")?.value||"",confidence:Number(t.dataset.score)||70,transfer:true});s=L.clearResume(s);saveLearning(s);document.getElementById("r11-result").innerHTML='<div class="r11-box" style="margin-top:8px">✅ تلاش و Self-rating ثبت شد.</div>';}else if(a==="play-exercise"&&activeItem?.audioText){native("speak",activeItem.audioText);}else if(a==="rescue"){const key="rescue_"+activeItem.id,n=(Number(sessionStorage.getItem(key))||0)+1;sessionStorage.setItem(key,n);const r=L.rescueFor(activeItem,n),el=document.getElementById("r11-rescue");if(el)el.innerHTML='<div class="r11-box" style="margin-top:8px">'+h(r.text)+'</div>';}
    else if(a==="quiz-objective")saveQuizAnswer({answer:decodeURIComponent(t.dataset.value||"")});else if(a==="quiz-check")saveQuizAnswer({answer:document.getElementById("r11-quiz-answer")?.value||""});else if(a==="quiz-manual")saveQuizAnswer({answer:document.getElementById("r11-quiz-answer")?.value||"",score:Number(t.dataset.score)||70});else if(a==="skill-model")skillModel();else if(a==="error-bank")errorBank();else if(a==="retry-error")runExercise(t.dataset.id);else if(a==="mastery")mastery();else if(a==="unknown")unknown();else if(a==="missions")missions();else if(a==="immersion")immersion();else if(a==="placement")placement();else if(a==="placement-start")placementQuestion(0);else if(a==="placement-answer"){let s=learning(),sess=s._placementSession,idx=Number(t.dataset.index),ex=sess.items[idx],score=ex.answer==="free"?70:E.compare(document.getElementById("r11-placement-answer")?.value||"",ex.answer);sess.answers=sess.answers||[];sess.answers[idx]={score};s._placementSession=sess;saveLearning(s);placementQuestion(idx+1);}
    else if(a==="classroom")classroomHub();else if(a==="assignment-builder")assignmentBuilder();else if(a==="create-enhanced-assignment")createEnhancedAssignment();else if(a==="review-submissions")reviewSubmissions();else if(a==="grade-submission")gradeSubmission(t.dataset.id);else if(a==="save-grade")saveGrade();else if(a==="class-report")classReport();else if(a==="export-class-pdf"){const s=platform();try{native("exportProgressPdf",JSON.stringify(CC.reportPayload(s,selectedClass)));}catch(_){toast("خروجی PDF در دسترس نیست");}}else if(a==="announcements")announcements();else if(a==="save-announcement"){let s=platform(),p=activeProfile();try{s=CC.addAnnouncement(s,{teacherId:p.id,classId:document.getElementById("r11-ann-class")?.value,title:document.getElementById("r11-ann-title")?.value,body:document.getElementById("r11-ann-body")?.value});savePlatform(s);toast("اعلان ذخیره شد");teacherHome(s,p);}catch(err){toast("خطا: "+err.message);}}
    else if(a==="student-assignment")studentAssignment(t.dataset.id);else if(a==="assignment-item")assignmentItem(t.dataset.id);else if(a==="mark-class-item")updateStudentItem({completed:true,score:100});else if(a==="play-class-exercise"){const ex=E.exercises.find(x=>x.id===activeItem.refId);if(ex?.audioText)native("speak",ex.audioText);}else if(a==="check-class-exercise"){const ex=E.exercises.find(x=>x.id===activeItem.refId);if(ex){const value=document.getElementById("r11-class-answer")?.value||"",score=E.compare(value,ex.answer);updateStudentItem({text:value,score,completed:score>=60});}}else if(a==="save-class-writing")updateStudentItem({text:document.getElementById("r11-class-writing")?.value||"",completed:true});else if(a==="start-class-speaking"){speechTarget="class-speaking";native("startSpeechRecognition","Speaking assignment");}else if(a==="submit-enhanced-assignment"){let s=platform(),p=activeProfile();try{s=CC.submitAssignment(s,{studentId:p.id,assignmentId:activeAssignment.id});savePlatform(s);toast("تکلیف تحویل شد");studentHome(s,p);}catch(err){toast(err.message==="required_items_incomplete"?"همه بخش‌های اجباری را کامل کن":"خطا در تحویل");}}
  });
  document.addEventListener("input",e=>{if(["r11-answer","r11-placement-answer","r11-quiz-answer"].includes(e.target&&e.target.id))saveResumeDraft(e.target.value);});
  document.addEventListener("change",e=>{if(e.target.id==="r11-class-select"){selectedClass=e.target.value;teacherHome(platform(),activeProfile());}});

  function inject(){
    const grid=view.querySelector(".skill-grid");if(grid&&!view.querySelector("[data-r11='learning']"))grid.insertAdjacentHTML("afterbegin",'<button class="card skill-card os-accent" data-r11="learning"><span class="big-icon">🧠</span><strong>مرحله ۲ · موتور یادگیری آفلاین</strong><small>برنامه امروز، آزمون مرحله‌ای، بانک اشتباه‌ها و ادامه دقیق فعالیت.</small></button>');
    const profile=view.querySelector(".settings-card");if(profile&&!view.querySelector("[data-r11='classroom']"))profile.insertAdjacentHTML("beforebegin",'<button class="card skill-card" style="width:100%;margin-bottom:10px" data-r11="classroom"><span class="big-icon">🏫</span><strong>کلاس و استاد</strong><small>پنل استاد و زبان‌آموز.</small></button>');
  }
  document.addEventListener("ghazal:ui-changed",inject);setTimeout(inject,450);
})();