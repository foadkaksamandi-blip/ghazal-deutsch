# GHAZAL — CROSS-PLATFORM PRODUCT LOCK

Status: ACTIVE CANDIDATE

This lock is additive to `MASTER_PRODUCT_LOCK.md`; it does not remove any educational, offline, classroom, security or QA requirement.

## Product definition

GHAZAL is no longer defined as Android-only. It is an offline-first German learning platform with one educational core and multiple clients.

Supported delivery surfaces:

- Android native client: full offline learning plus bundled Vosk German speech recognition.
- Web/PWA: browser access with installability and offline cached educational shell.
- iPhone/iPad: Safari PWA installation and offline learning after the application shell is cached.
- Windows: installable PWA through a compatible browser and browser access without installation.
- macOS: installable PWA through a compatible browser and browser access without installation.
- Linux/other modern desktop browsers: web/PWA access where supported.

## Non-negotiable honesty rule

Cross-platform does not mean silently pretending every browser has Android-native capabilities.

- Core lessons, exercises, progress, migration content, exams, classroom-local flows and backup must remain usable without permanent connectivity.
- Native Android offline German speech remains the strongest offline speech path.
- Browser speech recognition may depend on browser/OS services and can require connectivity. The UI must state this instead of claiming native offline recognition.
- Android background reminders can operate when the app is closed. Web/PWA background reminders are not claimed until a standards-supported implementation is verified on the target platform.
- No official Goethe/telc/TestDaF/ÖSD endorsement may be claimed without a real agreement.

## Shared-core rule

Lesson data, exercises, mastery logic, pathways, exams, local classroom contracts and progress formats remain shared. Platform-specific wrappers may add native capabilities but must not fork the curriculum into separate products.

## Sync roadmap

The local/offline state remains authoritative while offline. Optional authenticated sync may be enabled later using the existing server-ready contracts. A conflict-safe progress merge and privacy review are required before sync is marketed as production-ready.

## Commercial presentation readiness

External pilot and licensing outreach may describe GHAZAL as:

`Offline-first, cross-platform German learning for Persian speakers (A1–C2), designed for migration, study, work and exam preparation.`

Outreach must distinguish production capabilities from roadmap items and must not imply government, embassy, university or exam-provider endorsement.

## Cross-platform acceptance gate

A cross-platform candidate is accepted only when:

1. Manifest and service worker are valid.
2. Core shell installs or runs on supported browser surfaces.
3. Offline reload works after first successful load.
4. Existing Android automated tests do not regress.
5. PWA contract tests pass.
6. Browser UI smoke passes.
7. iPhone/iPad and desktop manual smoke tests are completed before public commercial release.
8. Android production release still requires permanent signing and the existing physical-device gate.
