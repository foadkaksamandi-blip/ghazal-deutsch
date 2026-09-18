#!/usr/bin/env node
"use strict";

import {spawn} from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT=path.resolve(new URL("..",import.meta.url).pathname);
const OUT=path.join(ROOT,"qa","browser");
fs.mkdirSync(OUT,{recursive:true});
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function findChrome(){for(const p of [process.env.CHROME_BIN,"/usr/bin/google-chrome","/usr/bin/google-chrome-stable","/usr/bin/chromium","/usr/bin/chromium-browser"].filter(Boolean)){if(fs.existsSync(p))return p;}throw new Error("Chrome/Chromium binary not found");}
async function pollJson(url,tries=80){let last;for(let i=0;i<tries;i++){try{const r=await fetch(url);if(r.ok)return await r.json();last=new Error("HTTP "+r.status);}catch(e){last=e;}await sleep(250);}throw last||new Error("poll failed "+url);}
class Cdp{
  constructor(url){this.url=url;this.ws=null;this.seq=0;this.pending=new Map();}
  async connect(){this.ws=new WebSocket(this.url);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("CDP connect timeout")),8000);this.ws.onopen=()=>{clearTimeout(timer);resolve();};this.ws.onerror=e=>{clearTimeout(timer);reject(e.error||new Error("CDP websocket error"));};});this.ws.onmessage=e=>{const msg=JSON.parse(String(e.data));if(msg.id&&this.pending.has(msg.id)){const p=this.pending.get(msg.id);this.pending.delete(msg.id);if(msg.error)p.reject(new Error(JSON.stringify(msg.error)));else p.resolve(msg.result);}};}
  call(method,params={}){const id=++this.seq;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(this.pending.has(id)){this.pending.delete(id);reject(new Error("CDP timeout "+method));}},10000);});}
  async eval(expression){const r=await this.call("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw new Error("JS exception: "+JSON.stringify(r.exceptionDetails));return r.result&&r.result.value;}
  close(){try{this.ws&&this.ws.close();}catch(_){}}
}
function must(condition,message,detail){if(!condition)throw new Error(message+(detail?" :: "+JSON.stringify(detail):""));}
async function waitFor(cdp,expression,timeout=7000){const end=Date.now()+timeout;let value;while(Date.now()<end){value=await cdp.eval(expression);if(value)return value;await sleep(100);}throw new Error("waitFor timeout: "+expression+" last="+JSON.stringify(value));}

const chrome=findChrome();
const server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1","--directory",path.join(ROOT,"app/src/main/assets")],{cwd:ROOT,stdio:["ignore","pipe","pipe"]});
const chromeProc=spawn(chrome,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--remote-debugging-port=9222","--user-data-dir=/tmp/ghazal-browser-smoke-"+process.pid,"http://127.0.0.1:8765/index.html"],{cwd:ROOT,stdio:["ignore","pipe","pipe"]});
let cdp;
const evidence={format:"ghazal-browser-ui-smoke-v1",startedAt:new Date().toISOString(),checks:[]};
function pass(id,detail={}){evidence.checks.push({id,pass:true,detail});}
try{
  const pages=await pollJson("http://127.0.0.1:9222/json");
  const page=pages.find(x=>x.type==="page"&&x.webSocketDebuggerUrl)||pages.find(x=>x.webSocketDebuggerUrl);
  must(page,"No Chrome debug page",pages);
  cdp=new Cdp(page.webSocketDebuggerUrl);await cdp.connect();await cdp.call("Runtime.enable");
  await waitFor(cdp,"document.readyState==='complete'");
  await waitFor(cdp,"window.GhazalBaseReady===true");
  const boot=await cdp.eval("(()=>({buttons:document.querySelectorAll('button').length,onboarding:!!document.getElementById('ghz-welcome-root'),rescue:!!window.GhazalInteractionRescue,baseReady:window.GhazalBaseReady===true}))()");
  must(boot.buttons>=8,"Too few buttons at boot",boot);must(boot.onboarding,"First-run screen missing on clean profile",boot);must(boot.rescue&&boot.baseReady,"Interaction runtime not ready",boot);pass("boot",boot);
  await cdp.eval("document.getElementById('ghz-skip-placement').click(); true");
  await waitFor(cdp,"(()=>{try{return JSON.parse(localStorage.getItem('ghazal_deutsch_state_v1')||'{}').onboardingDone===true}catch(e){return false}})()");
  await sleep(450);
  const reminder=await cdp.eval("!document.getElementById('modal').hidden");
  if(reminder){await cdp.eval("(()=>{const b=[...document.querySelectorAll(\"[data-action='close-modal']\")].find(x=>x.textContent.includes('فعلاً نه'))||document.querySelector(\"[data-action='close-modal']\");if(b)b.click();return !!b})()");await sleep(250);}
  await waitFor(cdp,"!!document.querySelector('.hero')");pass("onboarding-skip-button");
  const navCases=[["path","مسیر تسلط"],["practice","تمرین"],["migration","مهاجرت"],["profile","پیشرفت"],["home","سلام"]];
  for(const [nav,needle] of navCases){const clicked=await cdp.eval("(()=>{const b=document.querySelector('[data-nav=\\\""+nav+"\\\"]');if(!b)return false;b.click();return true})()");must(clicked,"Missing nav button "+nav);await sleep(180);const state=await cdp.eval("(()=>({active:document.querySelector('[data-nav].active')?.dataset.nav||'',text:document.getElementById('view')?.innerText||''}))()");must(state.active===nav,"Nav did not activate "+nav,state);must(state.text.includes("+JSON.stringify(needle)+"),"Nav view content mismatch "+nav,state);pass("nav-"+nav,{active:state.active});}
  await cdp.eval("document.querySelector('[data-nav=\\\"home\\\"]').click(); true");await sleep(200);
  const lessonClicked=await cdp.eval("(()=>{const b=document.querySelector(\"[data-action='open-lesson']\");if(!b)return false;b.click();return true})()");must(lessonClicked,"No lesson button");
  await waitFor(cdp,"document.getElementById('modal').hidden===false");const lessonModal=await cdp.eval("document.getElementById('modal-content').innerText");must(lessonModal&&lessonModal.length>20,"Lesson modal empty");pass("open-lesson");
  await cdp.eval("(()=>{const b=document.querySelector(\"[data-action='close-modal']\");if(b)b.click();return !!b})()");await sleep(150);
  await cdp.eval("document.querySelector(\"[data-action='quick-quiz']\").click(); true");await waitFor(cdp,"document.getElementById('modal').hidden===false");
  const quizOptions=await cdp.eval("document.querySelectorAll(\"[data-action='answer-quick']\").length");must(quizOptions>=2,"Quick quiz has no answer buttons",{quizOptions});pass("quick-quiz",{quizOptions});
  const interaction=await cdp.eval("window.GhazalInteractionRescue.diagnostics()");must(interaction&&interaction.ready,"Interaction rescue diagnostics unavailable",interaction);pass("interaction-rescue",interaction);
  const runtimeErrors=await cdp.eval("(()=>{try{return (JSON.parse(localStorage.getItem('ghazal_qa_v1')||'{}').runtimeErrors||[]).slice(-10)}catch(e){return [{message:String(e)}]}})()");
  must(Array.isArray(runtimeErrors),"Runtime error ledger unreadable");const severe=runtimeErrors.filter(x=>x&&x.message&&!/ResizeObserver loop/i.test(x.message));must(severe.length===0,"Runtime JavaScript errors detected",severe);pass("runtime-errors",{count:severe.length});
  evidence.pass=true;evidence.completedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,"browser-ui-smoke.json"),JSON.stringify(evidence,null,2));console.log(JSON.stringify({pass:true,checks:evidence.checks.map(x=>x.id)},null,2));
}catch(err){evidence.pass=false;evidence.error=String(err&&err.stack||err);evidence.completedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,"browser-ui-smoke.json"),JSON.stringify(evidence,null,2));console.error(evidence.error);process.exitCode=1;}
finally{if(cdp)cdp.close();try{chromeProc.kill("SIGTERM");}catch(_){}try{server.kill("SIGTERM");}catch(_){}}
