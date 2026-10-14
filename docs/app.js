import {
  dateKey, fromKey, shiftDays, mondayOf, workoutFor, exercisesFor, nextWorkout
} from "./plan.js";

const $ = (id) => document.getElementById(id);
const STORE = "rockyfit.web.v1.";
const memory = new Map();
const store = {
  get(key, fallback = "") {
    try { return localStorage.getItem(STORE + key) ?? fallback; }
    catch { return memory.get(key) ?? fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(STORE + key, String(value)); }
    catch { memory.set(key, String(value)); }
  },
};
const formatLong = new Intl.DateTimeFormat("en", {weekday:"long",day:"numeric",month:"long",year:"numeric"});
const formatShort = new Intl.DateTimeFormat("en", {weekday:"short",day:"numeric",month:"short"});
const formatMonth = new Intl.DateTimeFormat("en", {month:"short",day:"numeric"});
let chosen = fromKey(dateKey(new Date()));
let toastTimer = null;
let deferredInstall = null;
let lastSeenDay = dateKey(new Date());

function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("visible");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("visible"), 4500);
}

function setChosen(date) {
  chosen = fromKey(dateKey(date));
  render();
}

function progressKey(date, idx) {
  return "completed." + dateKey(date) + "." + idx;
}

function doneCount(date, total) {
  let done = 0;
  for (let idx = 0; idx < total; idx++) {
    if (store.get(progressKey(date, idx)) === "1") done++;
  }
  return done;
}

function updateProgress(date, total) {
  const done = doneCount(date, total);
  $("progress-label").textContent = done + " / " + total + " done";
  $("progress-fill").style.width = Math.round((done / total) * 100) + "%";
  $("progress-bar").setAttribute("aria-valuemax", String(total));
  $("progress-bar").setAttribute("aria-valuenow", String(done));
}

function renderWeek() {
  const monday = mondayOf(chosen);
  const sunday = shiftDays(monday, 6);
  const label = monday.getMonth() === sunday.getMonth()
    ? formatMonth.format(monday) + " – " + sunday.getDate() + ", " + sunday.getFullYear()
    : formatMonth.format(monday) + " – " + formatMonth.format(sunday) + ", " + sunday.getFullYear();
  $("week-range").textContent = label;
  const grid = $("week-grid");
  grid.replaceChildren();
  const today = dateKey(new Date());

  for (let offset = 0; offset < 7; offset++) {
    const day = shiftDays(monday, offset);
    const key = dateKey(day);
    const workout = workoutFor(day);
    const selected = key === dateKey(chosen);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-tile" + (selected ? " selected" : "") + (key === today ? " today" : "");
    button.setAttribute("aria-label", formatLong.format(day) + ": " + (workout ? "Workout " + workout : "rest day"));
    if (selected) button.setAttribute("aria-current", "date");
    const name = document.createElement("span");
    name.className = "day-name";
    name.textContent = ["MON","TUE","WED","THU","FRI","SAT","SUN"][offset];
    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = String(day.getDate());
    const status = document.createElement("span");
    status.className = "day-status" + (workout ? "" : " rest");
    status.textContent = workout ? "LIFT " + workout : "REST";
    button.append(name, number, status);
    button.addEventListener("click", () => setChosen(day));
    grid.appendChild(button);
  }
}

function renderWorkout() {
  const session = workoutFor(chosen);
  $("selected-date").textContent = formatLong.format(chosen).toUpperCase();
  const hero = $("workout-hero");
  hero.replaceChildren();
  hero.classList.toggle("rest-hero", !session);
  const eyebrow = document.createElement("span");
  eyebrow.className = "hero-eyebrow";
  eyebrow.textContent = session ? "FULL BODY  /  " + session : "RECOVERY  /  REST DAY";
  const headline = document.createElement("h2");
  headline.textContent = session ? "WORKOUT " + session : "REST & RECHARGE";
  const description = document.createElement("p");
  description.textContent = session
    ? "5–8 minute warm-up · 2 working sets per exercise"
    : "Take a walk, stretch gently, and come back ready for your next session.";
  hero.append(eyebrow, headline, description);

  const detail = $("workout-detail");
  detail.hidden = !session;
  if (!session) return;

  const exercises = exercisesFor(chosen);
  const list = $("exercise-list");
  list.replaceChildren();
  exercises.forEach(([name, reps, rest], index) => {
    const label = document.createElement("label");
    label.className = "exercise-item";
    const checkbox = document.createElement("input");
    checkbox.className = "exercise-check";
    checkbox.type = "checkbox";
    checkbox.checked = store.get(progressKey(chosen, index)) === "1";
    label.classList.toggle("complete", checkbox.checked);
    const copy = document.createElement("span");
    copy.className = "exercise-copy";
    const title = document.createElement("span");
    title.className = "exercise-title";
    title.textContent = name;
    const description = document.createElement("span");
    description.className = "exercise-meta";
    description.textContent = reps + " · " + rest + " rest";
    copy.append(title, description);
    const number = document.createElement("span");
    number.className = "exercise-index";
    number.textContent = String(index + 1).padStart(2, "0");
    label.append(checkbox, copy, number);
    checkbox.addEventListener("change", () => {
      store.set(progressKey(chosen, index), checkbox.checked ? "1" : "0");
      label.classList.toggle("complete", checkbox.checked);
      updateProgress(chosen, exercises.length);
    });
    list.appendChild(label);
  });
  updateProgress(chosen, exercises.length);
}

function renderSidebar() {
  const next = nextWorkout(chosen, false);
  const session = workoutFor(next);
  $("next-title").textContent = "Workout " + session;
  $("next-description").textContent = formatShort.format(next) + " · A focused full-body session at Rocky.";
}

function render() {
  renderWeek();
  renderWorkout();
  renderSidebar();
}

function updateOnlineLabel() {
  const offline = !navigator.onLine;
  $("connection-status").textContent = offline ? "YOU'RE OFFLINE" : "AVAILABLE OFFLINE";
  $("connection-status").classList.toggle("offline", offline);
}

function calendarTimestamp(date, hour, minute) {
  const pad = (n) => String(n).padStart(2, "0");
  return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + "T" + pad(hour) + pad(minute) + "00";
}

function makeIcs() {
  const time = $("reminder-time").value || "17:00";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    toast("Please enter a valid reminder time.");
    return;
  }
  store.set("reminder-time", time);
  const [hour, minute] = time.split(":").map(Number);
  const today = fromKey(dateKey(new Date()));
  const end = shiftDays(today, 84);
  const utcStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RockyFit//Workout Calendar//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:RockyFit Workouts"
  ];
  let count = 0;
  for (let day = today; day < end; day = shiftDays(day, 1)) {
    const session = workoutFor(day);
    if (!session) continue;
    const start = calendarTimestamp(day, hour, minute);
      // Use date arithmetic so a 23:xx workout ends on the following calendar day.
    const endDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour + 1, minute);
    const dtend = calendarTimestamp(endDate, endDate.getHours(), endDate.getMinutes());
    lines.push(
      "BEGIN:VEVENT",
      "UID:rockyfit-" + dateKey(day) + "-" + session + "@rockyfit.local",
      "DTSTAMP:" + utcStamp,
      "DTSTART:" + start,
      "DTEND:" + dtend,
      "SUMMARY:RockyFit - Full Body " + session,
      "DESCRIPTION:45-55 minute workout. Open RockyFit for exercises. Start light and focus on form.",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:RockyFit workout begins in 15 minutes",
      "TRIGGER:-PT15M",
      "END:VALARM",
      "END:VEVENT"
    );
    count++;
  }
  lines.push("END:VCALENDAR", "");
  const blob = new Blob([lines.join("\r\n")], { type:"text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "RockyFit-next-12-weeks.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast(count + " workouts exported. Import the file into your calendar to enable reminders.");
}

function updateNotifyButton() {
  const enabled = store.get("notification-enabled") === "1";
  const allowed = typeof Notification !== "undefined" && Notification.permission === "granted";
  $("notify-button").textContent = enabled && allowed
    ? "Disable in-app notifications"
    : "Enable in-app notifications";
}

async function toggleNotifications() {
  if (store.get("notification-enabled") === "1") {
    store.set("notification-enabled", "0");
    updateNotifyButton();
    toast("In-app notifications disabled.");
    return;
  }
  if (!("Notification" in window)) {
    toast("Your browser doesn't support local notifications. Use the calendar export.");
    return;
  }
  try {
    const granted = await Notification.requestPermission();
    if (granted !== "granted") {
      toast("Notifications were not allowed. Calendar reminders are still available.");
      return;
    }
    store.set("notification-enabled", "1");
    updateNotifyButton();
    toast("Enabled while the app is open. Use calendar export for closed-app reminders.");
  } catch {
    toast("Couldn't enable browser notifications here. Try the calendar instead.");
  }
}

async function reminderTick() {
  const actualDate = dateKey(new Date());
  if (actualDate !== lastSeenDay) {
    const wasViewingToday = dateKey(chosen) === lastSeenDay;
    lastSeenDay = actualDate;
    if (wasViewingToday) setChosen(new Date());
    else renderWeek();
  }
  if (store.get("notification-enabled") !== "1" ||
      typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const now = new Date();
  const session = workoutFor(now);
  if (!session) return;
  const time = store.get("reminder-time", "17:00");
  const actual = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  if (time !== actual || store.get("notified-" + dateKey(now)) === "1") return;
  try {
    const title = "RockyFit · Workout " + session;
    const options = {
      body: "Your full-body workout is ready. Open RockyFit to check off your exercises.",
      icon: "./icon.svg",
      tag: "rockyfit-" + dateKey(now)
    };
    if ("serviceWorker" in navigator && "showNotification" in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
    store.set("notified-" + dateKey(now), "1");
  } catch {
    // Some browsers grant permission but do not allow programmatic notifications.
  }
}

function setupInstall() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstall = event;
    $("install-button").hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    deferredInstall = null;
    $("install-button").hidden = true;
    toast("RockyFit installed.");
  });
  $("install-button").addEventListener("click", async () => {
    if (!deferredInstall) { $("info-dialog").showModal(); return; }
    await deferredInstall.prompt();
    deferredInstall = null;
    $("install-button").hidden = true;
  });
}

$("previous-week").addEventListener("click", () => setChosen(shiftDays(chosen, -7)));
$("next-week").addEventListener("click", () => setChosen(shiftDays(chosen, 7)));
$("today-button").addEventListener("click", () => setChosen(new Date()));
$("calendar-button").addEventListener("click", makeIcs);
$("notify-button").addEventListener("click", toggleNotifications);
$("reminder-time").value = store.get("reminder-time", "17:00");
$("reminder-time").addEventListener("change", (event) => {
  store.set("reminder-time", event.target.value);
  toast("Time saved for in-app reminders and future calendar exports.");
});
$("install-help").addEventListener("click", () => $("info-dialog").showModal());
$("close-dialog").addEventListener("click", () => $("info-dialog").close());
$("dialog-ok").addEventListener("click", () => $("info-dialog").close());
window.addEventListener("online", updateOnlineLabel);
window.addEventListener("offline", updateOnlineLabel);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) reminderTick();
});
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      toast("Offline installation unavailable in this browser.");
    });
  });
}
setupInstall();
render();
updateOnlineLabel();
updateNotifyButton();
setInterval(reminderTick, 20000);
reminderTick();
