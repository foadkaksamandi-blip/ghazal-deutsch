(function(){
  "use strict";
  const Core=window.GhazalFinalReleaseCore,view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!Core||!view||!modal||!box)return;
  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
  function info(){return Core.nativeReleaseInfo();}
  function head(title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">FINAL</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r14="close">×</button></div>';}
  function open(){
    const i=info(),status=Core.humanStatus(localStorage),privacy=Core.privacyModel();
    box.innerHTML=head("GHAZAL "+Core.VERSION,"نسخه نهایی آفلاین برای یادگیری آلمانی")+
      '<div class="r14-hero"><strong>'+h(status.label)+'</strong><span>'+h(Core.PACKAGE_ID)+'</span></div>'+
      '<div class="r14-grid">'+
        '<div><b>Offline Core</b><span>'+(privacy.offlineCore?"فعال":"—")+'</span></div>'+
        '<div><b>Production Signature</b><span>'+(i.productionSigned?"تأیید":"QA / not final")+'</span></div>'+
        '<div><b>Asset Integrity</b><span>'+(i.assetIntegrity?"PASS":"CHECK")+'</span></div>'+
        '<div><b>Debuggable</b><span>'+(i.debuggable?"YES":"NO")+'</span></div>'+
      '</div>'+
      '<div class="r14-note">اطلاعات آموزشی و پیشرفت به‌صورت محلی روی دستگاه نگهداری می‌شوند. هسته برنامه برای کار روزانه به اینترنت متکی نیست. میکروفون فقط هنگام تمرین گفتاری درخواست می‌شود.</div>'+
      '<div class="r14-footer">FOAD · GHAZAL '+h(Core.VERSION)+'</div>';
    modal.hidden=false;box.scrollTop=0;
  }
  function close(){modal.hidden=true;box.innerHTML="";}
  function inject(){
    if(view.querySelector("[data-r14='about']"))return;
    const settings=view.querySelector(".settings-card");
    const profile=view.querySelector(".profile-card,.profile-hero");
    const target=settings||profile;
    if(target)target.insertAdjacentHTML("afterend",'<button class="card r14-about" data-r14="about"><span>✓</span><strong>درباره نسخه نهایی</strong><small>GHAZAL '+Core.VERSION+' · Offline-first · Secure release architecture</small></button>');
    const footer=view.querySelector(".foad-signature,.app-signature");
    if(!footer&&view.children.length)view.insertAdjacentHTML("beforeend",'<div class="r14-subtle">GHAZAL '+Core.VERSION+' · FOAD</div>');
  }
  document.addEventListener("click",e=>{const t=e.target.closest("[data-r14]");if(!t)return;if(t.dataset.r14==="about")open();if(t.dataset.r14==="close")close();});
  new MutationObserver(inject).observe(view,{childList:true,subtree:true});setTimeout(inject,600);
})();