"use strict";
const crypto=require("crypto");
const {hashPassword,verifyPassword,signAccessToken,verifyAccessToken,issueRefreshToken,hashOpaque}=require("./crypto");
const {manifest,packs,getPack}=require("./content");
const {callAI}=require("./ai");
function json(res,status,body,headers={}){res.statusCode=status;res.setHeader("content-type","application/json; charset=utf-8");Object.entries(headers).forEach(([k,v])=>res.setHeader(k,v));if(status===204)return res.end();res.end(JSON.stringify(body));}
function readBody(req,max=1024*1024){return new Promise((resolve,reject)=>{let s="";req.on("data",c=>{s+=c;if(Buffer.byteLength(s)>max){reject(Object.assign(new Error("body_too_large"),{status:413}));req.destroy();}});req.on("end",()=>{try{resolve(s?JSON.parse(s):{});}catch(_){reject(Object.assign(new Error("invalid_json"),{status:400}));}});req.on("error",reject);});}
const emailOk=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)&&e.length<=200;
function createApp({store,config}){
 if(!store)throw new Error("store_required");if(!config)throw new Error("config_required");
 const access=u=>signAccessToken({sub:u.id,role:u.role,email:u.email},config.tokenSecret,config.accessTtl);
 async function auth(req){const m=String(req.headers.authorization||"").match(/^Bearer\s+(.+)$/i);const p=m&&verifyAccessToken(m[1],config.tokenSecret);if(!p)return null;const u=await store.getUserById(p.sub);return u?{...u,token:p}:null;}
 function originHeaders(req){const o=String(req.headers.origin||"");if(!o)return{};if(config.allowedOrigins.includes("*")||config.allowedOrigins.includes(o))return{"access-control-allow-origin":o,"vary":"Origin","access-control-allow-headers":"authorization,content-type,x-idempotency-key","access-control-allow-methods":"GET,POST,PATCH,OPTIONS"};return{};}
 async function handler(req,res){
  const requestId=String(req.headers["x-request-id"]||crypto.randomUUID());res.setHeader("x-request-id",requestId);res.setHeader("x-content-type-options","nosniff");res.setHeader("referrer-policy","no-referrer");res.setHeader("cache-control","no-store");Object.entries(originHeaders(req)).forEach(([k,v])=>res.setHeader(k,v));
  if(req.method==="OPTIONS"){res.statusCode=204;return res.end();}
  const u=new URL(req.url,"http://localhost");let path=u.pathname;if(path==="/api")path="/"+(u.searchParams.get("route")||"");path=path.replace(/\/{2,}/g,"/");
  try{
   const subject=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0].trim();const lim=path.startsWith("/v1/auth/")?20:180;const rl=await store.consumeRateLimit(subject,path,lim,60);res.setHeader("x-ratelimit-limit",String(rl.limit));res.setHeader("x-ratelimit-remaining",String(Math.max(0,rl.limit-rl.count)));if(!rl.allowed)return json(res,429,{error:"rate_limited",requestId});
   if(path==="/healthz"||path==="/v1/health"){const h=await store.health();return json(res,200,{ok:true,service:"ghazal-backend",release:config.release,database:h.ok,aiConfigured:!!config.aiApiKey,requestId});}
   if(path==="/v1/auth/register"&&req.method==="POST"){const b=await readBody(req),email=String(b.email||"").trim().toLowerCase(),name=String(b.displayName||"").trim(),role=b.role==="teacher"?"teacher":"student";if(!emailOk(email)||name.length<2||name.length>80)return json(res,400,{error:"invalid_registration",requestId});let user;try{user=await store.createUser({email,passwordHash:hashPassword(String(b.password||"")),displayName:name,role});}catch(e){if(e.code==="23505"||e.message==="duplicate")return json(res,409,{error:"email_exists",requestId});throw e;}const rt=issueRefreshToken(),expiresAt=new Date(Date.now()+config.refreshTtl*1000);await store.saveRefreshToken({hash:rt.hash,userId:user.id,expiresAt,deviceId:b.deviceId});return json(res,201,{user,accessToken:access(user),expiresIn:config.accessTtl,refreshToken:rt.raw,requestId});}
   if(path==="/v1/auth/login"&&req.method==="POST"){const b=await readBody(req),email=String(b.email||"").trim().toLowerCase(),user=await store.getUserByEmail(email);if(!user||!verifyPassword(String(b.password||""),user.passwordHash))return json(res,401,{error:"invalid_credentials",requestId});const rt=issueRefreshToken(),expiresAt=new Date(Date.now()+config.refreshTtl*1000);await store.saveRefreshToken({hash:rt.hash,userId:user.id,expiresAt,deviceId:b.deviceId});delete user.passwordHash;return json(res,200,{user,accessToken:access(user),expiresIn:config.accessTtl,refreshToken:rt.raw,requestId});}
   if(path==="/v1/auth/refresh"&&req.method==="POST"){const b=await readBody(req),old=hashOpaque(String(b.refreshToken||"")),rt=issueRefreshToken(),expiresAt=new Date(Date.now()+config.refreshTtl*1000),rot=await store.replaceRefreshToken(old,{hash:rt.hash,expiresAt,deviceId:b.deviceId});if(!rot)return json(res,401,{error:"invalid_refresh_token",requestId});const user=await store.getUserById(rot.userId);if(!user)return json(res,401,{error:"user_disabled",requestId});return json(res,200,{accessToken:access(user),expiresIn:config.accessTtl,refreshToken:rt.raw,requestId});}
   if(path==="/v1/auth/logout"&&req.method==="POST"){const b=await readBody(req);if(b.refreshToken)await store.revokeRefreshToken(hashOpaque(b.refreshToken));return json(res,204,{});}
   const user=await auth(req);if(!user)return json(res,401,{error:"unauthorized",requestId});
   const idemKey=String(req.headers["x-idempotency-key"]||"").slice(0,128);if(idemKey&&["POST","PATCH"].includes(req.method)){const old=await store.getIdempotency(user.id,idemKey);if(old)return json(res,old.statusCode,old.body,{"x-idempotency-replayed":"true"});}
   async function reply(status,body){if(idemKey&&["POST","PATCH"].includes(req.method)&&status<500)await store.putIdempotency(user.id,idemKey,status,body);return json(res,status,{...body,requestId});}
   if(path==="/v1/users/me"&&req.method==="GET")return reply(200,{user});
   if(path==="/v1/users/profile"&&["POST","PATCH"].includes(req.method)){const b=await readBody(req);if(b.displayName&&String(b.displayName).trim().length<2)return reply(400,{error:"invalid_display_name"});return reply(200,{user:await store.updateProfile(user.id,{displayName:String(b.displayName||"").trim()||null})});}
   if(path==="/v1/progress/pull"&&req.method==="GET"){const pid=u.searchParams.get("profileId")||user.id;return reply(200,{progress:await store.getProgress(user.id,pid)});}
   if(path==="/v1/progress/sync"&&req.method==="POST"){const b=await readBody(req),pid=String(b.profileId||user.id),base=Number(b.baseVersion||0);if(!b.data||typeof b.data!=="object")return reply(400,{error:"progress_data_required"});const r=await store.syncProgress(user.id,pid,base,b.data,String(b.deviceId||""));return reply(r.conflict?409:200,r);}
   if(path==="/v1/progress/conflicts"&&req.method==="GET")return reply(200,{conflicts:await store.listConflicts(user.id,u.searchParams.get("profileId"))});
   if(path==="/v1/content/manifest"&&req.method==="GET")return reply(200,{manifest});
   if(path==="/v1/content/packs"&&req.method==="GET")return reply(200,{packs});
   const packMatch=path.match(/^\/v1\/content\/packs\/([^/]+)$/);if(packMatch&&req.method==="GET"){const p=getPack(decodeURIComponent(packMatch[1]));return p?reply(200,{pack:p}):reply(404,{error:"pack_not_found"});}
   if(path==="/v1/classes"&&req.method==="GET")return reply(200,{classes:await store.listClasses(user.id)});
   if(path==="/v1/classes"&&req.method==="POST"){if(user.role!=="teacher")return reply(403,{error:"teacher_required"});const b=await readBody(req),name=String(b.name||"").trim();if(name.length<2)return reply(400,{error:"class_name_required"});return reply(201,{class:await store.createClass(user.id,{name})});}
   if(path==="/v1/classes/join"&&req.method==="POST"){const b=await readBody(req),c=await store.joinClass(user.id,String(b.code||"").trim().toUpperCase());return c?reply(200,{class:c}):reply(404,{error:"class_not_found"});}
   if(path==="/v1/assignments"&&req.method==="GET")return reply(200,{assignments:await store.listAssignments(user.id)});
   if(path==="/v1/assignments"&&req.method==="POST"){if(user.role!=="teacher")return reply(403,{error:"teacher_required"});const b=await readBody(req);if(!b.classId||!b.title||!Array.isArray(b.items))return reply(400,{error:"assignment_invalid"});const a=await store.createAssignment(user.id,b);return a?reply(201,{assignment:a}):reply(403,{error:"class_teacher_required"});}
   if(path==="/v1/submissions"&&req.method==="GET")return reply(200,{submissions:await store.listSubmissions(user.id)});
   if(path==="/v1/submissions"&&req.method==="POST"){const b=await readBody(req);if(!b.assignmentId)return reply(400,{error:"assignment_required"});const s=await store.upsertSubmission(user.id,b);return s?reply(200,{submission:s}):reply(403,{error:"submission_not_allowed"});}
   if(path==="/v1/grades"&&req.method==="GET")return reply(200,{grades:await store.listGrades(user.id)});
   if(path==="/v1/grades"&&req.method==="POST"){if(user.role!=="teacher")return reply(403,{error:"teacher_required"});const b=await readBody(req);if(!b.submissionId||!Number.isFinite(Number(b.grade)))return reply(400,{error:"grade_invalid"});const g=await store.gradeSubmission(user.id,{...b,grade:Math.max(0,Math.min(100,Number(b.grade)))});return g?reply(200,{grade:g}):reply(403,{error:"grade_not_allowed"});}
   if(path==="/v1/announcements"&&req.method==="GET")return reply(200,{announcements:await store.listAnnouncements(user.id)});
   if(path==="/v1/announcements"&&req.method==="POST"){if(user.role!=="teacher")return reply(403,{error:"teacher_required"});const b=await readBody(req);if(!b.classId||String(b.body||"").trim().length<2)return reply(400,{error:"announcement_invalid"});const a=await store.createAnnouncement(user.id,b);return a?reply(201,{announcement:a}):reply(403,{error:"class_teacher_required"});}
   const aiMatch=path.match(/^\/v1\/ai\/(tutor|writing|conversation)$/);if(aiMatch&&req.method==="POST"){const b=await readBody(req,256*1024);const r=await callAI(config,aiMatch[1],b,user);return r.available?reply(200,r):reply(503,r);}
   if(path==="/v1/events/batch"&&req.method==="POST"){const b=await readBody(req);if(!Array.isArray(b.events))return reply(400,{error:"events_required"});return reply(202,await store.insertEvents(user.id,b.events));}
   if(path==="/v1/entitlements"&&req.method==="GET")return reply(200,{entitlements:await store.getEntitlements(user.id)});
   if(path==="/v1/devices/push-token"&&req.method==="POST"){const b=await readBody(req);if(!b.pushToken||String(b.pushToken).length>4096)return reply(400,{error:"push_token_invalid"});return reply(200,await store.upsertPushToken(user.id,b));}
   return reply(404,{error:"not_found"});
  }catch(e){console.error("ghazal_backend_error",{requestId,message:e.message,stack:config.env==="development"?e.stack:undefined});return json(res,e.status||500,{error:e.status?e.message:"internal_error",requestId});}
 }
 return handler;
}
module.exports={createApp,readBody};
