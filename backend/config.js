"use strict";
function loadConfig(env=process.env){
  const allowedOrigins=String(env.GHAZAL_ALLOWED_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean);
  return{
    env:env.NODE_ENV||"production",
    databaseUrl:env.DATABASE_URL||"",
    tokenSecret:env.GHAZAL_TOKEN_SECRET||"",
    allowedOrigins,
    accessTtl:Number(env.GHAZAL_ACCESS_TTL_SECONDS||900),
    refreshTtl:Number(env.GHAZAL_REFRESH_TTL_SECONDS||2592000),
    aiBaseUrl:(env.GHAZAL_AI_BASE_URL||"https://api.openai.com/v1").replace(/\/$/,""),
    aiApiKey:env.OPENAI_API_KEY||env.GHAZAL_AI_API_KEY||"",
    aiModel:env.GHAZAL_AI_MODEL||"gpt-5-mini",
    release:env.VERCEL_GIT_COMMIT_SHA||env.GITHUB_SHA||"local"
  };
}
function assertRuntimeConfig(c){
  const missing=[];if(!c.databaseUrl)missing.push("DATABASE_URL");if(!c.tokenSecret||c.tokenSecret.length<32)missing.push("GHAZAL_TOKEN_SECRET");
  if(missing.length)throw new Error("missing_runtime_config:"+missing.join(","));return c;
}
module.exports={loadConfig,assertRuntimeConfig};
