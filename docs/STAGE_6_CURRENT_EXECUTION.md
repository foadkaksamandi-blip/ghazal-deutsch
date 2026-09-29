# GHAZAL — Current Execution Stage 6

Status: CODE COMPLETE CANDIDATE / DEVICE ACCEPTANCE PENDING

## Scope
Stage 6 in the active nine-stage execution roadmap is **Profiles / Classes**. It consolidates the existing local platform and classroom engines into one authoritative user-facing workflow without removing the locked Stage 1–5 capabilities.

## Implemented
- Local Student and Teacher profiles.
- Persistent active-profile switching on the device.
- Teacher Workspace.
- Local class creation with class codes.
- Student join by class code.
- Assignment Builder based on real bundled GHAZAL lessons.
- Optional real Exercise item from the exercise engine.
- Writing assignment evidence through the Stage 4 writing evaluator.
- Speaking assignment transcript/evidence through Android speech recognition + Stage 4 speaking evaluator.
- Required-item completion checks before final submission.
- Teacher submission review, rubric grading and comments.
- Assignment/class progress.
- Class report and existing native PDF export path.
- Server-ready classroom contract with offline queue + idempotency requirements.
- Future Student / Teacher / Admin roles represented in the architecture.

## Offline truth boundary
The current build has no real classroom server. Therefore:
- class codes work between local profiles on the same device;
- cross-device join/sync is disabled;
- no fake login, cloud class, online teacher, or fake sync state is shown;
- a future backend can connect through the existing platform/classroom contracts without replacing the offline learning core.

## Authoritative assets
- `stage6-profiles-classes.js`
- `stage6-profiles-classes-ui.js`
- `stage6-profiles-classes.css`
- existing `platform-core.js` and `release11-classroom-core.js` remain the underlying compatible data/domain engines.

## Acceptance gate
Stage 6 is not DEVICE ACCEPTED until:
1. Unit/regression tests pass for Teacher → Class → Student → Assignment → Writing/Speaking → Submission → Grade → Report.
2. Stage 8 Final Gate and hardened Android QA pass.
3. Android Physical-Touch Regression passes the Stage 6 profile/class creation path.
4. The same Stage 6 build is manually checked on the user's Android phone.

Stage 5 remains locked and must not regress while Stage 6 is being accepted.
