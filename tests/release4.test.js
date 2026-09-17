const test = require('node:test');
const assert = require('node:assert/strict');

function loadRelease4Data() {
  const dataPath = require.resolve('../app/src/main/assets/course-data.js');
  const r4Path = require.resolve('../app/src/main/assets/release4-content.js');
  delete require.cache[dataPath];
  delete require.cache[r4Path];
  const data = require(dataPath);
  global.window = { GhazalData: data };
  require(r4Path);
  delete global.window;
  return data;
}

test('Release 4 adds real lessons across every CEFR level', () => {
  const data = loadRelease4Data();
  const r4 = data.lessons.filter(x => x.id.startsWith('r4-'));
  assert.equal(r4.length, 36);
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    assert.equal(r4.filter(x => x.level === level).length, 6, `expected six ${level} lessons`);
  }
});

test('Release 4 lesson schema is executable by the existing lesson engine', () => {
  const data = loadRelease4Data();
  const ids = new Set();
  for (const lesson of data.lessons) {
    assert.equal(ids.has(lesson.id), false, `duplicate lesson id ${lesson.id}`);
    ids.add(lesson.id);
    assert.ok(['A1','A2','B1','B2','C1','C2'].includes(lesson.level));
    assert.ok(Array.isArray(lesson.words) && lesson.words.length >= 3);
    assert.ok(lesson.pattern && typeof lesson.pattern.de === 'string');
    assert.ok(Array.isArray(lesson.dialogue) && lesson.dialogue.length >= 2);
    assert.ok(lesson.quiz && Array.isArray(lesson.quiz.options));
    assert.ok(Number.isInteger(lesson.quiz.answer));
    assert.ok(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length);
  }
});
