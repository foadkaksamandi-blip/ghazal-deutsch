(function(){
  "use strict";

  const root=document.documentElement;
  const ua=navigator.userAgent||"";
  const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  const android=/Android/i.test(ua);
  const windows=/Windows/i.test(ua);
  const mac=/Macintosh|Mac OS X/i.test(ua)&&!ios;
  const platform=android?"android":ios?"ios":windows?"windows":mac?"macos":/Linux/i.test(ua)?"linux":"web";
  const standalone=window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  let deferredInstall=null;

  root.dataset.ghzPlatform=platform;
  root.dataset.ghzStandalone=standalone?"true":"false";
  root.dataset.ghzOnline=navigator.onLine?"true":"false";

  function toast(message){
    const el=document.getElementById("toast");
    if(!el)return;
    el.textContent=message;
    el.hidden=false;
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>{el.hidden=true;},4200);
  }

  function speechState(state,message){
    if(typeof window.onSpeechState==="function"){
      try{window.onSpeechState(state,message||"");}catch(_){ }
    }else if(message){
      toast(message);
    }
  }

  function browserSpeak(text){
    if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){
      toast("پخش گفتار در این مرورگر پشتیبانی نمی‌شود.");
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(String(text||""));
    utterance.lang="de-DE";
    utterance.rate=0.92;
    const voices=window.speechSynthesis.getVoices();
    const german=voices.find(v=>String(v.lang||"").toLowerCase().startsWith("de"));
    if(german)utterance.voice=german;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function browserSpeechRecognition(){
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Recognition){
      speechState("unsupported","تشخیص گفتار در این مرورگر در دسترس نیست. آموزش‌های دیگر غزل آفلاین ادامه دارند.");
      return false;
    }
    if(!navigator.onLine){
      speechState("unsupported","در نسخه وب، تشخیص گفتار این دستگاه آفلاین نیست. برای گفتار آفلاین کامل از نسخه Android استفاده کن.");
      return false;
    }
    try{
      const recognition=new Recognition();
      recognition.lang="de-DE";
      recognition.continuous=false;
      recognition.interimResults=false;
      recognition.maxAlternatives=5;
      recognition.onstart=()=>speechState("listening","گوش می‌دهم…");
      recognition.onerror=event=>speechState("error",event&&event.error==="not-allowed"?"اجازه میکروفون داده نشده است.":"تشخیص گفتار مرورگر انجام نشد؛ دوباره امتحان کن.");
      recognition.onend=()=>speechState("idle","");
      recognition.onresult=event=>{
        const result=event.results&&event.results[0];
        const text=result&&result[0]?result[0].transcript:"";
        if(text&&typeof window.onSpeechResult==="function")window.onSpeechResult(text);
      };
      recognition.start();
      return true;
    }catch(_){
      speechState("error","شروع میکروفون در این مرورگر ممکن نشد.");
      return false;
    }
  }

  if(!window.GhazalAndroid){
    window.GhazalAndroid={
      getAppVersion:()=>"web-14.0.2",
      speak:browserSpeak,
      stopSpeaking:()=>{if("speechSynthesis" in window)window.speechSynthesis.cancel();},
      startSpeechRecognition:browserSpeechRecognition
    };
  }

  function adaptNativeOnlyFeatures(){
    if(android)return;
    const reminder=document.getElementById("reminder-toggle");
    if(reminder){
      reminder.disabled=true;
      reminder.checked=false;
      const row=reminder.closest(".setting-row");
      const note=row&&row.querySelector(".setting-copy small");
      if(note)note.textContent="اعلان آفلاین هنگام بسته‌بودن برنامه فعلاً مخصوص نسخه Android است.";
    }
  }

  function ensureInstallButton(){
    if(standalone||document.getElementById("ghz-install-app"))return;
    const topbar=document.querySelector(".topbar");
    if(!topbar)return;
    const button=document.createElement("button");
    button.id="ghz-install-app";
    button.className="icon-button ghz-install-button";
    button.type="button";
    button.setAttribute("aria-label","نصب غزل روی این دستگاه");
    button.textContent="＋";
    button.addEventListener("click",async()=>{
      if(deferredInstall){
        deferredInstall.prompt();
        try{await deferredInstall.userChoice;}catch(_){ }
        deferredInstall=null;
        button.remove();
        return;
      }
      if(ios){
        toast("در Safari روی Share بزن و Add to Home Screen را انتخاب کن.");
      }else{
        toast("از منوی مرورگر گزینه Install app یا Add to Home Screen را انتخاب کن.");
      }
    });
    topbar.insertBefore(button,topbar.lastElementChild||null);
  }

  window.addEventListener("beforeinstallprompt",event=>{
    event.preventDefault();
    deferredInstall=event;
    ensureInstallButton();
  });
  window.addEventListener("appinstalled",()=>{
    root.dataset.ghzStandalone="true";
    document.getElementById("ghz-install-app")?.remove();
    toast("GHAZAL روی دستگاه نصب شد.");
  });
  window.addEventListener("online",()=>{root.dataset.ghzOnline="true";document.dispatchEvent(new CustomEvent("ghazal:connectivity",{detail:{online:true}}));});
  window.addEventListener("offline",()=>{root.dataset.ghzOnline="false";document.dispatchEvent(new CustomEvent("ghazal:connectivity",{detail:{online:false}}));});
  document.addEventListener("ghazal:ui-changed",adaptNativeOnlyFeatures);

  if((ios||!standalone)&&!android)ensureInstallButton();
  adaptNativeOnlyFeatures();

  if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){
    window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{}));
  }

  window.GhazalPWA={
    version:1,
    platform,
    isStandalone:()=>root.dataset.ghzStandalone==="true",
    isOnline:()=>navigator.onLine,
    capabilities:()=>({
      offlineLearning:true,
      installable:android?false:true,
      nativeOfflineSpeech:android,
      browserSpeech:!!(window.SpeechRecognition||window.webkitSpeechRecognition),
      nativeBackgroundReminder:android,
      backupExport:true
    }),
    install:async()=>{
      if(deferredInstall){deferredInstall.prompt();return deferredInstall.userChoice;}
      return{outcome:"manual"};
    }
  };
})();
