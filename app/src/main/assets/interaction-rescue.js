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
  function stamp(target,mode){
    try{
      target.dataset.ghzLastInteraction=mode;
      target.classList.add("ghz-touch-ack");
      setTimeout(()=>target.classList.remove("ghz-touch-ack"),160);
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