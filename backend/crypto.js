"use strict";
const crypto=require("crypto");
const b64=v=>Buffer.from(v).toString("base64url");
const unb64=v=>Buffer.from(v,"base64url");
function hashPassword(password){
  if(typeof password!=="string"||password.length<10||password.length>256)throw new Error("password_policy");
  const salt=crypto.randomBytes(16);const key=crypto.scryptSync(password,salt,64,{N:16384,r:8,p:1});
  return `scrypt$16384$${b64(salt)}$${b64(key)}`;
}
function verifyPassword(password,encoded){
  try{const [alg,n,salt,key]=String(encoded||"").split("$");if(alg!=="scrypt"||n!=="16384")return false;
    const actual=crypto.scryptSync(password,unb64(salt),64,{N:16384,r:8,p:1});const expected=unb64(key);
    return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected);
  }catch(_){return false;}
}
function signAccessToken(payload,secret,ttlSeconds=900){
  if(!secret||secret.length<32)throw new Error("token_secret_missing");
  const now=Math.floor(Date.now()/1000);const header={alg:"HS256",typ:"JWT"};const body={...payload,iat:now,exp:now+ttlSeconds};
  const data=b64(JSON.stringify(header))+"."+b64(JSON.stringify(body));
  const sig=crypto.createHmac("sha256",secret).update(data).digest("base64url");return data+"."+sig;
}
function verifyAccessToken(token,secret){
  try{const [h,p,s]=String(token||"").split(".");if(!h||!p||!s)return null;const data=h+"."+p;
    const expected=crypto.createHmac("sha256",secret).update(data).digest();const actual=unb64(s);
    if(expected.length!==actual.length||!crypto.timingSafeEqual(expected,actual))return null;
    const body=JSON.parse(unb64(p).toString("utf8"));if(!body.exp||body.exp<Math.floor(Date.now()/1000))return null;return body;
  }catch(_){return null;}
}
function issueRefreshToken(){const raw=crypto.randomBytes(48).toString("base64url");return{raw,hash:hashOpaque(raw)};}
function hashOpaque(raw){return crypto.createHash("sha256").update(String(raw)).digest("hex");}
function randomId(prefix){return prefix+"_"+crypto.randomBytes(12).toString("hex");}
module.exports={hashPassword,verifyPassword,signAccessToken,verifyAccessToken,issueRefreshToken,hashOpaque,randomId};
