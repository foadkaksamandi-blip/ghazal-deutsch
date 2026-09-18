const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');

global.crypto=webcrypto;

class FakeStorage{
  constructor(init={}){this.map=new Map(Object.entries(init));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
  clear(){this.map.clear();}
}

function load(){
  const p1=require.resolve('../app/src/main/assets/release12-product-core.js');
  const p2=require.resolve('../app/src/main/assets/release12-security-core.js');
  delete require.cache[p1];delete require.cache[p2];
  global.window={
    GhazalContentSystem:{index:[{id:'x'}]},
    GhazalDictionary:{all:[{lemma:'Haus'}]},
    GhazalPlatformCore:{},
    GhazalLearningEngine:{},
    GhazalClassroomCore:{}
  };
  const product=require(p1);window.GhazalProductCore=product;
  const security=require(p2);
  delete global.window;
  return{product,security};
}

test('Stage 5 professional product core exposes locked product capabilities',()=>{
  const {product}=load();
  assert.ok(Number(product.PRODUCT_VERSION.split('.')[0])>=12);
  assert.equal(product.PRODUCT_SCHEMA,4);
  assert.equal(product.BACKUP_SCHEMA,2);
  assert.equal(product.BUILTIN_PACKS.length,8);
  const a=product.architecture();
  assert.equal(a.offlineFirst,true);
  assert.equal(a.market,'IR');
  assert.equal(a.clients.android.status,'active');
  assert.equal(a.clients.web.status,'contract-ready');
  assert.equal(a.clients.ios.status,'contract-ready');
  for(const k of ['auth','users','progress','content','classroom','ai','analytics','entitlement','notification'])assert.ok(a.api[k],k);
});

test('Stage 5 content packs are data-only versioned and downgrade-protected',()=>{
  const {product}=load();
  const lesson={id:'pack.a1.001',level:'A1',title:'Pack lesson',goal:'تمرین',words:[['Haus','خانه','Das Haus ist groß.'],['gehen','رفتن','Ich gehe.'],['gut','خوب','Das ist gut.']],quiz:{q:'Haus?',options:['خانه','ماشین'],answer:0}};
  const pack={format:'ghazal-content-pack-v2',id:'sample-pack',version:'1.2.0',minAppVersion:'10.0.0',title:'Sample',lessons:[lesson]};
  const v=product.validatePack(pack,product.PRODUCT_VERSION);
  assert.equal(v.valid,true,JSON.stringify(v));
  let s=product.defaults();
  s=product.installPack(s,pack,product.PRODUCT_VERSION);
  assert.equal(s.importedPacks.length,1);
  assert.equal(s.importedPacks[0].trust,'local-untrusted');
  assert.throws(()=>product.installPack(s,{...pack,version:'1.1.0'},product.PRODUCT_VERSION),/downgrade_blocked/);
  assert.equal(product.validatePack({...pack,javascript:'alert(1)'},product.PRODUCT_VERSION).valid,false);
  assert.equal(product.validatePack({...pack,minAppVersion:'99.0.0'},product.PRODUCT_VERSION).valid,false);
});

test('Stage 5 full backup collects only GHAZAL state and verifies SHA-256 before restore',async()=>{
  const {product}=load();
  const source=new FakeStorage({
    ghazal_deutsch_state_v1:JSON.stringify({profile:{name:'Ghazal'}}),
    ghazal_platform_v1:JSON.stringify({profiles:[]}),
    other_app:'do-not-export'
  });
  const payload=await product.buildBackup(source,{purpose:'test'});
  assert.equal(payload.format,'ghazal-full-backup-v2');
  assert.ok(payload.integrity.digest.match(/^[a-f0-9]{64}$/));
  assert.deepEqual(Object.keys(payload.data).sort(),['ghazal_deutsch_state_v1','ghazal_platform_v1']);
  assert.equal((await product.verifyBackup(payload)).valid,true);
  const tampered=JSON.parse(JSON.stringify(payload));tampered.data.ghazal_platform_v1='{}x';
  assert.equal((await product.verifyBackup(tampered)).valid,false);
  const target=new FakeStorage();
  const restored=await product.restoreBackup(target,payload);
  assert.equal(restored.restored,2);
  assert.equal(target.getItem('ghazal_deutsch_state_v1'),source.getItem('ghazal_deutsch_state_v1'));
});

test('Stage 5 resume, accessibility state and report model survive normalization',()=>{
  const {product}=load();
  let s=product.defaults();
  s.accessibility={...s.accessibility,fontScale:1.25,highContrast:true,reducedMotion:true,largeTargets:true};
  s=product.setResume(s,{route:'stage5',action:'dictionary',id:'internal',step:3,level:'B2'});
  const n=product.normalize(s);
  assert.equal(n.resume.step,3);
  assert.equal(n.resume.level,'B2');
  assert.equal(n.accessibility.highContrast,true);
  const storage=new FakeStorage({ghazal_product_v12:JSON.stringify(n),ghazal_deutsch_state_v1:JSON.stringify({profile:{name:'Ghazal',level:'B2'},progress:{completedLessons:['x'],xp:20,streak:2}})});
  const report=product.buildReport(storage);
  assert.equal(report.profile.name,'Ghazal');
  assert.equal(report.profile.level,'B2');
  assert.equal(report.progress.completedLessons,1);
});

test('Stage 6 local secret audit and release gate fail closed',()=>{
  const {security}=load();
  let storage=new FakeStorage({ghazal_ok:JSON.stringify({theme:'dark'})});
  assert.equal(security.localSecretAudit(storage).pass,true);
  storage=new FakeStorage({ghazal_bad:JSON.stringify({apiKey:'should-not-be-here'})});
  const scan=security.localSecretAudit(storage);
  assert.equal(scan.pass,false);
  assert.ok(scan.findings.some(x=>x.path.includes('apiKey')));
});

test('Stage 6 Android source implements runtime integrity crypto hook and signing checks',()=>{
  const root=path.join(__dirname,'..');
  const main=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'),'utf8');
  const bridge=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java'),'utf8');
  for(const token of ['verifyBundledAssets','runCryptoSelfTest','isRuntimeHookRisk','signingCertificateSha256','isProductionSigned','getSecurityReport','310_000','PBKDF2WithHmacSHA256','AES/GCM/NoPadding'])assert.ok(main.includes(token),token);
  for(const token of ['verifyBundledAssets','runCryptoSelfTest','getSecurityReport','clearSecureSnapshot','setTextZoom'])assert.ok(bridge.includes(token),token);
  assert.ok(main.includes('version != 1 && version != 2'));
  assert.ok(main.includes('return "12.0.0"'));
  assert.ok(bridge.includes('return activity == null ? "12.0.0"'));
});

test('Stage 6 manifest and WebView hardening block backup cleartext and external networking',()=>{
  const root=path.join(__dirname,'..');
  const manifest=fs.readFileSync(path.join(root,'app/src/main/AndroidManifest.xml'),'utf8');
  const main=fs.readFileSync(path.join(root,'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'),'utf8');
  const net=fs.readFileSync(path.join(root,'app/src/main/res/xml/network_security_config.xml'),'utf8');
  const extraction=fs.readFileSync(path.join(root,'app/src/main/res/xml/data_extraction_rules.xml'),'utf8');
  assert.ok(manifest.includes('android:allowBackup="false"'));
  assert.ok(manifest.includes('android:dataExtractionRules="@xml/data_extraction_rules"'));
  assert.ok(manifest.includes('android:networkSecurityConfig="@xml/network_security_config"'));
  assert.ok(manifest.includes('android:allowAudioPlaybackCapture="false"'));
  assert.ok(!manifest.includes('android.permission.INTERNET'));
  assert.ok(net.includes('cleartextTrafficPermitted="false"'));
  assert.ok(extraction.includes('<exclude domain="sharedpref" path="." />'));
  for(const token of ['setWebContentsDebuggingEnabled(false)','setJavaScriptCanOpenWindowsAutomatically(false)','setGeolocationEnabled(false)','setDatabaseEnabled(false)','setAllowUniversalAccessFromFileURLs(false)','setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW)'])assert.ok(main.includes(token),token);
  assert.ok(main.includes('shouldInterceptRequest'));
});

test('Stage 6 Gradle provides hardened QA and secret-backed production signing gate',()=>{
  const root=path.join(__dirname,'..');
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  assert.ok(gradle.includes('versionCode 12'));
  assert.ok(gradle.includes('versionName "12.0.0"'));
  assert.ok(gradle.includes('hardenedQa'));
  assert.ok(gradle.includes('debuggable false'));
  assert.ok(gradle.includes('minifyEnabled true'));
  assert.ok(gradle.includes('shrinkResources true'));
  assert.ok(gradle.includes('GHZ_STORE_FILE'));
  assert.ok(gradle.includes('GHZ_EXPECTED_CERT_SHA256'));
  assert.ok(gradle.includes('PRODUCTION_SIGNING_ENABLED'));
  const proguard=fs.readFileSync(path.join(root,'app/proguard-rules.pro'),'utf8');
  assert.ok(proguard.includes('repackageclasses'));
  assert.ok(proguard.includes('@android.webkit.JavascriptInterface'));
});

test('Stage 5 and 6 assets load in the correct order and version matches package',()=>{
  const root=path.join(__dirname,'..');
  const index=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  for(const asset of ['release12-pack-loader.js','release12-product-core.js','release12-security-core.js','release12-stage56-ui.js','release12-stage56.css'])assert.ok(index.includes(asset),asset);
  assert.ok(index.indexOf('release12-pack-loader.js')<index.indexOf('release10-exercise-engine.js'));
  assert.ok(index.indexOf('release12-product-core.js')<index.indexOf('release12-stage56-ui.js'));
  assert.ok(Number(pkg.version.split('.')[0])>=12);
  assert.ok(gradle.includes('versionName "'+pkg.version+'"'));
});

test('CI generates integrity manifest scans secrets and builds a non-debuggable hardened APK',()=>{
  const root=path.join(__dirname,'..');
  const wf=fs.readFileSync(path.join(root,'.github/workflows/android.yml'),'utf8');
  for(const token of ['Generate bundled asset integrity manifest','Scan client source for embedded secrets','assembleHardenedQa','apksigner verify','application-debuggable'])assert.ok(wf.includes(token),token);
});

test('production release workflow requires external signing secrets and verifies cert identity',()=>{
  const root=path.join(__dirname,'..');
  const wf=fs.readFileSync(path.join(root,'.github/workflows/release-android.yml'),'utf8');
  for(const token of ['GHZ_KEYSTORE_B64','GHZ_STORE_PASSWORD','GHZ_KEY_ALIAS','GHZ_KEY_PASSWORD','GHZ_CERT_SHA256','assembleRelease','bundleRelease','apksigner verify','GHZ_EXPECTED_CERT_SHA256'])assert.ok(wf.includes(token),token);
  assert.ok(!wf.includes('BEGIN PRIVATE KEY'));
});
