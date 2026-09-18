(function(root,factory){
  const api=factory(root&&root.GhazalQACore,root&&root.GhazalProductCore,root&&root.GhazalSecurityCore);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalFinalReleaseCore=api;
})(typeof window!=="undefined"?window:null,function(QA,Product,Security){
  "use strict";
  const VERSION="14.0.2";
  const VERSION_CODE=16;
  const PACKAGE_ID="com.foad.ghazaldeutsch";
  const RELEASE_NAME="GHAZAL Final";
  const SCHEMA=1;
  function now(){return new Date().toISOString();}
  function parse(v,fallback={}){try{return typeof v==="string"?JSON.parse(v):v||fallback;}catch(_){return fallback;}}
  function nativeReleaseInfo(){
    try{
      if(typeof window!=="undefined"&&window.GhazalAndroid&&typeof window.GhazalAndroid.getReleaseInfo==="function"){
        return parse(window.GhazalAndroid.getReleaseInfo(),{});
      }
    }catch(_){}
    return{version:VERSION,versionCode:VERSION_CODE,packageName:PACKAGE_ID,channel:"web",finalReleaseBuild:false,qaToolsEnabled:true,productionSigned:false,debuggable:true,assetIntegrity:false,cryptoSelfTest:false};
  }
  function qaState(storage){
    try{
      const raw=storage&&storage.getItem?storage.getItem("ghazal_qa_v1"):null;
      return QA?QA.normalize(parse(raw,{})):parse(raw,{});
    }catch(_){return QA?QA.initialState():{};}
  }
  function qaSummary(storage){
    if(!QA)return{available:false,pass:false,counts:{},criticalPending:["qa_core_missing"],criticalFailed:[]};
    const summary=QA.manualSummary(qaState(storage));
    const automated=(qaState(storage).runs||[]).slice(-1)[0]||null;
    return{available:true,pass:summary.pass&&!!(automated&&automated.pass),manual:summary,automated,counts:summary.counts,criticalPending:summary.criticalPending,criticalFailed:summary.criticalFailed};
  }
  function releaseReadiness(storage,external){
    const info=nativeReleaseInfo(),qa=qaSummary(storage),e=external||{},blockers=[];
    if(String(info.version||"")!==VERSION)blockers.push("version_mismatch");
    if(Number(info.versionCode||0)!==VERSION_CODE)blockers.push("version_code_mismatch");
    if(info.debuggable===true)blockers.push("debuggable_build");
    if(info.assetIntegrity!==true)blockers.push("asset_integrity");
    if(info.cryptoSelfTest!==true)blockers.push("crypto_self_test");
    if(info.finalReleaseBuild!==true)blockers.push("not_final_release_build");
    if(info.productionSigningConfigured!==true)blockers.push("production_signing_not_configured");
    if(info.productionSigned!==true)blockers.push("production_signature_mismatch");
    if(!qa.pass)blockers.push("stage7_device_qa");
    if(e.repositoryPrivate!==true)blockers.push("repository_privacy");
    return{ready:blockers.length===0,version:VERSION,versionCode:VERSION_CODE,packageName:PACKAGE_ID,blockers,qa,native:info,external:e,checkedAt:now()};
  }
  function privacyModel(){
    return{
      offlineCore:true,
      internetPermission:false,
      localProgress:true,
      microphone:"Only requested for speaking exercises; recognition is delegated to the Android speech service and can vary by device.",
      notifications:"Used only for local reminders.",
      backups:"Portable backups are encrypted before export when secure backup is used.",
      analytics:"No built-in network analytics in the offline release.",
      advertising:false
    };
  }
  function distributionManifest(storage,external){
    const info=nativeReleaseInfo(),gate=releaseReadiness(storage,external);
    return{
      format:"ghazal-final-release-manifest-v1",
      product:RELEASE_NAME,
      packageId:PACKAGE_ID,
      version:VERSION,
      versionCode:VERSION_CODE,
      generatedAt:now(),
      channel:info.channel||"production",
      offlineCore:true,
      productionSigned:info.productionSigned===true,
      signingSha256:info.signingSha256||"",
      assetIntegrity:info.assetIntegrity===true,
      cryptoSelfTest:info.cryptoSelfTest===true,
      debuggable:info.debuggable===true,
      stage7:{pass:gate.qa.pass,criticalPending:gate.qa.criticalPending||[],criticalFailed:gate.qa.criticalFailed||[]},
      releaseGate:{ready:gate.ready,blockers:gate.blockers},
      privacy:privacyModel()
    };
  }
  function humanStatus(storage){
    const gate=releaseReadiness(storage,{repositoryPrivate:false});
    if(gate.native.productionSigned&&gate.native.finalReleaseBuild)return{code:"production",label:"Production-signed build"};
    if(gate.native.debuggable===false)return{code:"candidate",label:"Hardened final candidate"};
    return{code:"development",label:"Development / QA build"};
  }
  return{VERSION,VERSION_CODE,PACKAGE_ID,RELEASE_NAME,SCHEMA,nativeReleaseInfo,qaState,qaSummary,releaseReadiness,privacyModel,distributionManifest,humanStatus};
});