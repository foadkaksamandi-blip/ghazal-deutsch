#!/usr/bin/env node
"use strict";

const fs=require("node:fs");
const path=require("node:path");
const {performance}=require("node:perf_hooks");
const {webcrypto}=require("node:crypto");
if(!globalThis.crypto)Object.defineProperty(globalThis,"crypto",{value:webcrypto,configurable:true});

const ROOT=path.join(__dirname,"..");
const ASSETS=path.join(ROOT,"app/src/main/assets");
const report={version:"13.0.0",startedAt:new Date().toISOString(),checks:[],metrics:{},failures:[]};
function add(id,pass,detail={}){report.checks.push({id,pass:!!pass,detail});if(!pass)report.failures.push(id);}
function assertCheck(id,condition,detail={}){add(id,!!condition,detail);if(!condition)throw new Error(id+" failed "+JSON.stringify(detail));}
function safe(id,fn){try{const v=fn();add(id,true,v&&typeof v==="object"?v:{value:v});return v;}catch(err){add(id,false,{error:String(err&&err.stack||err)});return null;}}
async function safeAsync(id,fn){try{const v=await fn();add(id,true,v&&typeof v==="object"?v:{value:v});return v;}catch(err){add(id,false,{error:String(err&&err.stack||err)});return null;}}

class FakeStorage{
  constructor(init={}){this.map=new Map(Object.entries(init));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
  clear(){this.map.clear();}
}

function loadAll(){
  const rel=[
    "course-data.js","release4-content.js","release5-content.js","release7-content.js","release10-capstone-content.js",
    "release7-library.js","release8-dictionary.js","release8-deep-library.js","release9-specialization.js",
    "release10-advanced-content.js","release10-exercise-engine.js","release10-content-system.js","platform-core.js",
    "release11-learning-engine.js","release11-classroom-core.js"
  ];
  rel.forEach(p=>{const full=path.join(ASSETS,p);try{delete require.cache[require.resolve(full)];}catch(_){}});
  const data=require(path.join(ASSETS,rel[0]));
  global.window={GhazalData:data};
  require(path.join(ASSETS,rel[1]));require(path.join(ASSETS,rel[2]));require(path.join(ASSETS,rel[3]));require(path.join(ASSETS,rel[4]));
  const lib=require(path.join(ASSETS,rel[5]));window.GhazalLibrary=lib;
  const dict=require(path.join(ASSETS,rel[6]));window.GhazalDictionary=dict;
  const deep=require(path.join(ASSETS,rel[7]));window.GhazalDeepLibrary=deep;
  const spec=require(path.join(ASSETS,rel[8]));window.GhazalSpecialization=spec;
  const advanced=require(path.join(ASSETS,rel[9]));window.GhazalAdvancedContent=advanced;
  const exercises=require(path.join(ASSETS,rel[10]));window.GhazalExerciseEngine=exercises;
  const content=require(path.join(ASSETS,rel[11]));window.GhazalContentSystem=content;
  const platform=require(path.join(ASSETS,rel[12]));window.GhazalPlatformCore=platform;
  const learning=require(path.join(ASSETS,rel[13]));window.GhazalLearningEngine=learning;
  const classroom=require(path.join(ASSETS,rel[14]));window.GhazalClassroomCore=classroom;
  const product=require(path.join(ASSETS,"release12-product-core.js"));window.GhazalProductCore=product;
  const security=require(path.join(ASSETS,"release12-security-core.js"));window.GhazalSecurityCore=security;
  const qa=require(path.join(ASSETS,"release13-qa-core.js"));window.GhazalQACore=qa;
  delete global.window;
  return{data,lib,dict,deep,spec,advanced,exercises,content,platform,learning,classroom,product,security,qa};
}

function rng(seed=0x5a17c0de){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/0x100000000;};}
function pick(arr,r){return arr[Math.floor(r()*arr.length)];}

(async()=>{
  const all=loadAll(),{data,exercises,content,dict,platform,learning,classroom,product,security,qa}=all;

  const contentAudit=qa.contentAudit();
  assertCheck("content-full-schema",contentAudit.pass,contentAudit);
  assertCheck("content-level-coverage",qa.LEVELS.every(l=>contentAudit.levelCounts[l]>=10),contentAudit.levelCounts);
  assertCheck("exercise-volume",contentAudit.exercises>=100,{count:contentAudit.exercises});

  const lessonIds=new Set(data.lessons.map(x=>x.id));
  assertCheck("lesson-id-unique",lessonIds.size===data.lessons.length,{lessons:data.lessons.length});
  const exIds=new Set(exercises.exercises.map(x=>x.id));
  assertCheck("exercise-id-unique",exIds.size===exercises.exercises.length,{exercises:exercises.exercises.length});

  const queryPool=["Wohnung","Behörde","Arbeit","Versicherung","Universität","Seminar","Prüfung","Miete","Arzt","Bewerbung","Deutsch","Termin"];
  const searchStart=performance.now();
  let searchHits=0;
  for(let i=0;i<1200;i++){const q=queryPool[i%queryPool.length];const res=content.search(q,{});if(res&&res.length)searchHits++;}
  const searchMs=Math.round(performance.now()-searchStart);
  report.metrics.search1200Ms=searchMs;
  assertCheck("search-stress",searchHits>=1000&&searchMs<30000,{searchHits,searchMs});

  const dictStart=performance.now();let dictHits=0;
  for(let i=0;i<300;i++){const q=["Haus","gehen","Arbeit","Zeit","gut","lernen"][i%6];let r=[];if(dict&&typeof dict.search==="function")r=dict.search(q,"",30)||[];else r=(dict.all||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));if(r.length)dictHits++;}
  const dictMs=Math.round(performance.now()-dictStart);report.metrics.dictionary300Ms=dictMs;
  assertCheck("dictionary-stress",dictHits>0&&dictMs<10000,{dictHits,dictMs});

  const random=rng();
  let learner=learning.initialState("qa-fuzz"),attempts=0;
  const learnStart=performance.now();
  for(let i=0;i<1600;i++){
    const ex=pick(exercises.exercises,random),score=Math.floor(random()*101),confidence=Math.floor(random()*101);
    learner=learning.recordAttempt(learner,ex,score,{confidence,answer:score>70?ex.answer:"qa-wrong",transfer:random()>.65});
    attempts++;
  }
  for(const item of Object.values(learner.items)){
    if(!Number.isFinite(item.mastery)||item.mastery<0||item.mastery>100)throw new Error("learner mastery bounds");
    if(!Number.isFinite(item.confidence)||item.confidence<0||item.confidence>100)throw new Error("learner confidence bounds");
    if(item.dueAt&&!Number.isFinite(new Date(item.dueAt).getTime()))throw new Error("learner dueAt");
  }
  for(const level of qa.LEVELS)for(const budget of [20,25,30,45,60]){
    const p=learning.buildDailyPlan(learner,budget,level).plan;
    if(!p.items.length||p.estimatedMinutes>budget)throw new Error("daily plan "+level+" "+budget);
  }
  const learnMs=Math.round(performance.now()-learnStart);report.metrics.learning1600Ms=learnMs;
  assertCheck("learning-fuzz",attempts===1600&&learner.history.length<=1500&&learnMs<15000,{attempts,history:learner.history.length,learnMs});

  const classroomStart=performance.now();
  for(let n=0;n<40;n++){
    let s=platform.initialState();
    const tid="t"+n,sid="s"+n,cid="c"+n,aid="a"+n;
    s=platform.createProfile(s,{id:tid,displayName:"Teacher "+n,role:"teacher"});
    s=platform.createProfile(s,{id:sid,displayName:"Student "+n,role:"student"});
    s=platform.createClass(s,{id:cid,teacherId:tid,name:"Class "+n,code:("GHZ"+String(n).padStart(5,"0")).slice(0,8)});
    s=platform.joinClass(s,{studentId:sid,code:("GHZ"+String(n).padStart(5,"0")).slice(0,8)});
    s=classroom.normalizeState(s);
    const lesson=data.lessons[n%data.lessons.length],ex=exercises.exercises[n%exercises.exercises.length];
    s=classroom.createAssignment(s,{id:aid,teacherId:tid,classId:cid,title:"QA "+n,items:[{id:"l",kind:"lesson",refId:lesson.id},{id:"e",kind:"exercise",refId:ex.id},{id:"w",kind:"writing",prompt:"Schreibe."},{id:"sp",kind:"speaking",prompt:"Sprich."}]});
    s=classroom.upsertSubmission(s,{studentId:sid,assignmentId:aid,itemId:"l",completed:true,score:100});
    s=classroom.upsertSubmission(s,{studentId:sid,assignmentId:aid,itemId:"e",completed:true,score:88,text:String(ex.answer||"")});
    s=classroom.upsertSubmission(s,{studentId:sid,assignmentId:aid,itemId:"w",completed:true,text:"Ich lerne Deutsch."});
    s=classroom.upsertSubmission(s,{studentId:sid,assignmentId:aid,itemId:"sp",completed:true,transcript:"Guten Tag",score:80});
    s=classroom.submitAssignment(s,{studentId:sid,assignmentId:aid});
    const sub=s.enhancedSubmissions[0];
    s=classroom.gradeSubmission(s,{teacherId:tid,submissionId:sub.id,rubric:{grammar:80,vocabulary:85,task:90},comment:"QA"});
    const rep=classroom.classReport(s,cid);
    if(rep.completionRate!==100||rep.averageGrade==null)throw new Error("classroom flow "+n);
  }
  const classroomMs=Math.round(performance.now()-classroomStart);report.metrics.classroom40Ms=classroomMs;
  assertCheck("classroom-stress",classroomMs<15000,{flows:40,classroomMs});

  const storage=new FakeStorage({
    ghazal_deutsch_state_v1:JSON.stringify({profile:{name:"QA",level:"B2"},progress:{completedLessons:["x"],xp:400,streak:7}}),
    ghazal_platform_v1:JSON.stringify({profiles:[]}),
    ghazal_product_v12:JSON.stringify(product.defaults()),
    ghazal_qa_v1:JSON.stringify(qa.initialState())
  });
  const backupStart=performance.now();
  for(let i=0;i<80;i++){
    storage.setItem("ghazal_fuzz_"+i,JSON.stringify({i,text:"x".repeat((i%20)+1),n:Math.floor(random()*1e6)}));
    const p=await product.buildBackup(storage,{round:i}),v=await product.verifyBackup(p);
    if(!v.valid)throw new Error("backup verify "+i);
    if(i%10===0){const bad=JSON.parse(JSON.stringify(p));bad.data.ghazal_deutsch_state_v1+="x";if((await product.verifyBackup(bad)).valid)throw new Error("tamper accepted "+i);}
  }
  const backupMs=Math.round(performance.now()-backupStart);report.metrics.backup80Ms=backupMs;
  assertCheck("backup-tamper-stress",backupMs<20000,{rounds:80,backupMs});

  const validLesson={id:"qa.pack.001",level:"A1",title:"QA pack",goal:"QA",words:[["Haus","خانه"],["gehen","رفتن"],["gut","خوب"]],dialogue:[["A","Hallo"],["B","Guten Tag"]],quiz:{q:"Q",options:["A","B"],answer:0}};
  const basePack={format:"ghazal-content-pack-v2",id:"qa-pack",version:"1.0.0",minAppVersion:"1.0.0",title:"QA",lessons:[validLesson]};
  assertCheck("pack-valid",product.validatePack(basePack,"13.0.0").valid,{});
  const invalids=[
    {...basePack,javascript:"alert(1)"},
    {...basePack,format:"bad"},
    {...basePack,id:"!"},
    {...basePack,minAppVersion:"99.0.0"},
    {...basePack,lessons:[{...validLesson,level:"Z9"}]}
  ];
  assertCheck("pack-invalid-rejection",invalids.every(p=>!product.validatePack(p,"13.0.0").valid),{cases:invalids.length});

  const badSecret=new FakeStorage({ghazal_bad:JSON.stringify({apiKey:"not-allowed-in-state"})});
  assertCheck("local-secret-scan",security.localSecretAudit(storage).pass&&!security.localSecretAudit(badSecret).pass,{});

  const storageHealth=qa.storageAudit(storage);
  assertCheck("storage-integrity",storageHealth.pass,storageHealth);

  const manifest=fs.readFileSync(path.join(ROOT,"app/src/main/AndroidManifest.xml"),"utf8");
  assertCheck("offline-no-internet-permission",!manifest.includes("android.permission.INTERNET"),{});
  assertCheck("offline-cleartext-blocked",manifest.includes('android:usesCleartextTraffic="false"'),{});
  assertCheck("backup-disabled",manifest.includes('android:allowBackup="false"'),{});

  const runtimeFiles=[];
  for(const p of fs.readdirSync(ASSETS)){if(/\.(js|html)$/.test(p))runtimeFiles.push(p);}
  const networkCalls=[],dangerousEval=[],externalHtml=[];
  for(const p of runtimeFiles){
    const t=fs.readFileSync(path.join(ASSETS,p),"utf8");
    if(/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\s*\(|navigator\.sendBeacon\s*\(/.test(t))networkCalls.push(p);
    if(/\beval\s*\(|new\s+Function\s*\(/.test(t))dangerousEval.push(p);
    if(/<(?:script|img|audio|video|source|link)[^>]+(?:src|href)\s*=\s*["']https?:\/\//i.test(t))externalHtml.push(p);
  }
  assertCheck("runtime-no-network-api",networkCalls.length===0,{files:networkCalls});
  assertCheck("runtime-no-external-resource-tags",externalHtml.length===0,{files:externalHtml});
  assertCheck("runtime-no-dynamic-eval",dangerousEval.length===0,{files:dangerousEval});

  const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,"package.json"),"utf8"));
  const gradle=fs.readFileSync(path.join(ROOT,"app/build.gradle"),"utf8");
  const main=fs.readFileSync(path.join(ROOT,"app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java"),"utf8");
  const bridge=fs.readFileSync(path.join(ROOT,"app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java"),"utf8");
  const index=fs.readFileSync(path.join(ASSETS,"index.html"),"utf8");
  assertCheck("version-consistency",pkg.version==="13.0.0"&&gradle.includes('versionName "13.0.0"')&&main.includes('return "13.0.0"')&&bridge.includes('return activity == null ? "13.0.0"'),{pkg:pkg.version});
  for(const asset of ["release13-qa-core.js","release13-quality-runtime.js","release13-stage7-ui.js","release13-stage7.css"])if(!index.includes(asset))throw new Error("missing asset "+asset);
  add("stage7-assets-wired",true,{});

  const qaState=qa.initialState();
  const auto=await qa.runAutomated(qaState,storage,{device:{version:"13.0.0",assetIntegrity:true,cryptoSelfTest:true,debuggable:false,cleartextDisabled:true}});
  assertCheck("qa-core-self-run",auto.run.pass,{failed:auto.run.failed});

  report.completedAt=new Date().toISOString();
  report.durationMs=Math.round(performance.now());
  report.pass=report.failures.length===0;
  fs.mkdirSync(path.join(ROOT,"qa"),{recursive:true});
  fs.writeFileSync(path.join(ROOT,"qa/stage7-heavy-qa-report.json"),JSON.stringify(report,null,2));
  console.log(JSON.stringify({pass:report.pass,checks:report.checks.length,metrics:report.metrics,failures:report.failures},null,2));
  if(!report.pass)process.exit(1);
})().catch(err=>{
  report.completedAt=new Date().toISOString();report.pass=false;report.failures.push("uncaught");report.error=String(err&&err.stack||err);
  fs.mkdirSync(path.join(ROOT,"qa"),{recursive:true});fs.writeFileSync(path.join(ROOT,"qa/stage7-heavy-qa-report.json"),JSON.stringify(report,null,2));
  console.error(report.error);process.exit(1);
});
