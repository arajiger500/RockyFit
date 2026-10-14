// Shared, timezone-safe date schedule. Android and web use the same Monday anchor.
export const FIRST_MONDAY = "2026-10-19";
export const A = [
  ["Leg press", "2 × 10–12", "90 sec"],
  ["Chest press", "2 × 8–12", "90 sec"],
  ["Lat pulldown", "2 × 8–12", "90 sec"],
  ["Seated leg curl", "2 × 10–12", "60 sec"],
  ["Seated cable row", "2 × 10–12", "60 sec"],
  ["Plank", "2 × 20–30 sec", "45 sec"],
];
export const B = [
  ["Leg press", "2 × 10–12", "90 sec"],
  ["Incline chest press", "2 × 8–12", "90 sec"],
  ["Seated cable row", "2 × 10–12", "90 sec"],
  ["Glute bridge", "2 × 10–15", "60 sec"],
  ["Dumbbell shoulder press", "2 × 8–12", "60 sec"],
  ["Biceps curls", "2 × 10–15", "60 sec"],
];

export function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function fromKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error("Invalid date");
  const [year, month, day] = key.split("-").map(Number);
  const result = new Date(year, month - 1, day, 12);
  if (dateKey(result) !== key) throw new Error("Invalid calendar date");
  return result;
}
export function shiftDays(date, count) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  result.setDate(result.getDate() + count);
  return result;
}
export function mondayOf(date) {
  return shiftDays(date, -(date.getDay() + 6) % 7);
}
function dayNumber(date) {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}
export function workoutFor(date) {
  const day = date.getDay(); // Sunday=0
  if (![1, 4, 6].includes(day)) return null;
  const weeks = Math.round((dayNumber(mondayOf(date)) - dayNumber(fromKey(FIRST_MONDAY))) / 7);
  const even = ((weeks % 2) + 2) % 2 === 0;
  return day === 4 ? (even ? "B" : "A") : (even ? "A" : "B");
}
export function exercisesFor(date) {
  const workout = workoutFor(date);
  return workout === "A" ? A : workout === "B" ? B : [];
}
export function nextWorkout(date, includeToday = false) {
  let cursor = includeToday ? shiftDays(date, 0) : shiftDays(date, 1);
  for (let i = 0; i < 8; i++) {
    if (workoutFor(cursor)) return cursor;
    cursor = shiftDays(cursor, 1);
  }
  throw new Error("No workout found");
}
