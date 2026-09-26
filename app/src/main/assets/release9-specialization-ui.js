(function(){
  "use strict";
  const S=window.GhazalSpecialization,view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!S||!view||!modal||!box)return;
  const KEY="ghazal_specialization_progress_v1";
  let currentTrack="migration",currentLevel="",activeModule=null;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){activeModule=null;modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";}
  function head(tag,title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r9="close">×</button></div>';}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{};}catch(_){return{};}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s));}
  function done(id){return !!state()[id]?.done;}
  function mark(id,skill,score){const s=state(),x=s[id]||{attempts:0,skills:{}};x.attempts=(x.attempts||0)+1;x.skills=x.skills||{};x.skills[skill]=Math.max(Number(x.skills[skill])||0,Number(score)||0);x.updatedAt=new Date().toISOString();if((x.skills.writing||0)>=60&&(x.skills.speaking||0)>=60)x.done=true;s[id]=x;save(s);return x;}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}

  function showHub(){
    open(head("Stage 2","مسیرهای تخصصی","مهاجرت، کار، دانشگاه و آزمون با سناریو و تولید واقعی.")+
      '<div class="r9-track-grid">'+Object.values(S.tracks).map(t=>{
        const total=t.modules.length,completed=t.modules.filter(m=>done(m.id)).length;
        return '<button class="r9-track" data-r9="track" data-track="'+t.id+'"><strong>'+t.icon+' '+h(t.fa)+'</strong><small>'+completed+' / '+total+' ماژول تکمیل‌شده</small><div class="r9-progress" style="margin-top:8px"><span style="width:'+Math.round(completed/total*100)+'%"></span></div></button>';
      }).join("")+
      '<button class="r9-track" data-r9="collocations"><strong>🧠 Collocations</strong><small>'+S.collocations.length+' ترکیب پرکاربرد در چهار دامنه.</small></button>'+
      '</div>');
  }
  function showTrack(id){
    currentTrack=id;const t=S.tracks[id];if(!t)return;
    const levels=[...new Set(t.modules.map(m=>m.level))];
    if(currentLevel&&!levels.includes(currentLevel))currentLevel="";
    const items=t.modules.filter(m=>!currentLevel||m.level===currentLevel);
    open(head(t.icon+" "+t.fa,t.title,"هر ماژول: واژگان + عبارت + Writing + Speaking.")+
      '<div class="r9-levels"><button class="'+(!currentLevel?"on":"")+'" data-r9="level" data-level="">همه</button>'+levels.map(l=>'<button class="'+(currentLevel===l?"on":"")+'" data-r9="level" data-level="'+l+'">'+l+'</button>').join("")+'</div>'+
      '<div class="r9-list">'+items.map(m=>'<button class="r9-item" data-r9="module" data-id="'+m.id+'"><strong>'+h(m.level+" · "+m.fa)+'</strong><small>'+h(m.title+" — "+m.goal)+'</small>'+(done(m.id)?'<span class="r8-chip">✓ Mastery تمرینی</span>':"")+'</button>').join("")+'</div>');
  }
  function showModule(id){
    const all=Object.values(S.tracks).flatMap(t=>t.modules),m=all.find(x=>x.id===id);if(!m)return;activeModule=m;
    const st=state()[m.id]||{skills:{}};
    open(head(m.level,m.fa,m.title)+
      '<div class="r9-box"><b>هدف</b>'+h(m.goal)+'</div>'+
      '<div class="section-title"><h2>واژگان کلیدی</h2></div><div class="r9-vocab">'+m.vocabulary.map(v=>'<div><strong>'+h(v.de)+'</strong><small>'+h(v.fa)+'</small></div>').join("")+'</div>'+
      '<div class="section-title"><h2>عبارت‌های آماده</h2></div><div class="r9-box">'+m.phrases.map(p=>'<div class="r9-phrase">'+h(p)+'</div>').join("")+'</div>'+
      '<div class="button-row" style="margin-top:9px"><button class="secondary-button" data-r9="listen-phrases">🔊 شنیدن عبارت‌ها</button><button class="secondary-button" data-r9="track" data-track="'+currentTrack+'">فهرست ماژول‌ها</button></div>'+
      '<div class="section-title"><h2>Writing</h2></div><div class="r9-box">'+h(m.writing)+'</div><textarea id="r9-writing" class="r9-answer" placeholder="Deutsch schreiben…"></textarea><button class="primary-button" style="margin-top:8px" data-r9="score-writing">ثبت Writing</button>'+
      '<div class="section-title"><h2>Speaking</h2></div><div class="r9-box">'+h(m.speaking)+'</div><button class="primary-button" style="margin-top:8px" data-r9="start-speaking">🎙 شروع Speaking</button>'+
      '<div class="r9-box" style="margin-top:10px"><b>وضعیت این ماژول</b>Writing: '+(st.skills?.writing||0)+'% · Speaking: '+(st.skills?.speaking||0)+'%'+(st.done?' · ✅ تکمیل‌شده':'')+'</div>');
  }
  function scoreWriting(){
    if(!activeModule)return;const ta=document.getElementById("r9-writing");const txt=(ta?.value||"").trim(),words=txt.split(/\s+/).filter(Boolean),sent=(txt.match(/[.!?]/g)||[]).length,score=Math.min(100,Math.round(words.length*2.1+sent*8));mark(activeModule.id,"writing",score);showModule(activeModule.id);
  }
  function showCollocations(){
    const domains=[...new Set(S.collocations.map(x=>x.domain))];
    open(head("Collocations","ترکیب‌های پرکاربرد","عبارت را به‌صورت یک واحد یاد بگیر، نه ترجمه کلمه‌به‌کلمه.")+
      '<div class="r8-toolbar">'+domains.map(d=>'<button data-r9="coll-domain" data-domain="'+d+'">'+h(d)+'</button>').join("")+'</div>'+
      '<div id="r9-coll-list" class="r9-coll-list">'+renderColl("")+'</div>');
  }
  function renderColl(domain){return S.collocations.filter(x=>!domain||x.domain===domain).map(x=>'<div class="r9-coll"><strong>'+h(x.de)+'</strong><small>'+h(x.fa)+'</small><button class="r8-fav" style="margin-top:7px" data-r9="speak-coll" data-text="'+encodeURIComponent(x.de)+'">🔊</button></div>').join("");}

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r9]");if(!t)return;const a=t.dataset.r9;
    if(a==="close")close();
    else if(a==="hub")showHub();
    else if(a==="track")showTrack(t.dataset.track);
    else if(a==="level"){currentLevel=t.dataset.level||"";showTrack(currentTrack);}
    else if(a==="module")showModule(t.dataset.id);
    else if(a==="listen-phrases"&&activeModule)native("speak",activeModule.phrases.join(". "));
    else if(a==="score-writing")scoreWriting();
    else if(a==="start-speaking"&&activeModule){native("startSpeechRecognition","Deutsch sprechen");mark(activeModule.id,"speaking",70);showModule(activeModule.id);}
    else if(a==="collocations")showCollocations();
    else if(a==="coll-domain"){const el=document.getElementById("r9-coll-list");if(el)el.innerHTML=renderColl(t.dataset.domain||"");}
    else if(a==="speak-coll")native("speak",decodeURIComponent(t.dataset.text||""));
  });

  function inject(){
    if(window.GhazalStage5)return;
    const grid=view.querySelector(".skill-grid");
    if(grid&&!view.querySelector("[data-r9='hub']"))grid.insertAdjacentHTML("beforeend",'<button class="card skill-card os-accent" data-r9="hub"><span class="big-icon">🎯</span><strong>مسیرهای تخصصی</strong><small>Migration، Career، University، Exam Academy + Collocations.</small></button>');
  }
  document.addEventListener("ghazal:ui-changed",inject);setTimeout(inject,350);
})();