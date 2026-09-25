const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

function fresh(rel){const p=require.resolve(rel);delete require.cache[p];return require(p);}
function loadStage2(){
  const modules=[
    '../app/src/main/assets/course-data.js',
    '../app/src/main/assets/release4-content.js',
    '../app/src/main/assets/release5-content.js',
    '../app/src/main/assets/release7-content.js',
    '../app/src/main/assets/release10-capstone-content.js',
    '../app/src/main/assets/release7-library.js',
    '../app/src/main/assets/release8-dictionary.js',
    '../app/src/main/assets/release8-deep-library.js',
    '../app/src/main/assets/release9-specialization.js',
    '../app/src/main/assets/release10-advanced-content.js',
    '../app/src/main/assets/release10-human-audio.js',
    '../app/src/main/assets/release10-exercise-engine.js',
    '../app/src/main/assets/release10-content-system.js',
    '../app/src/main/assets/release10-offline-coach.js'
  ];
  modules.forEach(m=>{try{delete require.cache[require.resolve(m)];}catch(_){}});
  const data=require(modules[0]);
  global.window={GhazalData:data};
  require(modules[1]);require(modules[2]);require(modules[3]);require(modules[4]);
  const lib=require(modules[5]);window.GhazalLibrary=lib;
  const dict=require(modules[6]);window.GhazalDictionary=dict;
  const deep=require(modules[7]);window.GhazalDeepLibrary=deep;
  const spec=require(modules[8]);window.GhazalSpecialization=spec;
  const advanced=require(modules[9]);window.GhazalAdvancedContent=advanced;
  const human=require(modules[10]);window.GhazalHumanAudio=human;
  const exercises=require(modules[11]);window.GhazalExerciseEngine=exercises;
  const system=require(modules[12]);window.GhazalContentSystem=system;
  const coach=require(modules[13]);window.GhazalOfflineCoach=coach;
  delete global.window;
  return{data,lib,dict,deep,spec,advanced,human,exercises,system,coach};
}

test('Release 10 adds sixty capstone lessons and reaches hundreds of lessons',()=>{
  const {data}=loadStage2();
  const cap=data.lessons.filter(x=>x.id.startsWith('r10-'));
  assert.equal(cap.length,60);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    assert.equal(cap.filter(x=>x.level===level).length,10,level);
    assert.ok(data.lessons.filter(x=>x.level===level).length>=30,'lesson depth '+level);
  }
  assert.ok(data.lessons.length>=200,'expected >=200 lessons, got '+data.lessons.length);
});

test('capstone lessons are executable by the existing lesson engine schema',()=>{
  const {data}=loadStage2();
  for(const l of data.lessons.filter(x=>x.id.startsWith('r10-'))){
    assert.ok(l.title&&l.de&&l.goal&&l.pattern&&l.pattern.de&&l.pattern.fa);
    assert.ok(Array.isArray(l.words)&&l.words.length===5,l.id);
    assert.ok(Array.isArray(l.dialogue)&&l.dialogue.length>=2,l.id);
    assert.ok(l.quiz&&Array.isArray(l.quiz.options)&&l.quiz.options.length===3,l.id);
    assert.ok(Number.isInteger(l.quiz.answer)&&l.quiz.answer>=0&&l.quiz.answer<3,l.id);
  }
});

test('Stage 2 exercise engine produces thousands of real executable exercises',()=>{
  const {exercises}=loadStage2();
  const s=exercises.summary();
  assert.ok(s.total>=3000,'expected >=3000 exercises, got '+s.total);
  for(const level of ['A1','A2','B1','B2','C1','C2']) assert.ok((s.byLevel[level]||0)>=350,'exercise depth '+level);
  for(const type of ['meaning','recall','cloze','mcq','grammar','writing','speaking','reading','dictation','exam']) assert.ok((s.byType[type]||0)>0,type);
});

test('advanced natural-language packs cover A1-C2 and key real-life domains',()=>{
  const {advanced}=loadStage2();
  const packs=Object.values(advanced.packs);
  assert.equal(packs.length,6);
  const items=packs.flatMap(p=>p.items);
  assert.equal(items.length,126);
  for(const level of ['A1','A2','B1','B2','C1','C2']) assert.ok(items.filter(x=>x.level===level).length>=18,level);
  assert.equal(advanced.audio.length,12);
  assert.equal(advanced.pronunciation.length,24);
  assert.ok(advanced.dependencies.C2.requires.includes('C1'));
  assert.ok(Array.isArray(advanced.skillGraph.speaking));
});

test('licensed human-native pack is explicit, attributable and multi-speaker',()=>{
  const {human}=loadStage2();
  assert.equal(human.clips.length,6);
  assert.ok(new Set(human.clips.map(x=>x.speaker)).size>=3);
  assert.ok(new Set(human.clips.map(x=>x.region)).size>=3);
  for(const x of human.clips){
    assert.ok(x.text&&x.speaker&&x.voice&&x.region&&x.file&&x.license&&x.source&&x.sha1);
    assert.match(x.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(x.sha1,/^[a-f0-9]{40}$/);
  }
});

test('global content system search, manifest, migration and audit work',()=>{
  const {system}=loadStage2();
  const c=system.counts();
  assert.ok(c.educationalUnits>=280,'units '+c.educationalUnits);
  assert.ok(c.exercises>=3000,'exercises '+c.exercises);
  assert.ok(c.index>=1000,'index '+c.index);
  assert.ok(system.search('Widerspruch',{}).length>0);
  assert.equal(system.manifest.schema,3);
  assert.equal(system.manifest.version,'10.0.0');
  const migrated=system.migrateState({progress:{x:1}});
  assert.equal(migrated.contentSchema,3);
  assert.equal(migrated.progress.x,1);
  const audit=system.audit();
  assert.equal(audit.pass,true,audit.issues.join(', '));
});

test('offline writing coach provides multidimensional diagnostics and catches known errors',()=>{
  const {coach}=loadStage2();
  const r=coach.analyze('Ich habe 20 Jahre. Ich interessiere für Musik, weil ich bin glücklich.','B1','formelle E-Mail');
  assert.ok(r.total>=0&&r.total<=100);
  assert.ok(r.errors.length>=3);
  assert.ok(r.dimensions.cohesion>=0);
  assert.ok(r.suggestions.length>0);
  const mock=coach.buildMock('TestDaF','C1');
  assert.equal(mock.sections.length,4);
  assert.ok(mock.totalMinutes>0);
  assert.equal(mock.official,false);
  const rd=coach.testdafReadiness({reading:{attempts:2,total:170},listening:{attempts:2,total:168},writing:{attempts:2,total:166},speaking:{attempts:2,total:164}});
  assert.equal(rd.official,false);
  assert.ok(rd.band.includes('TDN5'));
});

test('Release 10 assets survive later product versions',()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  const bridge=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java'),'utf8');
  for(const asset of ['release10-capstone-content.js','release10-advanced-content.js','release10-human-audio.js','release10-exercise-engine.js','release10-content-system.js','release10-offline-coach.js','release10-stage2-ui.js','release10-stage2.css']) assert.ok(index.includes(asset),asset);
  assert.ok(Number(pkg.version.split('.')[0])>=10);
  assert.ok(gradle.includes('versionCode ghzVersionCode'));
  assert.ok(gradle.includes('GHZ_VERSION_CODE'));
  assert.ok(gradle.includes('autoVersionCode'));
  assert.ok(gradle.includes('versionName ghzVersionName'));
  assert.ok(gradle.includes('GHZ_VERSION_NAME'));
  assert.ok(bridge.includes('activity == null ? "'+pkg.version+'"'));
});

test('build workflow pins and verifies every licensed human audio file',()=>{
  const root=path.join(__dirname,'..');
  const wf=fs.readFileSync(path.join(root,'.github/workflows/android.yml'),'utf8');
  for(const name of ['De-guten_Tag2.ogg','De-Wie_geht_es_dir..ogg','De-Schritt_fuer_Schritt.ogg','De-darstellen.ogg','De-eintragen.ogg','De-at-deutsch.ogg']) assert.ok(wf.includes(name),name);
  assert.ok(wf.includes('sha1sum -c'));
  assert.ok(/GHAZAL-v\d+-.+-qa\.apk/.test(wf));
  const credits=fs.readFileSync(path.join(root,'docs/HUMAN_AUDIO_CREDITS.md'),'utf8');
  assert.ok(credits.includes('CC BY-SA 4.0'));
  assert.ok(credits.includes('CC BY 3.0 US'));
  assert.ok(credits.includes('CC BY 2.0 France'));
});