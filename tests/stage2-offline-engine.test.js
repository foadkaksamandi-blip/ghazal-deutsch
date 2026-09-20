const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

function load(){
  const paths=[
    '../app/src/main/assets/course-data.js',
    '../app/src/main/assets/release4-content.js',
    '../app/src/main/assets/release5-content.js',
    '../app/src/main/assets/release7-content.js',
    '../app/src/main/assets/release10-capstone-content.js',
    '../app/src/main/assets/release7-library.js',
    '../app/src/main/assets/release8-dictionary.js',
    '../app/src/main/assets/release8-deep-library.js',
    '../app/src/main/assets/release9-specialization.js',
    '../app/src/main/assets/release10-advanced-content.js',
    '../app/src/main/assets/release10-exercise-engine.js',
    '../app/src/main/assets/release10-content-system.js',
    '../app/src/main/assets/release11-learning-engine.js'
  ];
  paths.forEach(p=>{try{delete require.cache[require.resolve(p)];}catch(_){}});
  const data=require(paths[0]);
  global.window={GhazalData:data};
  require(paths[1]);require(paths[2]);require(paths[3]);require(paths[4]);
  window.GhazalLibrary=require(paths[5]);
  window.GhazalDictionary=require(paths[6]);
  window.GhazalDeepLibrary=require(paths[7]);
  window.GhazalSpecialization=require(paths[8]);
  window.GhazalAdvancedContent=require(paths[9]);
  window.GhazalExerciseEngine=require(paths[10]);
  window.GhazalContentSystem=require(paths[11]);
  const learning=require(paths[12]);
  const exercises=window.GhazalExerciseEngine;
  delete global.window;
  return{learning,exercises};
}

test('locked Stage 2 SRS starts from the intended first-success interval',()=>{
  const {learning,exercises}=load();
  const ex=exercises.exercises.find(x=>x.level==='A1'&&x.type==='recall');
  let s=learning.initialState('srs');
  s=learning.recordAttempt(s,ex,95,{answer:ex.answer,confidence:90});
  assert.equal(s.items[ex.id].reps,1);
  assert.equal(s.items[ex.id].intervalDays,2);
  s=learning.recordAttempt(s,ex,95,{answer:ex.answer,confidence:90});
  assert.equal(s.items[ex.id].reps,2);
  assert.equal(s.items[ex.id].intervalDays,5);
  s=learning.recordAttempt(s,ex,20,{answer:'wrong',confidence:30});
  assert.equal(s.items[ex.id].reps,0);
  assert.equal(s.items[ex.id].intervalDays,1);
});

test('locked Stage 2 mastery is isolated per skill',()=>{
  const {learning,exercises}=load();
  let s=learning.initialState('mastery');
  for(let i=0;i<12;i++)s.items['v'+i]={skill:'vocabulary',mastery:95};
  const ex=exercises.exercises.find(x=>x.level==='A1'&&x.type==='cloze');
  s=learning.recordAttempt(s,ex,70,{answer:ex.answer,confidence:70});
  assert.equal(s.items[ex.id].skill,'grammar');
  assert.ok(s.skills.grammar.mastery<=55,JSON.stringify(s.skills.grammar));
});

test('locked Stage 2 ten-minute daily plan never exceeds its budget',()=>{
  const {learning}=load();
  let s=learning.initialState('budget');
  s.currentLevel='B2';
  const out=learning.buildDailyPlan(s,10,'B2');
  assert.ok(out.plan.items.length>0);
  assert.ok(out.plan.estimatedMinutes<=10,JSON.stringify(out.plan));
  assert.equal(out.plan.budgetMinutes,10);
});

test('locked Stage 2 checkpoint quiz is real, scored and skill-aware',()=>{
  const {learning}=load();
  let s=learning.initialState('quiz');
  s.currentLevel='B1';
  const q=learning.buildQuizSession(s,{level:'B1',count:12,seed:42});
  assert.equal(q.level,'B1');
  assert.equal(q.items.length,12);
  const answers=q.items.map(ex=>ex.answer==='free'?{score:85,answer:'self-rated'}:{answer:ex.answer});
  const result=learning.scoreQuizSession(q,answers);
  assert.ok(result.overall>=80,JSON.stringify(result));
  assert.equal(result.pass,true,JSON.stringify(result));
  assert.ok(Object.keys(result.skillScores).length>=2);
  assert.equal(result.rows.length,12);
});

test('locked Stage 2 legacy SRS state migrates metadata without losing history',()=>{
  const {learning,exercises}=load();
  const ex=exercises.exercises.find(x=>x.level==='A2'&&x.type==='recall');
  const raw=learning.initialState('legacy');
  raw.schema=2;
  raw.items[ex.id]={attempts:8,scores:[80,90],reps:3,lapses:1,ease:2.2,intervalDays:14,dueAt:new Date().toISOString(),mastery:88,confidence:80};
  const n=learning.normalizeState(raw,'legacy');
  assert.equal(n.schema,3);
  assert.equal(n.items[ex.id].attempts,8);
  assert.equal(n.items[ex.id].mastery,88);
  assert.equal(n.items[ex.id].skill,'vocabulary');
  assert.equal(n.items[ex.id].level,'A2');
  assert.equal(n.items[ex.id].type,'recall');
});

test('locked Stage 2 exact resume survives normalization and clears explicitly',()=>{
  const {learning}=load();
  let s=learning.initialState('resume');
  s=learning.setResume(s,{kind:'quiz',id:'quiz-1',step:7,level:'C1',payload:{answer:'draft'}});
  const n=learning.normalizeState(JSON.parse(JSON.stringify(s)),'resume');
  assert.equal(n.resume.kind,'quiz');
  assert.equal(n.resume.step,7);
  assert.equal(n.resume.level,'C1');
  assert.equal(n.resume.payload.answer,'draft');
  const cleared=learning.clearResume(n);
  assert.equal(cleared.resume,null);
});

test('locked Stage 2 UI exposes resume, checkpoint and persistent adaptive flows',()=>{
  const root=path.join(__dirname,'..');
  const ui=fs.readFileSync(path.join(root,'app/src/main/assets/release11-stage34-ui.js'),'utf8');
  for(const token of [
    'data-r11="resume-learning"',
    'data-r11="checkpoint"',
    'function resumeLearning()',
    'function checkpoint()',
    'L.setResume',
    'L.clearResume',
    'buildQuizSession',
    'scoreQuizSession',
    'function saveResumeDraft',
    'r11-placement-answer',
    'r11-quiz-answer'
  ]) assert.ok(ui.includes(token),token);
});
