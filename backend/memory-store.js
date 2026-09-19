"use strict";
const {randomId}=require("./crypto");
function createMemoryStore(){
 const users=new Map(),byEmail=new Map(),refresh=new Map(),progress=new Map(),conflicts=[],classes=[],members=[],assignments=[],subs=[],grades=[],ann=[],events=[],ents=[],devices=[],idem=new Map(),rates=new Map();
 const userView=u=>u&&({id:u.id,email:u.email,displayName:u.displayName,role:u.role,createdAt:u.createdAt});
 return{
  async health(){return{ok:true,dbTime:new Date().toISOString()};},
  async createUser(x){if(byEmail.has(x.email)){const e=new Error("duplicate");e.code="23505";throw e;}const u={id:randomId("usr"),...x,createdAt:new Date().toISOString()};users.set(u.id,u);byEmail.set(u.email,u.id);return userView(u);},
  async getUserByEmail(email){const u=users.get(byEmail.get(email));return u?{...userView(u),passwordHash:u.passwordHash}:null;},
  async getUserById(id){return userView(users.get(id))||null;},
  async updateProfile(id,i){const u=users.get(id);if(!u)return null;if(i.displayName)u.displayName=i.displayName;return userView(u);},
  async saveRefreshToken(x){refresh.set(x.hash,{...x,revokedAt:null});},
  async getRefreshToken(h){return refresh.get(h)||null;},
  async revokeRefreshToken(h){const r=refresh.get(h);if(r)r.revokedAt=new Date().toISOString();},
  async replaceRefreshToken(oldHash,next){const r=refresh.get(oldHash);if(!r||r.revokedAt||new Date(r.expiresAt)<=new Date())return null;r.revokedAt=new Date().toISOString();refresh.set(next.hash,{...next,userId:r.userId,revokedAt:null});return{userId:r.userId};},
  async getProgress(uid,pid){return progress.get(uid+":"+pid)||{profileId:pid,version:0,data:{},updatedAt:null};},
  async syncProgress(uid,pid,base,data,deviceId){const k=uid+":"+pid,cur=progress.get(k)||{profileId:pid,version:0,data:{}};if(Number(base)!==Number(cur.version)){const c={id:randomId("cnf"),profileId:pid,clientVersion:Number(base),serverVersion:cur.version,clientData:data,serverData:cur.data,createdAt:new Date().toISOString()};conflicts.push({uid,...c});return{conflict:true,server:cur};}const next={profileId:pid,version:cur.version+1,data,deviceId,updatedAt:new Date().toISOString()};progress.set(k,next);return{conflict:false,server:next};},
  async listConflicts(uid,pid){return conflicts.filter(x=>x.uid===uid&&(!pid||x.profileId===pid)).map(({uid,...x})=>x);},
  async listClasses(uid){return classes.filter(c=>c.teacherId===uid||members.some(m=>m.classId===c.id&&m.userId===uid));},
  async createClass(uid,i){const c={id:randomId("cls"),name:i.name,code:Math.random().toString(36).slice(2,8).toUpperCase(),teacherId:uid,createdAt:new Date().toISOString()};classes.push(c);return c;},
  async joinClass(uid,code){const c=classes.find(x=>x.code===code);if(!c)return null;if(!members.some(m=>m.classId===c.id&&m.userId===uid))members.push({classId:c.id,userId:uid});return c;},
  async listAssignments(uid){const ids=new Set((await this.listClasses(uid)).map(x=>x.id));return assignments.filter(a=>ids.has(a.classId));},
  async createAssignment(uid,i){const c=classes.find(x=>x.id===i.classId&&x.teacherId===uid);if(!c)return null;const a={id:randomId("asg"),teacherId:uid,...i,createdAt:new Date().toISOString()};assignments.push(a);return a;},
  async listSubmissions(uid){return subs.filter(s=>s.studentId===uid||assignments.some(a=>a.id===s.assignmentId&&a.teacherId===uid));},
  async upsertSubmission(uid,i){const a=assignments.find(x=>x.id===i.assignmentId);if(!a||!members.some(m=>m.classId===a.classId&&m.userId===uid))return null;let s=subs.find(x=>x.assignmentId===i.assignmentId&&x.studentId===uid);if(!s){s={id:randomId("sub"),assignmentId:i.assignmentId,studentId:uid};subs.push(s);}Object.assign(s,{answers:i.answers||{},status:i.status||"in_progress",updatedAt:new Date().toISOString()});return s;},
  async listGrades(uid){return grades.filter(g=>{const s=subs.find(x=>x.id===g.submissionId);const a=s&&assignments.find(x=>x.id===s.assignmentId);return s&&(s.studentId===uid||a?.teacherId===uid);});},
  async gradeSubmission(uid,i){const s=subs.find(x=>x.id===i.submissionId),a=s&&assignments.find(x=>x.id===s.assignmentId);if(!a||a.teacherId!==uid)return null;let g=grades.find(x=>x.submissionId===s.id);if(!g){g={id:randomId("grd"),submissionId:s.id};grades.push(g);}Object.assign(g,{grade:i.grade,rubric:i.rubric||{},comment:i.comment||"",updatedAt:new Date().toISOString()});return g;},
  async listAnnouncements(uid){const ids=new Set((await this.listClasses(uid)).map(x=>x.id));return ann.filter(x=>ids.has(x.classId));},
  async createAnnouncement(uid,i){const c=classes.find(x=>x.id===i.classId&&x.teacherId===uid);if(!c)return null;const a={id:randomId("ann"),teacherId:uid,...i,createdAt:new Date().toISOString()};ann.push(a);return a;},
  async insertEvents(uid,es){events.push(...es.map(x=>({uid,...x})));return{accepted:Math.min(es.length,100)};},
  async getEntitlements(uid){return ents.filter(x=>x.userId===uid);},
  async upsertPushToken(uid,i){devices.push({uid,...i});return{ok:true};},
  async getIdempotency(uid,key){return idem.get(uid+":"+key)||null;},
  async putIdempotency(uid,key,statusCode,body){idem.set(uid+":"+key,{statusCode,body});},
  async consumeRateLimit(subject,route,limit,windowSec){const b=Math.floor(Date.now()/1000/windowSec),k=[subject,route,b].join(":");const count=(rates.get(k)||0)+1;rates.set(k,count);return{allowed:count<=limit,count,limit,resetAt:(b+1)*windowSec*1000};}
 };
}
module.exports={createMemoryStore};
