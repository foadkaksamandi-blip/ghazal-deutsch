const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app/src/main/assets');
const read=p=>fs.readFileSync(path.join(ASSETS,p),'utf8');

function values(text,attr){
  const rx=new RegExp(attr+'=["\\\']([^"\\\']+)["\\\']','g');
  const out=new Set();
  let m; while((m=rx.exec(text))) { if(!m[1].includes("${")) out.add(m[1]); }
  return [...out];
}
function handled(text,name){
  const q=name.replace(/[^a-zA-Z0-9_-]/g,'\\$&');
  return new RegExp('(?:===|==)\\s*["\\\']'+q+'["\\\']').test(text)
    || new RegExp('["\\\']'+q+'["\\\']\\s*:\\s*').test(text)
    || text.includes('includes("'+name+'")')
    || text.includes("includes('"+name+"')");
}

test('every literal base data-action has an implementation path',()=>{
  const app=read('app.js');
  const index=read('index.html');
  const actions=new Set([...values(app,'data-action'),...values(index,'data-action')]);
  const missing=[...actions].filter(a=>!handled(app,a));
  assert.deepEqual(missing,[],`Unhandled base actions: ${missing.join(', ')}`);
});

test('all bottom navigation destinations are renderable',()=>{
  const app=read('app.js'),index=read('index.html');
  const nav=values(index,'data-nav');
  assert.deepEqual(nav.sort(),['home','migration','path','practice','profile'].sort());
  for(const n of ['path','practice','migration','profile']){
    assert.ok(app.includes('currentView === "'+n+'"'),n);
  }
});

test('each release UI literal control is handled by its own dispatcher',()=>{
  const files=[
    ['release3-extension.js','data-r3'],
    ['release4-extension.js','data-r4'],
    ['release5-extension.js','data-r5'],
    ['release6-platform.js','data-r6'],
    ['release7-library-ui.js','data-r7'],
    ['release8-content-depth-ui.js','data-r8'],
    ['release9-specialization-ui.js','data-r9'],
    ['release10-stage2-ui.js','data-r10'],
    ['release11-stage34-ui.js','data-r11'],
    ['release12-stage56-ui.js','data-r12'],
    ['release13-stage7-ui.js','data-r13'],
    ['release14-final-ui.js','data-r14']
  ];
  const failures=[];
  for(const [file,attr] of files){
    const text=read(file),controls=values(text,attr);
    for(const control of controls){
      if(!handled(text,control))failures.push(file+':'+control);
    }
  }
  assert.deepEqual(failures,[],`Unhandled release controls: ${failures.join(', ')}`);
});

test('interaction kernel covers every control namespace and loads before app routing',()=>{
  const rescue=read('interaction-rescue.js'),index=read('index.html');
  for(const token of ['[data-action]','[data-nav]','[data-os-action]','[data-r3]','[data-r4]','[data-r5]','[data-r6]','[data-r7]','[data-r8]','[data-r9]','[data-r10]','[data-r11]','[data-r12]','[data-r13]','[data-r14]']){
    assert.ok(rescue.includes(token),token);
  }
  assert.ok(rescue.includes('VERSION:"2.0.0"'));
  assert.ok(rescue.includes('candidateFromCachedMap'));
  assert.ok(rescue.includes('candidateFromPoint'));
  assert.ok(index.indexOf('interaction-rescue.js')<index.indexOf('app.js'));
});

test('modal and first-run layers cannot silently cover all app controls',()=>{
  const css=read('styles.css');
  assert.match(css,/\.modal\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(css,/\.modal-backdrop\s*\{[\s\S]*pointer-events:\s*none\s*!important/);
  assert.match(css,/\.modal-sheet\s*\{[\s\S]*pointer-events:\s*auto\s*!important/);
  assert.match(css,/\.onboarding-page\s*\{[\s\S]*pointer-events:\s*auto\s*!important/);
});

test('Android native touch rescue is installed and delegates failed taps into the JS kernel',()=>{
  const main=fs.readFileSync(path.join(ROOT,'app/src/main/java/com/foad/ghazaldeutsch/MainActivity.java'),'utf8');
  const bridge=fs.readFileSync(path.join(ROOT,'app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java'),'utf8');
  for(const token of ['installNativeTouchRescue','MotionEvent.ACTION_DOWN','MotionEvent.ACTION_UP','GhazalInteractionRescue.nativeTap','setFilterTouchesWhenObscured(false)'])assert.ok(main.includes(token),token);
  for(const token of ['recordUiInteraction','publishInteractionMap','getInteractionQaState'])assert.ok(bridge.includes(token),token);
});

test('physical-touch instrumentation covers onboarding navigation lesson modal and dynamic Stage 5/6 UI',()=>{
  const testFile=fs.readFileSync(path.join(ROOT,'app/src/androidTest/java/com/foad/ghazaldeutsch/InteractionInstrumentedTest.java'),'utf8');
  for(const token of ['dispatchTouchEvent','skip-placement',"data-nav='path'","data-nav='practice'","data-nav='migration'","data-nav='profile'","data-action='open-lesson'","data-r12='hub'"])assert.ok(testFile.includes(token),token);
});
