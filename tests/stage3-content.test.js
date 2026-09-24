const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app/src/main/assets');
const LEVELS=['A1','A2','B1','B2','C1','C2'];

function fresh(p){const f=path.join(ASSETS,p);try{delete require.cache[require.resolve(f)];}catch(_){}return require(f);}

function loadBase(){
  for(const p of [
    'course-data.js','release4-content.js','release5-content.js','release7-content.js','release10-capstone-content.js',
    'release7-library.js','release8-dictionary.js','release8-deep-library.js','release9-specialization.js',
    'release10-advanced-content.js','stage3-content-pack.js','release10-exercise-engine.js','release10-content-system.js'
  ]){try{delete require.cache[require.resolve(path.join(ASSETS,p))];}catch(_){}}
  const data=fresh('course-data.js');
  global.window={GhazalData:data};
  require(path.join(ASSETS,'release4-content.js'));
  require(path.join(ASSETS,'release5-content.js'));
  require(path.join(ASSETS,'release7-content.js'));
  require(path.join(ASSETS,'release10-capstone-content.js'));
  const lib=fresh('release7-library.js');window.GhazalLibrary=lib;
  const dict=fresh('release8-dictionary.js');window.GhazalDictionary=dict;
  const deep=fresh('release8-deep-library.js');window.GhazalDeepLibrary=deep;
  const spec=fresh('release9-specialization.js');window.GhazalSpecialization=spec;
  const advanced=fresh('release10-advanced-content.js');window.GhazalAdvancedContent=advanced;
  return{data,lib,dict,deep,spec,advanced};
}

test('Stage 3 curated pack covers every CEFR level evenly and passes its own audit',()=>{
  const pack=fresh('stage3-content-pack.js');
  const audit=pack.audit();
  assert.equal(audit.pass,true,audit.issues.join(', '));
  assert.equal(pack.lessons.length,30);
  assert.equal(pack.grammar.length,24);
  assert.equal(pack.redemittel.length,36);
  assert.equal(pack.writing.length,18);
  assert.equal(pack.speaking.length,18);
  assert.equal(pack.reading.length,12);
  assert.equal(pack.listening.length,12);
  assert.equal(pack.exams.length,16);
  for(const level of LEVELS){
    const s=audit.summary.byLevel[level];
    assert.equal(s.lessons,5,'lessons '+level);
    assert.equal(s.grammar,4,'grammar '+level);
    assert.ok(s.dictionary>=25,'dictionary '+level+' '+s.dictionary);
    assert.ok(s.reading>=2&&s.listening>=2,'receptive '+level);
    assert.ok(s.writing>=3&&s.speaking>=3,'productive '+level);
  }
});

test('Stage 3 lessons are executable, metadata-rich and not display-only shells',()=>{
  const pack=fresh('stage3-content-pack.js');
  for(const lesson of pack.lessons){
    assert.ok(lesson.id&&lesson.title&&lesson.de&&lesson.goal,lesson.id);
    assert.ok(lesson.pattern&&lesson.pattern.de&&lesson.pattern.fa,lesson.id);
    assert.equal(lesson.words.length,5,lesson.id);
    assert.ok(lesson.dialogue.length>=3,lesson.id);
    assert.equal(lesson.quiz.options.length,3,lesson.id);
    assert.ok(Number.isInteger(lesson.quiz.answer)&&lesson.quiz.answer>=0&&lesson.quiz.answer<3,lesson.id);
    for(const w of lesson.words){
      assert.ok(w[0]&&w[1]&&w[2],lesson.id+' word');
      assert.ok(w[3]&&w[6]&&w[7],lesson.id+' rich word metadata');
    }
  }
  for(const x of pack.dictionary){
    assert.ok(x.level&&x.lemma&&x.meaning&&x.pos&&x.example&&x.register,x.id);
  }
});

test('Stage 3 apply is idempotent and expands real app banks without duplicate IDs',()=>{
  const x=loadBase();
  const pack=fresh('stage3-content-pack.js');
  const before={
    lessons:x.data.lessons.length,
    grammar:x.lib.grammar.length,
    dict:x.dict.all.length,
    reading:x.deep.reading.length,
    listening:x.deep.listening.length,
    exams:x.deep.exams.length
  };
  const first=pack.apply({data:x.data,lib:x.lib,dict:x.dict,deep:x.deep});
  const after1={
    lessons:x.data.lessons.length,
    grammar:x.lib.grammar.length,
    dict:x.dict.all.length,
    reading:x.deep.reading.length,
    listening:x.deep.listening.length,
    exams:x.deep.exams.length
  };
  const second=pack.apply({data:x.data,lib:x.lib,dict:x.dict,deep:x.deep});
  assert.equal(after1.lessons,before.lessons+30);
  assert.equal(after1.grammar,before.grammar+24);
  assert.ok(first.dictionary>=80,JSON.stringify({before:before.dict,after:after1.dict,first}));
  assert.equal(after1.dict-before.dict,first.dictionary);
  assert.equal(after1.reading,before.reading+12);
  assert.equal(after1.listening,before.listening+12);
  assert.equal(after1.exams,before.exams+16);
  assert.equal(second.lessons,0);
  assert.equal(second.grammar,0);
  assert.equal(second.exams,0);
  assert.equal(new Set(x.data.lessons.map(v=>v.id)).size,x.data.lessons.length);
  assert.equal(new Set(x.lib.grammar.map(v=>v.id)).size,x.lib.grammar.length);
  delete global.window;
});

test('Stage 3 content materially increases generated exercises and all-level depth',()=>{
  const x=loadBase();
  const baseExercises=fresh('release10-exercise-engine.js');
  const baseCount=baseExercises.exercises.length;
  const baseByLevel=baseExercises.summary().byLevel;
  const pack=fresh('stage3-content-pack.js');
  pack.apply({data:x.data,lib:x.lib,dict:x.dict,deep:x.deep});
  delete require.cache[require.resolve(path.join(ASSETS,'release10-exercise-engine.js'))];
  window.GhazalExerciseEngine=require(path.join(ASSETS,'release10-exercise-engine.js'));
  const expanded=window.GhazalExerciseEngine;
  const expandedSummary=expanded.summary();
  assert.ok(expandedSummary.total>=baseCount+650,{baseCount,expanded:expandedSummary.total});
  for(const level of LEVELS){
    assert.ok(expandedSummary.byLevel[level]>(baseByLevel[level]||0)+80,level+' '+JSON.stringify({base:baseByLevel[level],expanded:expandedSummary.byLevel[level]}));
  }
  const types=expandedSummary.byType;
  for(const type of ['meaning','recall','cloze','grammar','writing','speaking','reading','dictation','exam'])assert.ok((types[type]||0)>0,type);
  delete global.window;
});

test('Stage 3 global content search sees new curriculum, lexicon and exams',()=>{
  const x=loadBase();
  const pack=fresh('stage3-content-pack.js');
  pack.apply({data:x.data,lib:x.lib,dict:x.dict,deep:x.deep});
  delete require.cache[require.resolve(path.join(ASSETS,'release10-exercise-engine.js'))];
  window.GhazalExerciseEngine=require(path.join(ASSETS,'release10-exercise-engine.js'));
  delete require.cache[require.resolve(path.join(ASSETS,'release10-content-system.js'))];
  const system=require(path.join(ASSETS,'release10-content-system.js'));
  for(const q of ['Wohnungsgeberbestätigung','Risikobewertung','Synthese','Implikatur','Rechtsbehelfsbelehrung']){
    assert.ok(system.search(q,{}).length>0,q);
  }
  assert.ok(x.dict.search('Evidenzstufe','C2',20).some(v=>v.lemma==='die Evidenzstufe'));
  for(const level of LEVELS)assert.ok(x.data.lessons.filter(v=>v.level===level).length>=40,level);
  assert.ok(x.lib.grammar.length>=84,x.lib.grammar.length);
  delete global.window;
});

test('Stage 3 asset is wired before exercise generation and included in syntax QA',()=>{
  const index=fs.readFileSync(path.join(ASSETS,'index.html'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
  const audit=fs.readFileSync(path.join(ROOT,'scripts/full-product-audit.js'),'utf8');
  const heavy=fs.readFileSync(path.join(ROOT,'scripts/stage7-heavy-qa.js'),'utf8');
  assert.ok(index.includes('stage3-content-pack.js'));
  assert.ok(index.indexOf('stage3-content-pack.js')<index.indexOf('release10-exercise-engine.js'));
  assert.ok(pkg.scripts.check.includes('stage3-content-pack.js'));
  assert.ok(audit.includes('stage3-pack-audit'));
  assert.ok(heavy.includes('stage3-content-pack'));
});


test('Stage 3 runtime cannot use stale WebView assets after in-place APK update',()=>{
  const main=fs.readFileSync(path.join(ROOT,'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'),'utf8');
  const app=fs.readFileSync(path.join(ASSETS,'app.js'),'utf8');
  assert.ok(main.includes('settings.setCacheMode(WebSettings.LOAD_NO_CACHE)'));
  assert.ok(main.includes('webView.clearCache(true)'));
  assert.ok(app.includes('window.GhazalStage3Content.apply'));
  assert.ok(app.includes('data-ghz-stage3-runtime'));
  assert.ok(app.includes('count >= 40'));
});
