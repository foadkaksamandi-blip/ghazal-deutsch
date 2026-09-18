(function(root){
  "use strict";
  if(!root||typeof localStorage==="undefined")return;
  const KEY="ghazal_qa_v1";
  function load(){try{return root.GhazalQACore?root.GhazalQACore.normalize(JSON.parse(localStorage.getItem(KEY)||"{}")):JSON.parse(localStorage.getItem(KEY)||"{}");}catch(_){return root.GhazalQACore?root.GhazalQACore.initialState():{};}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(_){}}
  function record(input){try{const core=root.GhazalQACore;if(!core)return;save(core.recordRuntimeError(load(),input));}catch(_){}}
  root.addEventListener("error",e=>record({type:"window.error",message:e.message,source:e.filename,line:e.lineno,column:e.colno,stack:e.error&&e.error.stack}));
  root.addEventListener("unhandledrejection",e=>record({type:"unhandledrejection",message:e.reason&&e.reason.message||String(e.reason||"rejection"),stack:e.reason&&e.reason.stack}));
  const started=performance&&performance.now?performance.now():0;
  root.addEventListener("load",()=>{try{const ms=Math.round((performance.now?performance.now():0)-started),s=load();s.lastLoadMs=ms;s.updatedAt=new Date().toISOString();save(s);}catch(_){}},{once:true});
  root.GhazalRuntimeQuality={key:KEY,load,save,record};
})(typeof window!=="undefined"?window:null);
