(function(){
  "use strict";
  const Core=window.GhazalPlatformCore,Data=window.GhazalData,view=document.getElementById("view"),modal=document.getElementById("modal"),modalContent=document.getElementById("modal-content");
  if(!Core||!Data||!view||!modal||!modalContent)return;
  const KEY="ghazal_platform_v1",APP_KEY="ghazal_deutsch_state_v1";
  let state=load(),searchIndex=Core.buildSearchIndex(Data);

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function load(){try{return Core.normalizeState(JSON.parse(localStorage.getItem(KEY)||"{}"));}catch(_){return Core.initialState();}}
  function save(){state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));}
  function app(){try{return JSON.parse(localStorage.getItem(APP_KEY)||"{}")||{};}catch(_){return{};}}
  function open(html){modal.dataset.locked="false";modalContent.innerHTML=html;modal.hidden=false;modalContent.scrollTop=0;}
  function close(){modal.hidden=true;modalContent.innerHTML="";modal.dataset.locked="false";}
  function active(){return state.profiles.find(p=>p.id===state.activeProfileId)||null;}
  function roleFa(r){return r==="teacher"?"استاد":r==="student"?"زبان‌آموز":r==="admin"?"مدیر":"مهمان";}
  function head(tag,title,sub){return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r6="close">×</button></div>';}
  function toast(msg){try{if(window.GhazalAndroid&&window.GhazalAndroid.toast)window.GhazalAndroid.toast(msg);}catch(_){}}

  function showHub(){
    const p=active(),server=Core.serverReady(state);
    open(head("Product Core","حساب، کلاس و زیرساخت آماده سرور","این نسخه فعلاً آفلاین است؛ قابلیت آنلاین جعلی نمایش داده نمی‌شود.")+
      '<div class="r6-status">وضعیت: <b>Offline-first</b> · بازار فعلی: ایران · اتصال سرور: <b>'+(server.connected?"فعال":"هنوز متصل نشده")+'</b></div>'+
      '<div class="r6-grid" style="margin-top:12px">'+
        '<button class="r6-card" data-r6="profiles"><strong>👤 پروفایل‌ها</strong><small>'+(p?("فعال: "+h(p.displayName)+" · "+roleFa(p.role)):"هنوز پروفایل محلی ساخته نشده")+'</small></button>'+
        '<button class="r6-card" data-r6="classroom"><strong>🏫 کلاس و استاد</strong><small>کلاس، کد عضویت، تکلیف و گزارش محلی واقعی.</small></button>'+
        '<button class="r6-card" data-r6="search"><strong>🔎 جستجوی کامل</strong><small>جستجو در درس‌ها، واژه‌ها و گفت‌وگوهای داخلی.</small></button>'+
        '<button class="r6-card" data-r6="server"><strong>☁️ آمادگی سرور</strong><small>قرارداد API آماده است؛ اتصال واقعی در مرحله زیرساخت.</small></button>'+
      '</div>');
  }

  function showProfiles(){
    const p=active();
    open(head("Local Profiles","پروفایل زبان‌آموز و استاد","بدون اینترنت و بدون ساخت حساب جعلی روی سرور.")+
      '<div class="r6-stack">'+
      (state.profiles.length?state.profiles.map(x=>'<div class="r6-row"><div><strong>'+h(x.displayName)+'</strong><small>'+roleFa(x.role)+(x.username?" · @"+h(x.username):"")+'</small></div><div><span class="r6-role">'+(x.id===state.activeProfileId?"فعال":roleFa(x.role))+'</span> <button class="icon-button" data-r6="activate-profile" data-id="'+h(x.id)+'">✓</button></div></div>').join(""):'<div class="r6-empty">هنوز پروفایل محلی وجود ندارد.</div>')+
      '</div><div class="section-title"><h2>ساخت پروفایل</h2></div>'+
      '<label class="r6-label">نام نمایشی</label><input id="r6-name" class="r6-input" placeholder="مثلاً غزل یا استاد رضایی">'+
      '<label class="r6-label">نام کاربری محلی اختیاری</label><input id="r6-username" class="r6-input" dir="ltr" placeholder="ghazal">'+
      '<label class="r6-label">نوع پروفایل</label><select id="r6-role" class="r6-input"><option value="student">زبان‌آموز</option><option value="teacher">استاد</option></select>'+
      '<button class="primary-button" style="margin-top:12px" data-r6="create-profile">ساخت پروفایل محلی</button>');
  }

  function syncLocalAssignments(){
    const p=active();if(!p||p.role!=="student")return;
    const done=new Set((app().progress&&app().progress.completedLessons)||[]);
    const dash=Core.studentDashboard(state,p.id);
    dash.assignments.forEach(a=>{if(a.lessonIds.length&&a.lessonIds.every(id=>done.has(id))){try{state=Core.submitAssignment(state,{assignmentId:a.id,studentId:p.id,status:"completed"});}catch(_){}}});
    save();
  }

  function showClassroom(){
    syncLocalAssignments();
    const p=active();
    if(!p)return open(head("Classroom","ابتدا پروفایل بساز","برای استفاده از کلاس، یک پروفایل زبان‌آموز یا استاد فعال کن.")+'<button class="primary-button" data-r6="profiles">ساخت پروفایل</button>');
    if(p.role==="teacher")return showTeacher(p);
    if(p.role==="student")return showStudent(p);
    open(head("Classroom","نقش مناسب لازم است","پروفایل فعال باید زبان‌آموز یا استاد باشد."));
  }

  function showTeacher(p){
    const d=Core.teacherDashboard(state,p.id),lessonOptions=Data.lessons.map(l=>'<option value="'+h(l.id)+'">'+h(l.level+" · "+l.title)+'</option>').join("");
    open(head("Teacher Mode","پنل استاد · "+p.displayName,"کلاس و تکلیف فعلاً محلی است و بعداً بدون تغییر مدل داده به سرور Sync می‌شود.")+
      '<div class="r6-grid">'+
        '<div class="r6-card"><strong>'+d.classes.length+'</strong><small>کلاس</small></div>'+
        '<div class="r6-card"><strong>'+d.students.length+'</strong><small>زبان‌آموز محلی</small></div>'+
        '<div class="r6-card"><strong>'+d.assignments.length+'</strong><small>تکلیف</small></div>'+
        '<div class="r6-card"><strong>'+d.submissions.filter(x=>x.status==="completed").length+'</strong><small>تحویل کامل</small></div>'+
      '</div>'+
      '<div class="section-title"><h2>کلاس‌های من</h2></div>'+
      (d.classes.length?d.classes.map(c=>'<div class="r6-row"><div><strong>'+h(c.name)+'</strong><small>'+(c.studentIds||[]).length+' زبان‌آموز</small></div><span class="r6-code">'+h(c.code)+'</span></div>').join(""):'<div class="r6-empty">هنوز کلاسی نساخته‌ای.</div>')+
      '<label class="r6-label">نام کلاس جدید</label><input id="r6-class-name" class="r6-input" placeholder="مثلاً A1 شنبه‌ها"><button class="secondary-button" style="margin-top:8px" data-r6="create-class">ساخت کلاس و کد عضویت</button>'+
      (d.classes.length?'<div class="section-title"><h2>تکلیف جدید</h2></div><label class="r6-label">کلاس</label><select id="r6-assignment-class" class="r6-input">'+d.classes.map(c=>'<option value="'+h(c.id)+'">'+h(c.name)+'</option>').join("")+'</select><label class="r6-label">عنوان تکلیف</label><input id="r6-assignment-title" class="r6-input" placeholder="مثلاً درس خانه و اجاره"><label class="r6-label">درس</label><select id="r6-assignment-lesson" class="r6-input">'+lessonOptions+'</select><label class="r6-label">توضیح</label><input id="r6-assignment-note" class="r6-input" placeholder="راهنمای استاد"><button class="primary-button" style="margin-top:8px" data-r6="create-assignment">ثبت تکلیف واقعی</button>':"")+
      '<div class="section-title"><h2>تکلیف‌ها و تحویل‌ها</h2></div>'+
      (d.assignments.length?d.assignments.map(a=>{const c=d.classes.find(x=>x.id===a.classId),subs=d.submissions.filter(x=>x.assignmentId===a.id);return '<div class="r6-row"><div><strong>'+h(a.title)+'</strong><small>'+h(c?c.name:"کلاس")+' · '+a.lessonIds.length+' درس · '+subs.filter(x=>x.status==="completed").length+' تحویل</small></div><span class="r6-chip">'+h(a.lessonIds[0]||"")+'</span></div>';}).join(""):'<div class="r6-empty">تکلیفی ثبت نشده.</div>'));
  }

  function showStudent(p){
    const d=Core.studentDashboard(state,p.id),subMap=new Map(d.submissions.map(x=>[x.assignmentId,x]));
    open(head("Student Mode","کلاس‌های "+p.displayName,"عضویت و تکلیف در این نسخه روی دستگاه ذخیره می‌شود.")+
      '<div class="section-title"><h2>عضویت در کلاس</h2></div><input id="r6-join-code" class="r6-input r6-code" dir="ltr" placeholder="کد کلاس"><button class="secondary-button" style="margin-top:8px" data-r6="join-class">پیوستن با کد</button>'+
      '<div class="section-title"><h2>کلاس‌های من</h2></div>'+
      (d.classes.length?d.classes.map(c=>'<div class="r6-row"><div><strong>'+h(c.name)+'</strong><small>کد کلاس</small></div><span class="r6-code">'+h(c.code)+'</span></div>').join(""):'<div class="r6-empty">هنوز عضو کلاسی نیستی.</div>')+
      '<div class="section-title"><h2>تکلیف‌ها</h2></div>'+
      (d.assignments.length?d.assignments.map(a=>{const sub=subMap.get(a.id),lesson=Data.lessons.find(l=>l.id===a.lessonIds[0]);return '<div class="r6-row"><div><strong>'+h(a.title)+'</strong><small>'+(sub&&sub.status==="completed"?"✅ انجام شده":"در انتظار انجام")+(a.instructions?" · "+h(a.instructions):"")+'</small></div>'+(lesson?'<button class="icon-button" data-action="open-lesson" data-id="'+h(lesson.id)+'">▶</button>':"")+'</div>';}).join(""):'<div class="r6-empty">فعلاً تکلیفی نداری.</div>')+
      '<button class="secondary-button" style="margin-top:10px" data-r6="sync-local-assignments">بررسی تکلیف‌های تکمیل‌شده</button>');
  }

  function showSearch(q){
    const query=typeof q==="string"?q:"",results=query?Core.search(searchIndex,query,40):[];
    open(head("Internal Search","جستجوی جهان آموزشی GHAZAL","نتیجه از محتوای داخلی و آفلاین برنامه می‌آید.")+
      '<input id="r6-search" class="r6-input" value="'+h(query)+'" placeholder="کلمه، درس، موضوع یا عبارت آلمانی/فارسی…">'+
      '<div id="r6-search-results">'+renderSearchResults(results)+'</div>');
    const input=document.getElementById("r6-search");if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
  }
  function renderSearchResults(results){
    if(!results.length)return '<div class="r6-empty">عبارتی بنویس تا در درس‌ها، واژه‌ها و دیالوگ‌ها جستجو شود.</div>';
    return results.map(r=>'<button class="r6-search-result" data-action="open-lesson" data-id="'+h(r.lessonId)+'"><strong>'+h(r.title)+'</strong><small>'+h(r.level+" · "+(r.type==="word"?"واژه":r.type==="dialogue"?"گفت‌وگو":"درس")+" · "+(r.subtitle||""))+'</small></button>').join("");
  }

  function showServer(){
    const x=Core.serverReady(state);
    open(head("Server-ready","قرارداد اتصال آنلاین","هسته آفلاین مستقل است؛ این قراردادها برای مرحله زیرساخت ایران آماده شده‌اند.")+
      '<div class="r6-status">اتصال فعلی: <b>'+ (x.connected?"Online/Hybrid":"Offline") +'</b><br>هیچ API یا ثبت‌نام آنلاین تا زمان راه‌اندازی Backend شبیه‌سازی نمی‌شود.</div>'+
      '<div class="r6-stack" style="margin-top:10px">'+Object.keys(x.endpoints).map(k=>'<div class="r6-row"><strong>'+h(k)+'</strong><small>'+x.endpoints[k].length+' endpoint contract</small></div>').join("")+'</div>');
  }

  function inject(){
    const practice=view.querySelector(".skill-grid");
    if(practice&&!view.querySelector("[data-r6='search']"))practice.insertAdjacentHTML("beforeend",'<button class="card skill-card" data-r6="search"><span class="big-icon">🔎</span><strong>جستجوی کامل</strong><small>درس، واژه و گفت‌وگو را بدون خروج از برنامه پیدا کن.</small></button>');
    const profile=view.querySelector(".settings-card");
    if(profile&&!view.querySelector("[data-r6='hub']"))profile.insertAdjacentHTML("beforebegin",'<div class="section-title"><h2>محصول و کلاس</h2></div><button class="card skill-card" style="width:100%;margin-bottom:12px" data-r6="hub"><span class="big-icon">🏫</span><strong>حساب محلی، کلاس و استاد</strong><small>Teacher/Student Mode واقعی آفلاین و آماده اتصال سرور.</small></button>');
  }

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r6]");if(!t)return;
    const a=t.dataset.r6;
    if(a==="close")close();
    else if(a==="hub")showHub();
    else if(a==="profiles")showProfiles();
    else if(a==="classroom")showClassroom();
    else if(a==="search")showSearch("");
    else if(a==="server")showServer();
    else if(a==="activate-profile"){try{state=Core.setActiveProfile(state,t.dataset.id);save();showProfiles();}catch(_){toast("پروفایل پیدا نشد");}}
    else if(a==="create-profile"){try{state=Core.createProfile(state,{displayName:document.getElementById("r6-name")?.value,username:document.getElementById("r6-username")?.value,role:document.getElementById("r6-role")?.value});save();showProfiles();}catch(err){toast(err.message==="username_exists"?"این نام کاربری محلی تکراری است":"نام معتبر وارد کن");}}
    else if(a==="create-class"){const p=active();try{state=Core.createClass(state,{teacherId:p&&p.id,name:document.getElementById("r6-class-name")?.value});save();showTeacher(active());}catch(_){toast("نام کلاس معتبر وارد کن");}}
    else if(a==="join-class"){const p=active();try{state=Core.joinClass(state,{studentId:p&&p.id,code:document.getElementById("r6-join-code")?.value});save();showStudent(active());}catch(_){toast("کد کلاس معتبر نیست");}}
    else if(a==="create-assignment"){const p=active();try{state=Core.createAssignment(state,{teacherId:p&&p.id,classId:document.getElementById("r6-assignment-class")?.value,title:document.getElementById("r6-assignment-title")?.value,lessonIds:[document.getElementById("r6-assignment-lesson")?.value],instructions:document.getElementById("r6-assignment-note")?.value});save();showTeacher(active());}catch(_){toast("کلاس و درس را بررسی کن");}}
    else if(a==="sync-local-assignments"){syncLocalAssignments();showStudent(active());}
  });

  document.addEventListener("input",e=>{
    if(e.target&&e.target.id==="r6-search"){
      const box=document.getElementById("r6-search-results");if(box)box.innerHTML=renderSearchResults(Core.search(searchIndex,e.target.value,40));
    }
  });

  const observer=new MutationObserver(inject);observer.observe(view,{childList:true,subtree:true});setTimeout(inject,250);
})();