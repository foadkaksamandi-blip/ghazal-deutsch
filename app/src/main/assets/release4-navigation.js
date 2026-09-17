(function(){
  "use strict";
  const modal=document.getElementById("modal");
  function button(){return document.getElementById("r4-global-close");}
  function isHome(){const active=document.querySelector("[data-nav].active");return !active||active.dataset.nav==="home";}
  function refresh(){const b=button();if(!b)return;const modalOpen=modal&&!modal.hidden;const subpage=!isHome();b.style.display=(modalOpen||subpage)?"flex":"none";b.setAttribute("aria-label",modalOpen?"بستن مرحله":"بازگشت به صفحه اصلی");}
  document.addEventListener("click",event=>{
    if(event.target&&event.target.id==="r4-global-close"){
      const modalOpen=modal&&!modal.hidden;
      if(!modalOpen){const home=document.querySelector("[data-nav='home']");if(home)home.click();}
      setTimeout(refresh,40);
    }else if(event.target.closest&&event.target.closest("[data-nav]"))setTimeout(refresh,40);
  });
  const observer=new MutationObserver(refresh);
  if(modal)observer.observe(modal,{attributes:true,attributeFilter:["hidden"]});
  const nav=document.querySelector(".bottom-nav");if(nav)observer.observe(nav,{attributes:true,subtree:true,attributeFilter:["class"]});
  const view=document.getElementById("view");if(view)observer.observe(view,{childList:true,subtree:false});
  setTimeout(refresh,100);
})();
