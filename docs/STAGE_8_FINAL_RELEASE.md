# GHAZAL — STAGE 8 FINAL RELEASE

Version: 14.0.0

Stage 8 converts the completed offline product and Stage 7 QA system into a fail-closed production release pipeline.

## Implemented

- Final application version 14.0.0 / versionCode 14.
- Final-release BuildConfig identity.
- Production release channel.
- Internal QA Center hidden from production builds while retained in QA builds.
- Runtime production signature identity check.
- Production build refuses to run if the embedded expected signing certificate does not match the installed certificate.
- Gradle refuses release APK/AAB build when permanent signing inputs are absent.
- Stage 8 source/distribution gate.
- Full regression + Stage 7 heavy QA + Stage 8 final gate before production build.
- Android release lint.
- Signed APK and AAB production workflow.
- APK signing certificate SHA-256 verification.
- AAB signature verification.
- zipalign verification.
- Debuggable-build rejection.
- INTERNET-permission rejection for the offline release.
- Bundled asset-integrity verification.
- Release manifest with artifact hashes, signing certificate fingerprint, commit and Stage 7 device-QA evidence hash.
- Final SHA-256 checksum file.
- Final in-app release identity/about panel.
- No private key, password or API secret committed to source control.

## Mandatory external gates

Production release is intentionally blocked until all of the following are true:

1. The real-device Stage 7 critical matrix has been executed and passed.
2. The exported Stage 7 QA evidence JSON has a recorded SHA-256.
3. A permanent production keystore exists and is under secure custody.
4. GitHub production signing secrets are configured.
5. The repository is private before commercial release/source protection.
6. The signing certificate SHA-256 configured in GitHub matches the permanent key.

These gates are security controls, not missing application features. They must not be bypassed by committing a private key or password to the repository.

## Production artifacts

When the external gates are satisfied, the production workflow emits:

- GHAZAL-v14-production.apk
- GHAZAL-v14-production.aab
- release-v14-manifest.json
- release-v14-checksums.sha256
- APK signing certificate report
- Stage 7 Heavy QA report
- Stage 8 Final Gate report
- Android release lint report

The production APK remains offline-first and does not request Android INTERNET permission.
