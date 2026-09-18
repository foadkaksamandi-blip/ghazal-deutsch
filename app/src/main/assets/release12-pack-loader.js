(function(root){
  "use strict";
  if(!root||!root.GhazalData||!Array.isArray(root.GhazalData.lessons)||typeof localStorage==="undefined")return;
  const KEY="ghazal_product_v12",LEVELS=["A1","A2","B1","B2","C1","C2"];
  function valid(l){return !!(l&&typeof l.id==="string"&&/^[a-zA-Z0-9._-]{3,120}$/.test(l.id)&&LEVELS.includes(l.level)&&typeof l.title==="string"&&typeof l.goal==="string"&&Array.isArray(l.words)&&l.words.length>=3&&l.quiz&&Array.isArray(l.quiz.options)&&Number.isInteger(l.quiz.answer)&&l.quiz.answer>=0&&l.quiz.answer<l.quiz.options.length);}
  try{
    const state=JSON.parse(localStorage.getItem(KEY)||"{}"),packs=Array.isArray(state.importedPacks)?state.importedPacks:[],ids=new Set(root.GhazalData.lessons.map(x=>x.id));
    packs.forEach(pack=>(pack.lessons||[]).forEach(l=>{if(valid(l)&&!ids.has(l.id)){root.GhazalData.lessons.push(l);ids.add(l.id);}}));
    root.GhazalImportedPackCount=packs.length;
  }catch(_){root.GhazalImportedPackCount=0;}
})(typeof window!=="undefined"?window:null);
