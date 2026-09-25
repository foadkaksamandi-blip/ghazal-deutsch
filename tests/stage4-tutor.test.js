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
}

function load(){
  const names=[
    'course-data.js','release4-content.js','release5-content.js','release7-content.js','release10-capstone-content.js',
    'release7-library.js','release8-dictionary.js','release8-deep-library.js','release9-specialization.js','release10-advanced-content.js',
    'stage3-content-pack.js','release10-exercise-engine.js','release10-content-system.js','release10-offline-coach.js','release11-learning-engine.js','stage4-tutor-evaluation.js'
  ];
  names.forEach(n=>{const p=path.join(ASSETS,n);try{delete require.cache[require.resolve(p)];}catch(_){}});
  const data=require(path.join(ASSETS,names[0]));global.window={GhazalData:data};
  require(path.join(ASSETS,names[1]));require(path.join(ASSETS,names[2]));require(path.join(ASSETS,names[3]));require(path.join(ASSETS,names[4]));
  const lib=require(path.join(ASSETS,names[5]));window.GhazalLibrary=lib;
  const dict=require(path.join(ASSETS,names[6]));window.GhazalDictionary=dict;
  const deep=require(path.join(ASSETS,names[7]));window.GhazalDeepLibrary=deep;
  window.GhazalSpecialization=require(path.join(ASSETS,names[8]));
  window.GhazalAdvancedContent=require(path.join(ASSETS,names[9]));
  const stage3=require(path.join(ASSETS,names[10]));window.GhazalStage3Content=stage3;stage3.apply({data,lib,dict,deep});
  const ex=require(path.join(ASSETS,names[11]));window.GhazalExerciseEngine=ex;
  const content=require(path.join(ASSETS,names[12]));window.GhazalContentSystem=content;
  const coach=require(path.join(ASSETS,names[13]));window.GhazalOfflineCoach=coach;
  const learning=require(path.join(ASSETS,names[14]));window.GhazalLearningEngine=learning;
  const stage4=require(path.join(ASSETS,names[15]));
  delete global.window;
  return{stage4,learning,ex,content};
}

test('Stage 4 baseline assessment is balanced across A1-C2 and four receptive/core skills',()=>{
  const {stage4}=load();
  const s=stage4.buildBaselineAssessment(42);
  assert.equal(s.items.length,24);
  for(const level of stage4.LEVELS){
    const rows=s.items.filter(x=>x.diagnosticLevel===level);
    assert.equal(rows.length,4,level);
    assert.deepEqual(new Set(rows.map(x=>x.diagnosticSkill)),new Set(['vocabulary','grammar','reading','listening']));
  }
  const correct=s.items.map(x=>({answer:x.answer}));
  const r=stage4.scoreBaseline(s,correct);
  assert.equal(r.completed,24);
  assert.equal(r.suggestedLevel,'C2');
  assert.ok(r.overall>=95,JSON.stringify(r));
});

test('Stage 4 writing and speaking evaluators return bounded multidimensional evidence',()=>{
  const {stage4}=load();
  const writing=stage4.evaluateWriting(
    'Sehr geehrte Damen und Herren. Ich möchte mich nach dem Bearbeitungsstand erkundigen, weil ich alle Unterlagen bereits eingereicht habe. Außerdem wäre ich Ihnen für eine kurze Rückmeldung dankbar. Mit freundlichen Grüßen',
    'B2','formelle Anfrage'
  );
  assert.ok(writing.total>=0&&writing.total<=100);
  for(const k of ['task','grammar','vocabulary','cohesion','register'])assert.ok(Number.isFinite(writing.rubric[k]),k);
  assert.ok(writing.feedback.length>0);
  assert.match(writing.limitations,/Rule-Based/);

  const speaking=stage4.evaluateSpeaking(
    'Ich möchte meine Meinung kurz erklären. Erstens ist diese Lösung praktisch, weil sie Zeit spart. Außerdem reduziert sie Fehler. Deshalb würde ich diese Variante empfehlen.',
    'B2','Stellungnahme'
  );
  assert.ok(speaking.total>=0&&speaking.total<=100);
  for(const k of ['completion','coherence','grammar','vocabulary','recognizability'])assert.ok(Number.isFinite(speaking.rubric[k]),k);
  assert.match(speaking.limitations,/Transcript/);
});

test('Stage 4 pronunciation is explicitly a transcript proxy, not fake acoustic scoring',()=>{
  const {stage4}=load();
  const target='Ich möchte einen Termin vereinbaren.';
  const good=stage4.evaluatePronunciation(target,target,'A1');
  const weak=stage4.evaluatePronunciation('Termin bitte',target,'A1');
  assert.equal(good.total,100);
  assert.ok(weak.total<good.total);
  assert.match(good.limitations,/Proxy|Phoneme/);
});

test('Stage 4 builds a six-skill learner profile and persists it safely',()=>{
  const {stage4,learning}=load();
  let learner=learning.initialState('p1');
  const exSkills=['meaning','cloze','reading','dictation'];
  for(let i=0;i<80;i++){
    const ex={id:'e'+i,type:exSkills[i%4],level:'B1',prompt:'p',answer:'a'};
    learner=learning.recordAttempt(learner,ex,65+(i%30),{answer:'a',confidence:80,transfer:i%3===0});
  }
  const diag=stage4.buildBaselineAssessment(7),baseline=stage4.scoreBaseline(diag,diag.items.map(x=>({answer:x.answer})));
  const w=stage4.evaluateWriting('Ich schreibe einen strukturierten Text. Außerdem nenne ich einen Grund. Deshalb komme ich zu einem klaren Ergebnis.','B2','Text');
  const sp=stage4.evaluateSpeaking('Ich erkläre zuerst meine Position. Danach nenne ich ein Beispiel. Abschließend fasse ich meine Meinung zusammen.','B2','Sprechen');
  let s=stage4.defaults('p1','B1');s=stage4.recordWriting(s,w);s=stage4.recordSpeaking(s,sp);s=stage4.applyAssessment(s,learner,baseline,w,sp);
  const completion=stage4.completion(s.learnerProfile);
  assert.equal(completion.done,6);
  assert.equal(completion.percent,100);
  assert.equal(s.learnerProfile.level,'C2');
  assert.equal(Object.keys(s.learnerProfile.skills).length,6);
  const storage=new Storage();stage4.writeStorage(storage,s);
  const restored=stage4.readStorage(storage,'p1','A1');
  assert.equal(restored.learnerProfile.level,'C2');
  assert.equal(stage4.completion(restored.learnerProfile).done,6);
});

test('Stage 4 error profile, adaptive plan and tutor use real learning evidence',()=>{
  const {stage4,learning,ex}=load();
  let learner=learning.initialState('adaptive');
  const sample=ex.exercises.filter(x=>x.level==='B1').slice(0,80);
  sample.forEach((item,i)=>{learner=learning.recordAttempt(learner,item,i%3===0?35:72,{answer:i%3===0?'wrong':item.answer,confidence:60,transfer:false});});
  let state=stage4.defaults('adaptive','B1');
  state.learnerProfile=stage4.mergeEvidence(learner,null,null,null,state.learnerProfile);
  state.learnerProfile.level='B1';
  const errors=stage4.errorProfile(learner,state);
  assert.ok(errors.active>0,JSON.stringify(errors));
  const plan=stage4.buildAdaptivePlan(state.learnerProfile,learner,25);
  assert.ok(plan.items.length>0);
  assert.ok(plan.estimatedMinutes<=25);
  const advice=stage4.tutorAdvice('برای گرامر امروز چه کار کنم؟',state.learnerProfile,learner);
  assert.equal(advice.offline,true);
  assert.equal(advice.focus,'grammar');
  assert.ok(advice.answer.length>30);
  assert.ok(Array.isArray(advice.sources));
});

test('Stage 4 exact resume keeps writing draft and clears explicitly',()=>{
  const {stage4}=load();
  let s=stage4.defaults('resume','B2');
  s=stage4.setResume(s,{kind:'writing',id:'w1',step:0,payload:{draft:'Mein Entwurf'}});
  const n=stage4.normalizeState(JSON.parse(JSON.stringify(s)),'resume','B2');
  assert.equal(n.resume.payload.draft,'Mein Entwurf');
  assert.equal(stage4.clearResume(n).resume,null);
});

test('Stage 4 runtime/UI wiring exposes every required user-facing capability',()=>{
  const index=fs.readFileSync(path.join(ASSETS,'index.html'),'utf8');
  const ui=fs.readFileSync(path.join(ASSETS,'stage4-tutor-ui.js'),'utf8');
  const css=fs.readFileSync(path.join(ASSETS,'stage4-tutor.css'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
  assert.ok(index.indexOf('stage4-tutor-evaluation.js')>index.indexOf('release11-learning-engine.js'));
  assert.ok(index.indexOf('stage4-tutor-ui.js')>index.indexOf('release11-stage34-ui.js'));
  for(const token of [
    'مرحله ۴ · مربی خصوصی و ارزیابی','ارزیابی پایه و تعیین سطح','مربی خصوصی آفلاین','ارزیابی Writing',
    'ارزیابی Speaking','تمرین تلفظ تقریبی','پروفایل خطا و ضعف','مسیر شخصی امروز','Learner Profile'
  ])assert.ok(ui.includes(token),token);
  assert.ok(css.includes('.s4-entry'));
  assert.ok(pkg.scripts.check.includes('stage4-tutor-evaluation.js'));
  assert.ok(pkg.scripts.check.includes('stage4-tutor-ui.js'));
});
