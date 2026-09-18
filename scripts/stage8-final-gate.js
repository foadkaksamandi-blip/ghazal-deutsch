#!/usr/bin/env node
"use strict";

const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const ASSETS=path.join(ROOT,"app/src/main/assets");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const checks=[];
function check(id,ok,detail=""){checks.push({id,ok:!!ok,detail});if(!ok)throw new Error(id+" failed"+(detail?": "+detail:""));}

const pkg=JSON.parse(read("package.json"));
const gradle=read("app/build.gradle");
const manifest=read("app/src/main/AndroidManifest.xml");
const index=read("app/src/main/assets/index.html");
const main=read("app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java");
const bridge=read("app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java");
const releaseWorkflow=read(".github/workflows/release-android.yml");
const qaUi=read("app/src/main/assets/release13-stage7-ui.js");
const finalCore=read("app/src/main/assets/release14-final-core.js");
const finalUi=read("app/src/main/assets/release14-final-ui.js");

check("package-version",pkg.version==="14.0.2",pkg.version);
check("android-version",/versionCode\s+16/.test(gradle)&&/versionName\s+"14\.0\.2"/.test(gradle));
check("application-id",/applicationId\s+"com\.foad\.ghazaldeutsch"/.test(gradle));
check("min-target-sdk",/minSdk\s+26/.test(gradle)&&/targetSdk\s+35/.test(gradle));
check("release-final-build-flag",gradle.includes('buildConfigField "boolean", "FINAL_RELEASE_BUILD", "true"'));
check("release-qa-tools-off",gradle.includes('buildConfigField "boolean", "QA_INTERNAL_TOOLS_ENABLED", "false"'));
check("release-channel",/RELEASE_CHANNEL[^\n]+production/.test(gradle));
check("release-signing-fail-closed",gradle.includes("Production release requires GHZ_STORE_FILE")&&gradle.includes(":app:assembleRelease"));
check("native-signature-fail-closed",main.includes("BuildConfig.FINAL_RELEASE_BUILD")&&main.includes("!isProductionSigned()")&&main.includes("اعتبار نسخه نهایی GHAZAL تأیید نشد"));
check("native-release-info",main.includes("String getReleaseInfo()")&&bridge.includes("public String getReleaseInfo()"));
check("native-version-fallback",main.includes('return "14.0.2"')&&bridge.includes('return activity == null ? "14.0.2"'));
check("offline-no-internet",!manifest.includes("android.permission.INTERNET"));
check("cleartext-disabled",manifest.includes('android:usesCleartextTraffic="false"'));
check("backup-disabled",manifest.includes('android:allowBackup="false"'));
check("audio-capture-disabled",manifest.includes('android:allowAudioPlaybackCapture="false"'));
check("final-assets-wired",["release14-final-core.js","release14-final-ui.js","release14-final.css"].every(x=>index.includes(x)));
check("final-core-version",finalCore.includes('const VERSION="14.0.2"')&&finalCore.includes('const VERSION_CODE=16'));
check("final-core-package",finalCore.includes('const PACKAGE_ID="com.foad.ghazaldeutsch"'));
check("qa-hidden-in-production",qaUi.includes("qaToolsEnabled===false"));
check("final-about-ui",finalUi.includes("درباره نسخه نهایی")&&finalUi.includes("Offline-first"));
check("prod-workflow-private-gate",releaseWorkflow.includes("Repository must be private for Stage 8 production release"));
check("prod-workflow-device-qa-gate",releaseWorkflow.includes("stage7_device_qa_confirmed")&&releaseWorkflow.includes("stage7_device_qa_evidence_sha256"));
check("prod-workflow-secrets",["GHZ_KEYSTORE_B64","GHZ_STORE_PASSWORD","GHZ_KEY_ALIAS","GHZ_KEY_PASSWORD","GHZ_CERT_SHA256"].every(x=>releaseWorkflow.includes(x)));
check("prod-workflow-heavy-qa",releaseWorkflow.includes("npm run qa:heavy")&&releaseWorkflow.includes("npm run qa:final"));
check("prod-workflow-lint",releaseWorkflow.includes("lintRelease"));
check("prod-workflow-build",releaseWorkflow.includes("assembleRelease")&&releaseWorkflow.includes("bundleRelease"));
check("prod-workflow-signature",releaseWorkflow.includes("apksigner verify")&&releaseWorkflow.includes("certificate SHA-256 digest"));
check("prod-workflow-aab-verify",releaseWorkflow.includes("jarsigner -verify"));
check("prod-workflow-no-debug",releaseWorkflow.includes("application-debuggable"));
check("prod-workflow-no-internet",releaseWorkflow.includes("android.permission.INTERNET"));
check("prod-workflow-integrity",releaseWorkflow.includes("asset-integrity.json"));
check("prod-workflow-manifest",releaseWorkflow.includes("release-v14-manifest.json")&&releaseWorkflow.includes("release-v14-checksums.sha256"));
check("prod-artifact-names",releaseWorkflow.includes("GHAZAL-v14-production.apk")&&releaseWorkflow.includes("GHAZAL-v14-production.aab"));

const forbidden=[];
for(const file of [gradle,main,bridge,finalCore,finalUi,releaseWorkflow]){
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(file))forbidden.push("private-key");
  if(/sk-[A-Za-z0-9_-]{20,}/.test(file))forbidden.push("api-key");
}
check("no-embedded-private-secret",forbidden.length===0,forbidden.join(","));

fs.mkdirSync(path.join(ROOT,"qa"),{recursive:true});
const report={format:"ghazal-stage8-final-gate-v1",version:"14.0.2",generatedAt:new Date().toISOString(),pass:true,checks};
fs.writeFileSync(path.join(ROOT,"qa/stage8-final-gate.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify({pass:true,checks:checks.length,version:"14.0.2"},null,2));
