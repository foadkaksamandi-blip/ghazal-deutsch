(function(){
  "use strict";

  const INTERACTIVE = [
    "button",
    "[role='button']",
    "a[href]",
    "label",
    "[data-action]",
    "[data-nav]",
    "[data-os-action]",
    "[data-r3]","[data-r4]","[data-r5]","[data-r6]","[data-r7]","[data-r8]",
    "[data-r9]","[data-r10]","[data-r11]","[data-r12]","[data-r13]","[data-r14]"
  ].join(",");

  let lastBrowserActivationAt=0;
  let lastBrowserTarget=null;
  let lastRescueAt=0;
  let lastRescueTarget=null;
  let rescueCount=0;
  let normalCount=0;
  let lastNativeX=0;
  let lastNativeY=0;
  let cachedRows=[];
  let uidCounter=0;
  let nativeSuppressedUntil=0;
  let lastPhysicalTarget=null;
  let lastPhysicalTargetAt=0;

  function now(){return Date.now();}
  function interactive(node){
    if(!node||!node.closest)return null;
    const target=node.closest(INTERACTIVE);
    if(!target)return null;
    if(target.disabled||target.getAttribute("aria-disabled")==="true")return null;
    const style=getComputedStyle(target);
    if(style.pointerEvents==="none"||style.visibility==="hidden"||style.display==="none")return null;
    return target;
  }
  function same(a,b){return !!a&&!!b&&(a===b||a.contains(b)||b.contains(a));}
  function uidFor(target){
    if(!target)return "";
    if(!target.dataset.ghzControlId)target.dataset.ghzControlId="ghz-"+(++uidCounter);
    return target.dataset.ghzControlId;
  }
  function targetByUid(uid){
    if(!uid)return null;
    try{return document.querySelector('[data-ghz-control-id="'+String(uid).replace(/"/g,'\\"')+'"]');}
    catch(_){return null;}
  }
  function descriptor(target){
    if(!target)return "";
    const keys=["action","nav","osAction","r3","r4","r5","r6","r7","r8","r9","r10","r11","r12","r13","r14"];
    for(const key of keys)if(target.dataset&&target.dataset[key])return key+":"+target.dataset[key];
    if(target.id)return "id:"+target.id;
    return (target.tagName||"control").toLowerCase();
  }
  function targetByDescriptor(id){
    if(!id)return null;
    const split=id.indexOf(":");
    if(split<0)return null;
    const key=id.slice(0,split),value=id.slice(split+1);
    if(key==="id")return document.getElementById(value);
    const map={action:"data-action",nav:"data-nav",osAction:"data-os-action",r3:"data-r3",r4:"data-r4",r5:"data-r5",r6:"data-r6",r7:"data-r7",r8:"data-r8",r9:"data-r9",r10:"data-r10",r11:"data-r11",r12:"data-r12",r13:"data-r13",r14:"data-r14"};
    const attr=map[key];
    if(!attr)return null;
    try{return document.querySelector("["+attr+"="+JSON.stringify(String(value))+"]");}
    catch(_){return null;}
  }
  function native(method,arg){
    try{
      if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](arg);
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
  function clickElement(target,source){
    target=interactive(target);
    if(!target)return false;
    const t=now();
    if(same(lastBrowserTarget,target)&&t-lastBrowserActivationAt<220)return false;
    if(same(lastRescueTarget,target)&&t-lastRescueAt<360)return false;
    lastRescueTarget=target;
    lastRescueAt=t;
    rescueCount++;
    stamp(target,"rescue:"+source);
    try{
      target.click();
      return true;
    }catch(_){
      try{
        target.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,composed:true,view:window}));
        return true;
      }catch(__){return false;}
    }
  }

  function rowsForPoint(cssX,cssY){
    const hits=[];
    for(const row of cachedRows){
      if(row&&row.visible!==false&&cssX>=row.x&&cssX<=row.x+row.width&&cssY>=row.y&&cssY<=row.y+row.height)hits.push(row);
    }
    hits.sort((a,b)=>(a.width*a.height)-(b.width*b.height));
    return hits;
  }
  function candidateFromCachedMap(pxX,pxY){
    const dpr=Math.max(1,Number(window.devicePixelRatio)||1);
    const variants=[[pxX/dpr,pxY/dpr],[pxX,pxY]];
    for(const [x,y] of variants){
      const hit=rowsForPoint(x,y)[0];
      if(hit){
        const exact=interactive(targetByUid(hit.uid));
        if(exact)return exact;
        const fallback=interactive(targetByDescriptor(hit.id));
        if(fallback)return fallback;
      }
    }
    return null;
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
      for(const e of stack||[]){
        const target=interactive(e);
        if(target)return target;
      }
    }
    return null;
  }
  function rememberPhysicalTarget(node){
    const target=interactive(node);
    if(!target)return null;
    lastPhysicalTarget=target;
    lastPhysicalTargetAt=now();
    return target;
  }
  function nativeTap(pxX,pxY){
    lastNativeX=Number(pxX)||0;
    lastNativeY=Number(pxY)||0;
    if(now()<nativeSuppressedUntil){
      native("recordUiInteraction","native-skip:dom-transition");
      return false;
    }
    let recent=lastPhysicalTarget&&now()-lastPhysicalTargetAt<1200?lastPhysicalTarget:null;
    if(recent&&!recent.isConnected){
      native("recordUiInteraction","native-clear:detached-physical-target");
      lastPhysicalTarget=null;
      lastPhysicalTargetAt=0;
      recent=null;
    }
    const target=interactive(recent)||candidateFromCachedMap(lastNativeX,lastNativeY)||candidateFromPoint(lastNativeX,lastNativeY);
    if(!target){
      native("recordUiInteraction","native-miss:"+Math.round(lastNativeX)+","+Math.round(lastNativeY));
      return false;
    }
    setTimeout(()=>{
      if(now()<nativeSuppressedUntil)return;
      if(recent&&!recent.isConnected)return;
      clickElement(target,"native");
    },70);
    return true;
  }
  let publishTimer=0;
  function buildMap(){
    const rows=[];
    document.querySelectorAll(INTERACTIVE).forEach(el=>{
      if(!el||el.disabled)return;
      const rect=el.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return;
      rows.push({
        id:descriptor(el),
        uid:uidFor(el),
        x:rect.left,
        y:rect.top,
        width:rect.width,
        height:rect.height,
        visible:rect.bottom>0&&rect.right>0&&rect.top<innerHeight&&rect.left<innerWidth
      });
    });
    cachedRows=rows;
    return rows;
  }
  function publishMap(){
    const rows=buildMap();
    if(!window.GhazalAndroid||typeof window.GhazalAndroid.publishInteractionMap!=="function")return;
    try{window.GhazalAndroid.publishInteractionMap(JSON.stringify(rows.slice(0,600)));}catch(_){}
  }
  function schedulePublish(){
    clearTimeout(publishTimer);
    publishTimer=setTimeout(publishMap,100);
  }

  document.addEventListener("click",event=>{
    const target=interactive(event.target);
    if(!target)return;
    const t=now();
    if(event.isTrusted&&t<nativeSuppressedUntil){
      event.preventDefault();
      event.stopImmediatePropagation();
      native("recordUiInteraction","browser-skip:dom-transition");
      return;
    }
    if(event.isTrusted&&same(lastRescueTarget,target)&&t-lastRescueAt<360){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    lastBrowserActivationAt=t;
    lastBrowserTarget=target;
    normalCount++;
    stamp(target,event.isTrusted?"click":"synthetic-click");
    // Some controls close a modal or re-render themselves during bubbling.
    // After the event completes, detect that DOM transition and briefly block
    // the delayed Android fallback so the same physical gesture cannot leak
    // through to a newly exposed control underneath.
    queueMicrotask(()=>{
      if(!target.isConnected){
        nativeSuppressedUntil=Math.max(nativeSuppressedUntil,now()+280);
        if(same(lastPhysicalTarget,target)){
          lastPhysicalTarget=null;
          lastPhysicalTargetAt=0;
        }
      }
    });
  },true);

  document.addEventListener("touchstart",event=>{
    rememberPhysicalTarget(event.target);
  },true);

  document.addEventListener("pointerdown",event=>{
    if(event.pointerType&&event.pointerType!=="touch"&&event.pointerType!=="pen")return;
    rememberPhysicalTarget(event.target);
  },true);

  // Do not synthesize clicks from touchend/pointerup. Android/WebView already
  // generates the normal click for a deliberate tap. The native rescue below
  // is delayed and only acts when that browser click did not happen.
  document.addEventListener("keydown",event=>{
    if(event.key!=="Enter"&&event.key!==" ")return;
    const target=interactive(event.target);
    if(target)clickElement(target,"keyboard");
  },true);

  new MutationObserver(schedulePublish).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","class","style"]});
  window.addEventListener("load",schedulePublish,{once:true});
  window.addEventListener("resize",schedulePublish);
  setTimeout(schedulePublish,120);

  window.GhazalInteractionRescue={
    VERSION:"2.4.0",
    nativeTap,
    activateElement:target=>clickElement(target,"api"),
    activateDescriptor:id=>clickElement(targetByDescriptor(id),"descriptor"),
    refresh:publishMap,
    diagnostics:()=>({
      ready:true,
      rescueCount,
      normalCount,
      lastBrowserActivationAt,
      lastRescueAt,
      lastNativeX,
      lastNativeY,
      lastPhysicalTarget:lastPhysicalTarget?descriptor(lastPhysicalTarget):null,
      lastPhysicalTargetConnected:!!(lastPhysicalTarget&&lastPhysicalTarget.isConnected),
      cachedControls:cachedRows.length,
      dpr:Number(window.devicePixelRatio)||1,
      href:location.href
    })
  };
  document.documentElement.setAttribute("data-ghz-interaction-ready","2");
})();