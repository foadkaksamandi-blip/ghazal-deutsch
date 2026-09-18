(function(){
  "use strict";
  const Q=window.GhazalQACore,R=window.GhazalRuntimeQuality,modal=document.getElementById("modal"),box=document.getElementById("modal-content"),view=document.getElementById("view");
  if(!Q||!modal||!box||!view)return;
  const KEY="ghazal_qa_v1";let state=load(),activeCase=null;
  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function load(){try{return Q.normalize(JSON.parse(localStorage.getItem(KEY)||"{}"));}catch(_){return Q.initialState();}}
  function save(){state=Q.normalize(state);state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){activeCase=null;modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";}
  function head(tag,title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r13="close">×</button></div>';}
  function toast(m){native("toast",m);}
  function device(){try{return JSON.parse(native("getDeviceReport")||"{}");}catch(_){return{};}}
  function latest(){return state.runs&&state.runs.length?state.runs[state.runs.length-1]:null;}
  function statusFa(s){return s==="pass"?"PASS":s==="fail"?"FAIL":s==="skip"?"SKIP":"PENDING";}
  function statusClass(s){return s==="pass"?"r13-pass":s==="fail"?"r13-fail":"r13-pending";}

  function hub(){
    const last=latest(),manual=Q.manualSummary(state),dev=device(),auto=last?last.pass:false;
    open(head("Stage 7","Heavy QA Center","آزمون خودکار سنگین + ماتریس تست واقعی گوشی + Evidence قابل خروجی.")+
      '<div class="r13-kpis"><div class="r13-kpi"><b>'+(auto?"PASS":"—")+'</b><span>Automated Critical</span></div><div class="r13-kpi"><b>'+manual.counts.pass+'/'+Q.MANUAL_CASES.length+'</b><span>Manual Passed</span></div><div class="r13-kpi"><b>'+state.runtimeErrors.length+'</b><span>Runtime Errors</span></div></div>'+
      '<div class="r13-progress"><span style="width:'+Math.round(manual.counts.pass/Q.MANUAL_CASES.length*100)+'%"></span></div>'+
      '<div class="r13-grid" style="margin-top:10px">'+
      '<button class="r13-card" data-r13="auto"><strong>🧪 Full Automated QA</strong><small>محتوا، Engine، Classroom، Backup، Offline، Storage، Security و Runtime.</small></button>'+
      '<button class="r13-card" data-r13="manual"><strong>📱 Device Matrix</strong><small>'+Q.MANUAL_CASES.length+' سناریوی تست واقعی روی گوشی.</small></button>'+
      '<button class="r13-card" data-r13="errors"><strong>🧯 Runtime Errors</strong><small>Window error و unhandled rejection محلی.</small></button>'+
      '<button class="r13-card" data-r13="device"><strong>📟 Device Report</strong><small>Android، RAM، Speech، TTS، Security و Signature.</small></button>'+
      '<button class="r13-card" data-r13="readiness"><strong>🚦 Stage 7 Gate</strong><small>هیچ Manual Critical را خودکار PASS فرض نمی‌کند.</small></button>'+
      '<button class="r13-card" data-r13="export"><strong>📤 Export Evidence</strong><small>خروجی JSON قابل نگهداری برای QA.</small></button>'+
      '</div>'+
      '<div class="r13-warning" style="margin-top:10px">تست‌های خودکار می‌توانند کد و APK را تأیید کنند، اما لمس واقعی، میکروفون، اعلان، Reboot، Backup/Restore و رفتار دستگاه باید روی گوشی اجرا و در Device Matrix ثبت شوند.</div>');
  }

  async function runAuto(){
    open(head("Automated QA","در حال اجرای تست‌های داخل اپ","هیچ داده‌ای برای سرور ارسال نمی‌شود.")+'<div class="r13-box"><span class="r13-spinner"></span> در حال بررسی…</div>');
    const start=performance.now(),dev=device();
    try{
      const result=await Q.runAutomated(state,localStorage,{device:dev,durationMs:0});
      state=result.state;result.run.durationMs=Math.round(performance.now()-start);state.runs[state.runs.length-1]=result.run;save();autoResult(result.run);
    }catch(err){
      state=Q.recordRuntimeError(state,{type:"qa-run",message:err.message,stack:err.stack});save();open(head("Automated QA","FAIL","خود QA Runner خطا داد.")+'<div class="r13-danger">'+h(err.message)+'</div>');
    }
  }
  function autoResult(run){
    const passed=run.checks.filter(x=>x.pass).length;
    open(head("Automated QA",run.pass?"CRITICAL PASS":"CRITICAL FAIL",passed+"/"+run.checks.length+" checks · "+run.durationMs+"ms")+
      '<div class="r13-box">'+run.checks.map(x=>'<div class="r13-row"><span><strong>'+h(x.id)+'</strong><small>'+h(x.category)+(x.critical?" · critical":"")+'</small></span><b class="'+(x.pass?"r13-pass":"r13-fail")+'">'+(x.pass?"PASS":"FAIL")+'</b></div>').join("")+'</div>'+
      (run.failed.length?'<div class="r13-danger" style="margin-top:9px">Failed: '+h(run.failed.join(", "))+'</div>':''));
  }

  function manual(){
    const sum=Q.manualSummary(state),cats=[...new Set(Q.MANUAL_CASES.map(x=>x.category))];
    let html=head("Device Matrix","تست واقعی گوشی",sum.counts.pass+" PASS · "+sum.counts.fail+" FAIL · "+sum.counts.pending+" PENDING");
    cats.forEach(cat=>{html+='<div class="r13-category">'+h(cat.toUpperCase())+'</div><div class="r13-list">'+sum.rows.filter(x=>x.category===cat).map(x=>'<button class="r13-item" data-r13="case" data-id="'+h(x.id)+'"><strong>'+(x.critical?"🔴 ":"")+h(x.title)+'</strong><small>'+h(x.steps)+'</small><span class="r13-status '+statusClass(x.result.status)+'">'+statusFa(x.result.status)+'</span></button>').join("")+'</div>';});
    open(html);
  }
  function manualCase(id){
    const c=Q.MANUAL_CASES.find(x=>x.id===id);if(!c)return;activeCase=c;const r=state.manual[id]||{status:"pending",note:""};
    open(head(c.category,c.title,c.critical?"Critical release test":"Device test")+
      '<div class="r13-box">'+h(c.steps)+'</div>'+
      '<textarea id="r13-note" class="r13-note" style="margin-top:9px" placeholder="یادداشت / مدل گوشی / نتیجه…">'+h(r.note||"")+'</textarea>'+
      '<div class="r13-toolbar"><button data-r13="case-status" data-status="pass">✅ PASS</button><button data-r13="case-status" data-status="fail">❌ FAIL</button><button data-r13="case-status" data-status="skip">⏭ SKIP</button><button data-r13="case-status" data-status="pending">↺ PENDING</button></div>');
  }
  function setCase(status){
    if(!activeCase)return;state=Q.setManual(state,activeCase.id,status,document.getElementById("r13-note")?.value||"",device());save();toast(activeCase.title+" → "+statusFa(status));manual();
  }

  function errors(){
    const rows=(state.runtimeErrors||[]).slice().reverse();
    open(head("Runtime Errors","خطاهای ثبت‌شده محلی",rows.length+" مورد")+
      (rows.length?'<div class="r13-list">'+rows.map(x=>'<div class="r13-item"><strong>'+h(x.type+" · "+x.message)+'</strong><small>'+h(x.at+" · "+x.source+":"+x.line)+'</small></div>').join("")+'</div>':'<div class="r13-box">خطای Runtime ثبت نشده.</div>')+
      (rows.length?'<button class="secondary-button" style="margin-top:9px" data-r13="clear-errors">پاک‌کردن Log QA</button>':''));
  }
  function deviceView(){
    const d=device();open(head("Device Report",d.model||"Android","گزارش از خود دستگاه و Build فعلی")+'<div class="r13-device">'+h(JSON.stringify(d,null,2))+'</div>');
  }
  function readiness(){
    const d=device(),r=Q.releaseReadiness(state,latest(),{productionSigning:d.productionSigned===true,repositoryPrivate:false});
    open(head("Stage 7 Gate",r.ready?"READY":"BLOCKED","Stage 8 فقط بعد از عبور واقعی Gate.")+
      '<div class="r13-kpis"><div class="r13-kpi"><b>'+(r.automated?.pass?"PASS":"FAIL")+'</b><span>Automated</span></div><div class="r13-kpi"><b>'+(r.manual.pass?"PASS":"OPEN")+'</b><span>Device Matrix</span></div><div class="r13-kpi"><b>'+(d.productionSigned?"YES":"NO")+'</b><span>Prod Signing</span></div></div>'+
      '<div class="r13-box" style="margin-top:9px">'+(r.blockers.length?r.blockers.map(x=>'• '+h(x)).join("<br>"):'✅ هیچ Blocker باقی نمانده')+'</div>'+
      '<div class="r13-warning" style="margin-top:9px">Repository privacy و Production Signing متعلق به Stage 8 هستند؛ Device Matrix متعلق به Stage 7 و باید روی گوشی واقعی تکمیل شود.</div>');
  }
  function exportEvidence(){const e=Q.evidence(state,device());native("exportQaEvidence",JSON.stringify(e));}

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r13]");if(!t)return;const a=t.dataset.r13;
    if(a==="close")close();else if(a==="hub")hub();else if(a==="auto")runAuto();else if(a==="manual")manual();else if(a==="case")manualCase(t.dataset.id);else if(a==="case-status")setCase(t.dataset.status);else if(a==="errors")errors();else if(a==="clear-errors"){state.runtimeErrors=[];save();errors();}else if(a==="device")deviceView();else if(a==="readiness")readiness();else if(a==="export")exportEvidence();
  });

  function inject(){const grid=view.querySelector(".skill-grid");if(grid&&!view.querySelector("[data-r13='hub']"))grid.insertAdjacentHTML("beforeend",'<button class="card skill-card os-accent" data-r13="hub"><span class="big-icon">🧪</span><strong>Stage 7 · Heavy QA</strong><small>Automated QA + Device Matrix + Evidence.</small></button>');const settings=view.querySelector(".settings-card");if(settings&&!view.querySelector(".r13-qa-entry"))settings.insertAdjacentHTML("beforebegin",'<button class="card skill-card r13-qa-entry" style="width:100%;margin-bottom:10px" data-r13="hub"><span class="big-icon">✅</span><strong>QA Center</strong><small>کنترل نهایی قبل از Release.</small></button>');}
  window.GhazalQAStage7={runAutomated:runAuto,state:()=>state,manual:()=>Q.manualSummary(state),evidence:()=>Q.evidence(state,device())};
  const obs=new MutationObserver(inject);obs.observe(view,{childList:true,subtree:true});setTimeout(inject,550);
})();