const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.join(__dirname,"..");
const index=fs.readFileSync(path.join(root,"app/src/main/assets/index.html"),"utf8");
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const gradle=fs.readFileSync(path.join(root,"app/build.gradle"),"utf8");
const lock=fs.readFileSync(path.join(root,"docs/MASTER_PRODUCT_LOCK.md"),"utf8");

test("Release 6 loads real platform assets",()=>{
  for(const asset of ["platform-core.js","release6-platform.js","release6-platform.css"]){
    assert.ok(index.includes(asset),asset);
  }
});

test("Release 6 version is consistent",()=>{
  assert.equal(pkg.version,"6.0.0");
  assert.match(gradle,/versionCode 6/);
  assert.match(gradle,/versionName "6\.0\.0"/);
});

test("master product lock preserves core product rules",()=>{
  for(const phrase of ["APP = SCHOOL","NO EMPTY SHELL","NO REGRESSION","IRAN-FIRST","Teacher workspace","Release signing"]){
    assert.ok(lock.includes(phrase),phrase);
  }
});