# RockyFit

Minimal, offline Android workout app for a three-day full-body schedule.

- **Mon / Thu / Sat:** Workout A/B rotation, alternating each week (from Monday 19 October 2026).
- **Other days:** rest screen and next session.
- Exercise checkboxes saved by date on device.
- Workout-day reminder at 17:00 by default (editable).
- No account, network permission, ads or tracking.
- Designed for approximately 45–55 minute sessions.

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

The plan is a training starter, not an instruction to attempt maximum lifts. Start with manageable weights, learn technique and ask a trainer to inspect form.
