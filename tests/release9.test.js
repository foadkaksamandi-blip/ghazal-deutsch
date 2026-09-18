const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const spec=require('../app/src/main/assets/release9-specialization.js');

test('Release 9 contains four specialization tracks',()=>{
  assert.deepEqual(Object.keys(spec.tracks).sort(),['career','exams','migration','university']);
});

test('specialization tracks contain executable learning modules',()=>{
  const expected={migration:16,career:16,university:20,exams:20};
  for(const [id,count] of Object.entries(expected)){
    const track=spec.tracks[id];
    assert.equal(track.modules.length,count,id);
    for(const m of track.modules){
      assert.ok(m.id&&m.level&&m.title&&m.fa&&m.goal);
      assert.ok(Array.isArray(m.vocabulary)&&m.vocabulary.length===4);
      assert.ok(Array.isArray(m.phrases)&&m.phrases.length===3);
      assert.ok(m.writing&&m.speaking);
    }
  }
});

test('specialization modules span appropriate CEFR ranges',()=>{
  const all=Object.values(spec.tracks).flatMap(t=>t.modules);
  for(const level of ['A1','A2','B1','B2','C1']) assert.ok(all.some(m=>m.level===level),level);
  assert.ok(spec.tracks.university.modules.some(m=>m.level==='C1'));
  assert.ok(spec.tracks.exams.modules.some(m=>m.level==='C1'));
});

test('collocation bank covers all four product domains',()=>{
  assert.equal(spec.collocations.length,48);
  for(const domain of ['Migration','Career','University','Exam']){
    assert.equal(spec.collocations.filter(x=>x.domain===domain).length,12,domain);
  }
});

test('Release 9 assets survive later version upgrades',()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  for(const asset of ['release9-specialization.js','release9-specialization-ui.js','release9-specialization.css']) assert.ok(index.includes(asset),asset);
  assert.ok(Number(pkg.version.split('.')[0])>=9);
  const match=gradle.match(/versionCode\s+(\d+)/); assert.ok(match&&Number(match[1])>=9);
  assert.ok(gradle.includes('versionName "'+pkg.version+'"'));
});