(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GhazalCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DAY = 24 * 60 * 60 * 1000;
  const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30, 60];

  function dateKey(value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function yesterdayKey(now) {
    const date = new Date(now || Date.now());
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  }

  function updateStreak(lastStudyDate, currentStreak, now) {
    const today = dateKey(now);
    if (lastStudyDate === today) return Math.max(1, Number(currentStreak) || 1);
    if (lastStudyDate === yesterdayKey(now)) return Math.max(0, Number(currentStreak) || 0) + 1;
    return 1;
  }

  function placementLevel(score, total) {
    const safeTotal = Math.max(1, Number(total) || 1);
    const ratio = Math.max(0, Math.min(1, (Number(score) || 0) / safeTotal));
    if (ratio < 0.22) return "A1";
    if (ratio < 0.40) return "A2";
    if (ratio < 0.57) return "B1";
    if (ratio < 0.73) return "B2";
    if (ratio < 0.90) return "C1";
    return "C2";
  }

  function nextReview(previous, rating, now) {
    const current = previous || { box: 0, due: 0 };
    let box = Number(current.box) || 0;
    if (rating === "again") box = 0;
    else if (rating === "hard") box = Math.max(1, box);
    else if (rating === "good") box = Math.min(REVIEW_INTERVALS.length - 1, box + 1);
    else if (rating === "easy") box = Math.min(REVIEW_INTERVALS.length - 1, box + 2);
    const interval = REVIEW_INTERVALS[box];
    return { box, due: Number(now || Date.now()) + interval * DAY };
  }

  function isDue(review, now) {
    return !review || !review.due || Number(review.due) <= Number(now || Date.now());
  }

  function dailyPlan(mode, dueCards, remainingLessons) {
    const plans = {
      minimum: { minutes: 10, lessons: 0, cards: 5, quiz: 1 },
      normal: { minutes: 25, lessons: 1, cards: 10, quiz: 1 },
      intensive: { minutes: 45, lessons: 2, cards: 18, quiz: 2 }
    };
    const selected = plans[mode] || plans.normal;
    return {
      minutes: selected.minutes,
      lessons: Math.min(selected.lessons, Math.max(0, Number(remainingLessons) || 0)),
      cards: Math.min(selected.cards, Math.max(0, Number(dueCards) || 0)),
      quiz: selected.quiz
    };
  }

  function progressPercent(completed, total) {
    if (!total) return 0;
    return Math.round(Math.max(0, Math.min(1, completed / total)) * 100);
  }

  return {
    DAY,
    REVIEW_INTERVALS,
    dateKey,
    updateStreak,
    placementLevel,
    nextReview,
    isDue,
    dailyPlan,
    progressPercent
  };
});
