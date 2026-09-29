(function(root,factory){
  const api=factory(
    root&&root.GhazalPlatformCore,
    root&&root.GhazalClassroomCore,
    root&&root.GhazalData,
    root&&root.GhazalExerciseEngine,
    root&&root.GhazalStage4Tutor
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalStage6=api;
})(typeof window!=="undefined"?window:null,function(Platform,Classroom,Data,Exercises,Tutor){
  "use strict";
  const VERSION="6.0.0";
  const SCHEMA=1;
  const STORAGE_KEY="ghazal_platform_v1";
  const VISIBLE_ROLES=["student","teacher"];

  function text(v){return String(v==null?"":v).trim();}
  function requireCore(){
    if(!Platform||!Classroom)throw new Error("stage6_dependencies_missing");
  }
  function normalize(state){requireCore();return Classroom.normalizeState(state||{});}
  function activeProfile(state){
    const s=normalize(state);
    return s.profiles.find(p=>p.id===s.activeProfileId)||null;
  }
  function roleFa(role){
    return role==="teacher"?"استاد":role==="student"?"زبان‌آموز":role==="admin"?"مدیر":"مهمان";
  }
  function createProfile(state,input){
    requireCore();const i=input||{},role=VISIBLE_ROLES.includes(i.role)?i.role:"student";
    return Platform.createProfile(normalize(state),{id:text(i.id)||undefined,displayName:i.displayName,username:i.username,role});
  }
  function setActiveProfile(state,id){requireCore();return Platform.setActiveProfile(normalize(state),id);}
  function createClass(state,input){
    requireCore();const i=input||{};
    return Platform.createClass(normalize(state),{id:text(i.id)||undefined,teacherId:i.teacherId,name:i.name,code:i.code});
  }
  function joinClass(state,input){
    requireCore();return Platform.joinClass(normalize(state),{studentId:input&&input.studentId,code:input&&input.code});
  }
  function lessonById(id){
    return Data&&Array.isArray(Data.lessons)?Data.lessons.find(x=>x.id===id):null;
  }
  function exerciseById(id){
    return Exercises&&Array.isArray(Exercises.exercises)?Exercises.exercises.find(x=>x.id===id):null;
  }
  function buildAssignmentItems(input){
    const i=input||{},lesson=lessonById(i.lessonId);
    if(!lesson)throw new Error("lesson_not_found");
    const items=[{kind:"lesson",refId:lesson.id,required:true}];
    let ex=null;
    if(i.exerciseId)ex=exerciseById(i.exerciseId);
    else if(i.exerciseType&&Exercises&&Array.isArray(Exercises.exercises))ex=Exercises.exercises.find(x=>x.level===lesson.level&&x.type===i.exerciseType);
    if(i.includeExercise||i.exerciseId||i.exerciseType){
      if(!ex)throw new Error("exercise_not_found");
      items.push({kind:"exercise",refId:ex.id,required:i.exerciseRequired!==false});
    }
    if(text(i.writingPrompt))items.push({kind:"writing",prompt:text(i.writingPrompt),required:i.writingRequired!==false});
    if(text(i.speakingPrompt))items.push({kind:"speaking",prompt:text(i.speakingPrompt),required:i.speakingRequired!==false});
    return items;
  }
  function createAssignment(state,input){
    requireCore();const i=input||{},items=buildAssignmentItems(i);
    return Classroom.createAssignment(normalize(state),{
      id:text(i.id)||undefined,
      teacherId:i.teacherId,
      classId:i.classId,
      title:i.title,
      instructions:i.instructions,
      dueDate:i.dueDate,
      items,
      published:i.published!==false
    });
  }
  function assignmentsForStudent(state,studentId){
    requireCore();return Classroom.assignmentsForStudent(normalize(state),studentId);
  }
  function itemContext(state,studentId,assignmentId,itemId){
    const a=assignmentsForStudent(state,studentId).find(x=>x.id===assignmentId);
    if(!a)throw new Error("assignment_not_found");
    const item=a.items.find(x=>x.id===itemId);
    if(!item)throw new Error("item_not_found");
    const lessonItem=a.items.find(x=>x.kind==="lesson"),lesson=lessonItem?lessonById(lessonItem.refId):null;
    return{assignment:a,item,level:lesson&&lesson.level||"A1"};
  }
  function evaluateProductive(kind,value,level,prompt){
    const v=text(value);
    if(!v)return{score:null,detail:null};
    if(!Tutor)return{score:null,detail:null};
    if(kind==="writing"&&typeof Tutor.evaluateWriting==="function"){
      const r=Tutor.evaluateWriting(v,level,prompt||"");
      return{score:Number.isFinite(Number(r&&r.total))?Number(r.total):null,detail:r||null};
    }
    if(kind==="speaking"&&typeof Tutor.evaluateSpeaking==="function"){
      const r=Tutor.evaluateSpeaking(v,level,prompt||"");
      return{score:Number.isFinite(Number(r&&r.total))?Number(r.total):null,detail:r||null};
    }
    return{score:null,detail:null};
  }
  function saveAnswer(state,input){
    requireCore();const i=input||{},ctx=itemContext(state,i.studentId,i.assignmentId,i.itemId),item=ctx.item;
    let payload={studentId:i.studentId,assignmentId:i.assignmentId,itemId:i.itemId};
    if(item.kind==="lesson"){
      payload.completed=i.completed===true;
      payload.score=payload.completed?(Number.isFinite(Number(i.score))?Number(i.score):100):null;
    }else if(item.kind==="exercise"){
      const ex=exerciseById(item.refId);if(!ex)throw new Error("exercise_not_found");
      const answer=text(i.text),score=Number.isFinite(Number(i.score))?Number(i.score):(Exercises&&typeof Exercises.compare==="function"?Exercises.compare(answer,ex.answer):null);
      payload.text=answer;payload.score=score;payload.confidence=i.confidence;payload.completed=score!=null&&score>=60;
    }else if(item.kind==="writing"){
      const ev=evaluateProductive("writing",i.text,ctx.level,item.prompt);
      payload.text=text(i.text);payload.score=Number.isFinite(Number(i.score))?Number(i.score):ev.score;payload.completed=payload.text.length>0;
    }else if(item.kind==="speaking"){
      const transcript=text(i.transcript||i.text),ev=evaluateProductive("speaking",transcript,ctx.level,item.prompt);
      payload.transcript=transcript;payload.score=Number.isFinite(Number(i.score))?Number(i.score):ev.score;payload.completed=transcript.length>0;
    }
    return Classroom.upsertSubmission(normalize(state),payload);
  }
  function submitAssignment(state,input){
    requireCore();return Classroom.submitAssignment(normalize(state),input||{});
  }
  function gradeSubmission(state,input){
    requireCore();return Classroom.gradeSubmission(normalize(state),input||{});
  }
  function teacherDashboard(state,teacherId){requireCore();return Classroom.teacherDashboard(normalize(state),teacherId);}
  function studentDashboard(state,studentId){requireCore();return Classroom.studentDashboard(normalize(state),studentId);}
  function classReport(state,classId){requireCore();return Classroom.classReport(normalize(state),classId);}
  function reportPayload(state,classId){requireCore();return Classroom.reportPayload(normalize(state),classId);}
  function serverReadiness(state){
    requireCore();
    const platform=Platform.serverReady(normalize(state)),classroom=Classroom.serverContracts();
    return{
      offlineFirst:true,
      localClassCodes:true,
      crossDeviceSync:false,
      currentScope:"same-device-offline",
      futureRoles:["student","teacher","admin"],
      platform,
      classroom,
      note:"کد کلاس در نسخه فعلی فقط بین پروفایل‌های همین دستگاه کار می‌کند؛ Sync بین دستگاه‌ها بعد از Backend واقعی فعال می‌شود."
    };
  }
  function readStorage(storage){
    try{return normalize(JSON.parse(storage.getItem(STORAGE_KEY)||"{}"));}catch(_){return normalize({});}
  }
  function writeStorage(storage,state){
    const s=normalize(state);storage.setItem(STORAGE_KEY,JSON.stringify(s));return s;
  }
  function audit(){
    const issues=[];
    if(!Platform)issues.push("platform_core_missing");
    if(!Classroom)issues.push("classroom_core_missing");
    if(!Data||!Array.isArray(Data.lessons)||!Data.lessons.length)issues.push("lesson_universe_missing");
    if(!Exercises||!Array.isArray(Exercises.exercises)||!Exercises.exercises.length)issues.push("exercise_universe_missing");
    if(Classroom&&typeof Classroom.serverContracts==="function"){
      const c=Classroom.serverContracts();
      if(!c.offlineQueue||!c.idempotencyRequired)issues.push("server_contract_incomplete");
    }else issues.push("server_contract_missing");
    return{pass:issues.length===0,issues,version:VERSION,schema:SCHEMA};
  }
  return{
    VERSION,SCHEMA,STORAGE_KEY,VISIBLE_ROLES,roleFa,normalize,activeProfile,
    createProfile,setActiveProfile,createClass,joinClass,buildAssignmentItems,createAssignment,
    assignmentsForStudent,saveAnswer,submitAssignment,gradeSubmission,teacherDashboard,studentDashboard,
    classReport,reportPayload,serverReadiness,readStorage,writeStorage,audit
  };
});
