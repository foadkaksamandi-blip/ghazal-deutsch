# GHAZAL — Current Execution Stage 6

Status: DEVICE ACCEPTED / LOCKED

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

## Acceptance evidence
All Stage 6 acceptance gates passed:
1. Unit/regression tests passed for Teacher → Class → Student → Assignment → Submission → Grade → Report.
2. Stage 8 Final Gate and hardened Android QA passed.
3. Android Physical-Touch Regression passed the Stage 6 profile/class creation path.
4. Manual Android device acceptance passed end-to-end.

Manual device evidence:
- Student and Teacher local profiles created and switched correctly.
- Teacher created class "A1 تست" and local class code "GHZA1790".
- Student joined the class with the generated code.
- Teacher published "تکلیف تست" from a real A1 lesson.
- Student received the assignment, completed the lesson item and submitted it.
- Teacher received the submission, reviewed it, saved a 90% grade and "خوب بود" feedback.
- Student Workspace showed the saved 90% grade; assignment detail showed the saved teacher feedback.
- Class report correctly showed 1 student, 100% completion and 90% average.
- Native Android PDF save flow opened and the report was saved successfully.

Stage 6 is now locked. Future work must not regress this accepted flow.
