(function(root,factory){
  const api=factory(root&&root.GhazalExerciseEngine,root&&root.GhazalDeepLibrary);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalOfflineCoach=api;
})(typeof window!=="undefined"?window:null,function(Exercises,Deep){
  "use strict";
  const TARGET={A1:35,A2:75,B1:120,B2:180,C1:220,C2:280};
  const CONNECTORS={
    A1:["und","aber","oder","weil"],
    A2:["weil","dass","wenn","deshalb","trotzdem"],
    B1:["einerseits","andererseits","deshalb","obwohl","zum beispiel","zusammenfassend"],
    B2:["während","dennoch","allerdings","im vergleich","aus meiner sicht","folglich"],
    C1:["insofern","demgegenüber","daraus folgt","vor diesem hintergrund","allerdings","hingegen","folglich"],
    C2:["gleichwohl","unter der voraussetzung","bei näherer betrachtung","insofern","vorbehaltlich","sofern","dementsprechend"]
  };
  const REGISTER={
    formal:["sehr geehrte","mit freundlichen grüßen","hiermit","bezüglich","ich bitte","könnten sie"],
    academic:["die ergebnisse","die studie","daraus","evidenz","einschränkung","these","befund","lässt sich"],
    neutral:["ich denke","meiner meinung","zum beispiel","deshalb"]
  };
  const ERRORS=[
    {id:"weil-order",re:/\bweil\s+(ich|du|er|sie|wir|ihr|sie)\s+(bin|bist|ist|sind|seid|habe|hast|hat|haben)\b/i,msg:"بعد از weil فعل صرف‌شده معمولاً به پایان جمله وابسته می‌رود."},
    {id:"age-haben",re:/\bich\s+habe\s+\d+\s+jahre\b/i,msg:"برای سن از sein استفاده کن: Ich bin … Jahre alt."},
    {id:"mehr-besser",re:/\bmehr\s+besser\b/i,msg:"besser خودش Komparativ است؛ mehr لازم نیست."},
    {id:"interessiere",re:/\bich\s+interessiere\s+(?!mich\b)/i,msg:"sich interessieren بازتابی است: Ich interessiere mich für …"},
    {id:"seit-past",re:/\bseit\b[^.!?]{0,50}\b(war|hatte|machte|ging)\b/i,msg:"برای وضعیتی که از گذشته تا حال ادامه دارد، معمولاً seit + Präsens را بررسی کن."},
    {id:"formal-du",re:/\bsehr geehrte[\s\S]{0,200}\b(du|dein|dich)\b/i,msg:"در نامه رسمی، ضمایر du/dein را با Sie/Ihr یکدست کن."}
  ];
  function words(t){return String(t||"").trim().split(/\s+/).filter(Boolean);}
  function sentences(t){return String(t||"").split(/[.!?]+/).map(x=>x.trim()).filter(Boolean);}
  function norm(t){return String(t||"").toLocaleLowerCase("de-DE");}
  function countHits(text,list){const n=norm(text);return list.reduce((c,x)=>c+(n.includes(x)?1:0),0);}
  function repeatedRatio(ws){if(!ws.length)return 0;const freq={};ws.map(x=>norm(x).replace(/[^a-zäöüß]/g,"")).filter(x=>x.length>3).forEach(x=>freq[x]=(freq[x]||0)+1);const repeated=Object.values(freq).filter(n=>n>=3).reduce((a,b)=>a+b,0);return repeated/ws.length;}
  function inferRegister(prompt){
    const p=norm(prompt);if(/email|e-mail|beschwerde|antrag|bericht|formal|رسمی|اداری/.test(p))return"formal";
    if(/wissenschaft|studie|synthese|hausarbeit|akadem|دانشگاه|علمی/.test(p))return"academic";
    return"neutral";
  }
  function analyze(text,level,prompt){
    const t=String(text||"").trim(),ws=words(t),ss=sentences(t),target=TARGET[level]||120,connectorHits=countHits(t,CONNECTORS[level]||[]),reg=inferRegister(prompt),registerHits=countHits(t,REGISTER[reg]||[]),errors=ERRORS.filter(e=>e.re.test(t)).map(e=>({id:e.id,message:e.msg}));
    const unique=new Set(ws.map(x=>norm(x).replace(/[^a-zäöüß]/g,"")).filter(Boolean)).size;
    const lengthScore=Math.min(100,Math.round(ws.length/target*100));
    const structureScore=Math.min(100,Math.round((Math.min(ss.length,Math.max(3,Math.round(target/35)))/Math.max(3,Math.round(target/35)))*70+Math.min(connectorHits,3)/3*30));
    const varietyScore=ws.length?Math.min(100,Math.round(unique/ws.length*125)):0;
    const repetitionPenalty=Math.round(repeatedRatio(ws)*100);
    const mechanicsScore=Math.max(0,Math.min(100,70+(t.match(/[.!?]/g)||[]).length*4-errors.length*12));
    const registerScore=Math.min(100,reg==="neutral"?70+Math.min(registerHits,2)*15:45+Math.min(registerHits,3)*18);
    const cohesionScore=Math.min(100,35+connectorHits*18);
    const total=Math.round(lengthScore*.2+structureScore*.2+varietyScore*.16+mechanicsScore*.16+registerScore*.14+cohesionScore*.14-Math.min(12,repetitionPenalty*.15));
    const suggestions=[];
    if(ws.length<target*.75)suggestions.push("متن برای این سطح کوتاه است؛ دلیل، مثال یا نتیجه اضافه کن.");
    if(connectorHits<2&&level!=="A1")suggestions.push("از رابط‌های متناسب سطح برای پیوند منطقی جمله‌ها استفاده کن.");
    if(registerHits===0&&reg!=="neutral")suggestions.push("Register متن را با عبارت‌های رسمی/دانشگاهی متناسب‌تر کن.");
    if(repetitionPenalty>18)suggestions.push("چند واژه زیاد تکرار شده‌اند؛ از ضمیر، مترادف یا بازنویسی استفاده کن.");
    errors.forEach(e=>suggestions.push(e.message));
    if(!suggestions.length)suggestions.push("ساختار پایه مناسب است؛ حالا روی طبیعی‌بودن، دقت واژگانی و بازخوانی نهایی تمرکز کن.");
    return{level,register:reg,total:Math.max(0,Math.min(100,total)),wordCount:ws.length,sentenceCount:ss.length,uniqueWords:unique,connectorHits,dimensions:{length:lengthScore,structure:structureScore,variety:varietyScore,mechanics:mechanicsScore,register:registerScore,cohesion:cohesionScore},errors,suggestions,limitations:"Offline rule-based diagnostic; not equivalent to human or LLM correction."};
  }

  function buildMock(exam,level){
    const bank=Deep&&Array.isArray(Deep.exams)?Deep.exams:[],direct=bank.filter(x=>x.exam===exam&&(!level||x.level===level));
    const fallback=bank.filter(x=>x.exam===exam);
    const source=direct.length>=2?direct:fallback;
    const sections=["Lesen","Hören","Schreiben","Sprechen"].map(skill=>{
      const exact=source.find(x=>x.skill===skill)||(Exercises&&Exercises.exercises||[]).find(x=>x.level===level&&((skill==="Lesen"&&x.type==="reading")||(skill==="Hören"&&x.type==="dictation")||(skill==="Schreiben"&&x.type==="writing")||(skill==="Sprechen"&&x.type==="speaking")));
      return{skill,item:exact||null,minutes:exact&&exact.minutes?exact.minutes:(skill==="Lesen"?20:skill==="Hören"?15:skill==="Schreiben"?30:10)};
    });
    return{id:"mock-"+String(exam).toLowerCase()+"-"+String(level||"mixed").toLowerCase(),exam,level:level||"mixed",sections,totalMinutes:sections.reduce((n,s)=>n+s.minutes,0),official:false,note:"Practice mock assembled from GHAZAL content. It is not an official exam paper or official scoring instrument."};
  }

  function testdafReadiness(skills){
    const s=skills||{},names=["reading","listening","writing","speaking"],scores={};
    names.forEach(k=>{const x=s[k]||{};scores[k]=(Number(x.attempts)||0)?Math.round((Number(x.total)||0)/(Number(x.attempts)||1)):0;});
    const min=Math.min(...Object.values(scores)),avg=Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/4);
    let band="Foundation";if(min>=80&&avg>=84)band="TDN5-target practice readiness";else if(min>=65&&avg>=70)band="TDN4-target practice readiness";else if(avg>=50)band="Developing";
    return{scores,min,avg,band,official:false,note:"Internal practice-readiness indicator only; not a TestDaF score prediction."};
  }

  return{version:1,analyze,buildMock,testdafReadiness};
});