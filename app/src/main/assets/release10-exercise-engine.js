(function(root,factory){
  const api=factory(
    root&&root.GhazalData,
    root&&root.GhazalDictionary,
    root&&root.GhazalLibrary,
    root&&root.GhazalDeepLibrary,
    root&&root.GhazalSpecialization
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalExerciseEngine=api;
})(typeof window!=="undefined"?window:null,function(Data,Dict,Lib,Deep,Spec){
  "use strict";
  function norm(s){return String(s||"").toLocaleLowerCase("de-DE").replace(/[.,!?;:„“"'()\[\]{}]/g," ").replace(/\s+/g," ").trim();}
  function stableId(parts){return parts.map(x=>norm(x).replace(/[^a-z0-9äöüß]+/gi,"-")).join("-").slice(0,150);}
  function sameLevelWords(level){
    const all=[];
    if(Data&&Array.isArray(Data.lessons))Data.lessons.filter(l=>l.level===level).forEach(l=>(l.words||[]).forEach(w=>all.push(w)));
    return all;
  }
  function distractors(level,answer,field){
    const vals=sameLevelWords(level).map(w=>String(w[field]||"")).filter(v=>v&&norm(v)!==norm(answer));
    return [...new Set(vals)].slice(0,6);
  }
  function cloze(example,target){
    const e=String(example||""),t=String(target||"");
    if(!e||!t)return "";
    const pos=e.toLocaleLowerCase("de-DE").indexOf(t.toLocaleLowerCase("de-DE"));
    if(pos<0)return e.replace(/\b\S+\b/,"_____");
    return e.slice(0,pos)+"_____"+e.slice(pos+t.length);
  }
  function generate(){
    const out=[];
    if(Data&&Array.isArray(Data.lessons))Data.lessons.forEach(lesson=>{
      (lesson.words||[]).forEach((w,wi)=>{
        const de=String(w[0]||""),fa=String(w[1]||""),ex=String(w[2]||"");
        if(!de||!fa)return;
        out.push({id:stableId(["meaning",lesson.id,wi]),type:"meaning",level:lesson.level,lessonId:lesson.id,prompt:de,answer:fa,options:[fa,...distractors(lesson.level,fa,1).slice(0,3)]});
        out.push({id:stableId(["recall",lesson.id,wi]),type:"recall",level:lesson.level,lessonId:lesson.id,prompt:fa,answer:de});
        if(ex)out.push({id:stableId(["cloze",lesson.id,wi]),type:"cloze",level:lesson.level,lessonId:lesson.id,prompt:cloze(ex,de),answer:de,context:ex});
      });
      if(lesson.pattern&&lesson.pattern.de)out.push({id:stableId(["pattern",lesson.id]),type:"pattern",level:lesson.level,lessonId:lesson.id,prompt:lesson.pattern.fa||lesson.goal,answer:lesson.pattern.de});
      (lesson.dialogue||[]).forEach((d,di)=>{if(d[0])out.push({id:stableId(["dialogue",lesson.id,di]),type:"dialogue",level:lesson.level,lessonId:lesson.id,prompt:d[1]||"پاسخ طبیعی را تولید کن",answer:d[0]});});
      if(lesson.quiz&&lesson.quiz.q)out.push({id:stableId(["lessonquiz",lesson.id]),type:"mcq",level:lesson.level,lessonId:lesson.id,prompt:lesson.quiz.q,answer:lesson.quiz.options[lesson.quiz.answer],options:lesson.quiz.options,explain:lesson.quiz.explain});
    });
    if(Lib){
      (Lib.grammar||[]).forEach(x=>out.push({id:stableId(["grammar",x.id]),type:"grammar",level:x.level,prompt:x.title+": "+x.rule,answer:x.example,explain:x.mistake}));
      (Lib.redemittel||[]).forEach(x=>out.push({id:stableId(["redemittel",x.id]),type:"redemittel",level:x.level,prompt:"عبارت را از حافظه بازسازی و در جمله شخصی استفاده کن.",answer:x.text}));
      (Lib.writing||[]).forEach(x=>out.push({id:stableId(["writing",x.id]),type:"writing",level:x.level,prompt:x.prompt,answer:"free"}));
      (Lib.speaking||[]).forEach(x=>out.push({id:stableId(["speaking",x.id]),type:"speaking",level:x.level,prompt:x.prompt,answer:"free"}));
    }
    if(Deep){
      (Deep.contrasts||[]).forEach(x=>out.push({id:stableId(["contrast",x.id]),type:"contrast",level:x.level,prompt:x.title+" — "+x.explanation,answer:x.example,explain:x.trap}));
      (Deep.reading||[]).forEach(x=>(x.questions||[]).forEach((q,i)=>out.push({id:stableId(["reading",x.id,i]),type:"reading",level:x.level,prompt:q,context:x.text,answer:"free"})));
      (Deep.listening||[]).forEach(x=>out.push({id:stableId(["dictation",x.id]),type:"dictation",level:x.level,prompt:"آنچه می‌شنوی دقیق تایپ کن.",audioText:x.script,answer:x.script}));
      (Deep.writing||[]).forEach(x=>out.push({id:stableId(["deepwriting",x.id]),type:"writing",level:x.level,prompt:x.prompt,answer:"free"}));
      (Deep.speaking||[]).forEach(x=>out.push({id:stableId(["deepspeaking",x.id]),type:"speaking",level:x.level,prompt:x.prompt,answer:"free"}));
      (Deep.exams||[]).forEach(x=>out.push({id:stableId(["exam",x.id]),type:"exam",level:x.level,prompt:x.task,answer:"free",exam:x.exam,skill:x.skill,minutes:x.minutes}));
    }
    if(Spec&&Spec.tracks)Object.values(Spec.tracks).forEach(track=>(track.modules||[]).forEach(m=>{
      (m.vocabulary||[]).forEach((v,i)=>{
        out.push({id:stableId(["specvocab",m.id,i]),type:"recall",level:m.level,prompt:v.fa,answer:v.de,track:track.id,moduleId:m.id});
        out.push({id:stableId(["specmeaning",m.id,i]),type:"meaning",level:m.level,prompt:v.de,answer:v.fa,track:track.id,moduleId:m.id});
      });
      (m.phrases||[]).forEach((p,i)=>out.push({id:stableId(["specphrase",m.id,i]),type:"redemittel",level:m.level,prompt:"عبارت کاربردی این موقعیت را بازسازی کن.",answer:p,track:track.id,moduleId:m.id}));
      out.push({id:stableId(["specwriting",m.id]),type:"writing",level:m.level,prompt:m.writing,answer:"free",track:track.id,moduleId:m.id});
      out.push({id:stableId(["specspeaking",m.id]),type:"speaking",level:m.level,prompt:m.speaking,answer:"free",track:track.id,moduleId:m.id});
    }));
    return out;
  }
  const exercises=generate();
  function list(filter){
    const f=filter||{};
    return exercises.filter(x=>(!f.level||x.level===f.level)&&(!f.type||x.type===f.type)&&(!f.track||x.track===f.track));
  }
  function summary(){
    const byLevel={},byType={};exercises.forEach(x=>{byLevel[x.level]=(byLevel[x.level]||0)+1;byType[x.type]=(byType[x.type]||0)+1;});
    return{total:exercises.length,byLevel,byType};
  }
  function compare(answer,target){
    const a=norm(answer),b=norm(target);if(!a||!b)return 0;if(a===b)return 100;
    const aw=new Set(a.split(" ")),bw=new Set(b.split(" "));let hit=0;aw.forEach(w=>{if(bw.has(w))hit++;});
    return Math.round(100*(2*hit)/Math.max(1,aw.size+bw.size));
  }
  return{version:1,exercises,list,summary,compare};
});