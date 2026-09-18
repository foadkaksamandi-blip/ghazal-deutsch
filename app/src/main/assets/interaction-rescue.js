(function(){
  "use strict";

  const INTERACTIVE = [
    "button",
    "[role='button']",
    "[data-action]",
    "[data-nav]",
    "[data-os-action]",
    "[data-r3]","[data-r4]","[data-r5]","[data-r6]","[data-r7]","[data-r8]",
    "[data-r9]","[data-r10]","[data-r11]","[data-r12]","[data-r13]","[data-r14]"
  ].join(",");

  let lastBrowserActivationAt = 0;
  let lastBrowserTarget = null;
  let lastRescueAt = 0;
  let lastRescueTarget = null;
  let rescueCount = 0;
  let normalCount = 0;

  function now(){ return Date.now(); }
  function interactive(node){
    if(!node || !node.closest) return null;
    const target=node.closest(INTERACTIVE);
    if(!target) return null;
    if(target.disabled || target.getAttribute("aria-disabled")==="true") return null;
    return target;
  }
  function same(a,b){ return !!a && !!b && (a===b || a.contains(b) || b.contains(a)); }
  function descriptor(target){
    if(!target)return "";
    const keys=["action","nav","osAction","r3","r4","r5","r6","r7","r8","r9","r10","r11","r12","r13","r14"];
    for(const key of keys)if(target.dataset&&target.dataset[key])return key+":"+target.dataset[key];
    return (target.id?"id:"+target.id:(target.tagName||"control").toLowerCase());
  }
  function native(method,arg){
    try{
      if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function"){
        return window.GhazalAndroid[method](arg);
      }
    }catch(_){}
  }
  function stamp(target,mode){
    try{
      target.dataset.ghzLastInteraction=mode;
      target.classList.add("ghz-touch-ack");
      setTimeout(()=>target.classList.remove("ghz-touch-ack"),160);
      native("recordUiInteraction",descriptor(target)+"|"+mode);
    }catch(_){}
  }
  function activate(target,source){
    target=interactive(target);
    if(!target) return false;
    const t=now();
    if(same(lastBrowserTarget,target) && t-lastBrowserActivationAt<280) return false;
    if(same(lastRescueTarget,target) && t-lastRescueAt<420) return false;
    lastRescueTarget=target;
    lastRescueAt=t;
    rescueCount++;
    stamp(target,"rescue:"+source);
    try{
      target.click();
      return true;
    }catch(_){
      try{
        target.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));
        return true;
      }catch(__){ return false; }
    }
  }
  function candidateFromPoint(pxX,pxY){
    const dpr=Math.max(1,Number(window.devicePixelRatio)||1);
    const vv=window.visualViewport;
    const offsetX=vv?Number(vv.offsetLeft)||0:0;
    const offsetY=vv?Number(vv.offsetTop)||0:0;
    const points=[
      [pxX/dpr+offsetX,pxY/dpr+offsetY],
      [pxX+offsetX,pxY+offsetY]
    ];
    for(const [x,y] of points){
      const stack=typeof document.elementsFromPoint==="function"?document.elementsFromPoint(x,y):[document.elementFromPoint(x,y)];
      for(const e of stack){
        const target=interactive(e);
        if(target) return target;
      }
    }
    return null;
  }
  function nativeTap(pxX,pxY){
    const target=candidateFromPoint(Number(pxX)||0,Number(pxY)||0);
    if(!target) return false;
    setTimeout(()=>activate(target,"native"),95);
    return true;
  }
  function deferredTouch(target,source){
    target=interactive(target);
    if(!target) return;
    const snapshot=lastBrowserActivationAt;
    setTimeout(()=>{
      if(lastBrowserActivationAt!==snapshot && same(lastBrowserTarget,target)) return;
      activate(target,source);
    },90);
  }

  let publishTimer=0;
  function publishMap(){
    if(!window.GhazalAndroid||typeof window.GhazalAndroid.publishInteractionMap!=="function")return;
    const rows=[];
    document.querySelectorAll(INTERACTIVE).forEach(el=>{
      if(!el||el.disabled)return;
      const rect=el.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return;
      rows.push({
        id:descriptor(el),
        x:rect.left,
        y:rect.top,
        width:rect.width,
        height:rect.height,
        visible:rect.bottom>0&&rect.right>0&&rect.top<innerHeight&&rect.left<innerWidth
      });
    });
    try{window.GhazalAndroid.publishInteractionMap(JSON.stringify(rows.slice(0,500)));}catch(_){}
  }
  function schedulePublish(){
    clearTimeout(publishTimer);
    publishTimer=setTimeout(publishMap,120);
  }

  document.addEventListener("click",event=>{
    const target=interactive(event.target);
    if(!target) return;
    lastBrowserActivationAt=now();
    lastBrowserTarget=target;
    normalCount++;
    stamp(target,event.isTrusted?"click":"synthetic-click");
  },true);

  document.addEventListener("touchend",event=>{
    const touch=event.changedTouches&&event.changedTouches[0];
    if(!touch) return;
    deferredTouch(event.target,"touchend");
  },true);

  document.addEventListener("pointerup",event=>{
    if(event.pointerType && event.pointerType!=="touch" && event.pointerType!=="pen") return;
    deferredTouch(event.target,"pointerup");
  },true);

  new MutationObserver(schedulePublish).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","class"]});
  window.addEventListener("load",schedulePublish,{once:true});
  setTimeout(schedulePublish,250);

  window.GhazalInteractionRescue={
    VERSION:"1.0.0",
    nativeTap,
    activateElement:target=>activate(target,"api"),
    diagnostics:()=>({
      ready:true,
      rescueCount,
      normalCount,
      lastBrowserActivationAt,
      lastRescueAt,
      dpr:Number(window.devicePixelRatio)||1,
      href:location.href
    })
  };
  document.documentElement.setAttribute("data-ghz-interaction-ready","1");
})();