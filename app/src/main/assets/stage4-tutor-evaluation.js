(function(root,factory){
  const api=factory(
    root&&root.GhazalExerciseEngine,
    root&&root.GhazalContentSystem,
    root&&root.GhazalOfflineCoach,
    root&&root.GhazalLearningEngine
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalStage4Tutor=api;
})(typeof window!=="undefined"?window:null,function(Exercises,Content,Coach,Learning){
  "use strict";
  const VERSION="4.0.0",SCHEMA=1,LEVELS=["A1","A2","B1","B2","C1","C2"];
  const CORE_SKILLS=["vocabulary","grammar","reading","listening","writing","speaking"];
  const SKILL_FA={vocabulary:"واژگان",grammar:"گرامر",reading:"خواندن",listening:"شنیدن",writing:"نوشتن",speaking:"صحبت‌کردن",pronunciation:"تلفظ",transfer:"کاربرد در موقعیت جدید"};
  const READ_BANK={
    A1:{context:"Mina hat am Dienstag um neun Uhr einen Termin beim Bürgeramt. Sie soll zehn Minuten früher kommen und ihren Ausweis mitbringen.",prompt:"مینا چه زمانی قرار دارد؟",options:["سه‌شنبه ساعت ۹","دوشنبه ساعت ۱۰","جمعه ساعت ۹"],answer:0},
    A2:{context:"Die Warmmiete beträgt 980 Euro. Heizung und Wasser sind enthalten, Strom und Internet werden separat bezahlt.",prompt:"کدام مورد جداگانه پرداخت می‌شود؟",options:["آب","گرمایش","اینترنت"],answer:2},
    B1:{context:"Ihr Antrag ist eingegangen. Für die weitere Bearbeitung fehlt noch eine aktuelle Meldebescheinigung. Sobald sie vorliegt, kann die Entscheidung vorbereitet werden.",prompt:"چه چیزی ادامه رسیدگی را متوقف کرده است؟",options:["نبود Meldebescheinigung","نبود وقت ملاقات","پرداخت نشدن هزینه"],answer:0},
    B2:{context:"Das Projekt liegt beim Budget im Plan, beim Zeitplan jedoch eine Woche zurück. Um den Termin zu halten, werden Sicherheitstests priorisiert und Dokumentation parallel abgeschlossen.",prompt:"تیم برای جبران تأخیر چه می‌کند؟",options:["بودجه را افزایش می‌دهد","تست‌های امنیتی را اولویت می‌دهد","پروژه را لغو می‌کند"],answer:1},
    C1:{context:"Ein statistischer Zusammenhang allein erlaubt keine belastbare Kausalaussage. Zusätzlich braucht man eine plausible Wirkungslogik und muss alternative Erklärungen systematisch prüfen.",prompt:"برای ادعای علیت چه چیزی کافی نیست؟",options:["همبستگی آماری به‌تنهایی","بررسی توضیح‌های جایگزین","منطق اثر"],answer:0},
    C2:{context:"Robustheit gegenüber mehreren Modellvarianten stärkt das Vertrauen in die interne Stabilität eines Befunds. Daraus folgt jedoch nicht automatisch seine Übertragbarkeit auf andere Institutionen oder Populationen.",prompt:"از Robustheit چه چیزی خودکار نتیجه نمی‌شود؟",options:["پایداری داخلی","قابلیت تعمیم به جمعیت‌های دیگر","اعتماد بیشتر به تحلیل"],answer:1}
  };
  const LISTEN_BANK={
    A1:{audioText:"Der Zug nach Bonn fährt heute um zehn Uhr fünfundzwanzig von Gleis sieben.",prompt:"قطار از کدام سکو حرکت می‌کند؟",options:["پنج","شش","هفت"],answer:2},
    A2:{audioText:"Bitte schicken Sie uns Fotos und die Rechnung innerhalb von sieben Tagen.",prompt:"چه چیزی باید ارسال شود؟",options:["فقط پاسپورت","عکس‌ها و فاکتور","قرارداد اجاره"],answer:1},
    B1:{audioText:"Wir haben uns bei der Aufgabenverteilung missverstanden. Lassen Sie uns klären, wer welchen Teil bis Freitag übernimmt.",prompt:"هدف گفتگو چیست؟",options:["تقسیم وظایف را روشن کنند","جلسه را لغو کنند","بودجه را کم کنند"],answer:0},
    B2:{audioText:"Beim Preis können wir Ihnen fünf Prozent entgegenkommen, wenn Sie eine Laufzeit von zwei Jahren akzeptieren.",prompt:"تخفیف تحت چه شرطی ارائه می‌شود؟",options:["پرداخت نقدی","قرارداد دو ساله","تحویل فوری"],answer:1},
    C1:{audioText:"Die Studie zeigt einen signifikanten Zusammenhang, doch wegen der kleinen Stichprobe bleibt die Übertragbarkeit unklar.",prompt:"محدودیت اصلی چیست؟",options:["نمونه کوچک","نبود همبستگی","نبود داده زمانی"],answer:0},
    C2:{audioText:"Die These ist für diesen Kontext plausibel, ihre Reichweite sollte jedoch wegen alternativer Erklärungen begrenzt werden.",prompt:"گوینده چه موضعی دارد؟",options:["رد کامل فرضیه","پذیرش مشروط و محدود","قطعیت کامل"],answer:1}
  };
  const TARGET_WORDS={A1:35,A2:60,B1:90,B2:130,C1:170,C2:220};
  const SPEAK_WORDS={A1:18,A2:28,B1:45,B2:65,C1:85,C2:105};

  function now(){return new Date().toISOString();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0));}
  function avg(a){return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;}
  function words(v){return String(v||"").trim().split(/\s+/).filter(Boolean);}
  function norm(v){return String(v||"").toLocaleLowerCase("de-DE").replace(/[^a-zäöüß0-9\u0600-\u06FF\s]/g," ").replace(/\s+/g," ").trim();}
  function uniqueRatio(v){const a=words(norm(v));return a.length?new Set(a).size/a.length:0;}
  function key(profileId){return "ghazal_tutor_v1_"+String(profileId||"local");}
  function skillOf(ex){return Learning&&Learning.skillOf?Learning.skillOf(ex):({meaning:"vocabulary",recall:"vocabulary",cloze:"grammar",grammar:"grammar",reading:"reading",dictation:"listening",writing:"writing",speaking:"speaking"})[ex&&ex.type]||"transfer";}
  function scoreLabel(n){return n>=85?"قوی":n>=70?"خوب":n>=55?"در حال تثبیت":n>=35?"نیازمند تقویت":"شواهد ناکافی";}
  function defaultSkill(){return{score:0,evidence:0,confidence:0,label:"شواهد ناکافی",lastAt:null};}
  function defaults(profileId,level){const skills={};CORE_SKILLS.forEach(x=>skills[x]=defaultSkill());return{
    schema:SCHEMA,version:VERSION,profileId:String(profileId||"local"),currentLevel:LEVELS.includes(level)?level:"A1",
    learnerProfile:{level:LEVELS.includes(level)?level:"A1",overall:0,confidence:0,skills,weakest:[],strongest:[],updatedAt:null},
    baseline:null,writingHistory:[],speakingHistory:[],pronunciationHistory:[],tutorHistory:[],adaptiveHistory:[],resume:null,updatedAt:now()
  };}
  function normalizeState(raw,profileId,level){
    const b=defaults(profileId,level),r=raw&&typeof raw==="object"?raw:{},p=r.learnerProfile&&typeof r.learnerProfile==="object"?r.learnerProfile:{},skills={...b.learnerProfile.skills};
    CORE_SKILLS.forEach(k=>skills[k]={...skills[k],...(p.skills&&p.skills[k]||{})});
    return{...b,...r,schema:SCHEMA,version:VERSION,profileId:r.profileId||b.profileId,currentLevel:LEVELS.includes(r.currentLevel)?r.currentLevel:b.currentLevel,
      learnerProfile:{...b.learnerProfile,...p,skills},
      writingHistory:Array.isArray(r.writingHistory)?r.writingHistory.slice(-60):[],
      speakingHistory:Array.isArray(r.speakingHistory)?r.speakingHistory.slice(-60):[],
      pronunciationHistory:Array.isArray(r.pronunciationHistory)?r.pronunciationHistory.slice(-60):[],
      tutorHistory:Array.isArray(r.tutorHistory)?r.tutorHistory.slice(-100):[],
      adaptiveHistory:Array.isArray(r.adaptiveHistory)?r.adaptiveHistory.slice(-60):[],
      resume:r.resume&&typeof r.resume==="object"?r.resume:null
    };
  }
  function readStorage(storage,profileId,level){try{return normalizeState(JSON.parse(storage.getItem(key(profileId))||"{}"),profileId,level);}catch(_){return defaults(profileId,level);}}
  function writeStorage(storage,state){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.updatedAt=now();if(storage)storage.setItem(key(s.profileId),JSON.stringify(s));return s;}
  function setResume(state,input){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel),i=input||{};s.resume={kind:String(i.kind||""),id:String(i.id||""),step:Math.max(0,Number(i.step)||0),payload:i.payload&&typeof i.payload==="object"?clone(i.payload):{},at:now()};return s;}
  function clearResume(state){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.resume=null;return s;}

  function pickExercise(level,skill,seed){
    const pool=(Exercises&&Exercises.exercises||[]).filter(x=>x.level===level&&skillOf(x)===skill&&x.answer!=="free");
    if(!pool.length)return null;return pool[Math.abs(Number(seed)||0)%pool.length];
  }
  function buildBaselineAssessment(seed){
    const items=[];LEVELS.forEach((level,li)=>{
      const vocab=pickExercise(level,"vocabulary",seed+li*13),grammar=pickExercise(level,"grammar",seed+li*17);
      if(vocab)items.push({...clone(vocab),diagnosticSkill:"vocabulary",diagnosticLevel:level});
      if(grammar)items.push({...clone(grammar),diagnosticSkill:"grammar",diagnosticLevel:level});
      const r=READ_BANK[level];items.push({id:"s4-read-"+level,type:"diagnostic-mcq",diagnosticSkill:"reading",diagnosticLevel:level,level,prompt:r.prompt,context:r.context,options:r.options,answer:r.options[r.answer],answerIndex:r.answer});
      const l=LISTEN_BANK[level];items.push({id:"s4-listen-"+level,type:"diagnostic-listening",diagnosticSkill:"listening",diagnosticLevel:level,level,prompt:l.prompt,audioText:l.audioText,options:l.options,answer:l.options[l.answer],answerIndex:l.answer});
    });
    return{id:"baseline-"+Date.now(),kind:"stage4-baseline",items,createdAt:now(),official:false,note:"ارزیابی داخلی GHAZAL برای شخصی‌سازی آموزش است و مدرک رسمی CEFR نیست."};
  }
  function compare(answer,target){return Exercises&&Exercises.compare?Exercises.compare(answer,target):(norm(answer)===norm(target)?100:0);}
  function scoreBaseline(session,answers){
    const rows=(session&&session.items||[]).map((it,i)=>{
      const a=answers&&answers[i]||{},score=clamp(a.score==null?compare(a.answer||"",it.answer):a.score,0,100);
      return{id:it.id,level:it.diagnosticLevel||it.level,skill:it.diagnosticSkill||skillOf(it),score};
    });
    const byLevel={},bySkill={};
    LEVELS.forEach(l=>byLevel[l]=[]);CORE_SKILLS.forEach(k=>bySkill[k]=[]);
    rows.forEach(r=>{if(byLevel[r.level])byLevel[r.level].push(r.score);if(bySkill[r.skill])bySkill[r.skill].push(r.score);});
    const levelScores=Object.fromEntries(LEVELS.map(l=>[l,avg(byLevel[l])]));
    const skillScores=Object.fromEntries(CORE_SKILLS.map(k=>[k,avg(bySkill[k])]));
    let suggested="A1",passed=[];
    LEVELS.forEach((l,idx)=>{const cur=byLevel[l],previousOk=idx===0||LEVELS.slice(0,idx).every(p=>levelScores[p]>=55);if(cur.length>=4&&levelScores[l]>=65&&previousOk){suggested=l;passed.push(l);}});
    const overall=avg(rows.map(x=>x.score)),completed=rows.filter(x=>Number.isFinite(x.score)).length;
    return{sessionId:session&&session.id||"",rows,levelScores,skillScores,overall,suggestedLevel:suggested,completed,total:rows.length,confidence:Math.round(completed/Math.max(1,rows.length)*100),passedLevels:passed,official:false,note:"سطح پیشنهادی بر اساس شواهد این ارزیابی داخلی است، نه گواهی رسمی CEFR."};
  }

  function buildProductionAssessment(level){
    const lv=LEVELS.includes(level)?level:"A1",all=Exercises&&Exercises.exercises||[];
    const writing=all.find(x=>x.level===lv&&x.type==="writing")||{id:"s4-writing-"+lv,type:"writing",level:lv,prompt:"یک متن کوتاه متناسب با سطح "+lv+" درباره زندگی، کار یا تحصیل بنویس.",answer:"free"};
    const speaking=all.find(x=>x.level===lv&&x.type==="speaking")||{id:"s4-speaking-"+lv,type:"speaking",level:lv,prompt:"در سطح "+lv+" درباره یک موقعیت واقعی زندگی در آلمان صحبت کن.",answer:"free"};
    return{level:lv,writing:clone(writing),speaking:clone(speaking)};
  }

  function evaluateWriting(text,level,prompt){
    const t=String(text||"").trim(),lv=LEVELS.includes(level)?level:"A1",base=Coach&&Coach.analyze?Coach.analyze(t,lv,prompt):null,wc=words(t).length,target=TARGET_WORDS[lv],ratio=uniqueRatio(t);
    const task=clamp(Math.round(Math.min(1,wc/Math.max(10,target*.7))*75+(t.length?25:0)),0,100);
    const grammar=base?clamp(Math.round(base.dimensions.mechanics*.55+base.dimensions.structure*.45),0,100):clamp(60,0,100);
    const vocabulary=clamp(Math.round(Math.min(1,ratio/.72)*70+Math.min(30,wc/target*30)),0,100);
    const cohesion=base?base.dimensions.cohesion:50,register=base?base.dimensions.register:60;
    const total=Math.round(task*.22+grammar*.22+vocabulary*.18+cohesion*.20+register*.18);
    const issues=(base&&base.errors||[]).map(x=>({type:"grammar",id:x.id,message:x.message}));
    const feedback=[];
    if(wc<target*.7)feedback.push("پاسخ برای سطح "+lv+" کوتاه است؛ دلیل، مثال و نتیجه اضافه کن.");
    if(grammar<65)feedback.push("دقت ساختار جمله و جایگاه فعل را دوباره بررسی کن.");
    if(vocabulary<65)feedback.push("دامنه واژگان را با Collocation و عبارت‌های سطح "+lv+" گسترش بده.");
    if(cohesion<65)feedback.push("بین جمله‌ها از رابط‌های منطقی متناسب با سطح استفاده کن.");
    if(register<60)feedback.push("لحن متن را با موقعیت رسمی/دانشگاهی/روزمره هماهنگ کن.");
    if(!feedback.length)feedback.push("پاسخ از نظر ساختار و پوشش مناسب است؛ حالا روی طبیعی‌تر شدن و ویرایش نهایی تمرکز کن.");
    return{kind:"writing",level:lv,total,wordCount:wc,rubric:{task,grammar,vocabulary,cohesion,register},issues,feedback,at:now(),limitations:"ارزیابی آفلاین Rule-Based است؛ جایگزین تصحیح انسانی یا مدل زبانی آنلاین نیست."};
  }

  function evaluateSpeaking(transcript,level,prompt){
    const t=String(transcript||"").trim(),lv=LEVELS.includes(level)?level:"A1",base=Coach&&Coach.analyze?Coach.analyze(t,lv,prompt):null,wc=words(t).length,target=SPEAK_WORDS[lv],ratio=uniqueRatio(t);
    const completion=clamp(Math.round(Math.min(1,wc/target)*100),0,100);
    const coherence=base?Math.round((base.dimensions.structure+base.dimensions.cohesion)/2):50;
    const grammar=base?base.dimensions.mechanics:55;
    const vocabulary=clamp(Math.round(Math.min(1,ratio/.70)*75+Math.min(25,wc/target*25)),0,100);
    const recognizability=t?clamp(45+Math.round(Math.min(1,wc/Math.max(8,target*.5))*55),0,100):0;
    const total=Math.round(completion*.25+coherence*.24+grammar*.20+vocabulary*.20+recognizability*.11);
    const feedback=[];
    if(wc<target*.65)feedback.push("پاسخ گفتاری کوتاه است؛ یک دلیل و یک مثال اضافه کن.");
    if(coherence<65)feedback.push("پاسخ را با شروع، دلیل/مثال و جمع‌بندی منظم‌تر کن.");
    if(vocabulary<65)feedback.push("از عبارت‌های آماده و واژگان سطح "+lv+" بیشتر استفاده کن.");
    if(grammar<65)feedback.push("پس از صحبت، Transcript را برای جایگاه فعل و صرف مرور کن.");
    if(!feedback.length)feedback.push("پاسخ قابل‌فهم و منظم است؛ برای Fluency بیشتر همان موضوع را بدون توقف دوباره بگو.");
    return{kind:"speaking",level:lv,total,transcript:t,wordCount:wc,rubric:{completion,coherence,grammar,vocabulary,recognizability},feedback,at:now(),limitations:"امتیاز گفتار بر Transcript تشخیص‌داده‌شده تکیه دارد و تحلیل آکوستیکی Phoneme/Stress/Intonation نیست."};
  }

  function evaluatePronunciation(transcript,target,level){
    const a=words(norm(transcript)),b=words(norm(target)),setA=new Set(a),hits=b.filter(x=>setA.has(x)).length,coverage=b.length?Math.round(hits/b.length*100):0;
    let order=0,last=-1;b.forEach(w=>{const i=a.indexOf(w,last+1);if(i>=0){order++;last=i;}});const orderScore=b.length?Math.round(order/b.length*100):0;
    const total=Math.round(coverage*.65+orderScore*.35);
    return{kind:"pronunciation-proxy",level:LEVELS.includes(level)?level:"A1",total,coverage,order:orderScore,transcript:String(transcript||""),target:String(target||""),at:now(),limitations:"این فقط Proxy بر اساس Transcript است و کیفیت آوایی، استرس و آهنگ را مستقیماً اندازه‌گیری نمی‌کند."};
  }

  function mergeEvidence(learning,baseline,writing,speaking,prior){
    const skills={},ls=learning&&learning.skills||{},b=baseline&&baseline.skillScores||{};
    CORE_SKILLS.forEach(k=>{
      const l=ls[k]||{},historyScore=(Number(l.attempts)||0)?Math.round((Number(l.avg)||0)*.7+(Number(l.mastery)||0)*.3):0;
      let evidence=(Number(l.attempts)||0),score=historyScore,source="learning";
      if((k==="writing"&&writing)||(k==="speaking"&&speaking)){const x=k==="writing"?writing:speaking;score=Math.round(score*.35+x.total*.65);evidence+=1;source="production+learning";}
      if(b[k]!=null&&["vocabulary","grammar","reading","listening"].includes(k)){score=Math.round(score*.35+Number(b[k])*.65);evidence+=6;source="baseline+learning";}
      if(!evidence&&prior&&prior.skills&&prior.skills[k]){score=Number(prior.skills[k].score)||0;evidence=Number(prior.skills[k].evidence)||0;source="prior";}
      const confidence=clamp(Math.round(Math.min(1,evidence/12)*100),0,100);skills[k]={score:clamp(score,0,100),evidence,confidence,label:scoreLabel(score),source,lastAt:now()};
    });
    const evidenced=CORE_SKILLS.map(k=>skills[k]).filter(x=>x.evidence>0),overall=avg(evidenced.map(x=>x.score));
    const rank=CORE_SKILLS.map(k=>({skill:k,...skills[k]})).sort((a,b)=>a.score-b.score||a.evidence-b.evidence);
    const level=baseline&&baseline.suggestedLevel||prior&&prior.level||learning&&learning.currentLevel||"A1";
    return{level:LEVELS.includes(level)?level:"A1",overall,confidence:avg(evidenced.map(x=>x.confidence)),skills,weakest:rank.slice(0,3),strongest:rank.slice(-3).reverse(),updatedAt:now()};
  }

  function applyAssessment(state,learning,baseline,writing,speaking){
    const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.baseline=baseline||s.baseline;
    const w=writing||(s.writingHistory.length?s.writingHistory[s.writingHistory.length-1]:null),sp=speaking||(s.speakingHistory.length?s.speakingHistory[s.speakingHistory.length-1]:null);
    s.learnerProfile=mergeEvidence(learning,s.baseline,w,sp,s.learnerProfile);s.currentLevel=s.learnerProfile.level;s.updatedAt=now();return s;
  }

  function errorProfile(learning,state){
    const raw=Object.values(learning&&learning.errors||{}),active=raw.filter(x=>!x.resolved),bySkill={},recurring=[];
    active.forEach(e=>{const k=e.skill||"transfer";bySkill[k]=(bySkill[k]||0)+(Number(e.count)||1);if((Number(e.count)||0)>=2)recurring.push(e);});
    (state&&state.writingHistory||[]).slice(-8).forEach(w=>(w.issues||[]).forEach(i=>{bySkill.grammar=(bySkill.grammar||0)+1;}));
    const priorities=Object.entries(bySkill).map(([skill,count])=>({skill,count,priority:count>=6?"high":count>=3?"medium":"normal"})).sort((a,b)=>b.count-a.count);
    return{active:active.length,recurring:recurring.slice(0,20),bySkill,priorities,generatedAt:now()};
  }

  function buildAdaptivePlan(profile,learning,minutes){
    const p=profile&&profile.skills?profile:mergeEvidence(learning,null,null,null,null),budget=clamp(minutes||25,10,60),weak=(p.weakest||[]).map(x=>x.skill),all=Exercises&&Exercises.exercises||[],items=[],used=new Set();let spent=0;
    const COST={meaning:1,recall:1,cloze:2,grammar:2,reading:4,dictation:4,writing:8,speaking:6,exam:10};
    function add(ex,reason){if(!ex||used.has(ex.id))return;const cost=COST[ex.type]||3;if(spent+cost>budget)return;used.add(ex.id);items.push({exercise:clone(ex),minutes:cost,reason});spent+=cost;}
    weak.forEach((skill,idx)=>all.filter(x=>x.level===p.level&&skillOf(x)===skill).slice(idx*3,idx*3+3).forEach(x=>add(x,"تقویت "+(SKILL_FA[skill]||skill))));
    const active=Object.values(learning&&learning.errors||{}).filter(x=>!x.resolved);active.forEach(e=>add(all.find(x=>x.id===e.exerciseId),"رفع اشتباه تکرارشونده"));
    all.filter(x=>x.level===p.level).slice(0,30).forEach(x=>{if(spent<budget)add(x,"تثبیت سطح "+p.level);});
    return{id:"adaptive-"+Date.now(),level:p.level,budgetMinutes:budget,estimatedMinutes:spent,weakSkills:weak,items,createdAt:now()};
  }

  function tutorAdvice(question,profile,learning){
    const q=String(question||"").trim(),p=profile&&profile.skills?profile:mergeEvidence(learning,null,null,null,null),weak=(p.weakest||[])[0],query=norm(q);
    let focus=weak?weak.skill:"grammar",answer="";
    if(/نوشت|schreib|writing/.test(query))focus="writing";
    else if(/صحبت|sprech|speaking/.test(query))focus="speaking";
    else if(/گرامر|grammatik|grammar/.test(query))focus="grammar";
    else if(/واژ|wort|vocab/.test(query))focus="vocabulary";
    else if(/شنید|hören|listening/.test(query))focus="listening";
    else if(/خوان|lesen|reading/.test(query))focus="reading";
    const score=p.skills[focus]&&p.skills[focus].score||0;
    if(!q)answer="بر اساس پروفایل فعلی، اول روی "+(SKILL_FA[focus]||focus)+" کار کن. امتیاز فعلی این مهارت "+score+" از ۱۰۰ است.";
    else if(focus==="writing")answer="برای نوشتن، ابتدا پاسخ را با سه بخش «هدف/دلیل/نتیجه» بساز، سپس جایگاه فعل، رابط‌ها و Register را بازبینی کن.";
    else if(focus==="speaking")answer="برای گفتار، پاسخ را در سه گام بگو: موضع کوتاه، دلیل همراه مثال، جمع‌بندی. بعد Transcript را بررسی و همان پاسخ را روان‌تر تکرار کن.";
    else if(focus==="grammar")answer="برای گرامر، یک ساختار را جدا تمرین نکن؛ یک مثال صحیح بساز، خطای رایجش را مقایسه کن و بعد در جمله جدید Transfer بده.";
    else if(focus==="vocabulary")answer="برای واژگان، Lemma را با Artikel/Plural یا ساخت فعل، یک Collocation و یک جمله شخصی یاد بگیر تا واژه از Passive به Active برسد.";
    else if(focus==="listening")answer="برای شنیدار، اول بدون متن گوش بده، نکات کلیدی را ثبت کن، سپس Transcript را ببین و در پایان Shadowing انجام بده.";
    else answer="برای خواندن، ابتدا هدف متن و واژه‌های کلیدی را پیدا کن، بعد ادعا/دلیل/نتیجه را جدا کن و در پایان یک خلاصه یک‌جمله‌ای بساز.";
    const sources=Content&&Content.search?(Content.search(q||SKILL_FA[focus]||focus,{level:p.level}).slice(0,4).map(x=>({type:x.type,title:x.title,level:x.level,ref:x.ref}))):[];
    return{question:q,focus,focusFa:SKILL_FA[focus]||focus,score,answer,sources,at:now(),offline:true};
  }

  function explainExercise(ex,userAnswer,attempt){
    const n=Math.max(1,Number(attempt)||1),score=ex&&ex.answer!=="free"?compare(userAnswer,ex.answer):null,skill=skillOf(ex),hints=[];
    if(n===1)hints.push("اول مشخص کن سؤال دقیقاً چه مهارتی را می‌سنجد: "+(SKILL_FA[skill]||skill)+".");
    if(n===2){if(ex&&ex.context)hints.push("به Context برگرد و واژه‌ها/نشانه‌های مرتبط با سؤال را پیدا کن.");else hints.push("ساخت جمله و جایگاه فعل/مفعول را دوباره بررسی کن.");}
    if(n>=3&&ex&&ex.answer!=="free")hints.push("پاسخ هدف: "+String(ex.answer)+". حالا یک مثال جدید با همان الگو بساز.");
    return{exerciseId:ex&&ex.id||"",score,hints,attempt:n,skill,at:now()};
  }

  function recordWriting(state,result){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.writingHistory.push(clone(result));s.writingHistory=s.writingHistory.slice(-60);return s;}
  function recordSpeaking(state,result){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.speakingHistory.push(clone(result));s.speakingHistory=s.speakingHistory.slice(-60);return s;}
  function recordPronunciation(state,result){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.pronunciationHistory.push(clone(result));s.pronunciationHistory=s.pronunciationHistory.slice(-60);return s;}
  function recordTutor(state,result){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.tutorHistory.push(clone(result));s.tutorHistory=s.tutorHistory.slice(-100);return s;}
  function recordPlan(state,plan){const s=normalizeState(state,state&&state.profileId,state&&state.currentLevel);s.adaptiveHistory.push(clone(plan));s.adaptiveHistory=s.adaptiveHistory.slice(-60);return s;}
  function completion(profile){const p=profile&&profile.skills?profile:null;if(!p)return{done:0,total:6,percent:0};const done=CORE_SKILLS.filter(k=>(p.skills[k]&&p.skills[k].evidence>0)).length;return{done,total:6,percent:Math.round(done/6*100)};}

  return{VERSION,SCHEMA,LEVELS,CORE_SKILLS,SKILL_FA,key,defaults,normalizeState,readStorage,writeStorage,setResume,clearResume,
    buildBaselineAssessment,scoreBaseline,buildProductionAssessment,evaluateWriting,evaluateSpeaking,evaluatePronunciation,
    mergeEvidence,applyAssessment,errorProfile,buildAdaptivePlan,tutorAdvice,explainExercise,recordWriting,recordSpeaking,recordPronunciation,recordTutor,recordPlan,completion,scoreLabel};
});