# GHAZAL — Current Execution Stage 7

Status: AUTOMATED REVALIDATION IN PROGRESS / DEVICE MATRIX IN PROGRESS

## Scope
Stage 7 is the **Heavy QA + Android Device Matrix** gate for the current locked Stage 1–6 product. This stage adds no cosmetic feature for its own sake; its job is to prove that the complete product behaves correctly under stress, upgrade, offline, security, persistence, education and classroom scenarios.

## Automated gate
The current Stage 7 branch runs:
- all Node unit/regression tests;
- Stage 7 deterministic stress/fuzz QA;
- explicit audit of the authoritative Stage 6 surface (`GhazalStage6`);
- 40 end-to-end Stage 6 Teacher → Class → Student → Assignment → Writing/Speaking → Submit → Grade → Report stress flows;
- Stage 8 source/release gate;
- full product audit;
- whole-app UI interaction audit;
- JavaScript syntax validation;
- headless critical UI smoke;
- Android lint with zero-warning requirement;
- hardened non-debuggable APK build;
- signature, zipalign, permission and packaged-asset verification;
- real Android WebView physical-touch regression;
- in-place upgrade regression with monotonic version code.

## Manual Android matrix
The in-app QA Center keeps 28 manual cases. Critical cases remain PENDING until a human verifies them on Android hardware.

Critical cases:
- clean install;
- update install / data preservation;
- repeated launch/relaunch;
- App Lock;
- Privacy Screen;
- airplane-mode launch;
- offline A1 lesson;
- offline C2 lesson;
- five-skill session;
- Adaptive Daily Plan;
- Error Bank;
- Mastery Gate;
- encrypted Backup / Restore;
- exact Resume;
- Teacher → Student → Grade classroom flow;
- class report;
- Back / × navigation.

Already confirmed on the current physical-device history and not to be regressed:
- exact Resume behavior from the accepted learning/mock flows;
- Teacher → Student → Grade classroom flow;
- class report values;
- native PDF report save flow.

These prior observations do not auto-pass unrelated Device Matrix cases. Stage 7 closes only after the current automated gate is green and the remaining critical hardware checks are executed on the user's phone.

## Acceptance rule
Stage 7 becomes DEVICE ACCEPTED / LOCKED only when:
1. all current automated gates are green;
2. no critical runtime regression remains;
3. every critical manual Device Matrix case is physically verified PASS;
4. evidence is recorded before moving to Stage 8.
