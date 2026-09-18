# GHAZAL — STAGE 7 HEAVY QA

Version: 13.0.0

Stage 7 is the final QA layer before Stage 8 Final Release. It has two separate parts and never confuses them:

1. Automated heavy QA — executable in CI and inside the app.
2. Real-device QA — must be executed on Android hardware and recorded in the Device Matrix.

## Automated heavy QA

The Stage 7 CI runs all previous unit/regression tests plus a deterministic heavy runner.

Coverage includes:

- Full lesson schema and duplicate-ID validation.
- A1–C2 coverage validation.
- Exercise schema, ID and lesson-reference validation.
- Internal search stress.
- Internal dictionary stress.
- 1,600 deterministic adaptive-learning attempts.
- Mastery/confidence/due-date bounds.
- Daily-plan generation across levels and time budgets.
- 40 complete Teacher → Student → Submission → Grade → Report classroom flows.
- 80 full backup integrity rounds.
- Deliberate backup tampering rejection.
- Content Pack valid/invalid/downgrade/executable-content rejection.
- Local secret/API-key state scan.
- Local storage integrity and size checks.
- Offline manifest policy: no INTERNET permission.
- Cleartext and Android backup policy checks.
- Runtime JS scan for external HTTP references and dynamic eval.
- Product/package/Gradle/native version consistency.
- Stage 7 QA core self-test.
- JavaScript syntax validation.
- Android lint.
- Hardened non-debuggable APK build.
- APK signature verification.
- zipalign verification.
- Permission inspection.
- Packaged Stage 7 asset inspection.
- Packaged integrity-manifest inspection.
- APK size sanity gate.
- APK SHA-256 evidence.

CI writes:

- qa/stage7-heavy-qa-report.json
- qa/apk-sha256.txt
- Android lint HTML report
- Hardened Stage 7 APK

## In-app QA Center

The app contains a Stage 7 QA Center with:

- Full Automated QA.
- Device Matrix.
- Runtime Error ledger.
- Device Report.
- Stage 7 release gate.
- QA Evidence JSON export.

Runtime JavaScript errors and unhandled promise rejections are captured locally only. They are not uploaded.

## Real-device matrix

The Device Matrix contains 28 cases, including critical cases for:

- clean installation
- update installation
- repeated launch/relaunch
- App Lock
- Privacy Screen
- airplane-mode launch
- A1 offline lesson
- C2 offline lesson
- integrated five-skill session
- adaptive plan
- Error Bank
- Mastery Gate
- TTS
- Speech Recognition
- notification
- reminder after reboot
- encrypted Backup/Restore
- exact Resume
- PDF report
- complete Classroom flow
- class report
- Content Pack
- Search/Dictionary
- Accessibility
- low-memory recovery
- long session
- Back/× navigation
- personal-data deletion

A critical real-device item stays PENDING until a human actually tests it. Stage 7 does not auto-mark physical behavior as PASS.

## Release gate

Stage 7 is complete as code when:

- all automated heavy QA passes;
- the QA Center and Device Matrix are functional;
- the hardened QA APK builds and verifies.

Stage 7 is accepted for Stage 8 only when the critical real-device matrix also passes.

Stage 8 additionally requires:

- permanent production signing key;
- production signing fingerprint verification;
- repository privacy before commercial source protection;
- production APK/AAB build.

No private key, signing password, API key or backend secret belongs in the repository.
