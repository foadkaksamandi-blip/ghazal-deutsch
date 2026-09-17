const test = require("node:test");
const assert = require("node:assert/strict");

const Core = require("../app/src/main/assets/core.js");
const Data = require("../app/src/main/assets/course-data.js");

test("course contains six CEFR levels with four lessons each", () => {
  assert.deepEqual(Data.levels.map(level => level.id), ["A1", "A2", "B1", "B2", "C1", "C2"]);
  for (const level of Data.levels) {
    assert.equal(Data.lessons.filter(lesson => lesson.level === level.id).length, 4);
  }
});

test("lesson IDs are unique and content is structurally valid", () => {
  const ids = new Set();
  for (const lesson of Data.lessons) {
    assert.ok(!ids.has(lesson.id), `duplicate lesson id: ${lesson.id}`);
    ids.add(lesson.id);
    assert.ok(lesson.title && lesson.de && lesson.goal);
    assert.ok(lesson.words.length >= 5);
    assert.ok(lesson.dialogue.length >= 3);
    assert.ok(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length);
  }
});

test("placement questions and migration packs are valid", () => {
  assert.ok(Data.placement.length >= 12);
  assert.ok(Data.survivalPacks.length >= 8);
  for (const question of Data.placement) {
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
  }
  for (const pack of Data.survivalPacks) {
    assert.ok(pack.phrases.length >= 4);
  }
});

test("placement scoring spans A1 to C2", () => {
  assert.equal(Core.placementLevel(0, 12), "A1");
  assert.equal(Core.placementLevel(4, 12), "A2");
  assert.equal(Core.placementLevel(6, 12), "B1");
  assert.equal(Core.placementLevel(8, 12), "B2");
  assert.equal(Core.placementLevel(10, 12), "C1");
  assert.equal(Core.placementLevel(12, 12), "C2");
});

test("streak only increments on consecutive calendar days", () => {
  const now = new Date(2026, 8, 17, 10, 0, 0).getTime();
  assert.equal(Core.updateStreak("2026-09-16", 4, now), 5);
  assert.equal(Core.updateStreak("2026-09-17", 5, now), 5);
  assert.equal(Core.updateStreak("2026-09-10", 9, now), 1);
});

test("spaced repetition advances and resets correctly", () => {
  const now = 1_700_000_000_000;
  const first = Core.nextReview(null, "good", now);
  assert.equal(first.box, 1);
  assert.equal(first.due, now + Core.DAY);
  const easy = Core.nextReview(first, "easy", now);
  assert.equal(easy.box, 3);
  const reset = Core.nextReview(easy, "again", now);
  assert.equal(reset.box, 0);
  assert.equal(reset.due, now);
});

test("daily modes remain bounded by available work", () => {
  assert.deepEqual(Core.dailyPlan("minimum", 2, 0), { minutes: 10, lessons: 0, cards: 2, quiz: 1 });
  assert.deepEqual(Core.dailyPlan("normal", 50, 3), { minutes: 25, lessons: 1, cards: 10, quiz: 1 });
  assert.deepEqual(Core.dailyPlan("intensive", 7, 1), { minutes: 45, lessons: 1, cards: 7, quiz: 2 });
});
