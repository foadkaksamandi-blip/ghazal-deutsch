#!/usr/bin/env node
"use strict";

const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const ASSETS=path.join(ROOT,"app/src/main/assets");
const LEVELS=["A1","A2","B1","B2","C1","C2"];
const checks=[],gaps=[];
function add(id,pass,detail={},critical=true){checks.push({id,pass:!!pass,critical,detail});if(critical&&!pass)throw new Error(id+" failed "+JSON.stringify(detail));}
function countBy(arr,key){const out={};for(const x of arr||[]){const k=x&&x[key];if(k!=null)out[k]=(out[k]||0)+1;}return out;}
function load(){
  const data=require(path.join(ASSETS,"course-data.js"));
  global.window={GhazalData:data};
  for(const f of ["release4-content.js","release5-content.js","release7-content.js","release10-capstone-content.js"])require(path.join(ASSETS,f));
  const lib=require(path.join(ASSETS,"release7-library.js"));window.GhazalLibrary=lib;
  const dict=require(path.join(ASSETS,"release8-dictionary.js"));window.GhazalDictionary=dict;
  const deep=require(path.join(ASSETS,"release8-deep-library.js"));window.GhazalDeepLibrary=deep;
  const spec=require(path.join(ASSETS,"release9-specialization.js"));window.GhazalSpecialization=spec;
  const adv=require(path.join(ASSETS,"release10-advanced-content.js"));window.GhazalAdvancedContent=adv;
  const stage3=require(path.join(ASSETS,"stage3-content-pack.js"));window.GhazalStage3Content=stage3;
  const stage3Apply=stage3.apply({data,lib,dict,deep});
  const ex=require(path.join(ASSETS,"release10-exercise-engine.js"));window.GhazalExerciseEngine=ex;
  const content=require(path.join(ASSETS,"release10-content-system.js"));window.GhazalContentSystem=content;
  const coach=require(path.join(ASSETS,"release10-offline-coach.js"));window.GhazalOfflineCoach=coach;
  const learning=require(path.join(ASSETS,"release11-learning-engine.js"));window.GhazalLearningEngine=learning;
  const stage4=require(path.join(ASSETS,"stage4-tutor-evaluation.js"));window.GhazalStage4Tutor=stage4;
  const stage5=require(path.join(ASSETS,"stage5-exams-pathways.js"));window.GhazalStage5=stage5;
  const classroom=require(path.join(ASSETS,"release11-classroom-core.js"));window.GhazalClassroomCore=classroom;
  const product=require(path.join(ASSETS,"release12-product-core.js"));window.GhazalProductCore=product;
  const security=require(path.join(ASSETS,"release12-security-core.js"));window.GhazalSecurityCore=security;
  delete global.window;
  return{data,lib,dict,deep,spec,adv,stage3,stage3Apply,ex,content,coach,learning,stage4,stage5,classroom,product,security};
}
(async()=>{
  const x=load();
  const byLesson=countBy(x.data.lessons,"level"), byExercise=countBy(x.ex.exercises,"level"), byGrammar=countBy(x.lib.grammar,"level");
  const byWriting=countBy(x.lib.writing,"level"),bySpeaking=countBy(x.lib.speaking,"level"),byRedemittel=countBy(x.lib.redemittel,"level");
  const byReadLib=countBy(x.lib.reading,"level"),byListenLib=countBy(x.lib.listening,"level"),byReadDeep=countBy(x.deep.reading,"level"),byListenDeep=countBy(x.deep.listening,"level");
  const byDict=countBy(x.dict.all,"level"),byPron=countBy(x.adv.pronunciation,"level"),byExamLevel=countBy(x.deep.exams,"level"),byExamBrand=countBy(x.deep.exams,"exam");

  add("stage3-pack-audit",x.stage3&&x.stage3.audit().pass,{audit:x.stage3&&x.stage3.audit(),applied:x.stage3Apply});
  add("lessons-commercial-scale",x.data.lessons.length>=240,{count:x.data.lessons.length});
  add("exercises-commercial-scale",x.ex.exercises.length>=5000,{count:x.ex.exercises.length});
  add("all-cefr-lessons",LEVELS.every(l=>(byLesson[l]||0)>=40),byLesson);
  add("all-cefr-exercises",LEVELS.every(l=>(byExercise[l]||0)>=650),byExercise);
  add("grammar-all-levels",LEVELS.every(l=>(byGrammar[l]||0)>=14),byGrammar);
  add("redemittel-all-levels",LEVELS.every(l=>(byRedemittel[l]||0)>=14),byRedemittel);
  add("writing-all-levels",LEVELS.every(l=>(byWriting[l]||0)>=4),byWriting);
  add("speaking-all-levels",LEVELS.every(l=>(bySpeaking[l]||0)>=4),bySpeaking);
  add("reading-all-levels",LEVELS.every(l=>((byReadLib[l]||0)+(byReadDeep[l]||0))>=4),{library:byReadLib,deep:byReadDeep});
  add("listening-all-levels",LEVELS.every(l=>((byListenLib[l]||0)+(byListenDeep[l]||0))>=4),{library:byListenLib,deep:byListenDeep});
  add("dictionary-all-levels",LEVELS.every(l=>(byDict[l]||0)>=100),byDict);
  add("pronunciation-all-levels",LEVELS.every(l=>(byPron[l]||0)>=4),byPron);
  add("contrast-engine",Array.isArray(x.deep.contrasts)&&x.deep.contrasts.length>=30,{count:x.deep.contrasts.length});
  add("exam-brands",["Goethe","telc","TestDaF","ÖSD"].every(k=>(byExamBrand[k]||0)>=6),byExamBrand);
  add("exam-levels",LEVELS.every(l=>(byExamLevel[l]||0)>=2),byExamLevel);
  add("specialization-tracks",["migration","career","university","exams"].every(k=>x.spec.tracks&&x.spec.tracks[k]&&Array.isArray(x.spec.tracks[k].modules)&&x.spec.tracks[k].modules.length>=16),Object.fromEntries(Object.entries(x.spec.tracks||{}).map(([k,v])=>[k,(v.modules||[]).length])));
  add("collocations",Array.isArray(x.spec.collocations)&&x.spec.collocations.length>=40,{count:x.spec.collocations.length});
  add("advanced-packs",x.adv.packs&&Object.keys(x.adv.packs).length>=6,{packs:Object.keys(x.adv.packs||{})});
  add("dependency-graph",x.adv.dependencies&&LEVELS.every(l=>x.adv.dependencies[l]),x.adv.dependencies);
  add("cross-skill-graph",x.adv.skillGraph&&Object.keys(x.adv.skillGraph).length>=8,{nodes:Object.keys(x.adv.skillGraph||{}).length});
  add("content-index",x.content.index&&x.content.index.length>=2500,{count:x.content.index&&x.content.index.length});
  const queries=["Wohnung","Behörde","Arbeit","Universität","TestDaF","Versicherung","Bewerbung","Seminar"];
  add("global-search",queries.filter(q=>(x.content.search(q,{})||[]).length>0).length===queries.length,{queries:queries.map(q=>[q,(x.content.search(q,{})||[]).length])});
  add("resume-continuity",typeof x.content.makeResume==="function"&&typeof x.product.setResume==="function"&&typeof x.product.clearResume==="function",{});
  add("state-migration",typeof x.content.migrateState==="function"&&typeof x.product.normalize==="function",{});
  add("weekly-monthly-reporting",typeof x.content.weeklyReport==="function"&&typeof x.content.monthlyReport==="function"&&typeof x.content.evidenceReport==="function",{});
  add("adaptive-learning",["recordAttempt","buildDailyPlan","masteryGate","errorBank","rescueFor","unknownChallenge","placementSession"].every(k=>typeof x.learning[k]==="function"),{});
  const s4f=["buildBaselineAssessment","scoreBaseline","evaluateWriting","evaluateSpeaking","evaluatePronunciation","applyAssessment","errorProfile","buildAdaptivePlan","tutorAdvice"];
  add("stage4-private-tutor-engine",s4f.every(k=>typeof x.stage4[k]==="function"),{functions:s4f});
  const s4session=x.stage4.buildBaselineAssessment(17),s4answers=s4session.items.map(i=>({answer:i.answer})),s4base=x.stage4.scoreBaseline(s4session,s4answers);
  const s4writing=x.stage4.evaluateWriting("Sehr geehrte Damen und Herren. Ich möchte mich nach dem Bearbeitungsstand erkundigen, weil ich die Unterlagen bereits eingereicht habe. Bitte geben Sie mir Bescheid. Mit freundlichen Grüßen",s4base.suggestedLevel,"formelle Anfrage");
  const s4speaking=x.stage4.evaluateSpeaking("Ich möchte kurz erklären, warum diese Lösung sinnvoll ist. Erstens spart sie Zeit. Außerdem reduziert sie Fehler. Deshalb würde ich diese Variante empfehlen.",s4base.suggestedLevel,"professionelle Erklärung");
  const s4state=x.stage4.applyAssessment(x.stage4.defaults("audit",s4base.suggestedLevel),x.learning.initialState("audit"),s4base,s4writing,s4speaking);
  const s4plan=x.stage4.buildAdaptivePlan(s4state.learnerProfile,x.learning.initialState("audit"),25);
  add("stage4-private-tutor-functional",s4session.items.length===24&&s4base.completed===24&&s4writing.total>0&&s4speaking.total>0&&x.stage4.completion(s4state.learnerProfile).done===6&&s4plan.items.length>0,{baseline:s4base.suggestedLevel,writing:s4writing.total,speaking:s4speaking.total,profile:s4state.learnerProfile,planItems:s4plan.items.length});
  const s5audit=x.stage5.audit();
  add("stage5-exam-pathway-audit",s5audit.pass,s5audit);
  add("stage5-four-exams",["goethe","telc","testdaf","osd"].every(b=>x.stage5.examTasks(b).length>=4),Object.fromEntries(["goethe","telc","testdaf","osd"].map(b=>[b,x.stage5.examTasks(b).length])));
  add("stage5-four-purpose-pathways",["migration","university","career","alltag"].every(id=>{const p=x.stage5.pathways().find(v=>v.id===id);return p&&p.modules.length>0;}),Object.fromEntries(x.stage5.pathways().map(p=>[p.id,p.modules.length])));
  const s5Level=x.stage5.availableLevels("testdaf")[0]||"B2";
  let s5state=x.stage5.startMock(x.stage5.defaults("audit",s5Level),"testdaf",s5Level,"quick",31,1700000000000);
  for(const item of s5state.activeSession.items){
    let ans="";
    if(item.source==="core-objective")ans=Array.isArray(item.answer)?item.answer[0]:item.answer;
    else if(item.skill==="writing")ans="Sehr geehrte Damen und Herren. Ich möchte die Situation erklären. Außerdem nenne ich einen Grund und schlage eine Lösung vor. Vielen Dank für Ihre Rückmeldung. Mit freundlichen Grüßen";
    else if(item.skill==="speaking")ans="Ich erkläre zuerst die Situation. Außerdem nenne ich einen wichtigen Grund. Deshalb schlage ich eine konkrete Lösung vor.";
    s5state=x.stage5.saveMockAnswer(s5state,item.id,ans);
  }
  s5state=x.stage5.finishMock(s5state,1700000060000);
  const s5result=s5state.history.at(-1);
  add("stage5-timed-mock-functional",!!(s5result&&s5result.result&&s5result.result.score>=0&&s5result.result.score<=100&&s5result.result.official===false),s5result||{});
  const s5ready=x.stage5.testdafReadiness(s5state.history,s4state.learnerProfile);
  add("stage5-transparent-readiness",s5ready.score>=0&&s5ready.score<=100&&/TDN/.test(s5ready.note),s5ready);
  add("classroom-product",["createAssignment","upsertSubmission","submitAssignment","gradeSubmission","classReport","teacherDashboard","studentDashboard","serverContracts"].every(k=>typeof x.classroom[k]==="function"),{});
  const contracts=x.classroom.serverContracts();
  add("classroom-server-contracts",!!(contracts&&contracts.offlineQueue&&contracts.idempotencyRequired),contracts);
  add("backup-integrity",typeof x.product.buildBackup==="function"&&typeof x.product.verifyBackup==="function"&&typeof x.product.restoreBackup==="function",{});
  add("content-pack-validation",typeof x.product.validatePack==="function"&&typeof x.product.installPack==="function"&&typeof x.product.contentPackStatus==="function",{});
  add("server-ready-contracts",!!(x.product.API_CONTRACT_V2&&Object.keys(x.product.API_CONTRACT_V2).length>=6),{contracts:Object.keys(x.product.API_CONTRACT_V2||{})});
  add("offline-audit",typeof x.product.offlineAudit==="function",{});
  add("security-core",typeof x.security.evaluate==="function"&&typeof x.security.localSecretAudit==="function",{});

  const audioDir=path.join(ASSETS,"human_audio");
  const humanFiles=fs.existsSync(audioDir)?fs.readdirSync(audioDir).filter(n=>/\.(ogg|mp3|wav|m4a)$/i.test(n)):[];
  add("licensed-human-audio-present",humanFiles.length>=6,{count:humanFiles.length,files:humanFiles},false);
  if(humanFiles.length<30)gaps.push({id:"human-native-audio-scale",status:"PARTIAL",detail:"Only "+humanFiles.length+" bundled human-native files are present; this is not yet a commercial multi-speaker listening library."});

  const synthetic=(x.adv.audio||[]).filter(a=>String(a.source||"").includes("synthetic")).length;
  if(synthetic>0)gaps.push({id:"listening-humanization",status:"PARTIAL",detail:synthetic+" advanced audio drills are metadata/scripts intended for offline TTS rather than bundled human recordings."});
  gaps.push({id:"pronunciation-acoustic-scoring",status:"PARTIAL",detail:"Pronunciation content exists, but the app does not contain a phoneme/stress/rhythm/intonation acoustic scoring engine; Android speech recognition is approximate."});
  gaps.push({id:"writing-expert-feedback",status:"PARTIAL",detail:"Offline writing practice and feedback logic exist, but no full expert grammar/cohesion/register model is bundled."});
  gaps.push({id:"official-full-exam-mocks",status:"PARTIAL",detail:"Stage 5 now provides timed internal mocks, scoring, resume, strategy and readiness analysis for Goethe/telc/TestDaF/ÖSD; official licensed full-length exam papers are intentionally not bundled or claimed."});
  gaps.push({id:"online-ai-backend",status:"DEFERRED",detail:"Controlled online AI teacher, accounts, sync, subscriptions and server analytics remain intentionally unavailable until the backend phase."});
  gaps.push({id:"real-device-acceptance",status:"PENDING",detail:"Automated and emulator checks cannot replace the Stage 7 physical-device matrix for microphone, biometric/device credential, reboot reminder and file picker flows."});
  gaps.push({id:"production-signing",status:"PENDING",detail:"Permanent release signing key and certificate are external security gates; the repository must not contain them."});

  const report={
    format:"ghazal-full-product-audit-v1",
    version:"14.0.2",
    generatedAt:new Date().toISOString(),
    pass:checks.filter(x=>x.critical&&!x.pass).length===0,
    checks,
    metrics:{
      lessons:x.data.lessons.length,
      exercises:x.ex.exercises.length,
      dictionary:x.dict.all.length,
      grammar:x.lib.grammar.length,
      contrasts:x.deep.contrasts.length,
      examTasks:x.deep.exams.length,
      stage5ExamTasks:x.stage5.examTasks().length,
      stage5Pathways:x.stage5.pathways().length,
      searchIndex:x.content.index.length,
      humanAudioFiles:humanFiles.length
    },
    knownGaps:gaps
  };
  fs.mkdirSync(path.join(ROOT,"qa"),{recursive:true});
  fs.writeFileSync(path.join(ROOT,"qa/full-product-audit.json"),JSON.stringify(report,null,2));
  console.log(JSON.stringify({pass:report.pass,criticalChecks:checks.filter(x=>x.critical).length,metrics:report.metrics,knownGaps:gaps},null,2));
  if(!report.pass)process.exit(1);
})().catch(err=>{console.error(err.stack||err);process.exit(1);});
