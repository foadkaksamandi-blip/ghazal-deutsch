const test=require('node:test');
const assert=require('node:assert/strict');

function loadData(){
  const paths=[
    require.resolve('../app/src/main/assets/course-data.js'),
    require.resolve('../app/src/main/assets/release4-content.js'),
    require.resolve('../app/src/main/assets/release5-content.js'),
    require.resolve('../app/src/main/assets/release7-content.js')
  ];
  paths.forEach(p=>delete require.cache[p]);
  const data=require(paths[0]);
  global.window={GhazalData:data};
  require(paths[1]);require(paths[2]);require(paths[3]);
  delete global.window;
  return data;
}

test('Release 7 adds sixty original executable lessons, ten per CEFR level',()=>{
  const data=loadData();
  const r7=data.lessons.filter(x=>x.id.startsWith('r7-'));
  assert.equal(r7.length,60);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    assert.equal(r7.filter(x=>x.level===level).length,10,level);
  }
});

test('Release 7 lessons use the executable lesson schema',()=>{
  const data=loadData();
  for(const l of data.lessons.filter(x=>x.id.startsWith('r7-'))){
    assert.ok(l.title&&l.de&&l.goal);
    assert.ok(Array.isArray(l.words)&&l.words.length>=5);
    assert.ok(l.pattern&&l.pattern.de&&l.pattern.fa);
    assert.ok(Array.isArray(l.dialogue)&&l.dialogue.length>=2);
    assert.ok(l.quiz&&Array.isArray(l.quiz.options)&&l.quiz.options.length>=3);
    assert.ok(Number.isInteger(l.quiz.answer)&&l.quiz.answer>=0&&l.quiz.answer<l.quiz.options.length);
  }
});

test('cumulative curriculum exceeds one hundred twenty executable lessons',()=>{
  const data=loadData();
  assert.ok(data.lessons.length>=120,'got '+data.lessons.length);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    assert.ok(data.lessons.filter(x=>x.level===level).length>=20,level);
  }
});

test('structured educational library covers all levels and active skills',()=>{
  const lib=require('../app/src/main/assets/release7-library.js');
  assert.equal(lib.grammar.length,60);
  assert.equal(lib.redemittel.length,48);
  assert.equal(lib.writing.length,24);
  assert.equal(lib.speaking.length,24);
  assert.equal(lib.reading.length,6);
  assert.equal(lib.listening.length,6);
  for(const level of ['A1','A2','B1','B2','C1','C2']){
    assert.equal(lib.grammar.filter(x=>x.level===level).length,10,'grammar '+level);
    assert.equal(lib.redemittel.filter(x=>x.level===level).length,8,'redemittel '+level);
    assert.equal(lib.writing.filter(x=>x.level===level).length,4,'writing '+level);
    assert.equal(lib.speaking.filter(x=>x.level===level).length,4,'speaking '+level);
    assert.equal(lib.reading.filter(x=>x.level===level).length,1,'reading '+level);
    assert.equal(lib.listening.filter(x=>x.level===level).length,1,'listening '+level);
  }
});

test('library grammar entries contain rule example and error guidance',()=>{
  const lib=require('../app/src/main/assets/release7-library.js');
  for(const x of lib.grammar){
    assert.ok(x.id&&x.level&&x.title&&x.rule&&x.example&&x.mistake);
  }
});