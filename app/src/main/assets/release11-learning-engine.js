(function(root,factory){
  const api=factory(root&&root.GhazalExerciseEngine,root&&root.GhazalContentSystem,root&&root.GhazalAdvancedContent);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalLearningEngine=api;
})(typeof window!=="undefined"?window:null,function(Exercises,Content,Advanced){
  "use strict";
  const LEVELS=["A1","A2","B1","B2","C1","C2"];
  const SKILLS=["vocabulary","grammar","reading","listening","writing","speaking","pronunciation","transfer"];
  const TYPE_SKILL={
    meaning:"vocabulary",recall:"vocabulary",cloze:"grammar",pattern:"grammar",dialogue:"speaking",mcq:"grammar",
    grammar:"grammar",redemittel:"vocabulary",contrast:"grammar",reading:"reading",dictation:"listening",
    writing:"writing",speaking:"speaking",exam:"transfer"
  };
  const TYPE_MINUTES={meaning:1,recall:1,cloze:2,pattern:2,dialogue:2,mcq:1,grammar:2,redemittel:2,contrast:2,reading:4,dictation:4,writing:8,speaking:6,exam:12};
  function nowIso(){return new Date().toISOString();}
  function dateKey(d){const x=d?new Date(d):new Date();return x.toISOString().slice(0,10);}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function clamp(n,a,b){return Math.max(a,Math.min(b,Number(n)||0));}
  function mean(a){return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;}
  function initialState(profileId){
    const skills={};SKILLS.forEach(k=>skills[k]={attempts:0,total:0,avg:0,best:0,mastery:0,confidence:0,lastAt:null,streak:0});
    return{schema:2,profileId:profileId||"local",currentLevel:"A1",dailyMinutes:25,skills,items:{},errors:{},vocabulary:{},grammar:{},history:[],missions:{},placement:null,lastPlan:null,createdAt:nowIso(),updatedAt:nowIso()};
  }
  function normalizeState(raw,profileId){
    const b=initialState(profileId),r=raw&&typeof raw==="object"?raw:{},skills={...b.skills};
    Object.entries(r.skills||{}).forEach(([k,v])=>skills[k]={...skills[k],...v});
    return{...b,...r,profileId:r.profileId||profileId||b.profileId,skills,items:r.items||{},errors:r.errors||{},vocabulary:r.vocabulary||{},grammar:r.grammar||{},history:Array.isArray(r.history)?r.history:[],missions:r.missions||{}};
  }
  function skillOf(ex){return TYPE_SKILL[ex&&ex.type]||"transfer";}
  function dueMs(item){return item&&item.dueAt?new Date(item.dueAt).getTime():0;}
  function itemState(s,id){return s.items[id]||{attempts:0,scores:[],reps:0,lapses:0,ease:2.3,intervalDays:0,dueAt:null,lastAt:null,mastery:0,confidence:0,transferPasses:0};}
  function nextInterval(item,score){
    if(score<60)return 1;
    if(item.reps<=0)return score>=85?2:1;
    if(item.reps===1)return score>=85?5:3;
    const factor=clamp(item.ease+(score>=90?0.15:score<75?-0.12:0),1.3,2.8);
    return Math.max(1,Math.min(120,Math.round((item.intervalDays||2)*factor)));
  }
  function masteryScore(item){
    const recent=(item.scores||[]).slice(-5),avg=mean(recent),volume=Math.min(100,(item.attempts||0)*20),stability=Math.min(100,(item.intervalDays||0)*8),transfer=Math.min(100,(item.transferPasses||0)*35);
    return Math.round(avg*.5+volume*.18+stability*.17+transfer*.15);
  }
  function confidenceScore(old,score,selfConfidence){
    const observed=clamp(score,0,100),self=clamp(selfConfidence==null?observed:selfConfidence,0,100);
    return Math.round((Number(old)||0)*.55+observed*.25+self*.20);
  }
  function errorKey(ex){return (ex&&ex.id)||"unknown";}
  function recordError(s,ex,score,answer){
    const id=errorKey(ex),old=s.errors[id]||{id,exerciseId:id,type:ex.type,level:ex.level,skill:skillOf(ex),prompt:ex.prompt,answer:ex.answer,firstAt:nowIso(),lastAt:null,count:0,resolved:false,successfulRetries:0};
    if(score<70){old.count++;old.lastAt=nowIso();old.resolved=false;old.successfulRetries=0;old.lastUserAnswer=String(answer||"");}
    else if(old.count>0&&!old.resolved){old.successfulRetries++;old.lastAt=nowIso();if(old.successfulRetries>=2)old.resolved=true;}
    s.errors[id]=old;
  }
  function updateKnowledgeMaps(s,ex,score){
    const key=ex.lessonId||ex.moduleId||ex.id;
    if(ex.type==="meaning"||ex.type==="recall"||ex.type==="redemittel"){
      const x=s.vocabulary[key]||{attempts:0,active:0,automatic:0,lastAt:null};x.attempts++;if(score>=70)x.active++;if(score>=90)x.automatic++;x.lastAt=nowIso();s.vocabulary[key]=x;
    }
    if(["cloze","pattern","grammar","contrast","mcq"].includes(ex.type)){
      const x=s.grammar[key]||{attempts:0,success:0,transfer:0,lastAt:null};x.attempts++;if(score>=75)x.success++;if(ex.type==="contrast"&&score>=80)x.transfer++;x.lastAt=nowIso();s.grammar[key]=x;
    }
  }
  function recordAttempt(raw,exercise,score,meta){
    const s=normalizeState(raw,raw&&raw.profileId),ex=exercise||{},m=meta||{},n=clamp(score,0,100),id=ex.id||("adhoc-"+Date.now()),it=itemState(s,id);
    it.attempts++;it.scores=(it.scores||[]).concat(n).slice(-20);it.lastAt=nowIso();if(n<60){it.lapses++;it.reps=0;it.ease=clamp(it.ease-.2,1.3,2.8);}else{it.reps++;it.ease=clamp(it.ease+(n>=90?.1:n<75?-.05:0),1.3,2.8);}
    if(m.transfer===true&&n>=75)it.transferPasses=(it.transferPasses||0)+1;
    it.intervalDays=nextInterval(it,n);const due=new Date();due.setDate(due.getDate()+it.intervalDays);it.dueAt=due.toISOString();it.confidence=confidenceScore(it.confidence,n,m.confidence);it.mastery=masteryScore(it);s.items[id]=it;
    const skill=skillOf(ex),sk=s.skills[skill]||{attempts:0,total:0,avg:0,best:0,mastery:0,confidence:0,lastAt:null,streak:0};sk.attempts++;sk.total+=n;sk.avg=Math.round(sk.total/sk.attempts);sk.best=Math.max(sk.best||0,n);sk.lastAt=nowIso();sk.confidence=confidenceScore(sk.confidence,n,m.confidence);const mastered=Object.values(s.items).filter(x=>x.mastery>=80).length,totalItems=Math.max(1,Object.keys(s.items).length);sk.mastery=Math.round((sk.avg*.7)+(mastered/totalItems*100*.3));sk.streak=n>=70?(sk.streak||0)+1:0;s.skills[skill]=sk;
    recordError(s,ex,n,m.answer);updateKnowledgeMaps(s,ex,n);
    s.history.push({exerciseId:id,type:ex.type,level:ex.level,skill,score:n,confidence:m.confidence==null?null:clamp(m.confidence,0,100),transfer:!!m.transfer,at:nowIso()});if(s.history.length>1500)s.history=s.history.slice(-1500);
    s.updatedAt=nowIso();return s;
  }
  function dueReviews(s,limit){
    const now=Date.now(),ids=Object.keys(s.items).filter(id=>{const x=s.items[id];return x.dueAt&&dueMs(x)<=now;}).sort((a,b)=>dueMs(s.items[a])-dueMs(s.items[b])).slice(0,limit||50),map=new Map((Exercises&&Exercises.exercises||[]).map(x=>[x.id,x]));
    return ids.map(id=>map.get(id)).filter(Boolean);
  }
  function weakestSkills(s){
    return SKILLS.map(id=>({id,score:Math.round((s.skills[id]?.avg||0)*.55+(s.skills[id]?.mastery||0)*.3+(s.skills[id]?.confidence||0)*.15),attempts:s.skills[id]?.attempts||0})).sort((a,b)=>a.score-b.score||a.attempts-b.attempts);
  }
  function deterministicPick(arr,count,seed){
    if(!arr.length)return[];const out=[],used=new Set();let n=Math.abs(Number(seed)||1);while(out.length<Math.min(count,arr.length)){n=(n*9301+49297)%233280;const i=Math.floor(n/233280*arr.length);if(!used.has(i)){used.add(i);out.push(arr[i]);}}return out;
  }
  function buildDailyPlan(raw,minutes,level){
    const s=normalizeState(raw,raw&&raw.profileId),budget=Math.max(10,Math.min(120,Number(minutes)||s.dailyMinutes||25)),lv=LEVELS.includes(level)?level:s.currentLevel,all=(Exercises&&Exercises.exercises||[]).filter(x=>x.level===lv),due=dueReviews(s,Math.ceil(budget/2)),weak=weakestSkills(s).slice(0,3),selected=[],used=new Set();let spent=0;
    function add(ex,reason){if(!ex||used.has(ex.id))return;const cost=TYPE_MINUTES[ex.type]||3;if(spent+cost>budget&&selected.length)return;used.add(ex.id);selected.push({exercise:ex,minutes:cost,reason});spent+=cost;}
    due.forEach(x=>add(x,"مرور موعددار"));
    weak.forEach((w,idx)=>deterministicPick(all.filter(x=>skillOf(x)===w.id&&!used.has(x.id)),Math.max(1,idx===0?3:2),Number(dateKey().replace(/-/g,""))+idx).forEach(x=>add(x,"تقویت "+w.id)));
    deterministicPick(all.filter(x=>!used.has(x.id)),20,Number(dateKey().replace(/-/g,""))+17).forEach(x=>{if(spent<budget)add(x,"پیشروی و Transfer");});
    const plan={date:dateKey(),level:lv,budgetMinutes:budget,estimatedMinutes:spent,weakest:weak,items:selected,createdAt:nowIso()};s.lastPlan=clone(plan);s.dailyMinutes=budget;s.currentLevel=lv;s.updatedAt=nowIso();return{state:s,plan};
  }
  function masteryGate(raw,level){
    const s=normalizeState(raw),lv=LEVELS.includes(level)?level:s.currentLevel,h=s.history.filter(x=>x.level===lv).slice(-120),skillScores={};SKILLS.forEach(k=>{const a=h.filter(x=>x.skill===k).map(x=>x.score);skillScores[k]=mean(a);});
    const objective=["vocabulary","grammar","reading","listening"],production=["writing","speaking"],objMin=Math.min(...objective.map(k=>skillScores[k]||0)),prodMin=Math.min(...production.map(k=>skillScores[k]||0)),transfer=h.filter(x=>x.transfer&&x.score>=75).length,unresolved=Object.values(s.errors).filter(e=>e.level===lv&&!e.resolved&&e.count>=2).length;
    const pass=h.length>=30&&objMin>=75&&prodMin>=65&&transfer>=3&&unresolved<=5;
    return{level:lv,pass,evidence:{attempts:h.length,objectiveMin:objMin,productionMin:prodMin,transferPasses:transfer,unresolvedRecurringErrors:unresolved},requirements:{attempts:30,objectiveMin:75,productionMin:65,transferPasses:3,maxRecurringErrors:5}};
  }
  function nextLevel(raw){
    const s=normalizeState(raw),i=LEVELS.indexOf(s.currentLevel),gate=masteryGate(s,s.currentLevel);return{current:s.currentLevel,gate,next:gate.pass&&i>=0&&i<LEVELS.length-1?LEVELS[i+1]:s.currentLevel};
  }
  function errorBank(raw,filter){
    const s=normalizeState(raw),f=filter||{};return Object.values(s.errors).filter(e=>(f.resolved==null||e.resolved===f.resolved)&&(!f.level||e.level===f.level)&&(!f.skill||e.skill===f.skill)).sort((a,b)=>(b.count||0)-(a.count||0)||String(b.lastAt).localeCompare(String(a.lastAt)));
  }
  function rescueFor(exercise,attempt){
    const ex=exercise||{},n=Number(attempt)||1;
    if(n<=1)return{step:1,text:"اول کلیدواژه‌های سؤال و نقش دستوری را مشخص کن.",reveal:false};
    if(n===2&&ex.context)return{step:2,text:"به Context برگرد و جمله قبل/بعد را مقایسه کن.",reveal:false};
    if(n===2&&ex.options)return{step:2,text:"دو گزینه‌ای را که از نظر معنا یا Grammar نمی‌خورند حذف کن.",reveal:false};
    if(n===3)return{step:3,text:"الگوی پاسخ: "+String(ex.answer||"").split(" ").slice(0,2).join(" ")+" …",reveal:false};
    return{step:4,text:"پاسخ هدف را ببین، سپس صفحه را ببند و بدون نگاه دوباره تولیدش کن: "+String(ex.answer||""),reveal:true};
  }
  function immersion(level){
    const map={A1:{de:30,fa:70},A2:{de:45,fa:55},B1:{de:60,fa:40},B2:{de:78,fa:22},C1:{de:92,fa:8},C2:{de:98,fa:2}};return{level,...map[level]||map.A1};
  }
  function unknownChallenge(raw,level){
    const s=normalizeState(raw),lv=level||s.currentLevel,types=["reading","dictation","speaking","writing","contrast"],pool=(Exercises&&Exercises.exercises||[]).filter(x=>x.level===lv&&types.includes(x.type)&&!(s.history.slice(-80).some(h=>h.exerciseId===x.id))),picked=deterministicPick(pool,4,Date.now()%(24*60*60*1000));return{level:lv,title:"Unknown Situation",items:picked,rule:"بدون Hint شروع کن؛ Rescue Mode فقط بعد از تلاش اول باز شود."};
  }
  function placementSession(){
    const bank=Exercises&&Exercises.exercises||[],items=[];LEVELS.forEach((lv,li)=>{["meaning","cloze","reading","dictation"].forEach((type,ti)=>{const pool=bank.filter(x=>x.level===lv&&x.type===type);const picked=deterministicPick(pool,1,li*17+ti*31+7)[0];if(picked)items.push(picked);});});
    return{id:"placement-"+Date.now(),items,answers:[],createdAt:nowIso()};
  }
  function scorePlacement(session,answers){
    const a=Array.isArray(answers)?answers:[],bySkill={},byLevel={};(session.items||[]).forEach((ex,i)=>{const score=clamp(a[i]?.score,0,100),skill=skillOf(ex);(bySkill[skill]||(bySkill[skill]=[])).push(score);(byLevel[ex.level]||(byLevel[ex.level]=[])).push(score);});
    const skillScores={};Object.entries(bySkill).forEach(([k,v])=>skillScores[k]=mean(v));let suggested="A1";LEVELS.forEach(l=>{if(mean(byLevel[l]||[])>=70)suggested=l;});
    return{skillScores,levelScores:Object.fromEntries(Object.entries(byLevel).map(([k,v])=>[k,mean(v)])),suggestedLevel:suggested,diagnosticOnly:true,note:"Offline diagnostic placement; not an official CEFR certificate."};
  }
  function mission(raw,period){
    const s=normalizeState(raw),p=period==="monthly"?"monthly":"weekly",key=p+"-"+(p==="weekly"?dateKey():dateKey().slice(0,7)),old=s.missions[key];if(old)return old;
    const weak=weakestSkills(s).slice(0,2).map(x=>x.id),mission={id:key,period:p,createdAt:nowIso(),targets:p==="weekly"?{attempts:20,transfer:3,errorsResolved:3}:{attempts:80,transfer:12,errorsResolved:10},focus:weak,completed:false};s.missions[key]=mission;return mission;
  }
  function missionProgress(raw,period){
    const s=normalizeState(raw),m=mission(s,period),days=period==="monthly"?31:7,since=Date.now()-days*86400000,h=s.history.filter(x=>new Date(x.at).getTime()>=since),resolved=Object.values(s.errors).filter(e=>e.resolved&&e.lastAt&&new Date(e.lastAt).getTime()>=since).length,transfer=h.filter(x=>x.transfer&&x.score>=75).length,progress={attempts:h.length,transfer,errorsResolved:resolved},targets=m.targets;return{...m,progress,completed:progress.attempts>=targets.attempts&&progress.transfer>=targets.transfer&&progress.errorsResolved>=targets.errorsResolved};
  }
  return{LEVELS,SKILLS,TYPE_SKILL,initialState,normalizeState,recordAttempt,dueReviews,weakestSkills,buildDailyPlan,masteryGate,nextLevel,errorBank,rescueFor,immersion,unknownChallenge,placementSession,scorePlacement,mission,missionProgress,skillOf};
});