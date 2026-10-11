"use strict";

const CACHE="ghazal-cross-platform-v1";
const CORE=[
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/ghazal-icon.svg",
  "/styles.css",
  "/interaction-rescue.css",
  "/os-extension.css",
  "/release3-extension.css",
  "/release4-extension.css",
  "/release5-extension.css",
  "/release6-platform.css",
  "/release7-library.css",
  "/release8-content-depth.css",
  "/release9-specialization.css",
  "/release10-stage2.css",
  "/release11-stage34.css",
  "/release12-stage56.css",
  "/release13-stage7.css",
  "/release14-final.css",
  "/core.js",
  "/course-data.js",
  "/platform-core.js",
  "/app.js",
  "/interaction-rescue.js",
  "/os-extension.js",
  "/upgrade-runtime.js",
  "/release3-extension.js",
  "/release4-content.js",
  "/release4-extension.js",
  "/release4-navigation.js",
  "/release5-content.js",
  "/release5-extension.js",
  "/release6-platform.js",
  "/release7-content.js",
  "/release7-library.js",
  "/release7-library-ui.js",
  "/release8-deep-library.js",
  "/release8-dictionary.js",
  "/release8-content-depth-ui.js",
  "/release9-specialization.js",
  "/release9-specialization-ui.js",
  "/release10-advanced-content.js",
  "/release10-capstone-content.js",
  "/release10-content-system.js",
  "/release10-exercise-engine.js",
  "/release10-human-audio.js",
  "/release10-offline-coach.js",
  "/release10-stage2-ui.js",
  "/release11-classroom-core.js",
  "/release11-learning-engine.js",
  "/release11-stage34-ui.js",
  "/release12-pack-loader.js",
  "/release12-product-core.js",
  "/release12-security-core.js",
  "/release12-stage56-ui.js",
  "/release13-qa-core.js",
  "/release13-quality-runtime.js",
  "/release13-stage7-ui.js",
  "/release14-final-core.js",
  "/release14-final-ui.js",
  "/speech-accuracy-stage7.js",
  "/stage3-content-pack.js",
  "/stage4-tutor-evaluation.js",
  "/stage4-tutor-ui.js",
  "/stage4-tutor.css",
  "/stage5-exams-pathways.js",
  "/stage5-exams-pathways-ui.js",
  "/stage5-exams-pathways.css",
  "/stage6-profiles-classes.js",
  "/stage6-profiles-classes-ui.js",
  "/stage6-profiles-classes.css",
  "/pwa-runtime.js"
];

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(CORE.map(async url=>{
      const response=await fetch(url,{cache:"reload"});
      if(!response.ok)throw new Error("Precache failed: "+url+" "+response.status);
      await cache.put(url,response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith("ghazal-")&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

function offlineApi(){
  return new Response(JSON.stringify({ok:false,error:"offline",offlineCore:true}),{
    status:503,
    headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}
  });
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(url.pathname.startsWith("/v1/")||url.pathname==="/healthz"||url.pathname.startsWith("/api/")){
    event.respondWith(fetch(request).catch(offlineApi));
    return;
  }

  if(request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const live=await fetch(request);
        if(live.ok){const cache=await caches.open(CACHE);cache.put("/",live.clone());}
        return live;
      }catch(_){
        return (await caches.match("/"))||(await caches.match("/index.html"))||new Response("GHAZAL offline shell unavailable",{status:503});
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const live=await fetch(request);
      if(live.ok){const cache=await caches.open(CACHE);cache.put(request,live.clone());}
      return live;
    }catch(_){
      return new Response("",{status:504,statusText:"Offline"});
    }
  })());
});
