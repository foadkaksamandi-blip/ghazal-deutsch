const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const assets=path.join(root,'app','src','main','assets');
const read=name=>fs.readFileSync(path.join(assets,name),'utf8');
const readWeb=name=>fs.readFileSync(path.join(root,'web',name),'utf8');

test('PWA manifest is installable and offline-first scoped',()=>{
  const manifest=JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.short_name,'GHAZAL');
  assert.equal(manifest.start_url,'/');
  assert.equal(manifest.scope,'/');
  assert.ok(['standalone','fullscreen'].includes(manifest.display));
  assert.ok(Array.isArray(manifest.icons)&&manifest.icons.length>0);
});

test('index advertises PWA and Apple install metadata without blocking zoom',()=>{
  const html=read('index.html');
  assert.match(html,/rel="manifest" href="manifest\.webmanifest"/);
  assert.match(html,/apple-mobile-web-app-capable/);
  assert.match(html,/pwa-runtime\.js/);
  assert.doesNotMatch(html,/user-scalable=no/);
});

test('service worker is web-only, precaches educational shell and preserves API honesty offline',()=>{
  assert.equal(fs.existsSync(path.join(assets,'sw.js')),false,'network-capable service worker must never ship inside Android assets');
  const sw=readWeb('sw.js');
  for(const asset of ['/index.html','/app.js','/course-data.js','/stage5-exams-pathways.js','/stage6-profiles-classes.js','/pwa-runtime.js']){
    assert.ok(sw.includes(JSON.stringify(asset)),`missing ${asset}`);
  }
  assert.match(sw,/offlineCore:true/);
  assert.match(sw,/status:503/);
});

test('web runtime exposes platform capabilities and does not claim native offline speech outside Android',()=>{
  const runtime=read('pwa-runtime.js');
  assert.match(runtime,/nativeOfflineSpeech:android/);
  assert.match(runtime,/nativeBackgroundReminder:android/);
  assert.match(runtime,/تشخیص گفتار این دستگاه آفلاین نیست/);
  assert.match(runtime,/serviceWorker\.register/);
});

test('cross-platform files contain no placeholder markers',()=>{
  for(const text of [read('manifest.webmanifest'),read('pwa-runtime.js'),readWeb('sw.js')]){
    assert.doesNotMatch(text,/TODO|FIXME|placeholder/i,'cross-platform source contains placeholder text');
  }
});
