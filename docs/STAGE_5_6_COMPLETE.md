# GHAZAL — STAGE 5 + 6 COMPLETE CANDIDATE

Version: 12.0.0  
Status: Stage 5 code complete; Stage 6 hardening complete candidate. Permanent production signing remains an external release gate because the private signing key must never be committed to the repository.

## Stage 5 — Professional Product Features

Implemented:

- Internal Dictionary and full internal search.
- Offline Manager with bundled-pack status and airplane-mode acceptance checks.
- Safe JSON Content Pack v2 validation:
  - schema validation
  - duplicate-ID rejection
  - app-version floor
  - downgrade blocking
  - maximum size
  - executable HTML/JS rejection
  - imported packs marked untrusted unless a future CMS signature is available
- Pre-index pack loader so imported lessons join the educational universe after restart.
- Product/content versioning and schema versioning.
- Exact product resume model.
- Full GHAZAL local-state backup collection.
- SHA-256 backup integrity digest.
- AES-GCM encrypted portable backup through the native Android bridge.
- Restore with integrity verification before local state replacement.
- PDF progress report.
- Accessibility:
  - native WebView text zoom
  - high contrast
  - reduced motion
  - larger touch targets
  - speech-rate control
- Daily local notifications.
- Data/privacy controls including local data deletion.
- Server-ready Android/Web/iOS contracts without simulating a backend.
- Auth, Profile, Progress, Content/CMS, Classroom, AI Gateway, Analytics, Entitlement and Notification API contracts.
- Offline-first remains mandatory.

## Stage 6 — Security and Anti-Tamper

Implemented:

- Biometric/device credential (PIN/password/pattern/available biometrics) application lock.
- Privacy Screen / FLAG_SECURE.
- Android Keystore AES-GCM secure snapshot.
- Portable backup upgraded to v2:
  - PBKDF2-HMAC-SHA256
  - 310,000 iterations
  - AES-GCM
  - backward-compatible import of v1 backups.
- Cloud backup and device-transfer extraction disabled.
- Cleartext traffic disabled.
- Network security config trusts system anchors only for future TLS networking.
- Audio playback capture disabled.
- WebView:
  - debugging disabled
  - cookies disabled
  - mixed content denied
  - file-to-file and universal file access denied
  - window spawning disabled
  - geolocation disabled
  - database API disabled
  - non-file/non-data requests blocked in the current offline build
  - obscured touch filtering retained.
- Root-risk checks.
- Runtime debugger/hook risk checks (TracerPid / process maps / known hook packages).
- APK signing SHA-256 visibility.
- BuildConfig production-signing identity gate.
- Build-time SHA-256 manifest for bundled assets.
- Runtime verification of bundled assets.
- Android Keystore crypto self-test.
- Local-state secret/API-key scan.
- Hardened non-debuggable QA build with minification/resource shrinking/obfuscation.
- CI source secret scan.
- Dedicated production release workflow requiring signing material only from GitHub Secrets.
- Production workflow verifies signing certificate SHA-256 and rejects a debuggable release.

## Explicit external release gates

The following cannot be truthfully completed inside source code alone:

1. A permanent production keystore/private signing key must be generated and stored outside the public repository.
2. GitHub Secrets must be configured:
   - GHZ_KEYSTORE_B64
   - GHZ_STORE_PASSWORD
   - GHZ_KEY_ALIAS
   - GHZ_KEY_PASSWORD
   - GHZ_CERT_SHA256
3. The repository should become private before commercial source protection matters.
4. Stage 7 manual/automated heavy QA must pass before public distribution.

No production key, password, API key or backend secret is committed to this repository.
