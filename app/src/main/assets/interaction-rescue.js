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
    const map={action:"action",nav:"nav",osAction:"os-action",r3:"r3",r4:"r4",r5:"r5",r6:"r6",r7:"r7",r8:"r8",r9:"r9",r10:"r10",r11:"r11",r12:"r12",r13:"r13",r14:"r14"};
    const attr=map[key];
    if(!attr)return null;
    try{return document.querySelector("["+attr+"="+CSS.escape(JSON.stringify(value))+"]");}
    catch(_){
      try{return document.querySelector("["+attr+"='"+String(value).replace(/'/g,"\\'")+"']");}
      catch(__){return null;}
    }
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
        const target=interactive(targetByDescriptor(hit.id));
        if(target)return target;
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
  function nativeTap(pxX,pxY){
    lastNativeX=Number(pxX)||0;
    lastNativeY=Number(pxY)||0;
    const target=candidateFromCachedMap(lastNativeX,lastNativeY)||candidateFromPoint(lastNativeX,lastNativeY);
    if(!target){
      native("recordUiInteraction","native-miss:"+Math.round(lastNativeX)+","+Math.round(lastNativeY));
      return false;
    }
    setTimeout(()=>clickElement(target,"native"),70);
    return true;
  }
  function deferredTouch(target,source){
    target=interactive(target);
    if(!target)return;
    const observedClickAt=lastBrowserActivationAt;
    setTimeout(()=>{
      if(lastBrowserActivationAt!==observedClickAt&&same(lastBrowserTarget,target))return;
      clickElement(target,source);
    },85);
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
    if(event.isTrusted&&same(lastRescueTarget,target)&&t-lastRescueAt<360){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    lastBrowserActivationAt=t;
    lastBrowserTarget=target;
    normalCount++;
    stamp(target,event.isTrusted?"click":"synthetic-click");
  },true);

  document.addEventListener("touchend",event=>{
    const touch=event.changedTouches&&event.changedTouches[0];
    if(!touch)return;
    deferredTouch(event.target,"touchend");
  },true);

  document.addEventListener("pointerup",event=>{
    if(event.pointerType&&event.pointerType!=="touch"&&event.pointerType!=="pen")return;
    deferredTouch(event.target,"pointerup");
  },true);

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
    VERSION:"2.0.0",
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
      cachedControls:cachedRows.length,
      dpr:Number(window.devicePixelRatio)||1,
      href:location.href
    })
  };
  document.documentElement.setAttribute("data-ghz-interaction-ready","2");
})();