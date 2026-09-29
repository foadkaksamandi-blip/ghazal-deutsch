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
  key(i){return [...this.m.keys()][i]??null;}
  get length(){return this.m.size;}
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
    'platform-core.js','release11-learning-engine.js','stage4-tutor-evaluation.js','release11-classroom-core.js','stage6-profiles-classes.js'
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
  window.GhazalContentSystem=fresh(names[12]);
  window.GhazalOfflineCoach=fresh(names[13]);
  const platform=fresh(names[14]);window.GhazalPlatformCore=platform;
  window.GhazalLearningEngine=fresh(names[15]);
  const tutor=fresh(names[16]);window.GhazalStage4Tutor=tutor;
  const classroom=fresh(names[17]);window.GhazalClassroomCore=classroom;
  const stage6=fresh(names[18]);
  delete global.window;
  return{data,ex,platform,tutor,classroom,stage6};
}

test('Stage 6 domain exposes profiles classes and server-ready local architecture',()=>{
  const {stage6}=load();
  const a=stage6.audit();
  assert.equal(a.pass,true,a.issues.join(', '));
  assert.equal(stage6.VERSION,'6.0.0');
  assert.deepEqual(stage6.VISIBLE_ROLES,['student','teacher']);
  const ready=stage6.serverReadiness({});
  assert.equal(ready.offlineFirst,true);
  assert.equal(ready.crossDeviceSync,false);
  assert.equal(ready.currentScope,'same-device-offline');
  assert.ok(ready.futureRoles.includes('admin'));
  assert.equal(ready.classroom.offlineQueue,true);
  assert.equal(ready.classroom.idempotencyRequired,true);
});

test('Stage 6 completes a real same-device Teacher to Student classroom flow',()=>{
  const {data,stage6}=load();
  const lesson=data.lessons.find(x=>x.level==='A1')||data.lessons[0];
  assert.ok(lesson&&lesson.id);

  let s=stage6.normalize({});
  s=stage6.createProfile(s,{id:'teacher-1',displayName:'استاد غزل',username:'teacher',role:'teacher'});
  const teacherId=s.activeProfileId;
  s=stage6.createClass(s,{id:'class-1',teacherId,name:'A1 حضوری',code:'GHZA1001'});
  const klass=s.classes.find(x=>x.id==='class-1');
  assert.equal(klass.code,'GHZA1001');

  s=stage6.createProfile(s,{id:'student-1',displayName:'غزل',username:'ghazal',role:'student'});
  const studentId=s.activeProfileId;
  s=stage6.joinClass(s,{studentId,code:'ghza1001'});
  assert.ok(s.classes.find(x=>x.id==='class-1').studentIds.includes(studentId));

  s=stage6.createAssignment(s,{
    id:'asg-1',teacherId,classId:'class-1',title:'معرفی خود',
    lessonId:lesson.id,
    writingPrompt:'خودت را در چهار جمله معرفی کن.',
    speakingPrompt:'نام، محل زندگی و زبانت را معرفی کن.'
  });
  const a=s.enhancedAssignments.find(x=>x.id==='asg-1');
  assert.deepEqual(a.items.map(x=>x.kind),['lesson','writing','speaking']);

  const lessonItem=a.items.find(x=>x.kind==='lesson');
  const writingItem=a.items.find(x=>x.kind==='writing');
  const speakingItem=a.items.find(x=>x.kind==='speaking');
  s=stage6.saveAnswer(s,{studentId,assignmentId:a.id,itemId:lessonItem.id,completed:true});
  s=stage6.saveAnswer(s,{studentId,assignmentId:a.id,itemId:writingItem.id,text:'Ich heiße Ghazal. Ich wohne in Teheran. Ich lerne Deutsch. Ich spreche Persisch.'});
  s=stage6.saveAnswer(s,{studentId,assignmentId:a.id,itemId:speakingItem.id,transcript:'Ich heiße Ghazal. Ich wohne in Teheran und ich spreche Persisch.'});
  const subBefore=s.enhancedSubmissions.find(x=>x.assignmentId===a.id&&x.studentId===studentId);
  assert.equal(subBefore.status,'in_progress');
  assert.ok(Number.isFinite(subBefore.answers[writingItem.id].score));
  assert.ok(Number.isFinite(subBefore.answers[speakingItem.id].score));

  s=stage6.submitAssignment(s,{studentId,assignmentId:a.id});
  let sub=s.enhancedSubmissions.find(x=>x.assignmentId===a.id&&x.studentId===studentId);
  assert.equal(sub.status,'submitted');

  s=stage6.gradeSubmission(s,{teacherId,submissionId:sub.id,rubric:{task:90,grammar:82,vocabulary:84,fluency:80,pronunciation:78},comment:'خوب بود؛ جمله‌ها را طبیعی‌تر وصل کن.'});
  sub=s.enhancedSubmissions.find(x=>x.id===sub.id);
  assert.equal(sub.status,'graded');
  assert.ok(sub.grade>=0&&sub.grade<=100);
  assert.match(sub.teacherComment,/خوب بود/);

  const report=stage6.classReport(s,'class-1');
  assert.equal(report.students.length,1);
  assert.equal(report.assignmentCount,1);
  assert.equal(report.completionRate,100);
  assert.ok(Number.isFinite(report.averageGrade));
  const payload=stage6.reportPayload(s,'class-1');
  assert.equal(payload.className,'A1 حضوری');
});

test('Stage 6 active profile and classroom state persist exactly in local storage',()=>{
  const {stage6}=load(),storage=new Storage();
  let s=stage6.createProfile({}, {id:'teacher-x',displayName:'Teacher X',role:'teacher'});
  s=stage6.createClass(s,{id:'class-x',teacherId:'teacher-x',name:'B1 Class',code:'GHZB1001'});
  s=stage6.createProfile(s,{id:'student-x',displayName:'Student X',role:'student'});
  s=stage6.joinClass(s,{studentId:'student-x',code:'GHZB1001'});
  stage6.writeStorage(storage,s);
  const restored=stage6.readStorage(storage);
  assert.equal(restored.activeProfileId,'student-x');
  assert.equal(restored.profiles.length,2);
  assert.equal(restored.classes.length,1);
  assert.ok(restored.classes[0].studentIds.includes('student-x'));
});

test('Stage 6 validates real curriculum references and rejects fake assignment content',()=>{
  const {stage6}=load();
  let s=stage6.createProfile({}, {id:'t',displayName:'Teacher',role:'teacher'});
  s=stage6.createClass(s,{id:'c',teacherId:'t',name:'Class',code:'GHZC1001'});
  assert.throws(()=>stage6.createAssignment(s,{teacherId:'t',classId:'c',lessonId:'not-real',title:'Fake'}),/lesson_not_found/);
});

test('Stage 6 assets are wired after locked Stage 5 and expose one consolidated entry',()=>{
  const index=fs.readFileSync(path.join(ASSETS,'index.html'),'utf8');
  const ui=fs.readFileSync(path.join(ASSETS,'stage6-profiles-classes-ui.js'),'utf8');
  for(const asset of ['stage6-profiles-classes.css','stage6-profiles-classes.js','stage6-profiles-classes-ui.js'])assert.ok(index.includes(asset),asset);
  assert.ok(index.indexOf('stage5-exams-pathways.js')<index.indexOf('stage6-profiles-classes.js'));
  assert.ok(index.indexOf('stage5-exams-pathways-ui.js')<index.indexOf('stage6-profiles-classes-ui.js'));
  assert.ok(ui.includes('مرحله ۶ · پروفایل‌ها و کلاس‌ها'));
  assert.ok(ui.includes('same-device')||ui.includes('همین دستگاه'));
  assert.ok(ui.includes('data-r6="stage6-hub"'));
});
