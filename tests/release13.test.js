const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
global.crypto=webcrypto;

class FakeStorage{
  constructor(init={}){this.map=new Map(Object.entries(init));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}

function loadAll(){
  const root=path.join(__dirname,'../app/src/main/assets');
  const files=['course-data.js','release4-content.js','release5-content.js','release7-content.js','release10-capstone-content.js','release7-library.js','release8-dictionary.js','release8-deep-library.js','release9-specialization.js','release10-advanced-content.js','release10-exercise-engine.js','release10-content-system.js','platform-core.js','release11-learning-engine.js','release11-classroom-core.js','release12-product-core.js','release12-security-core.js','release13-qa-core.js'];
  files.forEach(f=>{try{delete require.cache[require.resolve(path.join(root,f))];}catch(_){}});
  const data=require(path.join(root,files[0]));
  global.window={GhazalData:data};
  require(path.join(root,files[1]));require(path.join(root,files[2]));require(path.join(root,files[3]));require(path.join(root,files[4]));
  const lib=require(path.join(root,files[5]));window.GhazalLibrary=lib;
  const dict=require(path.join(root,files[6]));window.GhazalDictionary=dict;
  const deep=require(path.join(root,files[7]));window.GhazalDeepLibrary=deep;
  const spec=require(path.join(root,files[8]));window.GhazalSpecialization=spec;
  const advanced=require(path.join(root,files[9]));window.GhazalAdvancedContent=advanced;
  const exercises=require(path.join(root,files[10]));window.GhazalExerciseEngine=exercises;
  const content=require(path.join(root,files[11]));window.GhazalContentSystem=content;
  const platform=require(path.join(root,files[12]));window.GhazalPlatformCore=platform;
  const learning=require(path.join(root,files[13]));window.GhazalLearningEngine=learning;
  const classroom=require(path.join(root,files[14]));window.GhazalClassroomCore=classroom;
  const product=require(path.join(root,files[15]));window.GhazalProductCore=product;
  const security=require(path.join(root,files[16]));window.GhazalSecurityCore=security;
  const qa=require(path.join(root,files[17]));
  delete global.window;
  return{data,dict,exercises,content,platform,learning,classroom,product,security,qa};
}

test('Stage 7 defines a real manual device matrix with critical release cases',()=>{
  const {qa}=loadAll();
  assert.ok(Number(qa.VERSION.split('.')[0])>=13);
  assert.ok(qa.MANUAL_CASES.length>=25);
  const ids=new Set(qa.MANUAL_CASES.map(x=>x.id));
  assert.equal(ids.size,qa.MANUAL_CASES.length);
  for(const id of ['install-clean','app-lock','airplane-launch','offline-a1','five-skill','backup-roundtrip','classroom','back-navigation'])assert.ok(ids.has(id),id);
  assert.ok(qa.MANUAL_CASES.filter(x=>x.critical).length>=12);
});

test('Stage 7 manual QA never auto-passes pending critical device work',()=>{
  const {qa}=loadAll();
  let s=qa.initialState();
  let sum=qa.manualSummary(s);
  assert.equal(sum.pass,false);
  assert.ok(sum.criticalPending.length>0);
  for(const c of qa.MANUAL_CASES.filter(x=>x.critical))s=qa.setManual(s,c.id,'pass','device verified',{model:'QA Phone'});
  sum=qa.manualSummary(s);
  assert.equal(sum.criticalPending.length,0);
  assert.equal(sum.pass,true);
  const noncritical=qa.MANUAL_CASES.find(x=>!x.critical);
  s=qa.setManual(s,noncritical.id,'fail','observed failure',{model:'QA Phone'});
  assert.equal(qa.manualSummary(s).pass,false);
});

test('Stage 7 runtime error ledger is bounded and release evidence is serializable',()=>{
  const {qa}=loadAll();
  let s=qa.initialState();
  for(let i=0;i<140;i++)s=qa.recordRuntimeError(s,{type:'test',message:'error '+i,stack:'x'.repeat(100)});
  assert.equal(s.runtimeErrors.length,100);
  const evidence=qa.evidence(s,{version:qa.VERSION,model:'QA',productionSigned:false});
  assert.equal(evidence.format,'ghazal-stage7-qa-evidence-v1');
  assert.equal(evidence.version,qa.VERSION);
  assert.ok(JSON.stringify(evidence).length>100);
});

test('Stage 7 automated core audits content storage product and security without modifying user data',async()=>{
  const {qa}=loadAll();
  const storage=new FakeStorage({
    ghazal_deutsch_state_v1:JSON.stringify({profile:{name:'QA',level:'A1'}}),
    ghazal_platform_v1:JSON.stringify({profiles:[]}),
    ghazal_product_v12:JSON.stringify({})
  });
  const before=[...storage.map.entries()];
  const out=await qa.runAutomated(qa.initialState(),storage,{device:{version:qa.VERSION,assetIntegrity:true,cryptoSelfTest:true,debuggable:false,cleartextDisabled:true}});
  assert.equal(out.run.pass,true,JSON.stringify(out.run.failed));
  assert.ok(out.run.checks.length>=12);
  assert.deepEqual([...storage.map.entries()],before);
});

test('Stage 7 release gate requires automated QA, manual device matrix and Stage 8 external gates',()=>{
  const {qa}=loadAll();
  let s=qa.initialState();
  const auto={pass:true,checks:[],failed:[],criticalFailed:[]};
  for(const c of qa.MANUAL_CASES)s=qa.setManual(s,c.id,'pass','verified',{model:'QA'});
  let gate=qa.releaseReadiness(s,auto,{productionSigning:false,repositoryPrivate:false});
  assert.equal(gate.ready,false);
  assert.ok(gate.blockers.includes('production_signing'));
  assert.ok(gate.blockers.includes('repository_privacy'));
  gate=qa.releaseReadiness(s,auto,{productionSigning:true,repositoryPrivate:true});
  assert.equal(gate.ready,true);
});

test('Stage 7 native bridge exposes device diagnostics and QA evidence export',()=>{
  const root=path.join(__dirname,'..');
  const main=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'),'utf8');
  const bridge=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java'),'utf8');
  for(const token of ['getDeviceReport','exportQaEvidence','REQUEST_QA_EXPORT','GHAZAL-stage7-QA-evidence.json'])assert.ok(main.includes(token),token);
  for(const token of ['getDeviceReport','exportQaEvidence'])assert.ok(bridge.includes(token),token);
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  assert.ok(main.includes('return "'+pkg.version+'"'));
  assert.ok(bridge.includes('return activity == null ? "'+pkg.version+'"'));
});

test('Stage 7 UI assets are wired after the educational product and include QA Center',()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  for(const asset of ['release13-qa-core.js','release13-quality-runtime.js','release13-stage7-ui.js','release13-stage7.css'])assert.ok(index.includes(asset),asset);
  assert.ok(index.indexOf('release12-security-core.js')<index.indexOf('release13-qa-core.js'));
  assert.ok(index.indexOf('release13-qa-core.js')<index.indexOf('release13-stage7-ui.js'));
  const ui=fs.readFileSync(path.join(root,'app/src/main/assets/release13-stage7-ui.js'),'utf8');
  for(const token of ['Full Automated QA','Device Matrix','Runtime Errors','Stage 7 Gate','Export Evidence'])assert.ok(ui.includes(token),token);
});

test('Stage 7 version stays aligned with the current forward release',()=>{
  const root=path.join(__dirname,'..');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  const main=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'),'utf8');
  const bridge=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java'),'utf8');
  const qa=fs.readFileSync(path.join(root,'app/src/main/assets/release13-qa-core.js'),'utf8');
  const major=Number(pkg.version.split('.')[0]);
  assert.ok(major>=13);
  assert.ok(gradle.includes('versionName "'+pkg.version+'"'));
  assert.ok(main.includes('return "'+pkg.version+'"'));
  assert.ok(bridge.includes('return activity == null ? "'+pkg.version+'"'));
  assert.ok(qa.includes('const VERSION="'+pkg.version+'"'));
});

test('Stage 7 CI runs regression stress lint and hardened APK verification',()=>{
  const root=path.join(__dirname,'..');
  const wf=fs.readFileSync(path.join(root,'.github/workflows/android.yml'),'utf8');
  for(const token of ['Unit and regression test suite','Stage 7 deterministic stress and fuzz QA','Android lint','assembleHardenedQa','zipalign -c','aapt dump permissions','release13-qa-core.js','stage7-heavy-qa-report.json'])assert.ok(wf.includes(token),token);
});

test('production workflow cannot bypass Stage 7 heavy QA before signing',()=>{
  const root=path.join(__dirname,'..');
  const wf=fs.readFileSync(path.join(root,'.github/workflows/release-android.yml'),'utf8');
  assert.ok(wf.includes('npm run qa:heavy'));
  assert.ok(wf.indexOf('npm run qa:heavy')<wf.indexOf('assembleRelease'));
  for(const token of ['GHZ_KEYSTORE_B64','GHZ_CERT_SHA256','apksigner verify'])assert.ok(wf.includes(token),token);
});
