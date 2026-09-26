# GHAZAL — MASTER PRODUCT LOCK

Status: ACTIVE
Market scope for current build: IRAN-FIRST
Rule: Previous capabilities + additive improvements. No regression, no silent removal, no fake/placeholder feature.

## Authoritative educational specification
The complete user-supplied “MASTER GERMAN OFFLINE EDUCATIONAL APP — FINAL MASTER OS” remains authoritative for all educational requirements from A1 through C2. Its requirements are cumulative and persistent. This repository lock does not replace or shorten that specification.

## Locked product principles
- APP = SCHOOL.
- CONTENT LIBRARY = EDUCATIONAL UNIVERSE.
- ACQUISITION OS = EDUCATIONAL BRAIN.
- AI = TEACHER, curriculum-controlled, never an uncontrolled chatbot.
- OFFLINE-FIRST: core learning must continue in airplane mode.
- NO EMPTY SHELL: every visible feature must work.
- NO RESOURCE DEPENDENCY: core learning cannot require another course/book/app.
- NO REGRESSION: new releases may add/improve/repair, never silently remove.
- Mastery is evidence-based and separate from completion.
- All major skills remain integrated: Hören, Lesen, Schreiben, Sprechen, Grammatik, Wortschatz, Aussprache, Pragmatik, Register, Fluency, Naturalness, Transfer, Automaticity.
- Real-life Germany, migration/admin, university, profession and exams remain integrated.
- TestDaF, Goethe, telc and ÖSD infrastructure remains active.
- FOAD attribution remains subtle and non-disruptive.

## Locked unfinished educational work
These items remain mandatory until explicitly closed by QA:
- Expand A1–C2 from dozens to a commercial-scale library of hundreds of lessons and thousands of exercises.
- Complete grammar coverage A1–C2 with contrast engine, exceptions, error patterns, production and transfer.
- Expand vocabulary database with article, plural, verb forms, collocations, prepositions, word families, register and active/passive/automatic states.
- Expand Redemittel, collocations, idioms, phone German, digital German, administration, university and professional tracks.
- Build multi-speaker listening library with human native recordings where rights are secured.
- Add connected-speech, micro-listening, dictation, transcript, shadowing, segmentation and diagnostic causes.
- Upgrade pronunciation toward phoneme/stress/rhythm/intonation analysis when an appropriate speech engine is available.
- Deepen writing feedback for grammar, cohesion, coherence, argumentation, style, register, naturalness and C1/C2 quality.
- Add controlled online AI conversation/writing teacher only after backend is available; offline learning must remain usable without it.
- Complete full mock exams, timing, task diagnostics and evidence-based TestDaF TDN4→TDN5 tracking.
- Complete internal search across lessons, vocabulary, grammar, dialogues, scenarios and exams.
- Complete content packs, content versioning, migration rules and progress-safe updates.
- Complete curriculum dependency graph and cross-skill knowledge graph.
- Complete exact-resume continuity and state migration across app versions.
- Complete weekly/monthly evidence reports and remediation recommendations.
- Complete airplane-mode acceptance test and “only this app” acceptance test.
- Complete accessibility and low-resource graceful degradation.
- Complete device-matrix manual QA before public release.

## Locked classroom/teacher product work
GHAZAL must be usable by teachers and classes, not only self-study:
- Local Student and Teacher profiles.
- Teacher workspace.
- Local class creation and class codes.
- Local assignment creation from real lessons.
- Student join flow.
- Assignment status/progress.
- Teacher view of assignments and learner results.
- Writing/Speaking assignment support.
- Class reports and PDF/export path.
- Later server sync across devices without redesigning the educational core.
- Future School/Admin role supported by architecture.

## Locked commercial/server-ready architecture
Current app must remain usable without a server, but code must be ready for:
- Auth API
- User/Profile API
- Progress Sync API
- Content/CMS API
- Classroom/Teacher API
- AI Gateway API
- Analytics API
- Subscription/Entitlement API
- Notification API
- Admin/CMS web panel
- Android, iOS and Web clients sharing the same product contracts

Until a backend exists, online-only features must be visibly unavailable rather than simulated.

## Locked security work
- Release signing with a permanent production key before public distribution.
- No secrets/API keys embedded in clients.
- Biometric/device credential lock.
- Secure local storage and encrypted backup.
- Privacy screen.
- Android Keystore / iOS Keychain equivalents.
- Obfuscation/minification for production.
- Root/jailbreak/tamper risk checks.
- Server-side token/session protection once online.
- TLS only; certificate strategy for production.
- Rate limiting and abuse controls on backend.
- Privacy-respecting logs/analytics.
- Repository must become private before commercial/public source protection matters.
- Public release must not use a debug APK.

## Locked Iran-first release sequence
1. Finish the app and educational universe.
2. Finish teacher/classroom and server-ready local architecture.
3. Run automated QA.
4. Run manual QA on real Android devices.
5. Produce release-signed Android build.
6. Only then build Iran backend, database, object storage, domain/SSL, sync, accounts and CMS.
7. Then add online AI, payments and public distribution.
8. Then expand to iOS/Web without rewriting the educational core.

## Definition of done for the current product phase
The current product phase is not “done” until the offline app itself is a complete, functional educational product, all visible features are real, automated tests pass, manual device QA passes, and the architecture can accept a server later without replacing the core.


## Locked roadmap status

As of GHAZAL 14.0.0:

- Stage 1 — Product Core: COMPLETE CANDIDATE.
- Stage 2 — A1–C2 Educational Universe: COMPLETE CANDIDATE.
- Stage 3 — Intelligent Learning Engine: COMPLETE CANDIDATE.
- Stage 4 — Classroom / Teacher Product: COMPLETE CANDIDATE.
- Stage 5 — Professional Product Features: COMPLETE CANDIDATE.
- Stage 6 — Security / Anti-Tamper: CODE + HARDENING COMPLETE CANDIDATE.
- Stage 7 — Heavy QA: AUTOMATED PASS / DEVICE ACCEPTANCE PENDING — regression, stress/fuzz, syntax, Android lint, hardened APK build, signature/zipalign/permission/payload verification all pass; real-device critical matrix must still be executed and passed.
- Stage 8 — Final Release: CODE / PIPELINE COMPLETE CANDIDATE — final build identity, fail-closed signing, final QA gate, production APK/AAB workflow, release manifest/checksums and production-only QA hiding are implemented. Production publication remains externally blocked until Stage 7 real-device acceptance, permanent signing secrets and repository privacy are satisfied.

Stage 8 external release gates that remain intentionally outside source control:
- permanent production keystore/private key creation and secure custody
- GitHub production signing secrets
- production signing certificate fingerprint confirmation
- repository privacy before commercial source protection matters

These external gates must never be bypassed by committing a private key, password, API key, or signing secret to the repository.


## Current 9-stage execution acceptance

This section records the active execution roadmap used for device acceptance and supersedes older stage labels where numbering conflicts.

- Stage 1 — UI/Core stabilization: **DEVICE ACCEPTED / LOCKED**.
- Stage 2 — Offline Learning Engine: **DEVICE ACCEPTED / LOCKED**.
  - Real-device acceptance confirmed for touch behavior, daily-plan interaction, exact resume after closing/reopening the app, and direct checkpoint-quiz entry.
  - The existing `×` close control across screens is an explicitly accepted UI behavior. It is not considered a Stage 2 defect and must not be changed solely for cosmetic consistency.
  - Stage 2 learning-engine scope locked: A1–C2 lesson/exercise flow, quiz/checkpoint testing, SRS, error bank, per-skill mastery, daily plan, adaptive learning, exact resume/draft persistence, and safe migration of prior learning state.
  - Any future change to these paths must preserve the accepted touch behavior and pass the Stage 2 phone-flow instrumentation tests before merge.
- Stage 3 — Complete real A1–C2 educational content: **CODE + AUTOMATED/WEBVIEW QA COMPLETE CANDIDATE**.
- Stage 4 — Private Tutor + Evaluation: **CODE + AUTOMATED/WEBVIEW QA COMPLETE CANDIDATE**.
- Stage 5 — Exams + Specialized Pathways: **CODE + QA CANDIDATE**.
  - Authoritative Stage 5 surface: `stage5-exams-pathways.js` + `stage5-exams-pathways-ui.js`.
  - Goethe / telc / TestDaF / ÖSD; timed quick/weekly/comprehensive internal mocks; exact resume; evidence-based Writing/Speaking scoring; results, weak-skill analysis and explicitly non-official TestDaF readiness.
  - Migration / University / Career / Alltag pathways require real Writing + Speaking evidence. Legacy fixed-score Speaking UI is suppressed.
  - Official licensed exam papers are not bundled or claimed.
- Next execution stage after Stage 5 acceptance: Stage 6 — profiles / classes.
