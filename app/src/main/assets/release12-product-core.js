(function(root,factory){
  const api=factory(
    root&&root.GhazalContentSystem,
    root&&root.GhazalDictionary,
    root&&root.GhazalPlatformCore,
    root&&root.GhazalLearningEngine,
    root&&root.GhazalClassroomCore
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalProductCore=api;
})(typeof window!=="undefined"?window:null,function(Content,Dictionary,Platform,Learning,Classroom){
  "use strict";
  const PRODUCT_VERSION="14.0.2";
  const PRODUCT_SCHEMA=4;
  const BACKUP_SCHEMA=2;
  const KEY="ghazal_product_v12";
  const LEVELS=["A1","A2","B1","B2","C1","C2"];
  const BUILTIN_PACKS=[
    {id:"core-curriculum",title:"A1–C2 Core Curriculum",kind:"core",required:true,source:"bundled"},
    {id:"dictionary",title:"Internal Dictionary",kind:"language",required:true,source:"bundled"},
    {id:"migration",title:"Migration & Administration",kind:"track",required:false,source:"bundled"},
    {id:"career",title:"Career German",kind:"track",required:false,source:"bundled"},
    {id:"university",title:"University German",kind:"track",required:false,source:"bundled"},
    {id:"exams",title:"Goethe · telc · TestDaF · ÖSD",kind:"exam",required:false,source:"bundled"},
    {id:"human-audio",title:"Licensed Human Audio",kind:"audio",required:false,source:"bundled"},
    {id:"classroom",title:"Classroom Pro",kind:"product",required:false,source:"bundled"}
  ];
  const API_CONTRACT_V2={
    auth:{version:1,endpoints:["/v1/auth/register","/v1/auth/login","/v1/auth/refresh","/v1/auth/logout"]},
    users:{version:1,endpoints:["/v1/users/me","/v1/users/profile"]},
    progress:{version:2,endpoints:["/v1/progress/sync","/v1/progress/pull","/v1/progress/conflicts"]},
    content:{version:2,endpoints:["/v1/content/manifest","/v1/content/packs","/v1/content/packs/:id"]},
    classroom:{version:2,endpoints:["/v1/classes","/v1/classes/join","/v1/assignments","/v1/submissions","/v1/grades","/v1/announcements"]},
    ai:{version:1,endpoints:["/v1/ai/tutor","/v1/ai/writing","/v1/ai/conversation"]},
    analytics:{version:1,endpoints:["/v1/events/batch"]},
    entitlement:{version:1,endpoints:["/v1/entitlements"]},
    notification:{version:1,endpoints:["/v1/devices/push-token"]}
  };
  function now(){return new Date().toISOString();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function text(v){return String(v==null?"":v).trim();}
  function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0));}
  function defaults(){return{
    schema:PRODUCT_SCHEMA,
    version:PRODUCT_VERSION,
    accessibility:{fontScale:1,highContrast:false,reducedMotion:false,largeTargets:false,speechRate:.88},
    reminder:{enabled:false,time:"19:00",title:"GHAZAL",body:"وقت تمرین آلمانی است."},
    offline:{enabledPacks:Object.fromEntries(BUILTIN_PACKS.map(p=>[p.id,true])),lastAudit:null},
    resume:null,
    history:[],
    importedPacks:[],
    reportPreferences:{includeClassroom:true,includeErrors:true,includeMastery:true},
    privacy:{analyticsOptIn:false},
    updatedAt:now()
  };}
  function normalize(raw){
    const b=defaults(),r=raw&&typeof raw==="object"?raw:{};
    return{...b,...r,schema:PRODUCT_SCHEMA,version:PRODUCT_VERSION,
      accessibility:{...b.accessibility,...(r.accessibility||{})},
      reminder:{...b.reminder,...(r.reminder||{})},
      offline:{...b.offline,...(r.offline||{}),enabledPacks:{...b.offline.enabledPacks,...((r.offline||{}).enabledPacks||{})}},
      history:Array.isArray(r.history)?r.history.slice(-500):[],
      importedPacks:Array.isArray(r.importedPacks)?r.importedPacks:[],
      reportPreferences:{...b.reportPreferences,...(r.reportPreferences||{})},
      privacy:{...b.privacy,...(r.privacy||{})}
    };
  }
  function readStorage(storage){
    if(storage){try{return normalize(JSON.parse(storage.getItem(KEY)||"{}"));}catch(_){}}
    return defaults();
  }
  function writeStorage(storage,state){const s=normalize(state);s.updatedAt=now();if(storage)storage.setItem(KEY,JSON.stringify(s));return s;}
  function setResume(state,input){
    const s=normalize(state),i=input||{};s.resume={route:text(i.route),action:text(i.action),id:text(i.id),step:Math.max(0,Number(i.step)||0),level:text(i.level),payload:i.payload&&typeof i.payload==="object"?clone(i.payload):{},at:now()};s.history.push({kind:"resume",...s.resume});s.history=s.history.slice(-500);return s;
  }
  function clearResume(state){const s=normalize(state);s.resume=null;return s;}
  function semver(v){return text(v).split(".").slice(0,3).map(x=>Math.max(0,parseInt(x,10)||0));}
  function compareVersion(a,b){const x=semver(a),y=semver(b);for(let i=0;i<3;i++){if(x[i]>y[i])return 1;if(x[i]<y[i])return-1;}return 0;}
  function validLesson(l){
    return !!(l&&typeof l.id==="string"&&/^[a-zA-Z0-9._-]{3,120}$/.test(l.id)&&LEVELS.includes(l.level)&&typeof l.title==="string"&&l.title.length>=2&&l.title.length<=180&&typeof l.goal==="string"&&Array.isArray(l.words)&&l.words.length>=3&&l.words.length<=30&&l.words.every(w=>Array.isArray(w)&&w.length>=2&&w.length<=3&&w.every(x=>typeof x==="string"&&x.length<=500))&&l.quiz&&Array.isArray(l.quiz.options)&&l.quiz.options.length>=2&&l.quiz.options.length<=6&&Number.isInteger(l.quiz.answer)&&l.quiz.answer>=0&&l.quiz.answer<l.quiz.options.length);
  }
  function validatePack(pack,currentVersion){
    const p=pack&&typeof pack==="object"?pack:{},errors=[];
    if(p.format!=="ghazal-content-pack-v2")errors.push("format");
    if(!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(text(p.id)))errors.push("id");
    if(!/^\d+\.\d+\.\d+$/.test(text(p.version)))errors.push("version");
    if(p.minAppVersion&&compareVersion(currentVersion||PRODUCT_VERSION,p.minAppVersion)<0)errors.push("app_too_old");
    if(!Array.isArray(p.lessons)||p.lessons.length<1||p.lessons.length>500)errors.push("lessons");
    const ids=new Set();(p.lessons||[]).forEach(l=>{if(!validLesson(l))errors.push("lesson_schema:"+text(l&&l.id));if(l&&ids.has(l.id))errors.push("duplicate:"+l.id);if(l)ids.add(l.id);});
    if(p.scripts||p.html||p.javascript||p.executable)errors.push("executable_content_forbidden");
    const size=JSON.stringify(p).length;if(size>2_000_000)errors.push("pack_too_large");
    return{valid:errors.length===0,errors,size,trust:p.signature&&p.keyId?"signed-unverified":"local-untrusted"};
  }
  function installPack(state,pack,currentVersion){
    const s=normalize(state),v=validatePack(pack,currentVersion);if(!v.valid)throw new Error(v.errors.join(","));
    const clean={format:"ghazal-content-pack-v2",id:pack.id,version:pack.version,minAppVersion:pack.minAppVersion||"0.0.0",title:text(pack.title)||pack.id,lessons:clone(pack.lessons),installedAt:now(),trust:v.trust,signature:text(pack.signature),keyId:text(pack.keyId)};
    const idx=s.importedPacks.findIndex(x=>x.id===clean.id);if(idx>=0){if(compareVersion(clean.version,s.importedPacks[idx].version)<0)throw new Error("downgrade_blocked");s.importedPacks[idx]=clean;}else s.importedPacks.push(clean);
    return s;
  }
  function removePack(state,id){const s=normalize(state);s.importedPacks=s.importedPacks.filter(x=>x.id!==id);return s;}
  function contentPackStatus(state){
    const s=normalize(state),built=BUILTIN_PACKS.map(p=>({...p,installed:true,enabled:s.offline.enabledPacks[p.id]!==false,version:PRODUCT_VERSION,trust:"bundled-trusted"})),imp=s.importedPacks.map(p=>({id:p.id,title:p.title,kind:"imported",required:false,source:"local",installed:true,enabled:true,version:p.version,trust:p.trust}));
    return built.concat(imp);
  }
  function setPackEnabled(state,id,enabled){const s=normalize(state);const p=BUILTIN_PACKS.find(x=>x.id===id);if(!p)throw new Error("pack_not_found");if(p.required&&!enabled)throw new Error("required_pack");s.offline.enabledPacks[id]=!!enabled;return s;}
  function collectStorage(storage){
    const keys={};if(!storage)return keys;
    for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k&&k.startsWith("ghazal_"))keys[k]=storage.getItem(k);}
    return keys;
  }
  function canonical(value){
    if(value===null||typeof value!=="object")return JSON.stringify(value);
    if(Array.isArray(value))return"["+value.map(canonical).join(",")+"]";
    return"{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+canonical(value[k])).join(",")+"}";
  }
  async function sha256(textValue){
    const data=new TextEncoder().encode(String(textValue));const hash=await crypto.subtle.digest("SHA-256",data);return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  async function buildBackup(storage,meta){
    const data=collectStorage(storage),payload={format:"ghazal-full-backup-v2",schema:BACKUP_SCHEMA,productVersion:PRODUCT_VERSION,createdAt:now(),meta:meta&&typeof meta==="object"?clone(meta):{},data};
    payload.integrity={algorithm:"SHA-256",digest:await sha256(canonical(payload.data))};return payload;
  }
  async function verifyBackup(payload){
    const p=payload&&typeof payload==="object"?payload:{};if(p.format!=="ghazal-full-backup-v2"||p.schema!==BACKUP_SCHEMA||!p.data||typeof p.data!=="object")return{valid:false,reason:"format"};
    const digest=await sha256(canonical(p.data));return{valid:digest===p.integrity?.digest,reason:digest===p.integrity?.digest?"ok":"digest_mismatch",digest};
  }
  async function restoreBackup(storage,payload){
    const check=await verifyBackup(payload);if(!check.valid)throw new Error(check.reason);const allowed=Object.entries(payload.data).filter(([k,v])=>k.startsWith("ghazal_")&&typeof v==="string");allowed.forEach(([k,v])=>storage.setItem(k,v));return{restored:allowed.length,productVersion:payload.productVersion};
  }
  function buildReport(storage){
    const raw=collectStorage(storage),safeParse=v=>{try{return JSON.parse(v||"{}");}catch(_){return{};}};
    const app=safeParse(raw.ghazal_deutsch_state_v1),platform=safeParse(raw.ghazal_platform_v1),product=safeParse(raw[KEY]),learningKeys=Object.keys(raw).filter(k=>k.startsWith("ghazal_learning_v2_")),learning=learningKeys.map(k=>safeParse(raw[k]));
    const active=platform.profiles?.find(p=>p.id===platform.activeProfileId)||app.profile||{};
    const currentLearning=learning.find(x=>x.profileId===active.id)||learning[0]||{};
    return{title:"GHAZAL Learning Report",generatedAt:now(),version:PRODUCT_VERSION,profile:{name:active.displayName||active.name||"Learner",role:active.role||"student",level:currentLearning.currentLevel||app.profile?.level||"A1"},progress:{completedLessons:app.progress?.completedLessons?.length||0,xp:app.progress?.xp||0,streak:app.progress?.streak||0},skills:currentLearning.skills||{},errors:Object.values(currentLearning.errors||{}).filter(x=>!x.resolved).slice(0,20),classes:(platform.classes||[]).filter(c=>(active.classIds||[]).includes(c.id)||c.teacherId===active.id).map(c=>({name:c.name,code:c.code})),settings:{accessibility:product.accessibility||{}}};
  }
  function offlineAudit(state,context){
    const s=normalize(state),ctx=context||{},packs=contentPackStatus(s),checks=[
      {id:"core",pass:packs.some(p=>p.id==="core-curriculum"&&p.installed&&p.enabled),label:"Core curriculum installed"},
      {id:"search",pass:!!(Content&&Content.index&&Content.index.length),label:"Internal search index ready"},
      {id:"dictionary",pass:!!(Dictionary&&(Dictionary.all||Dictionary.curated)),label:"Internal dictionary ready"},
      {id:"learning",pass:!!Learning,label:"Adaptive learning engine ready"},
      {id:"classroom",pass:!!Classroom,label:"Classroom model ready"},
      {id:"tts",pass:ctx.tts!==false,label:"German TTS available"},
      {id:"speech",pass:ctx.speech!==false,label:"Speech recognition available or gracefully optional"},
      {id:"storage",pass:ctx.storage!==false,label:"Local storage available"}
    ];s.offline.lastAudit={at:now(),checks};return{state:s,pass:checks.every(x=>x.pass),checks};
  }
  function architecture(){
    return{productVersion:PRODUCT_VERSION,productSchema:PRODUCT_SCHEMA,offlineFirst:true,market:"IR",clients:{android:{status:"active",storage:"local+native-secure"},web:{status:"contract-ready",storage:"IndexedDB/local equivalent"},ios:{status:"contract-ready",storage:"Keychain+local equivalent"}},api:clone(API_CONTRACT_V2),sync:{strategy:"offline-outbox + idempotency + server version conflict resolution",requiredForCore:false},content:{manifestVersion:2,packFormat:"ghazal-content-pack-v2",noExecutablePackContent:true},auth:{offlineLocalProfiles:true,serverAccountFuture:true}};
  }
  return{PRODUCT_VERSION,PRODUCT_SCHEMA,BACKUP_SCHEMA,KEY,BUILTIN_PACKS,API_CONTRACT_V2,defaults,normalize,readStorage,writeStorage,setResume,clearResume,compareVersion,validLesson,validatePack,installPack,removePack,contentPackStatus,setPackEnabled,collectStorage,canonical,sha256,buildBackup,verifyBackup,restoreBackup,buildReport,offlineAudit,architecture};
});