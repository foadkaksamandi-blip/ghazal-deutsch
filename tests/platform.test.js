const test=require("node:test");
const assert=require("node:assert/strict");
const Core=require("../app/src/main/assets/platform-core.js");
const Data=require("../app/src/main/assets/course-data.js");

test("local student and teacher profiles work without a server",()=>{
  let s=Core.initialState();
  s=Core.createProfile(s,{id:"t1",displayName:"Teacher",role:"teacher",username:"teacher1"});
  s=Core.createProfile(s,{id:"s1",displayName:"Student",role:"student",username:"student1"});
  assert.equal(s.profiles.length,2);
  assert.equal(Core.serverReady(s).connected,false);
  assert.equal(Core.serverReady(s).offlineCore,true);
});

test("teacher can create class and student can join by code",()=>{
  let s=Core.initialState();
  s=Core.createProfile(s,{id:"t1",displayName:"Teacher",role:"teacher"});
  s=Core.createProfile(s,{id:"s1",displayName:"Student",role:"student"});
  s=Core.createClass(s,{id:"c1",teacherId:"t1",name:"A1 Class",code:"GHZA1001"});
  s=Core.joinClass(s,{studentId:"s1",code:"GHZA1001"});
  assert.deepEqual(s.classes[0].studentIds,["s1"]);
  assert.ok(s.profiles.find(p=>p.id==="s1").classIds.includes("c1"));
});

test("assignment lifecycle is functional locally",()=>{
  let s=Core.initialState();
  s=Core.createProfile(s,{id:"t1",displayName:"Teacher",role:"teacher"});
  s=Core.createProfile(s,{id:"s1",displayName:"Student",role:"student"});
  s=Core.createClass(s,{id:"c1",teacherId:"t1",name:"B1",code:"GHZB1001"});
  s=Core.joinClass(s,{studentId:"s1",code:"GHZB1001"});
  const lessonId=Data.lessons[0].id;
  s=Core.createAssignment(s,{id:"a1",teacherId:"t1",classId:"c1",title:"Lesson",lessonIds:[lessonId]});
  s=Core.submitAssignment(s,{assignmentId:"a1",studentId:"s1",status:"completed",score:88});
  const teacher=Core.teacherDashboard(s,"t1");
  const student=Core.studentDashboard(s,"s1");
  assert.equal(teacher.assignments.length,1);
  assert.equal(teacher.submissions[0].score,88);
  assert.equal(student.assignments[0].lessonIds[0],lessonId);
});

test("internal search indexes lessons words and dialogues",()=>{
  const index=Core.buildSearchIndex(Data);
  assert.ok(index.length>Data.lessons.length);
  const first=Data.lessons[0];
  const q=first.words[0][0];
  const results=Core.search(index,q,20);
  assert.ok(results.some(x=>x.lessonId===first.id));
});

test("server contract is defined while online mode stays off by default",()=>{
  const ready=Core.serverReady(Core.initialState());
  for(const key of ["auth","users","progress","content","classroom","ai","analytics","entitlement","notification"]){
    assert.ok(Array.isArray(ready.endpoints[key])&&ready.endpoints[key].length>0,key);
  }
  assert.equal(ready.connected,false);
});