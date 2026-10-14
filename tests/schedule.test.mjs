import test from "node:test";
import assert from "node:assert/strict";
import { A, B, FIRST_MONDAY, dateKey, fromKey, workoutFor, nextWorkout, mondayOf, shiftDays } from "../docs/plan.js";

test("schedule anchors to Oct 19, 2026 and alternates by week", () => {
  const cases = {
    "2026-10-18": null,
    "2026-10-19": "A",
    "2026-10-20": null,
    "2026-10-22": "B",
    "2026-10-24": "A",
    "2026-10-26": "B",
    "2026-10-29": "A",
    "2026-10-31": "B",
    "2026-11-02": "A",
    "2026-11-05": "B",
    "2026-11-07": "A"
  };
  assert.equal(FIRST_MONDAY, "2026-10-19");
  for (const [key, expected] of Object.entries(cases))
    assert.equal(workoutFor(fromKey(key)), expected, key);
});
test("all weeks have 3 sessions, including both sides of anchor", () => {
  let cursor = fromKey("2026-09-01");
  for (let i = 0; i < 120; i++) {
    const m = mondayOf(cursor);
    assert.deepEqual(Array.from({length: 7}, (_, day) => workoutFor(shiftDays(m, day))),
      i % 2 === 0 ? ["B", null, null, "A", null, "B", null]
        : ["A", null, null, "B", null, "A", null]
    );
    cursor = shiftDays(cursor, 7);
  }
});
test("date parsing, rolling year and upcoming workouts", () => {
  assert.equal(dateKey(shiftDays(fromKey("2026-12-31"), 1)), "2027-01-01");
  assert.equal(dateKey(nextWorkout(fromKey("2026-10-24"))), "2026-10-26");
  assert.equal(dateKey(nextWorkout(fromKey("2026-10-24"), true)), "2026-10-24");
  assert.throws(() => fromKey("2026-02-30"));
  assert.equal(A.length, 6);
  assert.equal(B.length, 6);
});
