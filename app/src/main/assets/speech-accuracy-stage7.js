(function(){
  "use strict";

  const DATA=window.GhazalData||{lessons:[]};
  const modal=document.getElementById("modal-content");
  const previousSpeechResult=window.onSpeechResult;

  function normalize(value){
    return String(value==null?"":value)
      .toLocaleLowerCase("de-DE")
      .replace(/ß/g,"ss")
      .replace(/\[unk\]/g," unk ")
      .replace(/[.,!?;:„“\"'()]/g," ")
      .replace(/\s+/g," ")
      .trim();
  }

  function lessonTarget(lesson){
    return (lesson&&lesson.pattern&&lesson.pattern.de)||
      (lesson&&lesson.dialogue&&lesson.dialogue[0]&&lesson.dialogue[0][0])||"";
  }

  function visibleLesson(){
    if(!modal)return null;
    const badge=String(modal.querySelector(".level-badge")?.textContent||"");
    if(!/4\s*\/\s*5/.test(badge))return null;
    const level=(badge.match(/\b(A1|A2|B1|B2|C1|C2)\b/)||[])[1]||"";
    const goal=String(modal.querySelector(".r5-task > strong")?.textContent||"").trim();
    if(!goal)return null;
    const lesson=(DATA.lessons||[]).find(l=>String(l.goal||"").trim()===goal&&(!level||l.level===level));
    if(!lesson)return null;
    const target=lessonTarget(lesson);
    return target?{lesson,target}:null;
  }

  function templateAnchors(target){
    const raw=String(target||"");
    if(!/(…|\.{2,}|\/|_{2,})/.test(raw))return [];
    return raw
      .replace(/…|\.{2,}|_{2,}/g," / ")
      .split("/")
      .map(normalize)
      .filter(x=>x&&x.split(" ").length>=2);
  }

  function anchorMatched(heard,anchor){
    const h=normalize(heard),a=normalize(anchor);
    if(!h||!a)return false;
    if(h.includes(a))return true;
    const hw=new Set(h.split(" ").filter(Boolean));
    const aw=a.split(" ").filter(Boolean);
    if(!aw.length)return false;
    return aw.filter(w=>hw.has(w)).length/aw.length>=0.85;
  }

  function withTemporaryTarget(ctx,value,fn){
    const lesson=ctx.lesson;
    if(lesson.pattern&&typeof lesson.pattern.de==="string"){
      const old=lesson.pattern.de;
      lesson.pattern.de=value;
      try{return fn();}finally{lesson.pattern.de=old;}
    }
    if(lesson.dialogue&&lesson.dialogue[0]&&typeof lesson.dialogue[0][0]==="string"){
      const old=lesson.dialogue[0][0];
      lesson.dialogue[0][0]=value;
      try{return fn();}finally{lesson.dialogue[0][0]=old;}
    }
    return fn();
  }

  function rewriteFeedback(actual,reference){
    const span=document.querySelector("#r5-feedback .r5-score span");
    if(!span)return;
    const heard=String(actual||"—").replace(/\[unk\]/g,"…");
    span.textContent=`گوشی شنید: ${heard} · ساختار مورد انتظار: ${reference}`;
  }

  window.onSpeechResult=function(text){
    const ctx=visibleLesson();
    const anchors=ctx?templateAnchors(ctx.target):[];
    if(ctx&&anchors.length&&typeof previousSpeechResult==="function"){
      const matched=anchors.filter(a=>anchorMatched(text,a));
      const canonicalTarget=anchors.join(" / ");
      const canonicalHeard=matched.length?matched.join(" / "):normalize(text);
      withTemporaryTarget(ctx,canonicalTarget,()=>previousSpeechResult(canonicalHeard));
      rewriteFeedback(text,ctx.target);
      return;
    }
    if(typeof previousSpeechResult==="function")previousSpeechResult(text);
  };

  document.addEventListener("click",event=>{
    const button=event.target&&event.target.closest?event.target.closest("[data-r5='speak']"):null;
    if(!button)return;
    const ctx=visibleLesson();
    if(!ctx||!window.GhazalAndroid||typeof window.GhazalAndroid.startSpeechRecognition!=="function")return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if(typeof window.onSpeechState==="function"){
      window.onSpeechState("preparing","موتور آفلاین با الگوی همین درس در حال آماده‌شدن…");
    }
    window.GhazalAndroid.startSpeechRecognition("GHZ_HINT|"+ctx.target);
  },true);
})();
