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

test('template speaking score requires contiguous anchors in the expected order',()=>{
  const ui=read('app/src/main/assets/speech-accuracy-stage7.js');
  assert.ok(ui.includes('function findContiguous(words,needle,from)'));
  assert.ok(ui.includes('function matchedAnchorsInOrder(heard,anchors)'));
  assert.ok(ui.includes('const matched=matchedAnchorsInOrder(text,anchors)'));
  assert.ok(!ui.includes('const hw=new Set'));
  assert.ok(!ui.includes('anchors.filter(a=>anchorMatched(text,a))'));
  assert.ok(ui.includes('withTemporaryTarget(ctx,canonicalTarget'));
  assert.ok(ui.includes('rewriteFeedback(text,ctx.target)'));
  assert.ok(ui.includes('ساختار مورد انتظار'));
});

test('known false-positive transcript can no longer satisfy both lesson anchors',()=>{
  const normalize=value=>String(value==null?'':value)
    .toLocaleLowerCase('de-DE')
    .replace(/ß/g,'ss')
    .replace(/\[unk\]/g,' unk ')
    .replace(/[.,!?;:„“\"'()]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
  const speechTokens=value=>normalize(value).split(' ').filter(word=>word&&word!=='unk');
  const findContiguous=(words,needle,from)=>{
    if(!needle.length||words.length<needle.length)return null;
    for(let start=Math.max(0,from||0);start<=words.length-needle.length;start++){
      let ok=true;
      for(let i=0;i<needle.length;i++)if(words[start+i]!==needle[i]){ok=false;break;}
      if(ok)return{start,end:start+needle.length};
    }
    return null;
  };
  const matchedAnchorsInOrder=(heard,anchors)=>{
    const words=speechTokens(heard);
    const matched=[];
    let cursor=0;
    anchors.forEach(anchor=>{
      const hit=findContiguous(words,speechTokens(anchor),cursor);
      if(!hit)return;
      matched.push(anchor);
      cursor=hit.end;
    });
    return matched;
  };

  const anchors=['ich heiße','ich komme aus'];
  assert.deepEqual(matchedAnchorsInOrder('aus heiße ich komme aus',anchors),['ich komme aus']);
  assert.deepEqual(matchedAnchorsInOrder('ich heiße ghazal ich komme aus iran',anchors),anchors);
  assert.deepEqual(matchedAnchorsInOrder('ich komme aus iran ich heiße ghazal',anchors),['ich heiße']);
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
