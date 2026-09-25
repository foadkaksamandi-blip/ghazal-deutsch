const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');

test('Android build uses monotonic/overrideable versionCode instead of a frozen value',()=>{
  const gradle=fs.readFileSync(path.join(ROOT,'app/build.gradle'),'utf8');
  assert.ok(gradle.includes('GHZ_VERSION_CODE'));
  assert.ok(gradle.includes('autoVersionCode'));
  assert.ok(gradle.includes('versionCode ghzVersionCode'));
  assert.ok(!/versionCode\s+16\b/.test(gradle));
});

test('WebView refreshes APK assets by version without deleting WebStorage',()=>{
  const main=fs.readFileSync(path.join(ROOT,'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'),'utf8');
  assert.ok(main.includes('versionedAssetUrl()'));
  assert.ok(main.includes('index.html?v='));
  assert.ok(main.includes('prepareWebAssetsForCurrentVersion()'));
  assert.ok(main.includes('PREF_LAST_VERSION_CODE'));
  const method=main.slice(main.indexOf('private void prepareWebAssetsForCurrentVersion'),main.indexOf('WebView webViewForTesting'));
  assert.ok(method.includes('clearCache(true)'));
  assert.ok(method.includes('clearHistory()'));
  assert.ok(!method.includes('deleteAllData'));
});

test('Fresh-asset marker is wired into the packaged app',()=>{
  const index=fs.readFileSync(path.join(ROOT,'app/src/main/assets/index.html'),'utf8');
  const runtime=fs.readFileSync(path.join(ROOT,'app/src/main/assets/upgrade-runtime.js'),'utf8');
  assert.ok(index.includes('upgrade-runtime.js'));
  assert.ok(runtime.includes('data-ghz-upgrade-schema'));
  assert.ok(runtime.includes('SCHEMA=1'));
});
