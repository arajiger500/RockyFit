# RockyFit web (GitHub Pages)

Standalone offline Progressive Web App. No hosting server, account, ads, tracking,
third-party libraries, or runtime network requests beyond the static app shell.

**Website once Pages is enabled:** https://arajiger500.github.io/RockyFit/

## Deploy

In GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**.
Then go to **Actions > Test and deploy RockyFit web** and run it if needed.

On a private repository, GitHub Pages requires a GitHub account/organization plan
supporting Pages for private repos. The Android app is unaffected. If Pages is not
available on the current account, the repository owner must decide whether to make
it public; this project does not change repository visibility automatically.

## Offline behavior

Open the website once while online and let the service worker install, then add it
to the home screen or install it in your browser. Once cached, it works offline.
Progress is stored in **localStorage on each device** and does not sync across devices.

Workouts use local device time:
- **Monday A, Thursday B, Saturday C** — short dumbbell/bodyweight strength sessions (30–45 minutes)
- **Tuesday / Friday** — optional walk and mobility, without hard lifting
- **Wednesday / Sunday** — rest

No bench, equipment machines, or gym membership. If your smallest dumbbell
configuration is too heavy, use bodyweight versions or skip that weighted
exercise instead of forcing it. Check that weights are secured to handles
with working collars.

## Notifications

Due to browser restrictions, no purely offline web app can **reliably schedule
background notifications while closed on every platform**. The optional browser
notification option works while the app is open on compatible browsers.

Use **Add workouts to calendar** to download the next 12 weeks of workouts at your
chosen time with a 15-minute VALARM. Import into the device's calendar app. Actual
alerts depend on that calendar's notification settings and support for imported alarms.

iPhone / iPad: Safari > Share > Add to Home Screen.
Android: Chrome > Install app / Add to Home screen.
Desktop: install via browser toolbar or use the website.

## Local tests

Run `npm test` with Node 18+; no package installation is required.
