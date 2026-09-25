package com.foad.ghazaldeutsch;

import static org.junit.Assert.assertTrue;

import android.os.SystemClock;
import android.webkit.WebView;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.platform.app.InstrumentationRegistry;

import org.junit.Assume;
import org.junit.Rule;
import org.junit.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

public class UpgradeInstrumentedTest {
    @Rule
    public ActivityScenarioRule<MainActivity> rule = new ActivityScenarioRule<>(MainActivity.class);

    private String mode() {
        String value = InstrumentationRegistry.getArguments().getString("upgradeMode");
        return value == null ? "" : value;
    }

    private String eval(String script) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>("null");
        rule.getScenario().onActivity(activity -> {
            WebView webView = activity.webViewForTesting();
            webView.evaluateJavascript(script, value -> {
                result.set(value == null ? "null" : value);
                latch.countDown();
            });
        });
        assertTrue("evaluateJavascript timeout", latch.await(8, TimeUnit.SECONDS));
        return result.get();
    }

    private boolean evalBool(String expression) throws Exception {
        return "true".equals(eval("(function(){try{return !!(" + expression + ");}catch(e){return false;}})()"));
    }

    private void ready() throws Exception {
        long deadline = SystemClock.uptimeMillis() + 15000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (evalBool("document.readyState==='complete' && !!document.body")) return;
            SystemClock.sleep(120L);
        }
        assertTrue("WebView did not become ready", false);
    }

    @Test
    public void seedUpgradeState() throws Exception {
        Assume.assumeTrue("seed".equals(mode()));
        ready();
        eval("(function(){localStorage.setItem('ghazal_upgrade_sentinel','KEEP-ME');localStorage.setItem('ghazal_upgrade_progress','42');return true;})()");
        assertTrue("upgrade seed was not persisted",
                evalBool("localStorage.getItem('ghazal_upgrade_sentinel')==='KEEP-ME' && localStorage.getItem('ghazal_upgrade_progress')==='42'"));
    }

    @Test
    public void verifyUpgradePreservesDataAndLoadsFreshAssets() throws Exception {
        Assume.assumeTrue("verify".equals(mode()));
        ready();
        assertTrue("localStorage was lost during in-place APK update",
                evalBool("localStorage.getItem('ghazal_upgrade_sentinel')==='KEEP-ME' && localStorage.getItem('ghazal_upgrade_progress')==='42'"));
        assertTrue("new bundled asset runtime was not loaded after update",
                evalBool("window.GhazalUpgradeRuntime && window.GhazalUpgradeRuntime.SCHEMA===1 && document.documentElement.getAttribute('data-ghz-upgrade-schema')==='1'"));
        assertTrue("updated Stage 4 runtime is missing after in-place update",
                evalBool("window.GhazalStage4Tutor && window.GhazalStage4Tutor.VERSION==='4.0.0'"));
        assertTrue("Stage 3 content regressed during in-place update",
                evalBool("['A1','A2','B1','B2','C1','C2'].every(function(l){return window.GhazalData.lessons.filter(function(x){return x.level===l;}).length>=40;})"));
        assertTrue("WebView did not load a versioned APK asset URL",
                evalBool("location.href.indexOf('file:///android_asset/index.html?v=')===0"));
    }
}
