# GHAZAL 14 — OFFLINE RELEASE PRIVACY SUMMARY

GHAZAL 14 is an offline-first Android learning application.

- Core lessons, exercises, progress, classroom-local data and learning state are stored locally on the device.
- The production offline build does not request Android INTERNET permission.
- Microphone permission is requested only for speaking/pronunciation activities. Speech recognition is delegated to the Android speech-recognition service available on the device; behavior can differ by phone and installed system service.
- Notification permission is used for local study reminders.
- Android system backup is disabled for application data.
- Privacy Screen can block screenshots/recent-app previews when enabled.
- Secure portable backup uses encryption before export.
- No advertising SDK or built-in network analytics is part of the offline release.
- Online accounts, cloud sync, online AI, payments and server analytics are not silently simulated; they require a future backend and separate privacy review.
