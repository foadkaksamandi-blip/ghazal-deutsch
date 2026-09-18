const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const manifest = fs.readFileSync(path.join(root, 'app/src/main/AndroidManifest.xml'), 'utf8');
const main = fs.readFileSync(path.join(root, 'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'), 'utf8');
const gradle = fs.readFileSync(path.join(root, 'app/build.gradle'), 'utf8');
const index = fs.readFileSync(path.join(root, 'app/src/main/assets/index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('manifest blocks insecure platform backup and cleartext traffic', () => {
  assert.match(manifest, /android:allowBackup="false"/);
  assert.match(manifest, /android:fullBackupContent="false"/);
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:name="\\.BootReceiver"[\\s\\S]*android:exported="false"/);
  assert.match(manifest, /android:taskAffinity=""/);
});

test('WebView hardening stays enabled', () => {
  assert.match(main, /setWebContentsDebuggingEnabled\\(false\\)/);
  assert.match(main, /setAllowFileAccessFromFileURLs\\(false\\)/);
  assert.match(main, /setAllowUniversalAccessFromFileURLs\\(false\\)/);
  assert.match(main, /MIXED_CONTENT_NEVER_ALLOW/);
  assert.match(main, /setSafeBrowsingEnabled\\(true\\)/);
  assert.match(main, /setAcceptCookie\\(false\\)/);
  assert.match(main, /setAcceptThirdPartyCookies\\(webView, false\\)/);
  assert.match(main, /setFilterTouchesWhenObscured\\(true\\)/);
});

test('encrypted local and portable backup primitives are present', () => {
  assert.match(main, /AndroidKeyStore/);
  assert.match(main, /AES\\/GCM\\/NoPadding/);
  assert.match(main, /PBKDF2WithHmacSHA256/);
  assert.match(main, /120_000/);
});

test('release build stays minified and Android version matches package version', () => {
  const escaped = pkg.version.replace(/[.*+?^$()|[\\]\\\\]/g, '\\$&');
  assert.match(gradle, new RegExp('versionName "' + escaped + '"'));
  assert.match(gradle, /versionCode\\s+[1-9]\\d*/);
  assert.match(gradle, /release \\{[\\s\\S]*minifyEnabled true[\\s\\S]*shrinkResources true/);
});

test('final assets load locally and preserve universal cross navigation', () => {
  for (const asset of ['release5-content.js','release5-extension.js','release5-extension.css','release4-navigation.js']) {
    assert.ok(index.includes(asset), 'missing ' + asset);
  }
  assert.doesNotMatch(index, /https?:\\/\\//);
});