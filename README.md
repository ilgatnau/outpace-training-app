# Touchline

A local-first football training app for iOS and Android, built with Expo / React Native and TypeScript. No account or backend is required. The optional web build is useful for previews (its storage is browser-local).

## Run

Requires Node 20.19+ and npm.

```sh
npm install
npm start
```

Open with Expo Go on an iPhone or Android device. Use `npm run ios` / `npm run android` with a configured simulator, or `npm run web` for a browser preview. The phone and development server need network connectivity during development; installed release apps keep training data offline. Native production builds require your own Apple/Google signing and Expo build setup.

```sh
npm test
npm run typecheck
npm run build:web
```

## Included

- Private single-player profile: date of birth / calculated age, position, preferred foot, goals.
- Dated height / weight history; optional adult waist measurements.
- Reusable routines with exercises, sets, repetitions, optional distance, work duration, repetition recovery and set recovery.
- Live timer with pause, skip, early finish, sound and vibration. Elapsed-time reconciliation when returning to the foreground.
- Post-session effort, fatigue, notes, and manually logged sessions.
- Performance logs for 10/20/30 m sprint times, max speed, Yo-Yo IR1 distance, repeated sprint mean, 505 agility, heart-rate recovery, and estimated VO₂ max.
- VO₂ estimates entered from a device or calculated with the Cooper 12-minute equation. Field estimates are not lab measurements and may not be appropriate for children.
- Method-specific progress charts, baseline/latest/personal best, 30/90-day and all-time filters.
- On-device AsyncStorage persistence, storage error handling, JSON backup sharing / paste restore, and data deletion.
- Unit tests for calculations, interval transitions, comparison rules, backup validation, and persistence failures.

## Data and measurement limits

An adult should manage a child's profile. There is no public sharing, tracking analytics, body rating, or weight target. App data is stored in the operating system's app sandbox; AsyncStorage is not application-level encrypted. Android automatic backup is disabled; iOS/device backup settings can still apply. Exported JSON contains personal data. Uninstalling or clearing app storage may delete records; keep backups if needed.

The app records test results; it does not automatically measure speed, heart rate, or VO₂ max. No wearable integrations or lab measurements are claimed. Use repeatable age-appropriate supervised tests. Short sprint timing is best recorded with suitable equipment. Background sound/haptic scheduling is OS dependent; keep the timer visible during a workout. No push notifications or background execution service is included.

Body shape is represented by optional adult waist measurements rather than subjective ratings or photos. A future backend can replace `src/storage.ts`; all data currently uses the version 1 schema in `src/domain.ts`.

## Verification in this workspace

- 19 unit tests pass (`npm test`).
- TypeScript passes (`npm run typecheck`).
- iOS and Android JavaScript / Hermes bundle exports pass (not signed native builds).
- Production web export passes (`npm run build:web`).
- A Chromium check at 390 × 844 verified profile creation, test recording, progress rendering, persistence after reload, and timer controls with no page errors.
- Screenshots: `artifacts/home.png` and `artifacts/progress.png`.
- Physical iPhone/Android testing and signed release installation are still required. Browser checks do not validate native audio, haptics, or OS suspension behavior.

## App branding

The launcher icon, Android adaptive icon, web favicon, and native startup splash are configured in `app.json`. Generated source artwork is retained in `assets/icon-source.png`. Native icon and splash changes require a new native build/install; Expo Go does not accurately preview the final release splash screen.

## GitHub Actions: downloadable Android APK

Use this `football` directory as the GitHub repository root (the directory containing `package.json` and `.github`). The workflow at `.github/workflows/android-apk.yml` runs on pull requests and pushes to `main` / `master`, and can also be started from **Actions → Build Android APK → Run workflow**.

The workflow installs locked dependencies, runs unit tests and TypeScript, generates the native Android project with Expo, and builds a standalone release-variant APK. Download `touchline-android-preview-<run number>` from the completed run's **Artifacts** section. Unzip it, transfer `touchline-preview.apk` to the phone, and allow installation from that source if Android asks. Artifacts expire after 14 days; a SHA-256 checksum is included.

No Expo account, EAS subscription, or repository secrets are needed. The APK bundles its JavaScript and runs without Metro or Expo Go. It supports ARM64 phones and x86_64 emulators. It uses Expo's generated development signing key, so treat it as a testing build. Production/Google Play distribution will require a private release signing key and a separate signing workflow. Changing signing keys can require uninstalling the previous app, so export your local data first.

The workflow has been reviewed and the local tests run; a hosted GitHub Actions build still needs to run after these files are pushed to your repository.
