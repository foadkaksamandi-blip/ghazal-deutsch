#!/usr/bin/env node
"use strict";

const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const ASSETS=path.join(ROOT,"app/src/main/assets");
const UI_FILES=[
  "index.html","app.js","os-extension.js","release3-extension.js","release4-extension.js",
  "release4-navigation.js","release5-extension.js","release6-platform.js","release7-library-ui.js",
  "release8-content-depth-ui.js","release9-specialization-ui.js","release10-stage2-ui.js",
  "release11-stage34-ui.js","release12-stage56-ui.js","release13-stage7-ui.js","release14-final-ui.js",
  "interaction-rescue.js"
];
const source={};
for(const f of UI_FILES) source[f]=fs.readFileSync(path.join(ASSETS,f),"utf8");
const all=Object.values(source).join("\n");
const checks=[];
function check(id,pass,detail){checks.push({id,pass:!!pass,detail:detail||{}});if(!pass)throw new Error(id+" failed "+JSON.stringify(detail||{}));}
function escapeRe(s){return s.replace(/[.*+?^$(){}|[\]\\]/g,"\\$&");}

const buttonTags=[];
for(const [file,text] of Object.entries(source)){
  const re=/<button\b[^>]*>/g;let m;
  while((m=re.exec(text)))buttonTags.push({file,tag:m[0]});
}
const unbound=buttonTags.filter(function(x){return !/data-(?:action|nav|os-action|r\d+)=|id=["']r4-global-close["']|type=["']submit["']/.test(x.tag);});
check("all-buttons-have-actions",unbound.length===0,{count:buttonTags.length,unbound:unbound.slice(0,20)});

const literal=[];
for(const [file,text] of Object.entries(source)){
  const re=/data-([a-zA-Z0-9-]+)=["']([^"'$<>{}]+)["']/g;let m;
  while((m=re.exec(text)))literal.push({file,ns:m[1],value:m[2]});
}
const unique=[...new Map(literal.map(function(x){return [x.ns+"|"+x.value,x];})).values()];
const interactiveNamespaces=["action","nav","os-action","r3","r4","r5","r6","r7","r8","r9","r10","r11","r12","r13","r14"];
for(const ns of interactiveNamespaces){
  const rendered=unique.some(function(x){return x.ns===ns;});
  const camel=ns.replace(/-([a-z])/g,function(_,c){return c.toUpperCase();});
  const handled=all.includes("dataset."+camel)||all.includes("[data-"+ns+"]");
  check("namespace-"+ns,!rendered||handled,{rendered,handled});
}
const orphanActions=[];
for(const x of unique.filter(function(x){return x.ns==="action";})){
  const count=(all.match(new RegExp(escapeRe(x.value),"g"))||[]).length;
  if(count<2)orphanActions.push(Object.assign({},x,{count}));
}
check("no-orphan-base-actions",orphanActions.length===0,{orphanActions});

const critical=[
  "open-settings","open-lesson","start-review","quick-quiz","start-listening","show-errors",
  "start-placement","skip-placement","finish-onboarding","export-backup","import-backup","retake-assessment"
];
const missingCritical=critical.filter(function(x){
  const rendered=all.includes('data-action="'+x+'"');
  const handled=all.includes('action === "'+x+'"')||all.includes('action === "start-placement" || action === "retake-assessment"');
  return !(rendered&&handled);
});
check("critical-base-actions",missingCritical.length===0,{missingCritical});
for(const nav of ["home","path","practice","migration","profile"])check("nav-"+nav,all.includes('data-nav="'+nav+'"'),{});

const rescue=source["interaction-rescue.js"];
for(const ns of interactiveNamespaces){
  const selector=ns==="os-action"?"[data-os-action]":"[data-"+ns+"]";
  check("rescue-"+ns,rescue.includes(selector),{selector});
}
check("rescue-native-api",rescue.includes("nativeTap")&&rescue.includes("elementFromPoint")&&rescue.includes("target.click()"),{});
check("direct-first-run",source["app.js"].includes('id="ghz-welcome-root"')&&source["app.js"].includes('document.body.classList.add("onboarding-active")'),{});

const css=fs.readFileSync(path.join(ASSETS,"styles.css"),"utf8");
check("modal-backdrop-nontouch",/\.modal-backdrop\s*\{[\s\S]*?pointer-events:\s*none\s*!important/.test(css),{});
check("modal-sheet-touchable",/\.modal-sheet\s*\{[\s\S]*?pointer-events:\s*auto\s*!important/.test(css),{});

const report={format:"ghazal-ui-integrity-audit-v1",generatedAt:new Date().toISOString(),pass:true,buttons:buttonTags.length,literalControls:unique.length,checks};
fs.mkdirSync(path.join(ROOT,"qa"),{recursive:true});
fs.writeFileSync(path.join(ROOT,"qa/ui-integrity-audit.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify({pass:true,buttons:buttonTags.length,literalControls:unique.length,checks:checks.length},null,2));
