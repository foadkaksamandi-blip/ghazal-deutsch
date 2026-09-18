(function(root,factory){
  const api=factory(
    root&&root.GhazalData,
    root&&root.GhazalDictionary,
    root&&root.GhazalLibrary,
    root&&root.GhazalDeepLibrary,
    root&&root.GhazalSpecialization,
    root&&root.GhazalAdvancedContent,
    root&&root.GhazalExerciseEngine
  );
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalContentSystem=api;
})(typeof window!=="undefined"?window:null,function(Data,Dict,Lib,Deep,Spec,Advanced,Exercises){
  "use strict";
  const VERSION="10.0.0";
  const SCHEMA=3;

  function buildIndex(){
    const out=[];
    const push=(x)=>out.push(x);
    if(Data&&Array.isArray(Data.lessons))Data.lessons.forEach(l=>{
      push({id:"lesson:"+l.id,type:"lesson",level:l.level,title:l.title,text:[l.de,l.goal,l.pattern&&l.pattern.de,l.pattern&&l.pattern.fa].filter(Boolean).join(" "),ref:l.id});
      (l.words||[]).forEach((w,i)=>push({id:"word:"+l.id+":"+i,type:"word",level:l.level,title:w[0],text:[w[1],w[2]].join(" "),ref:l.id}));
      (l.dialogue||[]).forEach((d,i)=>push({id:"dialogue:"+l.id+":"+i,type:"dialogue",level:l.level,title:d[0],text:d[1]||"",ref:l.id}));
    });
    if(Dict&&Array.isArray(Dict.all))Dict.all.forEach(x=>push({id:"dict:"+x.id,type:"dictionary",level:x.level,title:x.lemma,text:[x.meaning,x.collocation,x.example,x.grammar].filter(Boolean).join(" "),ref:x.id}));
    if(Lib){
      (Lib.grammar||[]).forEach(x=>push({id:"grammar:"+x.id,type:"grammar",level:x.level,title:x.title,text:[x.rule,x.example,x.mistake].join(" "),ref:x.id}));
      (Lib.redemittel||[]).forEach(x=>push({id:"phrase:"+x.id,type:"redemittel",level:x.level,title:x.text,text:x.text,ref:x.id}));
      (Lib.reading||[]).forEach(x=>push({id:"reading:"+x.id,type:"reading",level:x.level,title:x.title,text:x.text,ref:x.id}));
      (Lib.listening||[]).forEach(x=>push({id:"listening:"+x.id,type:"listening",level:x.level,title:x.title,text:x.script,ref:x.id}));
    }
    if(Deep){
      (Deep.contrasts||[]).forEach(x=>push({id:"contrast:"+x.id,type:"contrast",level:x.level,title:x.title,text:[x.explanation,x.example,x.trap].join(" "),ref:x.id}));
      (Deep.exams||[]).forEach(x=>push({id:"exam:"+x.id,type:"exam",level:x.level,title:x.exam+" "+x.skill,text:x.task,ref:x.id}));
    }
    if(Spec&&Spec.tracks)Object.values(Spec.tracks).forEach(t=>(t.modules||[]).forEach(m=>push({id:"module:"+m.id,type:"module",level:m.level,title:m.title,text:[m.fa,m.goal,m.writing,m.speaking,...m.phrases].join(" "),ref:m.id,track:t.id})));
    if(Advanced&&Advanced.packs)Object.entries(Advanced.packs).forEach(([k,p])=>(p.items||[]).forEach(x=>push({id:"pack:"+x.id,type:"pack",level:x.level,title:x.de,text:[x.fa,x.example,x.register].join(" "),ref:x.id,pack:k})));
    return out;
  }
  const index=buildIndex();

  function normalize(s){return String(s||"").toLocaleLowerCase("de-DE").replace(/[.,!?;:„“"'()\[\]{}]/g," ").replace(/\s+/g," ").trim();}
  function search(q,filters){
    const query=normalize(q),terms=query.split(" ").filter(Boolean),f=filters||{};
    let pool=index.filter(x=>(!f.level||x.level===f.level)&&(!f.type||x.type===f.type)&&(!f.track||x.track===f.track));
    if(!query)return pool.slice(0,100);
    return pool.map(x=>{const hay=normalize([x.title,x.text,x.level,x.type].join(" "));let score=0;terms.forEach(t=>{if(normalize(x.title)===t)score+=20;else if(hay.startsWith(t))score+=8;else if(hay.includes(t))score+=3;});return{x,score};}).filter(o=>o.score>0).sort((a,b)=>b.score-a.score).slice(0,100).map(o=>o.x);
  }

  function counts(){
    const levels=["A1","A2","B1","B2","C1","C2"],lessons=Data&&Array.isArray(Data.lessons)?Data.lessons:[],modules=Spec&&Spec.tracks?Object.values(Spec.tracks).flatMap(t=>t.modules||[]):[];
    const byLevel={};levels.forEach(l=>byLevel[l]={lessons:lessons.filter(x=>x.level===l).length,modules:modules.filter(x=>x.level===l).length,grammar:(Lib&&Lib.grammar||[]).filter(x=>x.level===l).length,dictionary:(Dict&&Dict.all||[]).filter(x=>x.level===l).length,exercises:(Exercises&&Exercises.exercises||[]).filter(x=>x.level===l).length});
    return{
      lessons:lessons.length,
      specializationModules:modules.length,
      educationalUnits:lessons.length+modules.length,
      exercises:Exercises&&Exercises.exercises?Exercises.exercises.length:0,
      grammar:Lib&&Lib.grammar?Lib.grammar.length:0,
      contrasts:Deep&&Deep.contrasts?Deep.contrasts.length:0,
      dictionary:Dict&&Dict.all?Dict.all.length:0,
      advancedPackItems:Advanced&&Advanced.packs?Object.values(Advanced.packs).reduce((n,p)=>n+(p.items||[]).length,0):0,
      audioDrills:Advanced&&Advanced.audio?Advanced.audio.length:0,
      pronunciation:Advanced&&Advanced.pronunciation?Advanced.pronunciation.length:0,
      index:index.length,
      byLevel
    };
  }

  function audit(){
    const c=counts(),issues=[],levels=["A1","A2","B1","B2","C1","C2"];
    if(c.educationalUnits<200)issues.push("educational_units_below_200");
    if(c.exercises<2000)issues.push("exercises_below_2000");
    if(c.grammar<60)issues.push("grammar_below_60");
    if(c.contrasts<36)issues.push("contrasts_below_36");
    if(c.advancedPackItems<100)issues.push("advanced_pack_below_100");
    if(c.audioDrills<12)issues.push("audio_drills_below_12");
    if(c.pronunciation<24)issues.push("pronunciation_below_24");
    levels.forEach(l=>{
      if(c.byLevel[l].lessons<20)issues.push("lesson_coverage_"+l);
      if(c.byLevel[l].exercises<150)issues.push("exercise_coverage_"+l);
    });
    const ids=index.map(x=>x.id),dups=ids.filter((id,i)=>ids.indexOf(id)!==i);
    if(dups.length)issues.push("duplicate_index_ids");
    return{version:VERSION,schema:SCHEMA,pass:issues.length===0,issues,counts:c,checkedAt:new Date().toISOString()};
  }

  const manifest={
    product:"GHAZAL",
    version:VERSION,
    schema:SCHEMA,
    market:"IR",
    offlineFirst:true,
    packs:[
      {id:"core",version:"10.0.0",required:true},
      {id:"dictionary",version:"2.0.0",required:true},
      {id:"advanced",version:"1.0.0",required:true},
      {id:"specialization",version:"1.0.0",required:true},
      {id:"exam",version:"1.0.0",required:true}
    ],
    migrationRules:[
      {from:1,to:2,rule:"preserve lesson progress and review records"},
      {from:2,to:3,rule:"preserve ids; add content metadata and resume cursor without deleting user history"}
    ]
  };

  function migrateState(input){
    const s=input&&typeof input==="object"?JSON.parse(JSON.stringify(input)):{};
    s.contentSchema=SCHEMA;
    s.contentVersion=VERSION;
    s.resume=s.resume&&typeof s.resume==="object"?s.resume:{};
    s.migratedAt=new Date().toISOString();
    return s;
  }

  function makeResume(activity){
    return{type:String(activity&&activity.type||""),id:String(activity&&activity.id||""),step:Number(activity&&activity.step||0),level:String(activity&&activity.level||""),at:new Date().toISOString()};
  }

  function weeklyReport(skillState){
    const skills=skillState&&typeof skillState==="object"?skillState:{};
    const rows=Object.entries(skills).map(([id,s])=>({id,attempts:Number(s.attempts)||0,avg:(Number(s.attempts)||0)?Math.round((Number(s.total)||0)/(Number(s.attempts)||1)):0,best:Number(s.best)||0,lastAt:s.lastAt||null})).sort((a,b)=>a.avg-b.avg);
    return{generatedAt:new Date().toISOString(),weakest:rows.slice(0,5),strongest:rows.slice(-5).reverse(),totalAttempts:rows.reduce((n,x)=>n+x.attempts,0)};
  }

  return{VERSION,SCHEMA,index,search,counts,audit,manifest,migrateState,makeResume,weeklyReport};
});