import test from "node:test";
import assert from "node:assert/strict";
import { A, B, C, MOVE, dateKey, fromKey, workoutFor, nextWorkout, mondayOf, shiftDays, isStrength, exercisesFor } from "../docs/plan.js";

test("weekly dorm routine uses 3 strength, 2 optional movement and 2 rest days", () => {
  const cases = {
    "2026-10-19": "A",
    "2026-10-20": "MOVE",
    "2026-10-21": null,
    "2026-10-22": "B",
    "2026-10-23": "MOVE",
    "2026-10-24": "C",
    "2026-10-25": null,
    "2026-10-26": "A",
    "2026-10-29": "B",
    "2026-10-31": "C",
  };
  for (const [key, expected] of Object.entries(cases)) {
    assert.equal(workoutFor(fromKey(key)), expected, key);
  }
});

test("all weeks have the same healthy split and no adjacent strength days", () => {
  let cursor = fromKey("2026-09-01");
  for (let i = 0; i < 120; i++) {
    const monday = mondayOf(cursor);
    assert.deepEqual(Array.from({length:7}, (_, day) => workoutFor(shiftDays(monday, day))),
      ["A","MOVE",null,"B","MOVE","C",null]);
    cursor = shiftDays(cursor, 7);
  }
});

test("upcoming workouts skip optional movement days", () => {
  assert.equal(dateKey(nextWorkout(fromKey("2026-10-19"))), "2026-10-22");
  assert.equal(dateKey(nextWorkout(fromKey("2026-10-22"))), "2026-10-24");
  assert.equal(dateKey(nextWorkout(fromKey("2026-10-24"))), "2026-10-26");
  assert.equal(dateKey(nextWorkout(fromKey("2026-10-20"), true)), "2026-10-22");
  assert.equal(dateKey(nextWorkout(fromKey("2026-10-24"), true)), "2026-10-24");
  assert.deepEqual([A.length,B.length,C.length,MOVE.length],[6,6,6,3]);
  assert.equal(isStrength("MOVE"), false);
  assert.equal(isStrength("C"), true);
  assert.equal(exercisesFor(fromKey("2026-10-25")).length, 0);
});

test("local calendar handling works across year boundaries", () => {
  assert.equal(dateKey(shiftDays(fromKey("2026-12-31"), 1)), "2027-01-01");
  assert.throws(() => fromKey("2026-02-30"));
  assert.throws(() => fromKey("2026-99-10"));
});
