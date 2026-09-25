(function(root){
  "use strict";
  const SCHEMA=1;
  let release={};
  try{
    if(root&&root.GhazalAndroid&&typeof root.GhazalAndroid.getReleaseInfo==="function"){
      release=JSON.parse(root.GhazalAndroid.getReleaseInfo()||"{}");
    }
  }catch(_){release={};}
  const api={SCHEMA,versionCode:Number(release.versionCode)||0,version:String(release.version||""),loadedAt:Date.now()};
  if(root)root.GhazalUpgradeRuntime=api;
  if(typeof document!=="undefined"&&document.documentElement){
    document.documentElement.setAttribute("data-ghz-upgrade-schema",String(SCHEMA));
    document.documentElement.setAttribute("data-ghz-native-version-code",String(api.versionCode||0));
  }
  if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:null);
