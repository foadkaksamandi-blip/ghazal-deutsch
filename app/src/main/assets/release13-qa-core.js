(function(root,factory){
  const api=factory(
    root&&root.GhazalData,
    root&&root.GhazalExerciseEngine,
    root&&root.GhazalContentSystem,
    root&&root.GhazalDictionary,
    root&&root.GhazalLearningEngine,
    root&&root.GhazalClassroomCore,
    root&&root.GhazalProductCore,
    root&&root.GhazalSecurityCore
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalQACore=api;
})(typeof window!=="undefined"?window:null,function(Data,Exercises,Content,Dictionary,Learning,Classroom,Product,Security){
  "use strict";
  const VERSION="14.0.0",SCHEMA=1;
  const LEVELS=["A1","A2","B1","B2","C1","C2"];
  const CRITICAL_CATEGORIES=new Set(["startup","security","offline","persistence","education","classroom"]);
  const MANUAL_CASES=[
    {id:"install-clean",category:"startup",critical:true,title:"نصب تمیز",steps:"APK را روی گوشی بدون نسخه قبلی نصب کن؛ باید بدون Crash باز شود."},
    {id:"upgrade-install",category:"startup",critical:true,title:"آپدیت روی نسخه قبلی",steps:"روی نسخه قبلی نصب کن؛ اگر امضا سازگار است داده‌ها باید باقی بمانند. در غیر این صورت Backup قبل از حذف الزامی است."},
    {id:"launch-relaunch",category:"startup",critical:true,title:"باز و بسته‌کردن مکرر",steps:"اپ را ۵ بار کامل ببند و باز کن؛ صفحه سفید یا Crash نباید رخ دهد."},
    {id:"app-lock",category:"security",critical:true,title:"App Lock",steps:"قفل را فعال کن، اپ را پس‌زمینه ببر، بیش از ۵ ثانیه صبر کن و برگرد؛ PIN/اثر انگشت خود گوشی باید درخواست شود."},
    {id:"privacy-screen",category:"security",critical:true,title:"Privacy Screen",steps:"وقتی فعال است Screenshot و Recent Apps نباید محتوای حساس را نمایش دهند."},
    {id:"airplane-launch",category:"offline",critical:true,title:"Airplane Mode Launch",steps:"اینترنت، Wi‑Fi و دیتای موبایل را خاموش کن و اپ را از صفر باز کن؛ هسته آموزشی باید کار کند."},
    {id:"offline-a1",category:"education",critical:true,title:"درس A1 آفلاین",steps:"یک درس A1 را کامل کن؛ متن، Quiz، TTS و ثبت پیشرفت را بررسی کن."},
    {id:"offline-c2",category:"education",critical:true,title:"درس C2 آفلاین",steps:"یک درس C2 را باز و تمرین کن؛ هیچ وابستگی به اینترنت نباید مانع هسته درس شود."},
    {id:"five-skill",category:"education",critical:true,title:"جلسه ۵ مهارتی",steps:"Listening→Reading→Writing→Speaking→Transfer را تا پایان انجام بده و ثبت نتیجه را بررسی کن."},
    {id:"adaptive-plan",category:"education",critical:true,title:"Adaptive Daily Plan",steps:"چند پاسخ ضعیف و قوی ثبت کن؛ برنامه روزانه باید ضعف و مرور موعددار را بازتاب دهد."},
    {id:"error-bank",category:"education",critical:true,title:"Error Bank",steps:"یک تمرین را اشتباه بزن؛ باید وارد Error Bank شود و فقط پس از بازیابی‌های موفق Resolve شود."},
    {id:"mastery-gate",category:"education",critical:true,title:"Mastery Gate",steps:"تأیید کن Completion ساده باعث بازشدن سطح بعد نمی‌شود و Evidence لازم است."},
    {id:"tts",category:"audio",critical:false,title:"TTS آلمانی",steps:"سرعت آهسته و عادی را تست کن؛ صدا نباید Crash کند."},
    {id:"speech",category:"audio",critical:false,title:"Speech Recognition",steps:"اجازه میکروفون را بده و یک پاسخ آلمانی ضبط کن؛ Result یا خطای قابل‌فهم باید نمایش داده شود."},
    {id:"notification",category:"notification",critical:false,title:"اعلان روزانه",steps:"یادآوری را برای چند دقیقه بعد تنظیم کن؛ اپ را ببند و رسیدن اعلان را بررسی کن."},
    {id:"boot-reminder",category:"notification",critical:false,title:"یادآوری پس از Restart گوشی",steps:"پس از تنظیم Reminder گوشی را Restart کن و ماندگاری زمان‌بندی را بررسی کن."},
    {id:"backup-roundtrip",category:"persistence",critical:true,title:"Backup / Restore",steps:"Backup رمزگذاری‌شده بگیر، داده‌ای را تغییر بده، Restore کن و برگشت داده را تأیید کن."},
    {id:"resume",category:"persistence",critical:true,title:"Resume دقیق",steps:"در میانه فعالیت از اپ خارج شو و برگرد؛ آخرین مسیر باید قابل ادامه باشد."},
    {id:"pdf",category:"export",critical:false,title:"گزارش PDF",steps:"PDF گزارش را صادر و فایل را باز کن؛ مشخصات و شاخص‌ها باید قابل‌خواندن باشند."},
    {id:"classroom",category:"classroom",critical:true,title:"Teacher→Student→Grade",steps:"استاد کلاس و تکلیف بسازد، دانش‌آموز تحویل دهد و استاد Rubric/Comment/Grade ثبت کند."},
    {id:"class-report",category:"classroom",critical:true,title:"گزارش کلاس",steps:"Completion و Average Grade کلاس را با داده تحویل‌ها تطبیق بده."},
    {id:"content-pack",category:"content",critical:false,title:"Content Pack",steps:"یک Pack معتبر را Import و یک Pack خراب را Reject کن؛ درس معتبر پس از Restart وارد Universe شود."},
    {id:"search-dictionary",category:"content",critical:false,title:"Search + Dictionary",steps:"چند واژه فارسی و آلمانی و موضوع درسی را جستجو کن و نتایج مرتبط بگیر."},
    {id:"accessibility",category:"accessibility",critical:false,title:"Accessibility",steps:"Text Zoom، High Contrast، Reduced Motion و Large Targets را تغییر بده و ماندگاری را بررسی کن."},
    {id:"low-memory",category:"stability",critical:false,title:"Low-memory recovery",steps:"چند اپ دیگر باز کن، GHAZAL را پس‌زمینه ببر و برگرد؛ نباید صفحه سفید یا از دست‌رفتن داده رخ دهد."},
    {id:"long-session",category:"stability",critical:false,title:"جلسه طولانی",steps:"حداقل ۳۰ دقیقه بین چند درس/تمرین/کلاس جابه‌جا شو؛ Memory leak یا کندی شدید نباید دیده شود."},
    {id:"back-navigation",category:"stability",critical:true,title:"Back/× Navigation",steps:"در تمام پنل‌ها × و Back اندروید را تست کن؛ گیرکردن Modal یا خروج ناخواسته نباید رخ دهد."},
    {id:"data-delete",category:"privacy",critical:false,title:"حذف داده محلی",steps:"فقط پس از Backup، حذف داده محلی را روی پروفایل تست انجام بده و پاک‌شدن وضعیت را بررسی کن."}
  ];
  function now(){return new Date().toISOString();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function clamp(n,a,b){return Math.max(a,Math.min(b,Number(n)||0));}
  function initialState(){return{schema:SCHEMA,version:VERSION,runs:[],manual:{},runtimeErrors:[],lastDevice:null,updatedAt:now()};}
  function normalize(raw){
    const b=initialState(),r=raw&&typeof raw==="object"?raw:{};
    return{...b,...r,schema:SCHEMA,version:VERSION,runs:Array.isArray(r.runs)?r.runs.slice(-30):[],manual:r.manual&&typeof r.manual==="object"?r.manual:{},runtimeErrors:Array.isArray(r.runtimeErrors)?r.runtimeErrors.slice(-100):[]};
  }
  function recordRuntimeError(state,input){
    const s=normalize(state),i=input||{};s.runtimeErrors.push({at:now(),type:String(i.type||"error"),message:String(i.message||"").slice(0,600),source:String(i.source||"").slice(0,300),line:Number(i.line)||0,column:Number(i.column)||0,stack:String(i.stack||"").slice(0,2000)});s.runtimeErrors=s.runtimeErrors.slice(-100);s.updatedAt=now();return s;
  }
  function setManual(state,id,status,note,device){
    const s=normalize(state),c=MANUAL_CASES.find(x=>x.id===id);if(!c)throw new Error("manual_case_not_found");
    if(!["pass","fail","skip","pending"].includes(status))throw new Error("manual_status");
    s.manual[id]={status,note:String(note||"").slice(0,1000),at:now(),device:device||null};s.updatedAt=now();return s;
  }
  function manualSummary(state){
    const s=normalize(state),rows=MANUAL_CASES.map(c=>({...c,result:s.manual[c.id]||{status:"pending"}})),counts={pass:0,fail:0,skip:0,pending:0};rows.forEach(x=>counts[x.result.status]=(counts[x.result.status]||0)+1);
    const criticalPending=rows.filter(x=>x.critical&&x.result.status!=="pass"),criticalFailed=rows.filter(x=>x.critical&&x.result.status==="fail");
    return{rows,counts,criticalPending:criticalPending.map(x=>x.id),criticalFailed:criticalFailed.map(x=>x.id),pass:criticalPending.length===0&&counts.fail===0};
  }
  function lessonSchema(l){
    return !!(l&&typeof l.id==="string"&&LEVELS.includes(l.level)&&typeof l.title==="string"&&l.title.trim()&&typeof l.goal==="string"&&Array.isArray(l.words)&&l.words.length>=3&&Array.isArray(l.dialogue)&&l.dialogue.length>=2&&l.quiz&&Array.isArray(l.quiz.options)&&l.quiz.options.length>=2&&Number.isInteger(l.quiz.answer)&&l.quiz.answer>=0&&l.quiz.answer<l.quiz.options.length);
  }
  function contentAudit(){
    const lessons=Data&&Array.isArray(Data.lessons)?Data.lessons:[],ids=new Set(),dupes=[],bad=[],counts=Object.fromEntries(LEVELS.map(x=>[x,0]));
    lessons.forEach(l=>{if(ids.has(l.id))dupes.push(l.id);ids.add(l.id);if(counts[l.level]!=null)counts[l.level]++;if(!lessonSchema(l))bad.push(l&&l.id||"unknown");});
    const exercises=Exercises&&Array.isArray(Exercises.exercises)?Exercises.exercises:[],exIds=new Set(),exDupes=[],badEx=[];
    exercises.forEach(e=>{if(!e||!e.id||!LEVELS.includes(e.level)||!e.type||!e.prompt)badEx.push(e&&e.id||"unknown");if(exIds.has(e.id))exDupes.push(e.id);exIds.add(e.id);if(e.lessonId&&!ids.has(e.lessonId))badEx.push(e.id+":lesson-ref");});
    return{lessons:lessons.length,exercises:exercises.length,levelCounts:counts,duplicateLessons:dupes,badLessons:bad,duplicateExercises:exDupes,badExercises:badEx,pass:lessons.length>=60&&LEVELS.every(x=>counts[x]>=10)&&dupes.length===0&&bad.length===0&&exDupes.length===0&&badEx.length===0};
  }
  function storageAudit(storage){
    const rows=[],invalid=[];if(storage){for(let i=0;i<storage.length;i++){const k=storage.key(i);if(!k||!k.startsWith("ghazal_"))continue;const v=storage.getItem(k)||"";let json=true;try{JSON.parse(v);}catch(_){json=false;invalid.push(k);}rows.push({key:k,bytes:v.length,json});}}
    const total=rows.reduce((n,x)=>n+x.bytes,0);return{keys:rows.length,totalBytes:total,invalid,pass:invalid.length===0&&total<7_000_000};
  }
  function searchAudit(){
    try{
      const queries=["Wohnung","Behörde","Arbeit","Universität","Prüfung","Haus","gehen"],results=queries.map(q=>({q,count:Content&&Content.search?Content.search(q,{}).length:0})),hits=results.filter(x=>x.count>0).length;
      return{results,hits,total:results.length,pass:!!(Content&&Content.index&&Content.index.length)&&hits>=5};
    }catch(err){return{results:[],pass:false,error:String(err&&err.message||err)};}
  }
  function dictionaryAudit(){
    try{
      const probes=["Haus","gehen","Arbeit"],rows=probes.map(q=>{let r=[];if(Dictionary&&typeof Dictionary.search==="function")r=Dictionary.search(q,"",20)||[];else r=(Dictionary&&Dictionary.all||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));return{q,count:r.length};});
      return{rows,pass:rows.some(x=>x.count>0)};
    }catch(err){return{rows:[],pass:false,error:String(err&&err.message||err)};}
  }
  function learningAudit(){
    try{
      if(!Learning)return{pass:false,error:"missing_learning_engine"};
      let s=Learning.initialState("qa");s.currentLevel="B1";const p=Learning.buildDailyPlan(s,25,"B1");const gate=Learning.masteryGate(p.state,"B1");
      return{planItems:p.plan.items.length,minutes:p.plan.estimatedMinutes,gate,pass:p.plan.items.length>0&&p.plan.estimatedMinutes<=25&&gate&&typeof gate.pass==="boolean"};
    }catch(err){return{pass:false,error:String(err&&err.message||err)};}
  }
  function classroomAudit(){
    try{
      if(!Classroom)return{pass:false,error:"missing_classroom"};
      const contracts=Classroom.serverContracts?Classroom.serverContracts():null;return{contracts,pass:!!(contracts&&contracts.offlineQueue&&contracts.idempotencyRequired)};
    }catch(err){return{pass:false,error:String(err&&err.message||err)};}
  }
  async function productAudit(storage){
    try{
      if(!Product)return{pass:false,error:"missing_product_core"};
      const backup=await Product.buildBackup(storage,{qa:true}),verify=await Product.verifyBackup(backup),pack=Product.validatePack({format:"ghazal-content-pack-v2",id:"qa-pack",version:"1.0.0",minAppVersion:"1.0.0",title:"QA",lessons:[{id:"qa.a1.001",level:"A1",title:"QA",goal:"QA",words:[["a","b"],["c","d"],["e","f"]],dialogue:[["A","B"],["C","D"]],quiz:{q:"Q",options:["A","B"],answer:0}}]},Product.PRODUCT_VERSION);
      const offline=Product.offlineAudit(Product.defaults(),{tts:true,speech:true,storage:true});
      return{backupValid:verify.valid,packValid:pack.valid,offlinePass:offline.pass,pass:verify.valid&&pack.valid&&offline.pass};
    }catch(err){return{pass:false,error:String(err&&err.message||err)};}
  }
  function securityAudit(storage){
    try{if(!Security)return{pass:false,error:"missing_security_core"};const e=Security.evaluate(storage);return{score:e.score,checks:e.checks,native:e.native,pass:e.pass};}
    catch(err){return{pass:false,error:String(err&&err.message||err)};}
  }
  function runtimeAudit(state){const s=normalize(state),recent=s.runtimeErrors.filter(x=>Date.now()-new Date(x.at).getTime()<24*3600*1000);return{recent:recent.length,items:recent.slice(-20),pass:recent.length===0};}
  function check(id,category,critical,pass,detail){return{id,category,critical:!!critical,pass:!!pass,detail:detail||null};}
  async function runAutomated(state,storage,context){
    const s=normalize(state),ctx=context||{},content=contentAudit(),search=searchAudit(),dict=dictionaryAudit(),learn=learningAudit(),classroom=classroomAudit(),product=await productAudit(storage),security=securityAudit(storage),storageResult=storageAudit(storage),runtime=runtimeAudit(s);
    const native=ctx.device||security.native||{};
    const checks=[
      check("content-schema","education",true,content.pass,content),
      check("global-search","education",false,search.pass,search),
      check("dictionary","education",false,dict.pass,dict),
      check("adaptive-engine","education",true,learn.pass,learn),
      check("classroom-contract","classroom",true,classroom.pass,classroom),
      check("product-backup-pack-offline","persistence",true,product.pass,product),
      check("storage-health","persistence",true,storageResult.pass,storageResult),
      check("security-runtime","security",true,security.pass,security),
      check("asset-integrity","security",true,native.assetIntegrity!==false,{value:native.assetIntegrity}),
      check("crypto-self-test","security",true,native.cryptoSelfTest!==false,{value:native.cryptoSelfTest}),
      check("not-debuggable","security",true,native.debuggable!==true,{value:native.debuggable}),
      check("runtime-errors-24h","stability",false,runtime.pass,runtime),
      check("offline-network-policy","offline",true,native.cleartextDisabled!==false,{value:native.cleartextDisabled}),
      check("app-version","startup",true,String(native.version||VERSION).startsWith("14."),{value:native.version||VERSION})
    ];
    const criticalFailed=checks.filter(x=>x.critical&&!x.pass),failed=checks.filter(x=>!x.pass);
    const run={id:"qa-"+Date.now(),at:now(),version:VERSION,pass:criticalFailed.length===0,checks,failed:failed.map(x=>x.id),criticalFailed:criticalFailed.map(x=>x.id),device:ctx.device||null,durationMs:Number(ctx.durationMs)||0};
    s.runs.push(run);s.runs=s.runs.slice(-30);s.lastDevice=ctx.device||s.lastDevice;s.updatedAt=now();
    return{state:s,run};
  }
  function releaseReadiness(state,automatedRun,external){
    const manual=manualSummary(state),auto=automatedRun||normalize(state).runs.slice(-1)[0]||null,e=external||{},blockers=[];
    if(!auto||!auto.pass)blockers.push("automated_critical_qa");
    if(!manual.pass)blockers.push("manual_device_matrix");
    if(e.productionSigning!==true)blockers.push("production_signing");
    if(e.repositoryPrivate!==true)blockers.push("repository_privacy");
    return{ready:blockers.length===0,blockers,automated:auto,manual,external:e};
  }
  function evidence(state,device){
    const s=normalize(state),last=s.runs.slice(-1)[0]||null,manual=manualSummary(s);return{format:"ghazal-stage7-qa-evidence-v1",version:VERSION,generatedAt:now(),device:device||s.lastDevice||null,automated:last,manual:{counts:manual.counts,criticalPending:manual.criticalPending,criticalFailed:manual.criticalFailed,results:s.manual},runtimeErrors:s.runtimeErrors.slice(-50),releaseGate:releaseReadiness(s,last,{productionSigning:device&&device.productionSigned===true,repositoryPrivate:false})};
  }
  return{VERSION,SCHEMA,LEVELS,CRITICAL_CATEGORIES,MANUAL_CASES,initialState,normalize,recordRuntimeError,setManual,manualSummary,contentAudit,storageAudit,searchAudit,dictionaryAudit,learningAudit,classroomAudit,productAudit,securityAudit,runtimeAudit,runAutomated,releaseReadiness,evidence};
});