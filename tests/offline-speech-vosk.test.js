const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('GHAZAL speaking uses bundled Vosk instead of Android system speech',()=>{
  const gradle=read('app/build.gradle');
  const bridge=read('app/src/main/java/com/foad/ghazaldeutsch/AndroidBridge.java');
  const jsBridge=read('app/src/main/java/com/foad/ghazaldeutsch/OfflineSpeechJsBridge.java');
  const engine=read('app/src/main/java/com/foad/ghazaldeutsch/OfflineGermanSpeechEngine.java');
  const manifest=read('app/src/main/AndroidManifest.xml');

  for(const token of [
    'com.alphacephei:vosk-android:0.3.75@aar',
    'net.java.dev.jna:jna:5.18.1@aar',
    'vosk-model-small-de-0.15',
    'prepareVoskGermanModel'
  ]) assert.ok(gradle.includes(token),token);

  assert.ok(bridge.includes('OfflineSpeechJsBridge.start(activity, prompt)'));
  assert.ok(!bridge.includes('activity.startSpeechRecognition(prompt)'));
  assert.ok(jsBridge.includes('OfflineGermanSpeechEngine'));
  assert.ok(jsBridge.includes('window.onSpeechResult'));
  assert.ok(jsBridge.includes('window.onSpeechState'));
  assert.ok(jsBridge.includes('window.onSpeechError'));

  for(const token of [
    'new Model(finalModel.getAbsolutePath())',
    'new Recognizer(readyModel, SAMPLE_RATE)',
    'new SpeechService(recognizer, SAMPLE_RATE)',
    'startListening(new RecognitionListener()',
    'LISTEN_TIMEOUT_MS = 9000',
    'copyAssetTree(context.getAssets(), MODEL_ASSET, finalModel)'
  ]) assert.ok(engine.includes(token),token);

  assert.ok(manifest.includes('android.permission.RECORD_AUDIO'));
  assert.ok(!manifest.includes('android.speech.action.RECOGNIZE_SPEECH'));
  assert.ok(!manifest.includes('android.speech.RecognitionService'));
  assert.ok(!manifest.includes('android.permission.INTERNET'));
});

test('Vosk session cancels recorder thread before native recognizer teardown',()=>{
  const engine=read('app/src/main/java/com/foad/ghazaldeutsch/OfflineGermanSpeechEngine.java');
  const cancel=engine.indexOf('speechService.cancel()');
  const shutdown=engine.indexOf('speechService.shutdown()');
  const close=engine.indexOf('recognizer.close()');
  assert.ok(cancel>=0,'speechService.cancel() missing');
  assert.ok(shutdown>cancel,'SpeechService must be cancelled before recorder release');
  assert.ok(close>shutdown,'Recognizer must close only after SpeechService is stopped and released');
});

test('Vosk keeps listening across sentence pauses and scores the complete utterance',()=>{
  const engine=read('app/src/main/java/com/foad/ghazaldeutsch/OfflineGermanSpeechEngine.java');
  assert.ok(engine.includes('final StringBuilder transcript = new StringBuilder()'));
  assert.ok(engine.includes('appendSegment(text)'));
  assert.ok(engine.includes('شنیدم تا اینجا'));
  const onResultStart=engine.indexOf('@Override public void onResult(String hypothesis)');
  const onFinalStart=engine.indexOf('@Override public void onFinalResult(String hypothesis)');
  const onResultBlock=engine.slice(onResultStart,onFinalStart);
  assert.ok(!onResultBlock.includes('finishWithResult('),'intermediate silence must not finish the speech session');
  assert.ok(engine.includes('String complete = combined(lastPartial[0])'));
});

test('offline German model is structurally validated before packaging',()=>{
  const gradle=read('app/build.gradle');
  assert.ok(gradle.includes('am/final.mdl'));
  assert.ok(gradle.includes('conf/mfcc.conf'));
  assert.ok(gradle.includes('VOSK_MODEL_SHA256='));
  assert.ok(gradle.includes('https://alphacephei.com/vosk/models/'));
});
