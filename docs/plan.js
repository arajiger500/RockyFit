// Dorm-friendly routine, no bench or gym machines. All workouts use device-local calendar dates.
// Strength: Monday A, Thursday B, Saturday C. Optional movement: Tuesday and Friday.
export const A = [
  ["Bodyweight or goblet squat", "2 × 8–12", "75 sec"],
  ["Dumbbell floor press", "2 × 8–12", "75 sec"],
  ["One-arm dumbbell row", "2 × 8–12 / side", "75 sec"],
  ["Dumbbell Romanian deadlift", "2 × 8–12", "75 sec"],
  ["Standing calf raise", "2 × 12–15", "45 sec"],
  ["Dead bug", "2 × 6–10 / side", "45 sec"]
];
export const B = [
  ["Supported split squat", "2 × 6–10 / leg", "75 sec"],
  ["Wall or sturdy-desk push-up", "2 × 6–12", "75 sec"],
  ["Bent-over dumbbell row", "2 × 8–12", "75 sec"],
  ["Glute bridge", "2 × 12–15", "60 sec"],
  ["Dumbbell curl (if manageable)", "2 × 8–12", "60 sec"],
  ["Bird dog", "2 × 8 / side", "45 sec"]
];
export const C = [
  ["Bodyweight or goblet squat", "2 × 8–12", "75 sec"],
  ["Single-arm dumbbell floor press", "2 × 8–12 / side", "75 sec"],
  ["One-arm dumbbell row", "2 × 8–12 / side", "75 sec"],
  ["Dumbbell Romanian deadlift", "2 × 10–12", "75 sec"],
  ["Close-grip wall push-up", "2 × 8–12", "60 sec"],
  ["Side plank from knees", "2 × 15–25 sec / side", "45 sec"]
];
export const MOVE = [
  ["Easy walk (optional)", "10–20 min", "Comfortable pace"],
  ["Gentle mobility (optional)", "5–8 min", "No forcing range"],
  ["Relaxed stretching (optional)", "3–5 min", "Stop if painful"]
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
export function workoutFor(date) {
  switch (date.getDay()) {
    case 1: return "A"; // Monday
    case 2: return "MOVE"; // Tuesday, optional
    case 4: return "B"; // Thursday
    case 5: return "MOVE"; // Friday, optional
    case 6: return "C"; // Saturday
    default: return null; // Wednesday and Sunday
  }
}
export function isStrength(workout) {
  return workout === "A" || workout === "B" || workout === "C";
}
export function exercisesFor(date) {
  switch (workoutFor(date)) {
    case "A": return A;
    case "B": return B;
    case "C": return C;
    case "MOVE": return MOVE;
    default: return [];
  }
}
export function nextWorkout(date, includeToday = false) {
  let cursor = includeToday ? shiftDays(date, 0) : shiftDays(date, 1);
  for (let i = 0; i < 8; i++) {
    if (isStrength(workoutFor(cursor))) return cursor;
    cursor = shiftDays(cursor, 1);
  }
  throw new Error("No workout found");
}
