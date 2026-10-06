const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Stage 7 passes visible lesson target into offline Vosk grammar',()=>{
  const index=read('app/src/main/assets/index.html');
  const ui=read('app/src/main/assets/speech-accuracy-stage7.js');
  const bridge=read('app/src/main/java/com/foad/ghazaldeutsch/OfflineSpeechJsBridge.java');
  const engine=read('app/src/main/java/com/foad/ghazaldeutsch/OfflineGermanSpeechEngine.java');

  assert.ok(index.includes('<script src="speech-accuracy-stage7.js"></script>'));
  assert.ok(ui.includes('GHZ_HINT|'));
  assert.ok(ui.includes("[data-r5='speak']"));
  assert.ok(ui.includes('event.stopImmediatePropagation()'));
  assert.ok(bridge.includes('engine.start(prompt, new OfflineGermanSpeechEngine.Callback()'));
  assert.ok(engine.includes('private static final String HINT_PREFIX = "GHZ_HINT|"'));
  assert.ok(engine.includes('grammarForHint(hint)'));
  assert.ok(engine.includes('new Recognizer(readyModel, SAMPLE_RATE, grammar)'));
  assert.ok(engine.includes('grammar.put("[unk]")'));
});

test('template speaking score ignores variable slots but preserves the original feedback',()=>{
  const ui=read('app/src/main/assets/speech-accuracy-stage7.js');
  assert.ok(ui.includes('function templateAnchors(target)'));
  assert.ok(ui.includes('const matched=anchors.filter(a=>anchorMatched(text,a))'));
  assert.ok(ui.includes('withTemporaryTarget(ctx,canonicalTarget'));
  assert.ok(ui.includes('rewriteFeedback(text,ctx.target)'));
  assert.ok(ui.includes('ساختار مورد انتظار'));
});

test('lesson bias keeps the crash-safe Vosk shutdown order',()=>{
  const engine=read('app/src/main/java/com/foad/ghazaldeutsch/OfflineGermanSpeechEngine.java');
  const cancel=engine.indexOf('speechService.cancel()');
  const shutdown=engine.indexOf('speechService.shutdown()');
  const close=engine.indexOf('recognizer.close()');
  assert.ok(cancel>=0);
  assert.ok(shutdown>cancel);
  assert.ok(close>shutdown);
});
