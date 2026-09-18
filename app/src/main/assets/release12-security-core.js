(function(root,factory){
  const api=factory(root&&root.GhazalProductCore);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalSecurityCore=api;
})(typeof window!=="undefined"?window:null,function(Product){
  "use strict";
  const VERSION=2;
  const SENSITIVE_KEY_PATTERNS=[/api[_-]?key/i,/secret/i,/token/i,/password/i,/private[_-]?key/i,/client[_-]?secret/i,/authorization/i];
  function now(){return new Date().toISOString();}
  function native(method,...args){try{if(typeof window!=="undefined"&&window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}return undefined;}
  function scanObject(value,path,out){
    if(!value||typeof value!=="object")return out;
    Object.entries(value).forEach(([k,v])=>{const p=(path?path+".":"")+k;if(SENSITIVE_KEY_PATTERNS.some(re=>re.test(k))&&typeof v==="string"&&v.trim())out.push({path:p,length:v.length});if(v&&typeof v==="object")scanObject(v,p,out);});return out;
  }
  function localSecretAudit(storage){
    const findings=[];if(storage){for(let i=0;i<storage.length;i++){const k=storage.key(i),v=storage.getItem(k);if(!k)continue;if(SENSITIVE_KEY_PATTERNS.some(re=>re.test(k))&&v)findings.push({path:k,length:v.length});try{scanObject(JSON.parse(v),k,findings);}catch(_){}}}
    return{pass:findings.length===0,findings};
  }
  function nativeReport(){
    let raw=native("getSecurityReport");if(typeof raw==="string"){try{return JSON.parse(raw);}catch(_){}}
    return{appLock:native("isAppLockEnabled")!==false,deviceSecurity:native("isDeviceSecurityAvailable")!==false,privacyScreen:native("isPrivacyScreenEnabled")===true,rootRisk:native("isDeviceCompromised")===true,assetIntegrity:native("verifyBundledAssets")!==false,cryptoSelfTest:native("runCryptoSelfTest")!==false,debuggable:native("isDebuggableBuild")===true};
  }
  function evaluate(storage){
    const n=nativeReport(),secret=localSecretAudit(storage),checks=[
      {id:"device-security",label:"Device credential / biometric available",pass:n.deviceSecurity===true,severity:"high"},
      {id:"app-lock",label:"App lock enabled",pass:n.appLock===true,severity:"high"},
      {id:"privacy-screen",label:"Privacy screen enabled",pass:n.privacyScreen===true,severity:"medium"},
      {id:"root",label:"No obvious root compromise detected",pass:n.rootRisk!==true,severity:"high"},
      {id:"hooks",label:"No debugger/hook risk detected",pass:n.hookRisk!==true&&n.debugger!==true,severity:"high"},
      {id:"asset-integrity",label:"Bundled asset integrity verified",pass:n.assetIntegrity===true,severity:"high"},
      {id:"crypto",label:"Android Keystore AES-GCM self-test",pass:n.cryptoSelfTest===true,severity:"high"},
      {id:"debuggable",label:"Build is non-debuggable",pass:n.debuggable!==true,severity:"high"},
      {id:"secrets",label:"No secrets/API keys found in local app state",pass:secret.pass,severity:"high"},
      {id:"cleartext",label:"Cleartext traffic disabled by manifest",pass:n.cleartextDisabled!==false,severity:"high"}
    ];
    const high=checks.filter(x=>x.severity==="high"),score=Math.round(checks.filter(x=>x.pass).length/checks.length*100);
    return{version:VERSION,at:now(),pass:high.every(x=>x.pass),score,checks,native:n,localSecretAudit:secret,limitations:["Root/hook detection is risk detection, not a guarantee.","Production signing identity cannot be finalized until the permanent private signing key is configured outside the repository."]};
  }
  async function sealProductState(storage){
    if(!Product)return{ok:false,reason:"product_core_missing"};const payload=await Product.buildBackup(storage,{purpose:"secure-snapshot"}),json=JSON.stringify(payload);native("saveSecureSnapshot",json);const loaded=native("loadSecureSnapshot");if(typeof loaded!=="string"||!loaded)return{ok:false,reason:"snapshot_unavailable"};let parsed;try{parsed=JSON.parse(loaded);}catch(_){return{ok:false,reason:"snapshot_parse"};}const verified=await Product.verifyBackup(parsed);return{ok:verified.valid,digest:verified.digest,bytes:json.length};
  }
  async function verifySealedState(){
    if(!Product)return{ok:false,reason:"product_core_missing"};const loaded=native("loadSecureSnapshot");if(typeof loaded!=="string"||!loaded)return{ok:false,reason:"snapshot_missing"};try{const parsed=JSON.parse(loaded),v=await Product.verifyBackup(parsed);return{ok:v.valid,reason:v.reason,digest:v.digest};}catch(_){return{ok:false,reason:"snapshot_parse"};}
  }
  function releaseGate(storage){
    const e=evaluate(storage),n=e.native;const blockers=[];
    if(!e.pass)blockers.push("security_checks");
    if(n.debuggable===true)blockers.push("debuggable_build");
    if(!n.signingSha256)blockers.push("signing_identity_unavailable");
    if(n.productionSigned!==true)blockers.push("permanent_production_signing_not_confirmed");
    return{ready:blockers.length===0,blockers,security:e,rule:"Public distribution requires a permanent production signing key; QA signing is not accepted as production signing."};
  }
  return{VERSION,SENSITIVE_KEY_PATTERNS,localSecretAudit,nativeReport,evaluate,sealProductState,verifySealedState,releaseGate};
});