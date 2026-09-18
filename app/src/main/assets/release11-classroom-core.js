(function(root,factory){
  const api=factory(root&&root.GhazalPlatformCore,root&&root.GhazalData,root&&root.GhazalExerciseEngine,root&&root.GhazalLearningEngine);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalClassroomCore=api;
})(typeof window!=="undefined"?window:null,function(Base,Data,Exercises,Learning){
  "use strict";
  const RUBRICS={
    writing:{grammar:25,vocabulary:20,cohesion:20,task:20,register:15},
    speaking:{accuracy:20,vocabulary:20,fluency:20,pronunciation:20,task:20},
    lesson:{completion:50,mastery:50},
    exercise:{accuracy:70,confidence:15,transfer:15}
  };
  function text(v){return String(v==null?"":v).trim();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function uid(prefix,seed){return prefix+"-"+text(seed||Date.now()).toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,24)+"-"+Math.random().toString(36).slice(2,7);}
  function initialExtras(){return{classroomSchema:2,enhancedAssignments:[],enhancedSubmissions:[],announcements:[],teacherNotes:[],classroomUpdatedAt:new Date().toISOString()};}
  function normalizeState(raw){
    const s=Base?Base.normalizeState(raw):(raw||{}),e=initialExtras();
    return{...s,classroomSchema:2,enhancedAssignments:Array.isArray(s.enhancedAssignments)?s.enhancedAssignments:[],enhancedSubmissions:Array.isArray(s.enhancedSubmissions)?s.enhancedSubmissions:[],announcements:Array.isArray(s.announcements)?s.announcements:[],teacherNotes:Array.isArray(s.teacherNotes)?s.teacherNotes:[],classroomUpdatedAt:s.classroomUpdatedAt||e.classroomUpdatedAt};
  }
  function teacher(state,id){const s=normalizeState(state),p=s.profiles.find(x=>x.id===id);if(!p||p.role!=="teacher")throw new Error("teacher_required");return{s,p};}
  function student(state,id){const s=normalizeState(state),p=s.profiles.find(x=>x.id===id);if(!p||p.role!=="student")throw new Error("student_required");return{s,p};}
  function validClass(s,classId,teacherId){const c=s.classes.find(x=>x.id===classId&&!x.archived);if(!c||c.teacherId!==teacherId)throw new Error("class_teacher_required");return c;}
  function validateItems(items){
    const out=[];(Array.isArray(items)?items:[]).forEach(i=>{
      const kind=["lesson","exercise","writing","speaking"].includes(i.kind)?i.kind:"lesson",refId=text(i.refId),prompt=text(i.prompt);
      if(kind==="lesson"&&refId&&Data&&Data.lessons&&!Data.lessons.some(l=>l.id===refId))throw new Error("lesson_not_found");
      if(kind==="exercise"&&refId&&Exercises&&Exercises.exercises&&!Exercises.exercises.some(e=>e.id===refId))throw new Error("exercise_not_found");
      if((kind==="writing"||kind==="speaking")&&!prompt)throw new Error("prompt_required");
      if((kind==="lesson"||kind==="exercise")&&!refId)throw new Error("reference_required");
      out.push({id:text(i.id)||uid("item",kind+out.length),kind,refId,prompt,maxScore:Math.max(1,Math.min(100,Number(i.maxScore)||100)),required:i.required!==false});
    });
    if(!out.length)throw new Error("items_required");return out;
  }
  function createAssignment(state,input){
    const {s,p}=teacher(state,input&&input.teacherId),i=input||{},klass=validClass(s,i.classId,p.id),items=validateItems(i.items);
    const title=text(i.title)||"تکلیف GHAZAL",id=text(i.id)||uid("asg",title);
    if(s.enhancedAssignments.some(x=>x.id===id))throw new Error("assignment_exists");
    s.enhancedAssignments.push({id,classId:klass.id,teacherId:p.id,title,instructions:text(i.instructions),dueDate:text(i.dueDate),items,createdAt:new Date().toISOString(),published:i.published!==false,archived:false});
    s.classroomUpdatedAt=new Date().toISOString();return s;
  }
  function assignmentsForStudent(state,studentId){
    const {s,p}=student(state,studentId),classIds=new Set((p.classIds||[]));
    return s.enhancedAssignments.filter(a=>classIds.has(a.classId)&&a.published&&!a.archived).map(a=>({...a,submission:s.enhancedSubmissions.find(x=>x.assignmentId===a.id&&x.studentId===studentId)||null}));
  }
  function assignmentStatus(assignment,submission){
    if(!submission)return assignment.dueDate&&new Date(assignment.dueDate).getTime()<Date.now()?"late":"not_started";
    if(submission.status==="submitted"||submission.status==="graded")return submission.status;
    return"in_progress";
  }
  function upsertSubmission(state,input){
    const {s,p}=student(state,input&&input.studentId),i=input||{},a=s.enhancedAssignments.find(x=>x.id===i.assignmentId&&x.published&&!x.archived);
    if(!a)throw new Error("assignment_not_found");
    const klass=s.classes.find(c=>c.id===a.classId);if(!klass||(klass.studentIds||[]).indexOf(p.id)<0)throw new Error("student_not_in_class");
    let sub=s.enhancedSubmissions.find(x=>x.assignmentId===a.id&&x.studentId===p.id);
    if(!sub){sub={id:uid("sub",a.id+p.id),assignmentId:a.id,classId:a.classId,studentId:p.id,status:"in_progress",answers:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),submittedAt:null,grade:null,teacherComment:"",rubric:null};s.enhancedSubmissions.push(sub);}
    const item=a.items.find(x=>x.id===i.itemId);if(!item)throw new Error("item_not_found");
    const ans={kind:item.kind,text:text(i.text),transcript:text(i.transcript),score:Number.isFinite(Number(i.score))?Math.max(0,Math.min(100,Number(i.score))):null,confidence:Number.isFinite(Number(i.confidence))?Math.max(0,Math.min(100,Number(i.confidence))):null,completed:!!i.completed,updatedAt:new Date().toISOString()};
    if(item.kind==="lesson"&&i.completed===true)ans.score=ans.score==null?100:ans.score;
    sub.answers[item.id]=ans;sub.updatedAt=new Date().toISOString();s.classroomUpdatedAt=sub.updatedAt;return s;
  }
  function submitAssignment(state,input){
    const {s,p}=student(state,input&&input.studentId),a=s.enhancedAssignments.find(x=>x.id===input.assignmentId&&!x.archived),sub=s.enhancedSubmissions.find(x=>x.assignmentId===input.assignmentId&&x.studentId===p.id);
    if(!a||!sub)throw new Error("submission_not_found");
    const required=a.items.filter(x=>x.required),done=required.every(item=>{const ans=sub.answers[item.id];return ans&&(ans.completed||ans.text||ans.transcript||Number.isFinite(ans.score));});
    if(!done)throw new Error("required_items_incomplete");
    sub.status="submitted";sub.submittedAt=new Date().toISOString();sub.updatedAt=sub.submittedAt;s.classroomUpdatedAt=sub.updatedAt;return s;
  }
  function gradeSubmission(state,input){
    const {s,p}=teacher(state,input&&input.teacherId),i=input||{},sub=s.enhancedSubmissions.find(x=>x.id===i.submissionId),a=sub&&s.enhancedAssignments.find(x=>x.id===sub.assignmentId);
    if(!sub||!a||a.teacherId!==p.id)throw new Error("submission_teacher_required");
    const rubric=i.rubric&&typeof i.rubric==="object"?i.rubric:{},scores=Object.values(rubric).map(Number).filter(Number.isFinite).map(n=>Math.max(0,Math.min(100,n))),automatic=Object.values(sub.answers||{}).map(x=>x.score).filter(Number.isFinite);
    const grade=Number.isFinite(Number(i.grade))?Math.max(0,Math.min(100,Number(i.grade))):(scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):(automatic.length?Math.round(automatic.reduce((a,b)=>a+b,0)/automatic.length):null));
    sub.grade=grade;sub.rubric=clone(rubric);sub.teacherComment=text(i.comment);sub.status="graded";sub.gradedAt=new Date().toISOString();sub.updatedAt=sub.gradedAt;s.classroomUpdatedAt=sub.updatedAt;return s;
  }
  function addAnnouncement(state,input){
    const {s,p}=teacher(state,input&&input.teacherId),i=input||{},klass=validClass(s,i.classId,p.id),body=text(i.body);if(body.length<2)throw new Error("body_required");
    s.announcements.unshift({id:uid("ann",body),classId:klass.id,teacherId:p.id,title:text(i.title)||"اعلان کلاس",body,createdAt:new Date().toISOString()});s.classroomUpdatedAt=new Date().toISOString();return s;
  }
  function addTeacherNote(state,input){
    const {s,p}=teacher(state,input&&input.teacherId),i=input||{},studentProfile=s.profiles.find(x=>x.id===i.studentId&&x.role==="student");if(!studentProfile)throw new Error("student_not_found");
    const note=text(i.note);if(note.length<2)throw new Error("note_required");s.teacherNotes.unshift({id:uid("note",note),teacherId:p.id,studentId:studentProfile.id,classId:text(i.classId),note,private:true,createdAt:new Date().toISOString()});s.classroomUpdatedAt=new Date().toISOString();return s;
  }
  function assignmentProgress(state,assignmentId){
    const s=normalizeState(state),a=s.enhancedAssignments.find(x=>x.id===assignmentId);if(!a)return null;const klass=s.classes.find(c=>c.id===a.classId),studentIds=klass?klass.studentIds||[]:[],subs=s.enhancedSubmissions.filter(x=>x.assignmentId===assignmentId),graded=subs.filter(x=>x.status==="graded"),submitted=subs.filter(x=>["submitted","graded"].includes(x.status)),avg=graded.map(x=>x.grade).filter(Number.isFinite);
    return{assignment:a,students:studentIds.length,started:subs.length,submitted:submitted.length,graded:graded.length,completionRate:studentIds.length?Math.round(submitted.length/studentIds.length*100):0,averageGrade:avg.length?Math.round(avg.reduce((a,b)=>a+b,0)/avg.length):null};
  }
  function classReport(state,classId){
    const s=normalizeState(state),klass=s.classes.find(c=>c.id===classId);if(!klass)return null;const assignments=s.enhancedAssignments.filter(a=>a.classId===classId&&!a.archived),students=(klass.studentIds||[]).map(id=>s.profiles.find(p=>p.id===id)).filter(Boolean);
    const rows=students.map(st=>{const subs=s.enhancedSubmissions.filter(x=>x.studentId===st.id&&assignments.some(a=>a.id===x.assignmentId)),grades=subs.map(x=>x.grade).filter(Number.isFinite),submitted=subs.filter(x=>["submitted","graded"].includes(x.status)).length;return{id:st.id,name:st.displayName,assignments:assignments.length,submitted,completionRate:assignments.length?Math.round(submitted/assignments.length*100):0,averageGrade:grades.length?Math.round(grades.reduce((a,b)=>a+b,0)/grades.length):null,lastActivity:subs.map(x=>x.updatedAt).sort().slice(-1)[0]||null};});
    const grades=rows.map(x=>x.averageGrade).filter(Number.isFinite);return{class:klass,generatedAt:new Date().toISOString(),students:rows,assignmentCount:assignments.length,averageGrade:grades.length?Math.round(grades.reduce((a,b)=>a+b,0)/grades.length):null,completionRate:rows.length?Math.round(rows.reduce((n,x)=>n+x.completionRate,0)/rows.length):0};
  }
  function teacherDashboard(state,teacherId){
    const s=normalizeState(state),base=Base?Base.teacherDashboard(s,teacherId):{classes:[],students:[],assignments:[],submissions:[]},classes=base.classes,ids=new Set(classes.map(c=>c.id)),assignments=s.enhancedAssignments.filter(a=>ids.has(a.classId)&&!a.archived),submissions=s.enhancedSubmissions.filter(x=>assignments.some(a=>a.id===x.assignmentId));
    return{...base,enhancedAssignments:assignments,enhancedSubmissions:submissions,announcements:s.announcements.filter(x=>ids.has(x.classId)),reports:classes.map(c=>classReport(s,c.id))};
  }
  function studentDashboard(state,studentId){
    const s=normalizeState(state),base=Base?Base.studentDashboard(s,studentId):{classes:[],assignments:[],submissions:[]};return{...base,enhancedAssignments:assignmentsForStudent(s,studentId),announcements:s.announcements.filter(x=>base.classes.some(c=>c.id===x.classId))};
  }
  function reportPayload(state,classId){
    const r=classReport(state,classId);if(!r)throw new Error("class_not_found");return{title:"GHAZAL Class Report",className:r.class.name,generatedAt:r.generatedAt,summary:{students:r.students.length,assignments:r.assignmentCount,completionRate:r.completionRate,averageGrade:r.averageGrade},students:r.students};
  }
  function serverContracts(){
    return{version:2,entities:["profiles","classes","assignments","assignment_items","submissions","submission_answers","grades","rubrics","announcements","teacher_notes"],conflictPolicy:"server-version + updatedAt; preserve local unsynced copy on conflict",offlineQueue:true,idempotencyRequired:true};
  }
  return{RUBRICS,initialExtras,normalizeState,createAssignment,assignmentsForStudent,assignmentStatus,upsertSubmission,submitAssignment,gradeSubmission,addAnnouncement,addTeacherNote,assignmentProgress,classReport,teacherDashboard,studentDashboard,reportPayload,serverContracts};
});