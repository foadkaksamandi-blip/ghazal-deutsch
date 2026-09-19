"use strict";
const fs=require("fs"),path=require("path");
async function main(){
  const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL_required");
  const {Pool}=require("pg");const pool=new Pool({connectionString:url,ssl:url.includes("localhost")?false:{rejectUnauthorized:false}});
  try{
    for(const f of fs.readdirSync(path.join(__dirname,"migrations")).filter(x=>x.endsWith(".sql")).sort()){
      console.log("migrating",f);await pool.query(fs.readFileSync(path.join(__dirname,"migrations",f),"utf8"));
    }
    console.log("migrations complete");
  }finally{await pool.end();}
}
main().catch(e=>{console.error(e);process.exit(1);});
