const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app/src/main/assets');

class Storage{
  constructor(){this.m=new Map();}
  getItem(k){return this.m.has(k)?this.m.get(k):null;}
  setItem(k,v){this.m.set(k,String(v));}
  removeItem(k){this.m.delete(k);}
  clear(){this.m.clear();}
}

function fresh(name){
  const p=path.join(ASSETS,name);
  try{delete require.cache[require.resolve(p)];}catch(_){}
  return require(p);
}

function load(){
  const names=[
    'course-data.js','release4-content.js','release5-content.js','release7-content.js','release10-capstone-content.js',
    'release7-library.js','release8-dictionary.js','release8-deep-library.js','release9-specialization.js','release10-advanced-content.js',
    'stage3-content-pack.js','release10-exercise-engine.js','release10-content-system.js','release10-offline-coach.js',
    'release11-learning-engine.js','stage4-tutor-evaluation.js','stage5-exams-pathways.js'
  ];
  names.forEach(n=>{const p=path.join(ASSETS,n);try{delete require.cache[require.resolve(p)];}catch(_){}});
  const data=fresh(names[0]);global.window={GhazalData:data};
  require(path.join(ASSETS,names[1]));require(path.join(ASSETS,names[2]));require(path.join(ASSETS,names[3]));require(path.join(ASSETS,names[4]));
  const lib=fresh(names[5]);window.GhazalLibrary=lib;
  const dict=fresh(names[6]);window.GhazalDictionary=dict;
  const deep=fresh(names[7]);window.GhazalDeepLibrary=deep;
  const spec=fresh(names[8]);window.GhazalSpecialization=spec;
  window.GhazalAdvancedContent=fresh(names[9]);
  const stage3=fresh(names[10]);window.GhazalStage3Content=stage3;stage3.apply({data,lib,dict,deep});
  const ex=fresh(names[11]);window.GhazalExerciseEngine=ex;
  const content=fresh(names[12]);window.GhazalContentSystem=content;
  window.GhazalOfflineCoach=fresh(names[13]);
  const learning=fresh(names[14]);window.GhazalLearningEngine=learning;
  const stage4=fresh(names[15]);window.GhazalStage4Tutor=stage4;
  const stage5=fresh(names[16]);
  delete global.window;
  return{data,lib,dict,deep,spec,ex,learning,stage4,stage5};
}

test('Stage 5 exposes all four exam brands and all four specialized pathways',()=>{
  const {stage5}=load();
  const audit=stage5.audit();
  assert.equal(audit.pass,true,audit.issues.join(', '));
  assert.deepEqual(Object.keys(stage5.EXAMS).sort(),['goethe','osd','telc','testdaf']);
  for(const brand of Object.keys(stage5.EXAMS)){
    assert.ok(stage5.examTasks(brand).length>=4,brand);
    assert.ok(stage5.availableLevels(brand).length>=1,brand);
  }
  const paths=stage5.pathways();
  assert.deepEqual(paths.map(x=>x.id),['migration','university','career','alltag']);
  paths.forEach(p=>assert.ok(p.modules.length>0,p.id));
});

test('Stage 5 builds real timed mocks and scores objective plus productive evidence',()=>{
  const {stage5}=load();
  const brands=['goethe','telc','testdaf','osd'];
  for(let i=0;i<brands.length;i++){
    const b=brands[i],lvl=stage5.availableLevels(b)[0];
    const s=stage5.buildMock(b,lvl,'quick',100+i,1700000000000+i*1000);
    assert.equal(s.brand,b);
    assert.equal(s.level,lvl);
    assert.equal(s.durationSec,15*60);
    assert.ok(s.items.length>=1&&s.items.length<=stage5.MODE.quick.count);
    const hasProductive=stage5.examTasks(b,lvl).some(x=>x.skill==='writing'||x.skill==='speaking');
    if(hasProductive)assert.ok(s.items.some(x=>x.source==='brand-exam-style'),b+' branded productive task');
    assert.ok(s.items.some(x=>x.source==='core-objective'),b+' objective task');
    assert.equal(stage5.remainingSec(s,1700000000000+i*1000),900);
  }

  let s=stage5.buildMock('goethe',stage5.availableLevels('goethe')[0],'quick',77,1700000100000);
  for(const item of s.items){
    let answer='';
    if(item.source==='core-objective')answer=Array.isArray(item.answer)?item.answer[0]:item.answer;
    else if(item.skill==='writing')answer='Sehr geehrte Damen und Herren. Ich schreibe, weil ich eine wichtige Rückfrage habe. Außerdem möchte ich einen passenden Termin vereinbaren. Bitte geben Sie mir eine kurze Rückmeldung. Mit freundlichen Grüßen';
    else if(item.skill==='speaking')answer='Ich möchte meine Meinung erklären. Erstens ist diese Lösung praktisch. Außerdem spart sie Zeit. Deshalb würde ich diese Möglichkeit empfehlen.';
    s=stage5.answerSession(s,item.id,answer);
  }
  const done=stage5.finalizeSession(s,1700000100000+120000);
  assert.equal(done.status,'finished');
  assert.ok(done.result.score>=0&&done.result.score<=100);
  assert.equal(done.result.answered,done.result.total);
  assert.equal(done.result.completion,100);
  assert.ok(Object.keys(done.result.sections).length>=2);
  assert.equal(done.result.official,false);
  assert.match(done.result.note,/رسمی/);
});

test('Stage 5 mock state survives exact resume and finished history is bounded',()=>{
  const {stage5}=load(),storage=new Storage();
  let st=stage5.defaults('device','B2');
  st=stage5.startMock(st,'testdaf','B2','weekly',22,1700000200000);
  const first=st.activeSession.items[0];
  st=stage5.saveMockAnswer(st,first.id,'GHAZAL-STAGE5-DRAFT');
  st=stage5.moveMock(st,Math.min(1,st.activeSession.items.length-1));
  stage5.writeStorage(storage,st);

  const restored=stage5.readStorage(storage,'device','B2');
  assert.ok(restored.activeSession);
  assert.equal(restored.activeSession.answers[first.id].value,'GHAZAL-STAGE5-DRAFT');
  assert.equal(restored.activeSession.mode,'weekly');

  const finished=stage5.finishMock(restored,1700000200000+60000);
  assert.equal(finished.activeSession,null);
  assert.equal(finished.history.length,1);
  assert.equal(finished.history[0].brand,'testdaf');
  assert.ok(finished.history[0].result);
});

test('Stage 5 pathway mastery requires actual writing and speaking evidence',()=>{
  const {stage5,stage4}=load();
  const path=stage5.pathways().find(x=>x.id==='migration');
  const m=path.modules[0];
  let st=stage5.defaults('device',m.level);
  const writing=stage4.evaluateWriting(
    'Sehr geehrte Damen und Herren. Ich möchte mein Anliegen erklären und bitte um eine Rückmeldung. Außerdem habe ich alle notwendigen Unterlagen vorbereitet. Mit freundlichen Grüßen',
    m.level,m.writing
  );
  const speaking=stage4.evaluateSpeaking(
    'Ich erkläre kurz die Situation. Zuerst nenne ich das Problem. Außerdem schlage ich eine Lösung vor. Deshalb bitte ich um eine Rückmeldung.',
    m.level,m.speaking
  );
  st=stage5.markPathway(st,'migration',m.id,'writing',writing.total);
  let row=st.pathwayProgress['migration|'+m.id];
  assert.equal(row.done,false);
  st=stage5.markPathway(st,'migration',m.id,'speaking',speaking.total);
  row=st.pathwayProgress['migration|'+m.id];
  assert.equal(row.done,row.writing>=60&&row.speaking>=60);
  assert.equal(row.speaking,speaking.total,'stored speaking evidence must equal the real Stage 4 evaluator output');
});

test('Stage 5 readiness and scoring are explicitly non-official',()=>{
  const {stage5}=load();
  const history=[
    {brand:'testdaf',result:{score:72,sections:{reading:75,listening:68,writing:70,speaking:74}}},
    {brand:'testdaf',result:{score:78,sections:{reading:80,listening:72,writing:76,speaking:84}}}
  ];
  const r=stage5.testdafReadiness(history,{overall:74});
  assert.ok(r.score>0);
  assert.equal(r.evidence,2);
  assert.match(r.note,/TDN/);
  assert.match(stage5.SCORE_NOTE,/رسمی/);
  assert.match(stage5.RIGHTS_NOTE,/حق‌نشر/);
});

test('Stage 5 assets are wired and legacy fixed-score specialization entry is suppressed',()=>{
  const index=fs.readFileSync(path.join(ASSETS,'index.html'),'utf8');
  const legacy=fs.readFileSync(path.join(ASSETS,'release9-specialization-ui.js'),'utf8');
  assert.ok(index.includes('stage5-exams-pathways.js'));
  assert.ok(index.includes('stage5-exams-pathways-ui.js'));
  assert.ok(index.includes('stage5-exams-pathways.css'));
  assert.ok(legacy.includes('if(window.GhazalStage5)return;'));
});
