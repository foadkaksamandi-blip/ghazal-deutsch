(function(root,factory){
  const api=factory(
    root&&root.GhazalDeepLibrary,
    root&&root.GhazalSpecialization,
    root&&root.GhazalStage4Tutor,
    root&&root.GhazalLearningEngine,
    root&&root.GhazalExerciseEngine
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalStage5=api;
})(typeof window!=="undefined"?window:null,function(Deep,Specialization,Stage4,Learning,Exercises){
  "use strict";

  const VERSION="5.0.0",SCHEMA=1;
  const LEVELS=["A1","A2","B1","B2","C1","C2"];
  const SKILLS=["reading","listening","writing","speaking","grammar","vocabulary"];
  const SKILL_FA={reading:"خواندن",listening:"شنیدن",writing:"نوشتن",speaking:"صحبت‌کردن",grammar:"گرامر",vocabulary:"واژگان"};
  const EXAMS={
    goethe:{id:"goethe",name:"Goethe",fa:"گوته",levels:["A1","A2","B1","B2","C1","C2"],focus:"چهار مهارت + مدیریت زمان و ساختار پاسخ"},
    telc:{id:"telc",name:"telc",fa:"تلک",levels:["A1","A2","B1","B2","C1","C2"],focus:"کاربرد واقعی زبان + تعامل و تولید هدفمند"},
    testdaf:{id:"testdaf",name:"TestDaF",fa:"تست‌داف",levels:["B2","C1"],focus:"آلمانی دانشگاهی، درک متن/شنیدار و تولید آکادمیک"},
    osd:{id:"osd",name:"ÖSD",fa:"اُاِس‌دِ",levels:["A1","A2","B1","B2","C1","C2"],focus:"چهار مهارت با سناریوهای ارتباطی و نوشتار/گفتار ساختاریافته"}
  };
  const MODE={
    quick:{id:"quick",fa:"آزمون سریع",minutes:15,count:8},
    weekly:{id:"weekly",fa:"Mock هفتگی",minutes:35,count:12},
    full:{id:"full",fa:"Mock جامع",minutes:60,count:16}
  };
  const RIGHTS_NOTE="تمام سؤال‌های بسته فعلی، تمرین‌های تألیفی/داخلی GHAZAL با سبک آمادگی آزمون هستند؛ هیچ برگه رسمی دارای حق‌نشر یا بانک کامل و دارای مجوز آزمون در برنامه ادعا یا بازنشر نشده است.";
  const SCORE_NOTE="امتیازها و شاخص‌های آمادگی، داخلی GHAZAL و برای تمرین هستند؛ نتیجه رسمی Goethe، telc، TestDaF، ÖSD یا CEFR محسوب نمی‌شوند.";

  const STRATEGIES={
    goethe:{
      before:["صورت سؤال را پیش از متن اسکن کن.","برای Schreiben الزام‌های محتوا و Register را جدا علامت بزن.","در Sprechen برای مقدمه، دلیل، مثال و جمع‌بندی زمان نگه دار."],
      traps:["پاسخ درستِ معنایی اما خارج از خواسته سؤال.","نوشتن طولانی بدون پوشش تمام Punkte.","استفاده از عبارت‌های حفظی بدون اتصال منطقی."]
    },
    telc:{
      before:["در Aufgaben با شریک، توافق و واکنش متقابل را فراموش نکن.","در Schreiben هدف ارتباطی را در ابتدای متن روشن کن.","در Lesen/Hören کلیدواژه را با Synonymها جست‌وجو کن."],
      traps:["فقط بیان نظر بدون تعامل.","لحن نامتناسب با مخاطب.","انتخاب گزینه صرفاً به‌خاطر تکرار یک کلمه از متن."]
    },
    testdaf:{
      before:["در متون دانشگاهی ادعا، دلیل، مثال و محدودیت را جدا کن.","در Schreiben توصیف داده را از تفسیر و Stellungnahme تفکیک کن.","برای Sprechen پاسخ را با Aufgabe، Begründung و Schluss بساز."],
      traps:["تبدیل همبستگی به علیت.","شرح همه جزئیات به‌جای روندهای اصلی.","قضاوت قطعی وقتی متن محدودیت یا عدم‌قطعیت دارد."]
    },
    osd:{
      before:["نقش، مخاطب و هدف ارتباطی را قبل از پاسخ مشخص کن.","در Schreiben بندبندی و اتصال منطقی را کنترل کن.","در Sprechen هم مقایسه و هم تصمیم نهایی ارائه بده."],
      traps:["جا انداختن یکی از نکات الزامی.","Register بیش از حد محاوره‌ای در متن رسمی.","نتیجه‌گیری بدون دلیل یا مثال."]
    }
  };

  function now(){return new Date().toISOString();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0));}
  function avg(a){return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;}
  function norm(v){return String(v==null?"":v).trim().toLocaleLowerCase("de-DE");}
  function brandId(v){
    const s=norm(v).replace(/ö/g,"o").replace(/[^a-z]/g,"");
    if(s.includes("testdaf"))return"testdaf";
    if(s.includes("goethe"))return"goethe";
    if(s.includes("telc"))return"telc";
    if(s.includes("osd"))return"osd";
    return s;
  }
  function skillId(v){
    const s=norm(v);
    if(/schreib|writing/.test(s))return"writing";
    if(/sprech|speaking/.test(s))return"speaking";
    if(/hör|hoer|listen/.test(s))return"listening";
    if(/les|read/.test(s))return"reading";
    if(/gram/.test(s))return"grammar";
    if(/wort|vocab/.test(s))return"vocabulary";
    return s||"reading";
  }
  function exSkill(ex){
    if(Learning&&typeof Learning.skillOf==="function")return Learning.skillOf(ex);
    return skillId(ex&&ex.type);
  }
  function rawExamTasks(){
    return (Deep&&Array.isArray(Deep.exams)?Deep.exams:[]).map((x,i)=>({
      id:String(x.id||("exam-"+i)),
      brand:brandId(x.exam||x.brand),
      exam:String(x.exam||x.brand||""),
      level:LEVELS.includes(x.level)?x.level:"B1",
      skill:skillId(x.skill||x.type),
      title:String(x.title||"Exam task"),
      prompt:String(x.task||x.prompt||""),
      minutes:Math.max(2,Number(x.minutes)||10),
      source:"ghazal-original-exam-style"
    })).filter(x=>EXAMS[x.brand]&&x.prompt);
  }
  function examTasks(brand,level,skill){
    const b=brandId(brand);
    return rawExamTasks().filter(x=>(!b||x.brand===b)&&(!level||x.level===level)&&(!skill||x.skill===skillId(skill))).map(clone);
  }
  function availableLevels(brand){
    const b=brandId(brand),seen=new Set(examTasks(b).map(x=>x.level));
    const defined=(EXAMS[b]&&EXAMS[b].levels)||LEVELS;
    const levels=defined.filter(x=>seen.has(x));
    return levels.length?levels:defined.slice();
  }
  function objectivePool(level){
    return (Exercises&&Array.isArray(Exercises.exercises)?Exercises.exercises:[])
      .filter(x=>x&&x.level===level&&x.answer!=="free"&&["reading","listening","grammar","vocabulary"].includes(exSkill(x)))
      .map(x=>({
        id:"s5-core-"+x.id,
        refId:x.id,
        source:"core-objective",
        level:x.level,
        skill:exSkill(x),
        title:SKILL_FA[exSkill(x)]||"تمرین",
        prompt:String(x.prompt||""),
        context:String(x.context||""),
        audioText:String(x.audioText||""),
        options:Array.isArray(x.options)?x.options.map(String):[],
        answer:x.answer,
        minutes:2
      }));
  }
  function seededOrder(arr,seed){
    return arr.slice().sort((a,b)=>{
      function h(id){let n=(Number(seed)||17)>>>0;for(const c of String(id)){n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;}return n;}
      return h(a.id)-h(b.id);
    });
  }
  function productivePool(brand,level){
    return examTasks(brand,level).filter(x=>["writing","speaking"].includes(x.skill)).map(x=>({
      ...x,
      id:"s5-brand-"+x.id,
      source:"brand-exam-style",
      options:[],
      answer:"free"
    }));
  }
  function buildMock(brand,level,mode,seed,startedMs){
    const b=brandId(brand),m=MODE[mode]||MODE.quick;
    if(!EXAMS[b])throw new Error("unknown exam brand");
    if(!LEVELS.includes(level))throw new Error("invalid level");
    const prod=seededOrder(productivePool(b,level),seed);
    const objective=seededOrder(objectivePool(level),Number(seed||1)+37);
    const chosen=[],seen=new Set();
    function add(x){if(x&&!seen.has(x.id)&&chosen.length<m.count){seen.add(x.id);chosen.push(clone(x));}}
    if(prod.length)add(prod[0]);
    objective.filter(x=>x.skill==="reading").slice(0,3).forEach(add);
    objective.filter(x=>x.skill==="listening").slice(0,3).forEach(add);
    objective.filter(x=>x.skill==="grammar").slice(0,3).forEach(add);
    objective.filter(x=>x.skill==="vocabulary").slice(0,3).forEach(add);
    if(prod.length>1)add(prod[1]);
    seededOrder(objective,Number(seed||1)+91).forEach(add);
    seededOrder(prod,Number(seed||1)+117).forEach(add);
    if(!chosen.length)throw new Error("no mock items for "+b+" "+level);
    const start=Number(startedMs)||Date.now();
    return{
      id:"s5-"+b+"-"+level.toLowerCase()+"-"+m.id+"-"+start,
      schema:SCHEMA,version:VERSION,brand:b,brandName:EXAMS[b].name,level,mode:m.id,
      durationSec:m.minutes*60,startedAt:new Date(start).toISOString(),deadlineAt:new Date(start+m.minutes*60000).toISOString(),
      index:0,answers:{},status:"active",items:chosen,createdAt:now(),updatedAt:now(),
      official:false,scoreNote:SCORE_NOTE
    };
  }
  function remainingSec(session,atMs){
    if(!session||session.status!=="active")return 0;
    return Math.max(0,Math.ceil((new Date(session.deadlineAt).getTime()-(Number(atMs)||Date.now()))/1000));
  }
  function setIndex(session,index){
    const s=clone(session);s.index=clamp(index,0,Math.max(0,s.items.length-1));s.updatedAt=now();return s;
  }
  function answerSession(session,itemId,value){
    const s=clone(session),item=s.items.find(x=>x.id===itemId);if(!item)return s;
    s.answers=s.answers||{};s.answers[itemId]={value:String(value==null?"":value),at:now()};s.updatedAt=now();return s;
  }
  function compareObjective(item,value){
    const original=(Exercises&&Array.isArray(Exercises.exercises)?Exercises.exercises:[]).find(x=>x.id===item.refId);
    if(original&&Exercises&&typeof Exercises.compare==="function")return clamp(Exercises.compare(value,original.answer),0,100);
    if(Array.isArray(item.answer))return item.answer.some(x=>norm(x)===norm(value))?100:0;
    return norm(item.answer)===norm(value)?100:0;
  }
  function scoreItem(item,value){
    const text=String(value==null?"":value).trim();
    if(item.source==="core-objective")return{score:compareObjective(item,text),kind:"objective",limitations:""};
    if(item.skill==="writing"&&Stage4&&typeof Stage4.evaluateWriting==="function"){
      const r=Stage4.evaluateWriting(text,item.level,item.prompt);return{score:clamp(r.total,0,100),kind:"writing-rule-based",detail:r,limitations:r.limitations||SCORE_NOTE};
    }
    if(item.skill==="speaking"&&Stage4&&typeof Stage4.evaluateSpeaking==="function"){
      const r=Stage4.evaluateSpeaking(text,item.level,item.prompt);return{score:clamp(r.total,0,100),kind:"speaking-transcript",detail:r,limitations:r.limitations||SCORE_NOTE};
    }
    return{score:text.length>=20?60:text.length?35:0,kind:"practice-fallback",limitations:SCORE_NOTE};
  }
  function finalizeSession(session,atMs){
    const s=clone(session),rows=[],bySkill={};
    for(const item of s.items){
      const a=s.answers&&s.answers[item.id],sc=scoreItem(item,a&&a.value||"");
      rows.push({itemId:item.id,skill:item.skill,score:sc.score,kind:sc.kind,answered:!!(a&&String(a.value).trim()),limitations:sc.limitations||""});
      (bySkill[item.skill]||(bySkill[item.skill]=[])).push(sc.score);
    }
    const sections={};Object.entries(bySkill).forEach(([k,v])=>sections[k]=avg(v));
    const weak=Object.entries(sections).sort((a,b)=>a[1]-b[1]).slice(0,2).map(([skill,score])=>({skill,score,label:SKILL_FA[skill]||skill}));
    const completed=rows.filter(x=>x.answered).length,score=avg(rows.map(x=>x.score));
    s.status="finished";s.finishedAt=new Date(Number(atMs)||Date.now()).toISOString();s.updatedAt=now();
    s.result={score,sections,weakSkills:weak,answered:completed,total:rows.length,completion:Math.round(completed/Math.max(1,rows.length)*100),items:rows,timedOut:remainingSec(session,atMs)===0,official:false,note:SCORE_NOTE};
    return s;
  }

  function key(profileId){return"ghazal_stage5_v1_"+String(profileId||"local");}
  function defaults(profileId,level){
    return{schema:SCHEMA,version:VERSION,profileId:String(profileId||"local"),level:LEVELS.includes(level)?level:"B1",examGoal:"goethe",activeSession:null,history:[],pathwayProgress:{},updatedAt:now()};
  }
  function normalizeState(raw,profileId,level){
    const b=defaults(profileId,level),r=raw&&typeof raw==="object"?raw:{};
    return{...b,...r,schema:SCHEMA,version:VERSION,profileId:String(r.profileId||b.profileId),level:LEVELS.includes(r.level)?r.level:b.level,examGoal:EXAMS[brandId(r.examGoal)]?brandId(r.examGoal):b.examGoal,
      activeSession:r.activeSession&&typeof r.activeSession==="object"?r.activeSession:null,
      history:Array.isArray(r.history)?r.history.slice(-60):[],pathwayProgress:r.pathwayProgress&&typeof r.pathwayProgress==="object"?r.pathwayProgress:{},updatedAt:r.updatedAt||now()};
  }
  function readStorage(storage,profileId,level){try{return normalizeState(JSON.parse(storage.getItem(key(profileId))||"{}"),profileId,level);}catch(_){return defaults(profileId,level);}}
  function writeStorage(storage,state){const s=normalizeState(state,state&&state.profileId,state&&state.level);s.updatedAt=now();if(storage)storage.setItem(key(s.profileId),JSON.stringify(s));return s;}
  function startMock(state,brand,level,mode,seed,startedMs){const s=normalizeState(state,state&&state.profileId,level);s.examGoal=brandId(brand);s.level=level;s.activeSession=buildMock(brand,level,mode,seed,startedMs);return s;}
  function saveMockAnswer(state,itemId,value){const s=normalizeState(state,state&&state.profileId,state&&state.level);if(s.activeSession)s.activeSession=answerSession(s.activeSession,itemId,value);return s;}
  function moveMock(state,index){const s=normalizeState(state,state&&state.profileId,state&&state.level);if(s.activeSession)s.activeSession=setIndex(s.activeSession,index);return s;}
  function finishMock(state,atMs){
    const s=normalizeState(state,state&&state.profileId,state&&state.level);if(!s.activeSession)return s;
    const done=finalizeSession(s.activeSession,atMs);s.history.push({id:done.id,brand:done.brand,level:done.level,mode:done.mode,finishedAt:done.finishedAt,result:done.result});s.history=s.history.slice(-60);s.activeSession=null;return s;
  }

  function pathSource(id){
    const src=Specialization&&Specialization.tracks||{};
    if(id==="migration")return src.migration;
    if(id==="career")return src.career;
    if(id==="university")return src.university;
    if(id==="alltag"){
      const base=src.migration&&Array.isArray(src.migration.modules)?src.migration.modules:[];
      const keys=/arzt|bank|wohnung|supermarkt|bahn|bus|notfall|nachbar|versicherung|miet|alltag|einkauf|verkehr/i;
      let modules=base.filter(x=>keys.test((x.title||"")+" "+(x.fa||"")));
      if(modules.length<6)modules=base.slice(0,Math.min(12,base.length));
      return{id:"alltag",title:"Alltag in Deutschland",fa:"زندگی واقعی در آلمان",icon:"🏠",modules};
    }
    return null;
  }
  function pathways(){
    return[
      {id:"migration",fa:"مهاجرت و اداره‌ها",icon:"🧳"},
      {id:"university",fa:"دانشگاه",icon:"🎓"},
      {id:"career",fa:"کار و حرفه",icon:"💼"},
      {id:"alltag",fa:"زندگی واقعی",icon:"🏠"}
    ].map(x=>{const s=pathSource(x.id);return{...x,title:s&&s.title||x.fa,modules:s&&Array.isArray(s.modules)?s.modules.map(clone):[]};});
  }
  function pathwayModules(pathId,level){
    const p=pathways().find(x=>x.id===pathId);return p?p.modules.filter(x=>!level||x.level===level):[];
  }
  function markPathway(state,pathId,moduleId,skill,score){
    const s=normalizeState(state,state&&state.profileId,state&&state.level),p=s.pathwayProgress||(s.pathwayProgress={});
    const k=pathId+"|"+moduleId,x=p[k]||{pathId,moduleId,attempts:0,writing:0,speaking:0,done:false};
    x.attempts++;if(skill==="writing")x.writing=Math.max(x.writing,clamp(score,0,100));if(skill==="speaking")x.speaking=Math.max(x.speaking,clamp(score,0,100));
    x.done=x.writing>=60&&x.speaking>=60;x.updatedAt=now();p[k]=x;return s;
  }
  function pathwayStats(state,pathId){
    const mods=pathwayModules(pathId),p=normalizeState(state,state&&state.profileId,state&&state.level).pathwayProgress||{};
    const done=mods.filter(m=>p[pathId+"|"+m.id]&&p[pathId+"|"+m.id].done).length;
    return{done,total:mods.length,percent:Math.round(done/Math.max(1,mods.length)*100)};
  }
  function testdafReadiness(history,learnerProfile){
    const h=(Array.isArray(history)?history:[]).filter(x=>brandId(x.brand)==="testdaf"&&x.result).slice(-5),scores=h.map(x=>Number(x.result.score)||0);
    if(learnerProfile&&Number.isFinite(Number(learnerProfile.overall)))scores.push(Number(learnerProfile.overall));
    const score=avg(scores),label=score>=80?"آمادگی تمرینی خوب":score>=65?"نزدیک به سطح هدف":score>=45?"در حال تثبیت":"نیازمند پایه‌سازی";
    return{score,label,evidence:h.length,note:"این شاخص داخلی GHAZAL است و معادل TDN یا نتیجه رسمی TestDaF نیست."};
  }
  function historySummary(history){
    const h=Array.isArray(history)?history:[],last=h.slice(-10),scores=last.map(x=>Number(x.result&&x.result.score)||0),skill={};
    last.forEach(x=>Object.entries(x.result&&x.result.sections||{}).forEach(([k,v])=>(skill[k]||(skill[k]=[])).push(Number(v)||0)));
    const sections={};Object.entries(skill).forEach(([k,v])=>sections[k]=avg(v));
    const weak=Object.entries(sections).sort((a,b)=>a[1]-b[1]).slice(0,3).map(([k,v])=>({skill:k,score:v,label:SKILL_FA[k]||k}));
    return{attempts:h.length,recent:last.length,average:avg(scores),sections,weak};
  }
  function nextRecommendation(state,learnerProfile){
    const s=normalizeState(state,state&&state.profileId,state&&state.level);
    if(s.activeSession)return{kind:"resume",title:"ادامه آزمون نیمه‌تمام",detail:s.activeSession.brandName+" · "+s.activeSession.level};
    const weak=learnerProfile&&Array.isArray(learnerProfile.weakest)?learnerProfile.weakest[0]:null;
    const path=pathways().find(p=>p.id==="migration"),pending=path&&path.modules.find(m=>!(s.pathwayProgress["migration|"+m.id]&&s.pathwayProgress["migration|"+m.id].done));
    if(pending)return{kind:"pathway",pathId:"migration",moduleId:pending.id,title:"سناریوی بعدی مهاجرت",detail:pending.level+" · "+pending.fa};
    return{kind:"mock",brand:s.examGoal,level:s.level,title:"Mock بعدی",detail:(EXAMS[s.examGoal]||EXAMS.goethe).name+" · "+s.level+(weak?" · تمرکز "+(SKILL_FA[weak]||weak):"")};
  }
  function audit(){
    const tasks=rawExamTasks(),byBrand={};Object.keys(EXAMS).forEach(b=>byBrand[b]=tasks.filter(x=>x.brand===b).length);
    const ps=pathways(),issues=[];
    Object.keys(EXAMS).forEach(b=>{if(byBrand[b]<4)issues.push("exam_"+b);});
    ps.forEach(p=>{if(!p.modules.length)issues.push("path_"+p.id);});
    const sample=buildMock("goethe",availableLevels("goethe")[0]||"B1","quick",7,1700000000000);
    if(!sample.items.length||sample.durationSec!==900)issues.push("mock_builder");
    if(!RIGHTS_NOTE.includes("حق‌نشر")||!SCORE_NOTE.includes("رسمی"))issues.push("transparency");
    return{pass:issues.length===0,issues,version:VERSION,examTasks:tasks.length,byBrand,pathways:Object.fromEntries(ps.map(p=>[p.id,p.modules.length])),sampleItems:sample.items.length};
  }

  return{
    VERSION,SCHEMA,LEVELS,SKILLS,SKILL_FA,EXAMS,MODE,RIGHTS_NOTE,SCORE_NOTE,STRATEGIES,
    brandId,skillId,examTasks,availableLevels,buildMock,remainingSec,setIndex,answerSession,scoreItem,finalizeSession,
    defaults,normalizeState,readStorage,writeStorage,startMock,saveMockAnswer,moveMock,finishMock,
    pathways,pathwayModules,markPathway,pathwayStats,testdafReadiness,historySummary,nextRecommendation,audit
  };
});