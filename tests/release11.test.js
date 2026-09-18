const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

function loadAll(){
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
    '../app/src/main/assets/platform-core.js',
    '../app/src/main/assets/release11-learning-engine.js',
    '../app/src/main/assets/release11-classroom-core.js'
  ];
  paths.forEach(p=>{try{delete require.cache[require.resolve(p)];}catch(_){}});
  const data=require(paths[0]);
  global.window={GhazalData:data};
  require(paths[1]);require(paths[2]);require(paths[3]);require(paths[4]);
  const lib=require(paths[5]);window.GhazalLibrary=lib;
  const dict=require(paths[6]);window.GhazalDictionary=dict;
  const deep=require(paths[7]);window.GhazalDeepLibrary=deep;
  const spec=require(paths[8]);window.GhazalSpecialization=spec;
  const advanced=require(paths[9]);window.GhazalAdvancedContent=advanced;
  const exercises=require(paths[10]);window.GhazalExerciseEngine=exercises;
  const system=require(paths[11]);window.GhazalContentSystem=system;
  const platform=require(paths[12]);window.GhazalPlatformCore=platform;
  const learning=require(paths[13]);window.GhazalLearningEngine=learning;
  const classroom=require(paths[14]);window.GhazalClassroomCore=classroom;
  delete global.window;
  return{data,lib,dict,deep,spec,advanced,exercises,system,platform,learning,classroom};
}

test('Stage 3 learner model separates mastery confidence and review schedule',()=>{
  const {learning,exercises}=loadAll();
  let s=learning.initialState('student-1');
  const ex=exercises.exercises.find(x=>x.level==='A1'&&x.type==='recall');
  assert.ok(ex);
  s=learning.recordAttempt(s,ex,45,{answer:'wrong',confidence:80});
  assert.equal(s.items[ex.id].lapses,1);
  assert.ok(s.items[ex.id].dueAt);
  assert.ok(s.errors[ex.id]);
  assert.equal(s.errors[ex.id].resolved,false);
  assert.notEqual(s.skills.vocabulary.mastery,s.skills.vocabulary.confidence);
  s=learning.recordAttempt(s,ex,95,{answer:ex.answer,confidence:90,transfer:true});
  s=learning.recordAttempt(s,ex,95,{answer:ex.answer,confidence:90,transfer:true});
  assert.equal(s.errors[ex.id].resolved,true);
  assert.ok(s.items[ex.id].intervalDays>=1);
  assert.ok(s.items[ex.id].mastery>0);
});

test('Stage 3 adaptive daily plan respects budget and targets weak skills',()=>{
  const {learning}=loadAll();
  let s=learning.initialState('student-2');
  s.currentLevel='B1';
  s.dailyMinutes=25;
  s.skills.grammar={...s.skills.grammar,attempts:5,total:180,avg:36,mastery:30,confidence:40};
  s.skills.vocabulary={...s.skills.vocabulary,attempts:5,total:400,avg:80,mastery:75,confidence:80};
  const out=learning.buildDailyPlan(s,25,'B1');
  assert.equal(out.plan.level,'B1');
  assert.ok(out.plan.items.length>0);
  assert.ok(out.plan.estimatedMinutes<=25);
  assert.equal(out.plan.weakest[0].score,0);
  const grammar=learning.weakestSkills(s).find(x=>x.id==='grammar'),vocab=learning.weakestSkills(s).find(x=>x.id==='vocabulary');
  assert.ok(grammar.score<vocab.score);
});

test('Stage 3 mastery gate is evidence-based and can unlock next level',()=>{
  const {learning}=loadAll();
  let s=learning.initialState('student-3');
  s.currentLevel='A1';
  const skills=['vocabulary','grammar','reading','listening','writing','speaking'];
  let n=0;
  for(let round=0;round<6;round++){
    for(const skill of skills){
      s.history.push({exerciseId:'x'+(++n),type:'synthetic',level:'A1',skill,score:skill==='writing'||skill==='speaking'?82:88,confidence:85,transfer:round<1&&['reading','writing','speaking'].includes(skill),at:new Date().toISOString()});
    }
  }
  const gate=learning.masteryGate(s,'A1');
  assert.equal(gate.pass,true,JSON.stringify(gate));
  const next=learning.nextLevel(s);
  assert.equal(next.next,'A2');
});

test('Stage 3 placement, immersion, rescue, unknown transfer and missions are functional',()=>{
  const {learning}=loadAll();
  const session=learning.placementSession();
  assert.ok(session.items.length>=18);
  const result=learning.scorePlacement(session,session.items.map(()=>({score:85})));
  assert.equal(result.suggestedLevel,'C2');
  assert.deepEqual(learning.immersion('A1'),{level:'A1',de:30,fa:70});
  assert.deepEqual(learning.immersion('C2'),{level:'C2',de:98,fa:2});
  const rescue=learning.rescueFor({answer:'Ich komme morgen.',context:'Morgen habe ich Zeit.'},4);
  assert.equal(rescue.reveal,true);
  const challenge=learning.unknownChallenge(learning.initialState('x'),'B2');
  assert.ok(challenge.items.length>0);
  const mission=learning.missionProgress(learning.initialState('x'),'weekly');
  assert.equal(mission.period,'weekly');
  assert.ok(mission.targets.attempts>0);
});

test('Stage 4 supports full teacher-student assignment submission grading report flow',()=>{
  const {platform,classroom,data,exercises}=loadAll();
  let s=platform.initialState();
  s=platform.createProfile(s,{id:'teacher-1',displayName:'Teacher',role:'teacher',username:'teacher'});
  s=platform.createProfile(s,{id:'student-1',displayName:'Student',role:'student',username:'student'});
  s=platform.createClass(s,{id:'class-1',teacherId:'teacher-1',name:'A1 Class',code:'GHZTEST1'});
  s=platform.joinClass(s,{studentId:'student-1',code:'GHZTEST1'});
  s=classroom.normalizeState(s);
  const lesson=data.lessons.find(x=>x.level==='A1');
  const ex=exercises.exercises.find(x=>x.level==='A1'&&x.type==='meaning');
  s=classroom.createAssignment(s,{
    id:'asg-1',teacherId:'teacher-1',classId:'class-1',title:'Week 1',
    items:[
      {id:'i1',kind:'lesson',refId:lesson.id},
      {id:'i2',kind:'exercise',refId:ex.id},
      {id:'i3',kind:'writing',prompt:'Schreibe fünf Sätze.'},
      {id:'i4',kind:'speaking',prompt:'Stell dich vor.'}
    ]
  });
  const a=classroom.assignmentsForStudent(s,'student-1')[0];
  assert.equal(a.items.length,4);
  s=classroom.upsertSubmission(s,{studentId:'student-1',assignmentId:'asg-1',itemId:'i1',completed:true,score:100});
  s=classroom.upsertSubmission(s,{studentId:'student-1',assignmentId:'asg-1',itemId:'i2',completed:true,score:90,text:ex.answer});
  s=classroom.upsertSubmission(s,{studentId:'student-1',assignmentId:'asg-1',itemId:'i3',completed:true,text:'Ich lerne Deutsch. Ich wohne hier.'});
  s=classroom.upsertSubmission(s,{studentId:'student-1',assignmentId:'asg-1',itemId:'i4',completed:true,transcript:'Guten Tag, ich heiße Student.',score:80});
  s=classroom.submitAssignment(s,{studentId:'student-1',assignmentId:'asg-1'});
  const sub=s.enhancedSubmissions[0];
  assert.equal(sub.status,'submitted');
  s=classroom.gradeSubmission(s,{teacherId:'teacher-1',submissionId:sub.id,rubric:{grammar:85,vocabulary:80,task:90},comment:'Gut gemacht.'});
  assert.equal(s.enhancedSubmissions[0].status,'graded');
  assert.equal(s.enhancedSubmissions[0].grade,85);
  const report=classroom.classReport(s,'class-1');
  assert.equal(report.students.length,1);
  assert.equal(report.completionRate,100);
  assert.equal(report.averageGrade,85);
});

test('Stage 4 announcements, dashboards, PDF payload and server contracts are real',()=>{
  const {platform,classroom,data}=loadAll();
  let s=platform.initialState();
  s=platform.createProfile(s,{id:'t',displayName:'Teacher',role:'teacher'});
  s=platform.createProfile(s,{id:'s',displayName:'Student',role:'student'});
  s=platform.createClass(s,{id:'c',teacherId:'t',name:'Class',code:'GHZC1234'});
  s=platform.joinClass(s,{studentId:'s',code:'GHZC1234'});
  s=classroom.normalizeState(s);
  s=classroom.createAssignment(s,{id:'a',teacherId:'t',classId:'c',title:'Lesson',items:[{kind:'lesson',refId:data.lessons[0].id}]});
  s=classroom.addAnnouncement(s,{teacherId:'t',classId:'c',title:'کلاس',body:'جلسه فردا ساعت ۱۰.'});
  assert.equal(classroom.teacherDashboard(s,'t').announcements.length,1);
  assert.equal(classroom.studentDashboard(s,'s').announcements.length,1);
  const payload=classroom.reportPayload(s,'c');
  assert.equal(payload.title,'GHAZAL Class Report');
  assert.equal(payload.className,'Class');
  const contracts=classroom.serverContracts();
  assert.equal(contracts.version,2);
  assert.equal(contracts.offlineQueue,true);
  assert.equal(contracts.idempotencyRequired,true);
});

test('Release 11 assets and Android version are wired consistently',()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  const bridge=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java'),'utf8');
  for(const asset of ['release11-learning-engine.js','release11-classroom-core.js','release11-stage34-ui.js','release11-stage34.css']) assert.ok(index.includes(asset),asset);
  assert.equal(pkg.version,'11.0.0');
  assert.match(gradle,/versionCode 11/);
  assert.match(gradle,/versionName "11\.0\.0"/);
  assert.match(bridge,/activity == null \? "11\.0\.0"/);
  const wf=fs.readFileSync(path.join(root,'.github/workflows/android.yml'),'utf8');
  assert.ok(wf.includes('GHAZAL-v11-stage3-4-complete-qa.apk'));
});