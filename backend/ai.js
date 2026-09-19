"use strict";
async function callAI(config,kind,input,user){
  if(!config.aiApiKey)return{available:false,reason:"ai_provider_not_configured"};
  const prompts={
    tutor:"Act as a German tutor for a Persian-speaking learner. Be concise, CEFR-aware, and correct mistakes explicitly.",
    writing:"Evaluate German writing. Return concise feedback on grammar, vocabulary, cohesion, task completion, and register.",
    conversation:"Continue a realistic German conversation. Keep the learner's CEFR level and migration/life context in mind."
  };
  const body={model:config.aiModel,input:[{role:"system",content:prompts[kind]||prompts.tutor},{role:"user",content:JSON.stringify({user:{id:user.id,role:user.role},request:input})}],max_output_tokens:700};
  const response=await fetch(config.aiBaseUrl+"/responses",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+config.aiApiKey},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  const text=await response.text();if(!response.ok)throw new Error("ai_provider_"+response.status+":"+text.slice(0,300));
  const data=JSON.parse(text);return{available:true,provider:"openai-compatible",model:config.aiModel,responseId:data.id||null,outputText:data.output_text||extract(data)};
}
function extract(data){try{return (data.output||[]).flatMap(x=>x.content||[]).map(x=>x.text||"").filter(Boolean).join("\n");}catch(_){return"";}}
module.exports={callAI};
