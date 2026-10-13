# RockyFit

Minimal, offline Android workout app for a three-day full-body schedule.

- **Mon / Thu / Sat:** Workout A/B rotation, alternating each week (from Monday 19 October 2026).
- **Other days:** rest screen and next session.
- Exercise checkboxes saved by date on device.
- Workout-day reminder at 17:00 by default (editable).
- No account, network permission, ads or tracking.
- Designed for approximately 45–55 minute sessions.

## Build

Requires Java 17, Android SDK 35 and Gradle 8.10.2.

```sh
gradle assembleDebug
```

Or open **GitHub Actions → Build Android APK**, then download artifact **RockyFit-APK** from the successful run and extract `app-debug.apk`.

On first opening the app, allow notification permission. Reminders use Android inexact alarms and may be delayed by system battery-saving behavior.

The plan is a training starter, not an instruction to attempt maximum lifts. Start with manageable weights, learn technique and ask a trainer to inspect form.
