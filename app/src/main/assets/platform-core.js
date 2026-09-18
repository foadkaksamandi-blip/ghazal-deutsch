(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalPlatformCore=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";
  const ROLES=["guest","student","teacher","admin"];
  const API_CONTRACT={
    auth:["/v1/auth/register","/v1/auth/login","/v1/auth/refresh","/v1/auth/logout"],
    users:["/v1/users/me","/v1/users/profile"],
    progress:["/v1/progress/sync","/v1/progress/pull"],
    content:["/v1/content/manifest","/v1/content/packs"],
    classroom:["/v1/classes","/v1/classes/join","/v1/assignments","/v1/submissions"],
    ai:["/v1/ai/tutor","/v1/ai/writing","/v1/ai/conversation"],
    analytics:["/v1/events/batch"],
    entitlement:["/v1/entitlements"],
    notification:["/v1/devices/push-token"]
  };

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function text(v){return String(v==null?"":v).trim();}
  function norm(v){return text(v).toLocaleLowerCase("de-DE").replace(/[.,!?;:„“"'()\[\]{}]/g," ").replace(/\s+/g," ").trim();}
  function slug(v){return norm(v).replace(/[^a-z0-9äöüßآ-ی]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,30)||"item";}
  function uid(prefix,seed){const s=text(seed)||Date.now().toString(36);return prefix+"-"+slug(s)+"-"+Math.random().toString(36).slice(2,7);}
  function classCode(seed){const base=(text(seed)||Math.random().toString(36).slice(2,8)).toUpperCase().replace(/[^A-Z0-9]/g,"");return ("GHZ"+base).slice(0,8).padEnd(8,"X");}

  function initialState(){
    return{
      schema:1,
      market:"IR",
      mode:"offline",
      activeProfileId:null,
      profiles:[],
      classes:[],
      assignments:[],
      submissions:[],
      server:{baseUrl:"",connected:false,lastSync:null,contractVersion:1},
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
  }

  function normalizeState(raw){
    const b=initialState(),r=raw&&typeof raw==="object"?raw:{};
    return{
      ...b,...r,
      market:"IR",
      mode:r.server&&r.server.connected?"hybrid":"offline",
      profiles:Array.isArray(r.profiles)?r.profiles:[],
      classes:Array.isArray(r.classes)?r.classes:[],
      assignments:Array.isArray(r.assignments)?r.assignments:[],
      submissions:Array.isArray(r.submissions)?r.submissions:[],
      server:{...b.server,...(r.server||{})}
    };
  }

  function createProfile(state,input){
    const s=normalizeState(state),i=input||{},name=text(i.displayName);
    if(name.length<2)throw new Error("displayName");
    const role=ROLES.includes(i.role)?i.role:"student";
    const username=norm(i.username||"").replace(/\s+/g,"");
    if(username&&s.profiles.some(p=>p.username===username))throw new Error("username_exists");
    const id=text(i.id)||uid("profile",name);
    if(s.profiles.some(p=>p.id===id))throw new Error("profile_exists");
    const profile={id,displayName:name,role,username,createdAt:new Date().toISOString(),classIds:[]};
    s.profiles.push(profile);s.activeProfileId=id;s.updatedAt=new Date().toISOString();return s;
  }

  function setActiveProfile(state,id){
    const s=normalizeState(state);
    if(!s.profiles.some(p=>p.id===id))throw new Error("profile_not_found");
    s.activeProfileId=id;s.updatedAt=new Date().toISOString();return s;
  }

  function createClass(state,input){
    const s=normalizeState(state),i=input||{},teacher=s.profiles.find(p=>p.id===i.teacherId);
    if(!teacher||teacher.role!=="teacher")throw new Error("teacher_required");
    const name=text(i.name);if(name.length<2)throw new Error("class_name");
    let code=text(i.code).toUpperCase();if(!code)code=classCode(name+Date.now());
    if(s.classes.some(c=>c.code===code))throw new Error("class_code_exists");
    const id=text(i.id)||uid("class",name);
    const item={id,name,code,teacherId:teacher.id,studentIds:[],createdAt:new Date().toISOString(),archived:false};
    s.classes.push(item);
    teacher.classIds=Array.from(new Set([...(teacher.classIds||[]),id]));
    s.updatedAt=new Date().toISOString();return s;
  }

  function joinClass(state,input){
    const s=normalizeState(state),i=input||{},student=s.profiles.find(p=>p.id===i.studentId);
    if(!student||student.role!=="student")throw new Error("student_required");
    const code=text(i.code).toUpperCase(),klass=s.classes.find(c=>c.code===code&&!c.archived);
    if(!klass)throw new Error("class_not_found");
    klass.studentIds=Array.from(new Set([...(klass.studentIds||[]),student.id]));
    student.classIds=Array.from(new Set([...(student.classIds||[]),klass.id]));
    s.updatedAt=new Date().toISOString();return s;
  }

  function createAssignment(state,input){
    const s=normalizeState(state),i=input||{},klass=s.classes.find(c=>c.id===i.classId&&!c.archived);
    if(!klass||klass.teacherId!==i.teacherId)throw new Error("class_teacher_required");
    const lessonIds=Array.from(new Set((Array.isArray(i.lessonIds)?i.lessonIds:[]).map(text).filter(Boolean)));
    if(!lessonIds.length)throw new Error("lesson_required");
    const title=text(i.title)||"تکلیف GHAZAL";
    const id=text(i.id)||uid("assignment",title);
    s.assignments.push({id,classId:klass.id,teacherId:i.teacherId,title,lessonIds,dueDate:text(i.dueDate),instructions:text(i.instructions),createdAt:new Date().toISOString(),archived:false});
    s.updatedAt=new Date().toISOString();return s;
  }

  function submitAssignment(state,input){
    const s=normalizeState(state),i=input||{},assignment=s.assignments.find(a=>a.id===i.assignmentId&&!a.archived);
    const student=s.profiles.find(p=>p.id===i.studentId&&p.role==="student");
    if(!assignment||!student)throw new Error("assignment_or_student");
    const klass=s.classes.find(c=>c.id===assignment.classId);
    if(!klass||(klass.studentIds||[]).indexOf(student.id)<0)throw new Error("student_not_in_class");
    const existing=s.submissions.find(x=>x.assignmentId===assignment.id&&x.studentId===student.id);
    const payload={assignmentId:assignment.id,studentId:student.id,status:i.status==="completed"?"completed":"in_progress",score:Number.isFinite(Number(i.score))?Math.max(0,Math.min(100,Number(i.score))):null,note:text(i.note),updatedAt:new Date().toISOString()};
    if(existing)Object.assign(existing,payload);else s.submissions.push(payload);
    s.updatedAt=new Date().toISOString();return s;
  }

  function teacherDashboard(state,teacherId){
    const s=normalizeState(state),classes=s.classes.filter(c=>c.teacherId===teacherId&&!c.archived);
    const classIds=new Set(classes.map(c=>c.id)),assignments=s.assignments.filter(a=>classIds.has(a.classId)&&!a.archived);
    const studentIds=new Set();classes.forEach(c=>(c.studentIds||[]).forEach(id=>studentIds.add(id)));
    const submissions=s.submissions.filter(x=>assignments.some(a=>a.id===x.assignmentId));
    return{classes,assignments,students:s.profiles.filter(p=>studentIds.has(p.id)),submissions};
  }

  function studentDashboard(state,studentId){
    const s=normalizeState(state),classes=s.classes.filter(c=>(c.studentIds||[]).includes(studentId)&&!c.archived);
    const classIds=new Set(classes.map(c=>c.id)),assignments=s.assignments.filter(a=>classIds.has(a.classId)&&!a.archived);
    return{classes,assignments,submissions:s.submissions.filter(x=>x.studentId===studentId)};
  }

  function buildSearchIndex(data){
    const out=[];(data&&Array.isArray(data.lessons)?data.lessons:[]).forEach(l=>{
      out.push({id:"lesson:"+l.id,type:"lesson",lessonId:l.id,level:l.level,title:l.title,subtitle:l.de||"",text:[l.title,l.de,l.goal,l.pattern&&l.pattern.de,l.pattern&&l.pattern.fa].filter(Boolean).join(" ")});
      (l.words||[]).forEach((w,n)=>out.push({id:"word:"+l.id+":"+n,type:"word",lessonId:l.id,level:l.level,title:w[0],subtitle:w[1],text:w.join(" ")}));
      (l.dialogue||[]).forEach((d,n)=>out.push({id:"dialogue:"+l.id+":"+n,type:"dialogue",lessonId:l.id,level:l.level,title:d[0],subtitle:d[1],text:d.join(" ")}));
    });return out;
  }

  function search(index,query,limit){
    const q=norm(query);if(!q)return[];
    const terms=q.split(" ").filter(Boolean),max=Math.max(1,Math.min(100,Number(limit)||30));
    return(index||[]).map(item=>{const hay=norm([item.title,item.subtitle,item.text,item.level].join(" "));let score=0;terms.forEach(t=>{if(hay===t)score+=10;else if(hay.startsWith(t))score+=6;else if(hay.includes(t))score+=3;});return{...item,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||String(a.title).localeCompare(String(b.title),"de")).slice(0,max);
  }

  function serverReady(state){
    const s=normalizeState(state);
    return{market:s.market,offlineCore:true,connected:!!s.server.connected,baseUrl:s.server.baseUrl||"",contractVersion:s.server.contractVersion||1,endpoints:clone(API_CONTRACT)};
  }

  return{ROLES,API_CONTRACT,initialState,normalizeState,createProfile,setActiveProfile,createClass,joinClass,createAssignment,submitAssignment,teacherDashboard,studentDashboard,buildSearchIndex,search,serverReady};
});