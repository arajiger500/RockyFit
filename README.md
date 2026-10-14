# RockyFit

Minimal, offline Android + web workout tracker for a bench-free dorm dumbbell routine.

- **Monday A / Thursday B / Saturday C:** Three 30–45-minute full-body workouts with dumbbells and bodyweight.
- **Tuesday / Friday:** Optional easy walking and mobility. **Wednesday / Sunday:** Recovery.
- Exercise checkboxes saved by date on device.
- Workout-day reminder at 17:00 by default (editable).
- No account, network permission, ads or tracking.
- Designed for approximately 30–45 minute strength sessions.

## Web app (GitHub Pages)

RockyFit also includes a lightweight, installable and offline-first web version for
Android, iOS, iPadOS, Windows, macOS and Linux browsers.

- **Pages URL (after enabling deployment):** https://arajiger500.github.io/RockyFit/
- Setup: GitHub **Settings → Pages → Source: GitHub Actions**.
- On a free GitHub account, private repositories may not be eligible for Pages;
  repository visibility is **not changed** by this project.
- Choose any day to see its workout, track exercises locally, and use the
  **calendar export** for OS-managed reminders when the browser is closed.
- See [web app deployment instructions](docs/README.md) for offline/notification caveats.

## Build

Requires Java 17, Android SDK 35 and Gradle 8.10.2.

```sh
gradle assembleDebug
```

Or open **GitHub Actions → Build Android APK**, then download artifact **RockyFit-APK** from the successful run and extract `app-debug.apk`.

On first opening the app, allow notification permission. Reminders use Android inexact alarms and may be delayed by system battery-saving behavior.

## Strength plan and safety

No bench or gym machines are required. You only need safe, stable dumbbells and clear floor space.

| Day | Plan | Duration |
| --- | --- | --- |
| Monday | A: squat, floor press, row, hinge, calves, core | 30–45 min |
| Tuesday | Optional easy walk / mobility | 10–30 min |
| Wednesday | Rest | — |
| Thursday | B: supported split squat, incline push-up, row, bridge, optional curl, core | 30–45 min |
| Friday | Optional easy walk / mobility | 10–30 min |
| Saturday | C: squat, single-arm floor press, row, hinge, wall push-up, side plank | 30–45 min |
| Sunday | Rest | — |

Start with about 5–8 minutes of warm-up and two sets per exercise. Don't force every
weight: if the plates and handles only allow a weight you cannot control,
use the bodyweight version or skip that dumbbell movement. Secure every plate
with a proper collar. Leave about 2–3 comfortable reps in reserve; avoid 1RM
tests and maximum-effort lifting. Build repetitions and technique before load.
For a minor, get a coach or qualified adult to check technique where possible.
Soreness is normal; sharp pain is a reason to stop. Movement days are *optional*,
not another demanding workout.
