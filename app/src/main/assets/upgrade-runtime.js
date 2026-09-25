(function(root){
  "use strict";
  const SCHEMA=1;
  const api={SCHEMA,loadedAt:Date.now()};
  if(root)root.GhazalUpgradeRuntime=api;
  if(typeof document!=="undefined"&&document.documentElement){
    document.documentElement.setAttribute("data-ghz-upgrade-schema",String(SCHEMA));
  }
  if(typeof module==="object"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:null);
