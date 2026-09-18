const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Stage 8 final core locks version package and offline privacy model',()=>{
  delete require.cache[require.resolve('../app/src/main/assets/release14-final-core.js')];
  const core=require('../app/src/main/assets/release14-final-core.js');
  assert.equal(core.VERSION,'14.0.2');
  assert.equal(core.VERSION_CODE,16);
  assert.equal(core.PACKAGE_ID,'com.foad.ghazaldeutsch');
  const privacy=core.privacyModel();
  assert.equal(privacy.offlineCore,true);
  assert.equal(privacy.internetPermission,false);
  assert.equal(privacy.advertising,false);
});

test('Stage 8 Android build is fail-closed for unsigned production releases',()=>{
  const gradle=read('app/build.gradle');
  assert.match(gradle,/versionCode\s+16/);
  assert.match(gradle,/versionName\s+"14\.0\.2"/);
  assert.ok(gradle.includes('FINAL_RELEASE_BUILD", "true"'));
  assert.ok(gradle.includes('QA_INTERNAL_TOOLS_ENABLED", "false"'));
  assert.match(gradle,/RELEASE_CHANNEL[^\n]+production/);
  assert.ok(gradle.includes('Production release requires GHZ_STORE_FILE'));
  assert.ok(gradle.includes(':app:assembleRelease'));
  assert.ok(gradle.includes(':app:bundleRelease'));
});

test('Stage 8 runtime refuses a final build whose production identity does not verify',()=>{
  const main=read('app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java');
  const bridge=read('app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java');
  assert.ok(main.includes('BuildConfig.FINAL_RELEASE_BUILD'));
  assert.ok(main.includes('!BuildConfig.PRODUCTION_SIGNING_ENABLED || !isProductionSigned()'));
  assert.ok(main.includes('اعتبار نسخه نهایی GHAZAL تأیید نشد'));
  assert.ok(main.includes('String getReleaseInfo()'));
  assert.ok(bridge.includes('public String getReleaseInfo()'));
  assert.ok(main.includes('return "14.0.2"'));
  assert.ok(bridge.includes('return activity == null ? "14.0.2"'));
});

test('Stage 8 production build hides internal QA center while QA builds retain it',()=>{
  const gradle=read('app/build.gradle');
  const qaUi=read('app/src/main/assets/release13-stage7-ui.js');
  assert.ok(gradle.includes('QA_INTERNAL_TOOLS_ENABLED", "false"'));
  assert.ok(gradle.includes('QA_INTERNAL_TOOLS_ENABLED", "true"'));
  assert.ok(qaUi.includes('qaToolsEnabled===false'));
});

test('Stage 8 final assets load after security and QA core',()=>{
  const index=read('app/src/main/assets/index.html');
  for(const asset of ['release14-final-core.js','release14-final-ui.js','release14-final.css'])assert.ok(index.includes(asset),asset);
  assert.ok(index.indexOf('release13-qa-core.js')<index.indexOf('release14-final-core.js'));
  assert.ok(index.indexOf('release13-stage7-ui.js')<index.indexOf('release14-final-ui.js'));
});

test('Stage 8 offline final manifest does not request internet and blocks platform backup',()=>{
  const manifest=read('app/src/main/AndroidManifest.xml');
  assert.ok(!manifest.includes('android.permission.INTERNET'));
  assert.ok(manifest.includes('android:allowBackup="false"'));
  assert.ok(manifest.includes('android:usesCleartextTraffic="false"'));
  assert.ok(manifest.includes('android:allowAudioPlaybackCapture="false"'));
});

test('Stage 8 production workflow requires private repository real-device QA and permanent signing secrets',()=>{
  const wf=read('.github/workflows/release-android.yml');
  for(const token of [
    'Repository must be private for Stage 8 production release',
    'stage7_device_qa_confirmed',
    'stage7_device_qa_evidence_sha256',
    'GHZ_KEYSTORE_B64','GHZ_STORE_PASSWORD','GHZ_KEY_ALIAS','GHZ_KEY_PASSWORD','GHZ_CERT_SHA256',
    'npm run qa:heavy','npm run qa:final','lintRelease','assembleRelease','bundleRelease',
    'apksigner verify','jarsigner -verify','application-debuggable','android.permission.INTERNET',
    'release-v14-manifest.json','release-v14-checksums.sha256',
    'GHAZAL-v14-production.apk','GHAZAL-v14-production.aab'
  ])assert.ok(wf.includes(token),token);
  assert.ok(wf.indexOf('Stage 8 external release gate')<wf.indexOf('Build signed production APK and AAB'));
  assert.ok(wf.indexOf('npm run qa:final')<wf.indexOf('assembleRelease'));
});

test('Stage 8 CI builds a hardened v14 final candidate before production',()=>{
  const wf=read('.github/workflows/android.yml');
  for(const token of ['Stage 8 Final Gate','npm run qa:heavy','npm run qa:final','lintHardenedQa','assembleHardenedQa','release14-final-core.js','GHAZAL-v14-stage8-final-qa.apk','stage8-final-gate.json'])assert.ok(wf.includes(token),token);
});

test('Stage 8 source control contains no production private key material',()=>{
  const files=[
    'app/build.gradle',
    '.github/workflows/release-android.yml',
    'app/src/main/assets/release14-final-core.js',
    'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'
  ];
  for(const p of files){
    const t=read(p);
    assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(t),p);
    assert.ok(!/sk-[A-Za-z0-9_-]{20,}/.test(t),p);
  }
});

test('Stage 8 package and final gate remain version-consistent',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const qa=read('app/src/main/assets/release13-qa-core.js');
  const finalCore=read('app/src/main/assets/release14-final-core.js');
  assert.equal(pkg.version,'14.0.2');
  assert.ok(gradle.includes('versionName "14.0.2"'));
  assert.ok(qa.includes('const VERSION="14.0.2"'));
  assert.ok(finalCore.includes('const VERSION="14.0.2"'));
});
