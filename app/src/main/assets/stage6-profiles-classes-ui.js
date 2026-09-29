(function(){
  "use strict";
  const S=window.GhazalStage6,D=window.GhazalData,E=window.GhazalExerciseEngine;
  const view=document.getElementById("view"),modal=document.getElementById("modal"),box=document.getElementById("modal-content");
  if(!S||!D||!E||!view||!modal||!box)return;
  let selectedClass="",activeAssignment=null,activeItem=null,speechTarget=null;
  const previousSpeech=window.onSpeechResult,previousSpeechError=window.onSpeechError;

  function h(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function native(method,...args){try{if(window.GhazalAndroid&&typeof window.GhazalAndroid[method]==="function")return window.GhazalAndroid[method](...args);}catch(_){}}
  function toast(msg){native("toast",String(msg||""));}
  function state(){return S.readStorage(localStorage);}
  function save(s){return S.writeStorage(localStorage,s);}
  function active(){return S.activeProfile(state());}
  function open(html){modal.dataset.locked="false";box.innerHTML=html;modal.hidden=false;box.scrollTop=0;}
  function close(){speechTarget=null;activeAssignment=null;activeItem=null;native("stopSpeaking");modal.hidden=true;box.innerHTML="";modal.dataset.locked="false";}
  function head(tag,title,sub,home){
    return '<div class="sheet-handle"></div><div class="sheet-head"><div><span class="level-badge">'+h(tag)+'</span><h2>'+h(title)+'</h2><p>'+h(sub||"")+'</p></div><button class="close-button" data-r6="'+(home?"s6-hub":"s6-close")+'">'+(home?"⌂":"×")+'</button></div>';
  }
  function statusFa(v){return({not_started:"شروع نشده",late:"مهلت گذشته",in_progress:"در حال انجام",submitted:"تحویل شده",graded:"نمره داده شده"})[v]||v;}

  function hub(){
    const s=state(),p=S.activeProfile(s),ready=S.serverReadiness(s);
    open(head("مرحله ۶","پروفایل‌ها و کلاس‌ها","Teacher/Student واقعی، کاملاً آفلاین و آماده Sync آینده.",false)+
      '<div class="s6-kpis"><div><b>'+s.profiles.length+'</b><span>پروفایل</span></div><div><b>'+s.classes.filter(c=>!c.archived).length+'</b><span>کلاس</span></div><div><b>'+(p?h(p.displayName):"—")+'</b><span>فعال</span></div></div>'+
      '<div class="s6-grid" style="margin-top:10px">'+
      '<button class="s6-card" data-r6="s6-profiles"><strong>👤 پروفایل‌ها</strong><small>ساخت و جابه‌جایی بین Student و Teacher روی همین گوشی.</small></button>'+
      '<button class="s6-card" data-r6="s6-workspace"><strong>🏫 Workspace</strong><small>'+(p?h(S.roleFa(p.role)):"اول پروفایل بساز")+' · کلاس، تکلیف، تحویل و گزارش.</small></button>'+
      '<button class="s6-card" data-r6="s6-server"><strong>☁️ Server-ready</strong><small>ساختار Admin/School و Sync آینده بدون Login یا Sync جعلی.</small></button>'+
      '</div><div class="s6-note" style="margin-top:10px">'+h(ready.note)+'</div>');
  }

  function profiles(){
    const s=state();
    open(head("Stage 6","پروفایل‌های محلی","هر پروفایل پیشرفت و نقش خودش را دارد.",true)+
      '<div class="s6-list">'+(s.profiles.length?s.profiles.map(p=>'<div class="s6-row"><div><strong>'+h(p.displayName)+'</strong><small>'+h(S.roleFa(p.role))+(p.username?" · @"+h(p.username):"")+'</small></div><button class="secondary-button" data-r6="s6-activate" data-id="'+h(p.id)+'">'+(p.id===s.activeProfileId?"فعال":"انتخاب")+'</button></div>').join(""):'<div class="s6-empty">هنوز پروفایلی وجود ندارد.</div>')+'</div>'+
      '<div class="section-title"><h2>پروفایل جدید</h2></div>'+
      '<input id="s6-name" class="s6-input" placeholder="نام نمایشی">'+
      '<input id="s6-user" class="s6-input" dir="ltr" placeholder="نام کاربری محلی اختیاری">'+
      '<select id="s6-role" class="s6-input"><option value="student">زبان‌آموز</option><option value="teacher">استاد</option></select>'+
      '<button class="primary-button" style="margin-top:9px" data-r6="s6-create-profile">ساخت پروفایل</button>');
  }

  function workspace(){
    const s=state(),p=S.activeProfile(s);
    if(!p)return profiles();
    if(p.role==="teacher")return teacherHome(s,p);
    if(p.role==="student")return studentHome(s,p);
    open(head("Stage 6","نقش آینده","Admin/School در Contract آماده است و بعد از Backend واقعی فعال می‌شود.",true));
  }

  function teacherHome(s,p){
    const d=S.teacherDashboard(s,p.id),classes=d.classes;
    if(!selectedClass&&classes[0])selectedClass=classes[0].id;
    open(head("Teacher Workspace",p.displayName,"کلاس، تکلیف، تحویل، ارزیابی و گزارش محلی.",true)+
      '<div class="s6-kpis"><div><b>'+classes.length+'</b><span>کلاس</span></div><div><b>'+d.students.length+'</b><span>زبان‌آموز</span></div><div><b>'+d.enhancedAssignments.length+'</b><span>تکلیف</span></div></div>'+
      '<div class="s6-grid" style="margin-top:10px">'+
      '<button class="s6-card" data-r6="s6-new-class"><strong>➕ کلاس جدید</strong><small>ساخت Class Code محلی.</small></button>'+
      '<button class="s6-card" data-r6="s6-new-assignment"><strong>📝 تکلیف جدید</strong><small>Lesson + Exercise + Writing + Speaking.</small></button>'+
      '<button class="s6-card" data-r6="s6-submissions"><strong>✅ تحویل‌ها</strong><small>Rubric، نمره و Comment استاد.</small></button>'+
      '<button class="s6-card" data-r6="s6-report"><strong>📈 گزارش کلاس</strong><small>Completion، Average و PDF.</small></button>'+
      '</div><div class="section-title"><h2>کلاس‌های من</h2></div>'+
      (classes.length?'<div class="s6-list">'+classes.map(c=>'<div class="s6-row"><div><strong>'+h(c.name)+'</strong><small>'+(c.studentIds||[]).length+' زبان‌آموز</small></div><span class="s6-code">'+h(c.code)+'</span></div>').join("")+'</div>':'<div class="s6-empty">هنوز کلاسی نساخته‌ای.</div>'));
  }

  function newClass(){
    open(head("Teacher","ساخت کلاس","کد عضویت فقط بین پروفایل‌های همین دستگاه معتبر است.",true)+
      '<input id="s6-class-name" class="s6-input" placeholder="مثلاً A1 شنبه‌ها">'+
      '<button class="primary-button" style="margin-top:9px" data-r6="s6-save-class">ساخت کلاس و کد</button>');
  }

  function newAssignment(){
    const s=state(),p=S.activeProfile(s),classes=s.classes.filter(c=>c.teacherId===p.id&&!c.archived);
    if(!classes.length)return newClass();
    const lessons=D.lessons.slice().sort((a,b)=>a.level.localeCompare(b.level)||a.title.localeCompare(b.title));
    open(head("Teacher","Assignment Builder","تمام آیتم‌ها از محتوای واقعی GHAZAL ساخته می‌شوند.",true)+
      '<label class="s6-label">کلاس</label><select id="s6-asg-class" class="s6-input">'+classes.map(c=>'<option value="'+h(c.id)+'">'+h(c.name)+'</option>').join("")+'</select>'+
      '<label class="s6-label">عنوان</label><input id="s6-asg-title" class="s6-input" placeholder="مثلاً هفته ۱ · معرفی خود">'+
      '<label class="s6-label">مهلت</label><input id="s6-asg-due" class="s6-input" type="date">'+
      '<label class="s6-label">درس اصلی</label><select id="s6-asg-lesson" class="s6-input">'+lessons.map(l=>'<option value="'+h(l.id)+'">'+h(l.level+" · "+l.title)+'</option>').join("")+'</select>'+
      '<label class="s6-label">تمرین تکمیلی</label><select id="s6-asg-ex" class="s6-input"><option value="">بدون تمرین اضافه</option><option value="meaning">Vocabulary</option><option value="cloze">Grammar</option><option value="reading">Reading</option><option value="dictation">Listening</option></select>'+
      '<label class="s6-label">Writing Prompt اختیاری</label><input id="s6-asg-writing" class="s6-input" placeholder="مثلاً خودت را در ۴ جمله معرفی کن">'+
      '<label class="s6-label">Speaking Prompt اختیاری</label><input id="s6-asg-speaking" class="s6-input" placeholder="مثلاً ۳۰ ثانیه درباره شهر خودت صحبت کن">'+
      '<label class="s6-label">راهنمای استاد</label><textarea id="s6-asg-note" class="s6-textarea"></textarea>'+
      '<button class="primary-button" style="margin-top:9px" data-r6="s6-save-assignment">ثبت و انتشار تکلیف</button>');
  }

  function submissions(){
    const s=state(),p=S.activeProfile(s),d=S.teacherDashboard(s,p.id),rows=d.enhancedSubmissions.filter(x=>["submitted","graded"].includes(x.status));
    open(head("Teacher","تحویل‌ها",rows.length+" مورد",true)+(rows.length?'<div class="s6-list">'+rows.map(sub=>{const a=d.enhancedAssignments.find(x=>x.id===sub.assignmentId),st=s.profiles.find(x=>x.id===sub.studentId);return '<button class="s6-row s6-button-row" data-r6="s6-grade" data-id="'+h(sub.id)+'"><div><strong>'+h(st?.displayName||"Student")+'</strong><small>'+h(a?.title||"Assignment")+' · '+statusFa(sub.status)+(sub.grade!=null?" · "+sub.grade+"%":"")+'</small></div><span>‹</span></button>';}).join("")+'</div>':'<div class="s6-empty">هنوز تحویل نهایی وجود ندارد.</div>'));
  }

  function grade(id){
    const s=state(),sub=s.enhancedSubmissions.find(x=>x.id===id),a=sub&&s.enhancedAssignments.find(x=>x.id===sub.assignmentId);
    if(!sub||!a)return;activeAssignment=sub;
    const answers=Object.entries(sub.answers||{}).map(([itemId,ans])=>{const item=a.items.find(x=>x.id===itemId);return '<div class="s6-answer"><b>'+h(item?.kind||"item")+'</b>'+(ans.text?'<p>'+h(ans.text)+'</p>':'')+(ans.transcript?'<p dir="ltr">'+h(ans.transcript)+'</p>':'')+(ans.score!=null?'<small>Evidence score: '+ans.score+'%</small>':'')+'</div>';}).join("");
    open(head("Teacher Review",a.title,"Rubric به‌صورت محلی و واقعی ذخیره می‌شود.",true)+answers+
      '<div class="s6-rubrics">'+["task","grammar","vocabulary","cohesion","fluency","pronunciation","register"].map(k=>'<label>'+h(k)+'<input class="s6-input s6-rubric" data-key="'+k+'" type="number" min="0" max="100"></label>').join("")+'</div>'+
      '<textarea id="s6-comment" class="s6-textarea" placeholder="بازخورد استاد"></textarea>'+
      '<button class="primary-button" style="margin-top:9px" data-r6="s6-save-grade">ثبت نمره و بازخورد</button>');
  }

  function report(){
    const s=state(),p=S.activeProfile(s),classes=s.classes.filter(c=>c.teacherId===p.id&&!c.archived);
    if(!classes.length)return newClass();
    if(!selectedClass||!classes.some(c=>c.id===selectedClass))selectedClass=classes[0].id;
    const r=S.classReport(s,selectedClass);
    open(head("Class Report",r.class.name,"گزارش واقعی بر اساس Submissionهای ذخیره‌شده.",true)+
      '<select id="s6-report-class" class="s6-input">'+classes.map(c=>'<option value="'+h(c.id)+'" '+(c.id===selectedClass?"selected":"")+'>'+h(c.name)+'</option>').join("")+'</select>'+
      '<div class="s6-kpis" style="margin-top:9px"><div><b>'+r.students.length+'</b><span>Students</span></div><div><b>'+r.completionRate+'%</b><span>Completion</span></div><div><b>'+(r.averageGrade==null?"—":r.averageGrade+"%")+'</b><span>Average</span></div></div>'+
      '<div class="s6-list" style="margin-top:9px">'+r.students.map(x=>'<div class="s6-row"><div><strong>'+h(x.name)+'</strong><small>'+x.submitted+'/'+x.assignments+' تحویل · '+x.completionRate+'%</small></div><b>'+(x.averageGrade==null?"—":x.averageGrade+"%")+'</b></div>').join("")+'</div>'+
      '<button class="secondary-button" style="margin-top:9px" data-r6="s6-export-report">خروجی PDF</button>');
  }

  function studentHome(s,p){
    const d=S.studentDashboard(s,p.id),assignments=S.assignmentsForStudent(s,p.id);
    open(head("Student Workspace",p.displayName,"عضویت، انجام تکلیف و مشاهده بازخورد استاد.",true)+
      '<div class="s6-join"><input id="s6-join-code" class="s6-input s6-code" dir="ltr" placeholder="Class Code"><button class="secondary-button" data-r6="s6-join">پیوستن</button></div>'+
      '<div class="section-title"><h2>کلاس‌های من</h2></div>'+(d.classes.length?'<div class="s6-list">'+d.classes.map(c=>'<div class="s6-row"><div><strong>'+h(c.name)+'</strong><small>کد کلاس</small></div><span class="s6-code">'+h(c.code)+'</span></div>').join("")+'</div>':'<div class="s6-empty">هنوز عضو کلاسی نیستی.</div>')+
      '<div class="section-title"><h2>تکلیف‌ها</h2></div>'+(assignments.length?'<div class="s6-list">'+assignments.map(a=>'<button class="s6-row s6-button-row" data-r6="s6-student-assignment" data-id="'+h(a.id)+'"><div><strong>'+h(a.title)+'</strong><small>'+statusFa(window.GhazalClassroomCore.assignmentStatus(a,a.submission))+(a.submission?.grade!=null?" · "+a.submission.grade+"%":"")+'</small></div><span>‹</span></button>').join("")+'</div>':'<div class="s6-empty">فعلاً تکلیفی نداری.</div>'));
  }

  function studentAssignment(id){
    const s=state(),p=S.activeProfile(s),a=S.assignmentsForStudent(s,p.id).find(x=>x.id===id);if(!a)return;
    activeAssignment=a;
    open(head("Assignment",a.title,a.instructions||"",true)+
      '<div class="s6-list">'+a.items.map((it,i)=>{const ans=a.submission?.answers?.[it.id],label=it.kind==="lesson"?(D.lessons.find(l=>l.id===it.refId)?.title||it.refId):it.kind==="exercise"?(E.exercises.find(x=>x.id===it.refId)?.prompt||it.refId):it.prompt;return '<button class="s6-row s6-button-row" data-r6="s6-item" data-id="'+h(it.id)+'"><div><strong>'+(i+1)+'. '+h(it.kind)+(ans?" ✅":"")+'</strong><small>'+h(label).slice(0,120)+'</small></div><span>‹</span></button>';}).join("")+'</div>'+
      '<button class="primary-button" style="margin-top:9px" data-r6="s6-submit">تحویل نهایی</button>'+
      (a.submission?.teacherComment?'<div class="s6-note" style="margin-top:9px"><b>بازخورد استاد</b><br>'+h(a.submission.teacherComment)+'</div>':''));
  }

  function itemPage(itemId){
    const s=state(),p=S.activeProfile(s),a=S.assignmentsForStudent(s,p.id).find(x=>x.id===activeAssignment.id),it=a&&a.items.find(x=>x.id===itemId);if(!it)return;
    activeItem=it;
    if(it.kind==="lesson"){
      const l=D.lessons.find(x=>x.id===it.refId);
      open(head("Lesson Task",l?.level||"",l?.title||it.refId,true)+'<div class="s6-note">'+h(l?.goal||"درس را کامل کن.")+'</div><button class="secondary-button" style="margin-top:9px" data-action="open-lesson" data-id="'+h(it.refId)+'">باز کردن درس</button><button class="primary-button" style="margin-top:9px" data-r6="s6-mark-lesson">ثبت انجام درس</button>');
    }else if(it.kind==="exercise"){
      const ex=E.exercises.find(x=>x.id===it.refId);if(!ex)return;
      open(head("Exercise Task",ex.level,ex.type,true)+'<div class="s6-note">'+h(ex.prompt)+'</div>'+(ex.type==="dictation"?'<button class="secondary-button" style="margin-top:9px" data-r6="s6-play-ex">🔊 پخش</button>':'')+'<input id="s6-ex-answer" class="s6-input" style="margin-top:9px"><button class="primary-button" style="margin-top:9px" data-r6="s6-save-ex">بررسی و ذخیره</button>');
    }else if(it.kind==="writing"){
      open(head("Writing Assignment","Writing",it.prompt,true)+'<textarea id="s6-writing" class="s6-textarea" placeholder="Deutsch schreiben…"></textarea><button class="primary-button" style="margin-top:9px" data-r6="s6-save-writing">ارزیابی و ذخیره</button>');
    }else if(it.kind==="speaking"){
      open(head("Speaking Assignment","Speaking",it.prompt,true)+'<button class="primary-button" data-r6="s6-speak">🎙 شروع پاسخ گفتاری</button><div class="s6-note" style="margin-top:9px">Transcript با موتور گفتار دستگاه ثبت و سپس با Evaluator داخلی Stage 4 سنجیده می‌شود.</div>');
    }
  }

  function persistItem(payload){
    try{const s=state(),p=S.activeProfile(s);save(S.saveAnswer(s,{studentId:p.id,assignmentId:activeAssignment.id,itemId:activeItem.id,...payload}));toast("پاسخ ذخیره شد");studentAssignment(activeAssignment.id);}catch(err){toast("خطا: "+err.message);}
  }

  function server(){
    const r=S.serverReadiness(state());
    open(head("Server-ready","معماری مرحله ۶","هسته فعلی بدون اینترنت کامل کار می‌کند.",true)+
      '<div class="s6-note">'+h(r.note)+'</div>'+
      '<div class="s6-list" style="margin-top:9px"><div class="s6-row"><span>Offline First</span><b>YES</b></div><div class="s6-row"><span>Cross-device Sync</span><b>فعلاً خاموش</b></div><div class="s6-row"><span>Future Roles</span><b>Student / Teacher / Admin</b></div><div class="s6-row"><span>Offline Queue Contract</span><b>'+(r.classroom.offlineQueue?"READY":"CHECK")+'</b></div><div class="s6-row"><span>Idempotency</span><b>'+(r.classroom.idempotencyRequired?"READY":"CHECK")+'</b></div></div>');
  }

  window.onSpeechResult=function(value){
    if(speechTarget==="s6-speaking"&&activeItem){
      speechTarget=null;persistItem({transcript:value});return;
    }
    if(typeof previousSpeech==="function")previousSpeech(value);
  };
  window.onSpeechError=function(msg){
    if(speechTarget==="s6-speaking"){speechTarget=null;toast(msg||"Speech recognition failed");return;}
    if(typeof previousSpeechError==="function")previousSpeechError(msg);
  };

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-r6]");if(!t)return;const a=t.dataset.r6;
    if(a==="s6-close")close();else if(a==="s6-hub")hub();else if(a==="s6-profiles")profiles();else if(a==="s6-workspace")workspace();else if(a==="s6-server")server();
    else if(a==="s6-activate"){try{save(S.setActiveProfile(state(),t.dataset.id));profiles();}catch(_){toast("پروفایل پیدا نشد");}}
    else if(a==="s6-create-profile"){try{save(S.createProfile(state(),{displayName:document.getElementById("s6-name")?.value,username:document.getElementById("s6-user")?.value,role:document.getElementById("s6-role")?.value}));profiles();}catch(err){toast(err.message==="username_exists"?"نام کاربری تکراری است":"نام معتبر وارد کن");}}
    else if(a==="s6-new-class")newClass();else if(a==="s6-save-class"){const p=active();try{save(S.createClass(state(),{teacherId:p&&p.id,name:document.getElementById("s6-class-name")?.value}));workspace();}catch(_){toast("نام کلاس معتبر وارد کن");}}
    else if(a==="s6-new-assignment")newAssignment();else if(a==="s6-save-assignment"){const p=active(),ex=document.getElementById("s6-asg-ex")?.value||"";try{save(S.createAssignment(state(),{teacherId:p.id,classId:document.getElementById("s6-asg-class")?.value,title:document.getElementById("s6-asg-title")?.value,dueDate:document.getElementById("s6-asg-due")?.value,lessonId:document.getElementById("s6-asg-lesson")?.value,exerciseType:ex||undefined,includeExercise:!!ex,writingPrompt:document.getElementById("s6-asg-writing")?.value,speakingPrompt:document.getElementById("s6-asg-speaking")?.value,instructions:document.getElementById("s6-asg-note")?.value}));toast("تکلیف منتشر شد");workspace();}catch(err){toast("خطا: "+err.message);}}
    else if(a==="s6-submissions")submissions();else if(a==="s6-grade")grade(t.dataset.id);else if(a==="s6-save-grade"){const p=active(),rubric={};document.querySelectorAll(".s6-rubric").forEach(el=>{if(el.value!=="")rubric[el.dataset.key]=Number(el.value);});try{save(S.gradeSubmission(state(),{teacherId:p.id,submissionId:activeAssignment.id,rubric,comment:document.getElementById("s6-comment")?.value}));toast("نمره ثبت شد");submissions();}catch(err){toast("خطا: "+err.message);}}
    else if(a==="s6-report")report();else if(a==="s6-export-report"){try{native("exportProgressPdf",JSON.stringify(S.reportPayload(state(),selectedClass)));}catch(_){toast("PDF در دسترس نیست");}}
    else if(a==="s6-join"){const p=active();try{save(S.joinClass(state(),{studentId:p.id,code:document.getElementById("s6-join-code")?.value}));studentHome(state(),active());}catch(_){toast("کد کلاس معتبر نیست");}}
    else if(a==="s6-student-assignment")studentAssignment(t.dataset.id);else if(a==="s6-item")itemPage(t.dataset.id);else if(a==="s6-mark-lesson")persistItem({completed:true,score:100});
    else if(a==="s6-play-ex"){const ex=E.exercises.find(x=>x.id===activeItem.refId);if(ex?.audioText)native("speak",ex.audioText);}else if(a==="s6-save-ex")persistItem({text:document.getElementById("s6-ex-answer")?.value||""});
    else if(a==="s6-save-writing")persistItem({text:document.getElementById("s6-writing")?.value||""});else if(a==="s6-speak"){speechTarget="s6-speaking";native("startSpeechRecognition","Stage 6 speaking assignment");}
    else if(a==="s6-submit"){const p=active();try{save(S.submitAssignment(state(),{studentId:p.id,assignmentId:activeAssignment.id}));toast("تکلیف تحویل شد");studentHome(state(),active());}catch(err){toast(err.message==="required_items_incomplete"?"همه بخش‌های اجباری را کامل کن":"خطا در تحویل");}}
  });
  document.addEventListener("change",e=>{if(e.target&&e.target.id==="s6-report-class"){selectedClass=e.target.value;report();}});

  function inject(){
    const profile=view.querySelector(".settings-card");
    if(profile&&!view.querySelector("[data-r6='stage6-hub']")){
      profile.insertAdjacentHTML("beforebegin",'<button class="card skill-card s6-entry" style="width:100%;margin-bottom:12px" data-r6="stage6-hub"><span class="big-icon">👥</span><strong>مرحله ۶ · پروفایل‌ها و کلاس‌ها</strong><small>Teacher/Student، Class Code، تکلیف، Speaking/Writing، نمره و گزارش آفلاین.</small></button>');
    }
  }
  document.addEventListener("click",e=>{const t=e.target.closest("[data-r6='stage6-hub']");if(t)hub();});
  document.addEventListener("ghazal:ui-changed",inject);setTimeout(inject,550);
})();
