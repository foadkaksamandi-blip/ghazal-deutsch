const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const dict=require('../app/src/main/assets/release8-dictionary.js');
const deep=require('../app/src/main/assets/release8-deep-library.js');

test('Release 8 curated dictionary covers every CEFR level with rich metadata',()=>{
  assert.equal(dict.curated.length,72);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    const items=dict.curated.filter(x=>x.level===level);
    assert.equal(items.length,12,level);
    for(const x of items){
      assert.ok(x.lemma&&x.meaning&&x.pos&&x.example&&x.register);
    }
  }
});

test('dictionary search works offline on German and Persian fields',()=>{
  assert.ok(dict.search('Widerspruch','B2',20).some(x=>x.lemma.includes('Widerspruch')));
  assert.ok(dict.search('اجاره','A2',20).some(x=>x.meaning.includes('اجاره')));
});

test('grammar contrast bank covers A1-C2 evenly',()=>{
  assert.equal(deep.contrasts.length,36);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    assert.equal(deep.contrasts.filter(x=>x.level===level).length,6,level);
  }
});

test('deep reading and listening banks cover every CEFR level',()=>{
  assert.equal(deep.reading.length,18);
  assert.equal(deep.listening.length,18);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    assert.equal(deep.reading.filter(x=>x.level===level).length,3,'reading '+level);
    assert.equal(deep.listening.filter(x=>x.level===level).length,3,'listening '+level);
  }
});

test('deep writing and speaking production tasks cover every CEFR level',()=>{
  assert.equal(deep.writing.length,18);
  assert.equal(deep.speaking.length,18);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    assert.equal(deep.writing.filter(x=>x.level===level).length,3,'writing '+level);
    assert.equal(deep.speaking.filter(x=>x.level===level).length,3,'speaking '+level);
  }
});

test('exam bank contains all four target exam families and timed tasks',()=>{
  assert.equal(deep.exams.length,24);
  for(const exam of ['Goethe','telc','TestDaF','ÖSD'])assert.equal(deep.exams.filter(x=>x.exam===exam).length,6,exam);
  for(const x of deep.exams){assert.ok(x.task&&x.skill&&x.level&&x.minutes>0);}
});

test('Release 8 assets and version are wired into the app',()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  for(const asset of ['release8-dictionary.js','release8-deep-library.js','release8-content-depth-ui.js','release8-content-depth.css']) assert.ok(index.includes(asset),asset);
  assert.equal(pkg.version,'8.0.0');
  assert.match(gradle,/versionCode 8/);
  assert.match(gradle,/versionName "8\.0\.0"/);
});