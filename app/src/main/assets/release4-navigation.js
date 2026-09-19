(function(){
  "use strict";
  const modal=document.getElementById("modal");
  function button(){return document.getElementById("r4-global-close");}
  function isHome(){const active=document.querySelector("[data-nav].active");return !active||active.dataset.nav==="home";}
  function refresh(){
    const b=button();if(!b)return;
    const modalOpen=modal&&!modal.hidden;
    const ownClose=modalOpen&&!!modal.querySelector(".close-button,[data-action='close-modal'],[data-r3='close'],[data-r4='close'],[data-r5='close'],[data-r6='close'],[data-r7='close'],[data-r8='close'],[data-r9='close'],[data-r10='close'],[data-r11='close'],[data-r12='close'],[data-r13='close'],[data-r14='close']");
    const subpage=!isHome();
    b.style.display=((modalOpen&&!ownClose)||(!modalOpen&&subpage))?"flex":"none";
    b.setAttribute("aria-label",modalOpen?"بستن مرحله":"بازگشت به صفحه اصلی");
  }
  document.addEventListener("click",event=>{
    if(event.target&&event.target.id==="r4-global-close"){
      const modalOpen=modal&&!modal.hidden;
      if(!modalOpen){const home=document.querySelector("[data-nav='home']");if(home)home.click();}
      setTimeout(refresh,40);
    }else if(event.target.closest&&event.target.closest("[data-nav]"))setTimeout(refresh,40);
  });
  document.addEventListener("ghazal:ui-changed",refresh);
  setTimeout(refresh,100);
})();
