const test = require('node:test');
const assert = require('node:assert/strict');

function loadFinalData() {
  const dataPath = require.resolve('../app/src/main/assets/course-data.js');
  const r4Path = require.resolve('../app/src/main/assets/release4-content.js');
  const r5Path = require.resolve('../app/src/main/assets/release5-content.js');
  delete require.cache[dataPath];
  delete require.cache[r4Path];
  delete require.cache[r5Path];
  const data = require(dataPath);
  global.window = { GhazalData: data };
  require(r4Path);
  require(r5Path);
  delete global.window;
  return data;
}

test('Release 5 adds thirty executable lessons across A1-C2', () => {
  const data = loadFinalData();
  const r5 = data.lessons.filter(x => x.id.startsWith('r5-'));
  assert.equal(r5.length, 30);
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    assert.equal(r5.filter(x => x.level === level).length, 5, `expected five ${level} Release 5 lessons`);
  }
});

test('final curriculum has broad coverage and valid executable schema', () => {
  const data = loadFinalData();
  const ids = new Set();
  assert.ok(data.lessons.length >= 60, `expected at least 60 lessons, got ${data.lessons.length}`);
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    assert.ok(data.lessons.filter(x => x.level === level).length >= 10, `expected at least ten lessons for ${level}`);
  }
  for (const lesson of data.lessons) {
    assert.ok(!ids.has(lesson.id), `duplicate lesson id ${lesson.id}`);
    ids.add(lesson.id);
    assert.ok(lesson.title && lesson.goal);
    assert.ok(Array.isArray(lesson.words) && lesson.words.length >= 3);
    assert.ok(lesson.pattern && typeof lesson.pattern.de === 'string' && lesson.pattern.de.length > 2);
    assert.ok(Array.isArray(lesson.dialogue) && lesson.dialogue.length >= 2);
    assert.ok(lesson.quiz && Array.isArray(lesson.quiz.options) && lesson.quiz.options.length >= 3);
    assert.ok(Number.isInteger(lesson.quiz.answer));
    assert.ok(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length);
  }
});

test('Release 5 content includes migration, career, university and advanced transfer language', () => {
  const data = loadFinalData();
  const text = data.lessons.filter(x => x.id.startsWith('r5-')).map(x => `${x.title} ${x.de} ${x.goal}`).join(' ').toLowerCase();
  for (const term of ['restaurant', 'wohnung', 'behörde', 'vorstellungsgespräch', 'versicherung', 'präsentation', 'vorlesung', 'seminar', 'testdaf', 'mediation', 'verhandlung']) {
    assert.ok(text.includes(term.toLowerCase()), `missing domain term ${term}`);
  }
});
