# GHAZAL — STAGE 3 + 4 COMPLETE CANDIDATE

Version: 11.0.0
Status: COMPLETE CANDIDATE — automated QA required, then real-device QA before product release.

## Stage 3 — Intelligent Learning Engine

Implemented offline and without fake online AI:

- Persistent learner model per local profile.
- Skill state for vocabulary, grammar, reading, listening, writing, speaking, pronunciation and transfer.
- Mastery and confidence stored separately.
- Item-level spaced-review scheduling with interval, due date, lapses, ease and mastery evidence.
- Error Bank with recurrence count and two-success resolution rule.
- Adaptive Daily Plan based on due reviews, weakest skills, level and user time budget.
- Mastery Gate requiring volume, objective skills, production skills, transfer evidence and controlled recurring errors.
- Unknown Situation / transfer challenges.
- Rescue Mode with progressive hints only after attempts.
- A1→C2 immersion ratios.
- Multi-level diagnostic Placement 2.0.
- Weekly and monthly missions.
- Integration hook so Stage 2 Smart Practice writes into the Stage 3 learner model.
- Existing content remains offline-first.

Limitations kept explicit:
- No claim of official CEFR certification.
- No claim of official TestDaF prediction.
- No fake LLM/online teacher while backend does not exist.
- Speech Recognition availability depends on the Android device/service.

## Stage 4 — Complete Local Classroom / Teacher

Implemented on the local offline product model:

- Student and Teacher local profiles.
- Class creation and class codes.
- Student join flow.
- Advanced assignments with multiple item types:
  - lesson
  - exercise
  - writing
  - speaking
- Assignment due date and instructions.
- Student local submission state.
- Writing answer storage.
- Speaking transcript through Android Speech Recognition.
- Objective exercise scoring.
- Teacher submission review.
- Teacher rubric scoring.
- Teacher comment and final grade.
- Class announcements.
- Assignment/class completion reports.
- Per-student completion and average grade.
- PDF export path through the existing Android report bridge.
- Server-ready v2 classroom entity contract with offline queue and idempotency requirement.

Architecture note:
Cross-device classroom synchronization is intentionally not simulated. It activates only after the real backend is connected. The local data model already separates profiles/classes/assignments/submissions/grades/announcements so server sync can be added without replacing the educational core.

## Acceptance

Automated acceptance must verify:
- no regression of Stage 1/2 content and security tests
- Stage 3 state updates and review scheduling
- Error Bank resolution
- adaptive planning
- mastery gate
- placement/immersion/missions
- complete teacher→student→submission→grade→report flow
- version consistency
- Android APK build

Manual device QA remains a later product QA stage and is not silently treated as completed by this document.
