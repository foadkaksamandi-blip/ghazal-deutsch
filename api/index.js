"use strict";
const {loadConfig,assertRuntimeConfig}=require("../backend/config");
const {createPgStore}=require("../backend/pg-store");
const {createApp}=require("../backend/app");
let cached;
module.exports=async function handler(req,res){
  if(!cached){const config=assertRuntimeConfig(loadConfig());cached=createApp({store:createPgStore(config.databaseUrl),config});}
  return cached(req,res);
};
