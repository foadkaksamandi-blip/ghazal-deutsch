package com.foad.ghazaldeutsch;

import static org.junit.Assert.assertTrue;

import android.app.Instrumentation;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.webkit.WebView;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import org.json.JSONArray;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@RunWith(AndroidJUnit4.class)
public class InteractionInstrumentedTest {
    @Rule
    public ActivityScenarioRule<MainActivity> rule = new ActivityScenarioRule<>(MainActivity.class);

    private boolean pageReady() {
        AtomicBoolean ready = new AtomicBoolean(false);
        rule.getScenario().onActivity(activity -> ready.set(activity.isPageReadyForTesting()));
        return ready.get();
    }

    private String webViewState() {
        AtomicReference<String> state = new AtomicReference<>("{}");
        rule.getScenario().onActivity(activity -> state.set(activity.getWebViewTestState()));
        return state.get();
    }

    private void waitForPageReady() {
        long deadline = SystemClock.uptimeMillis() + 15000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (pageReady()) return;
            SystemClock.sleep(100L);
        }
        assertTrue("Timed out waiting for WebView page completion state=" + webViewState(), false);
    }

    private String eval(String script) throws Exception {
        waitForPageReady();
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>("null");
        rule.getScenario().onActivity(activity -> {
            WebView w = activity.webViewForTesting();
            w.post(() -> w.evaluateJavascript(script, value -> {
                result.set(value == null ? "null" : value);
                latch.countDown();
            }));
        });
        assertTrue("evaluateJavascript timeout: " + script, latch.await(8, TimeUnit.SECONDS));
        return result.get();
    }

    private boolean evalBool(String script) throws Exception {
        return "true".equals(eval(script));
    }

    private void waitFor(String expression) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 10000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (evalBool("(function(){try{return !!(" + expression + ");}catch(e){return false;}})()")) return;
            SystemClock.sleep(120L);
        }
        assertTrue("Timed out waiting for: " + expression, false);
    }

    private float[] rect(String selector) throws Exception {
        String q = selector.replace("\\", "\\\\").replace("'", "\\'");
        String value = eval("(function(){var e=document.querySelector('" + q + "');"
                + "if(!e)return null;var r=e.getBoundingClientRect();"
                + "return [r.left+r.width/2,r.top+r.height/2,window.devicePixelRatio||1,r.width,r.height];})()");
        assertTrue("Missing control: " + selector + " -> " + value, !"null".equals(value));
        JSONArray a = new JSONArray(value);
        assertTrue("Zero width control: " + selector, a.getDouble(3) > 2);
        assertTrue("Zero height control: " + selector, a.getDouble(4) > 2);
        return new float[]{(float)a.getDouble(0),(float)a.getDouble(1),(float)a.getDouble(2)};
    }

    private void systemTap(String selector) throws Exception {
        float[] r = rect(selector);
        AtomicReference<float[]> screen = new AtomicReference<>(new float[]{0f,0f});
        rule.getScenario().onActivity(activity -> {
            int[] loc = new int[]{0,0};
            activity.webViewForTesting().getLocationOnScreen(loc);
            screen.set(new float[]{loc[0] + r[0] * r[2], loc[1] + r[1] * r[2]});
        });
        float[] p = screen.get();
        Instrumentation ins = InstrumentationRegistry.getInstrumentation();
        long downTime = SystemClock.uptimeMillis();
        MotionEvent down = MotionEvent.obtain(downTime,downTime,MotionEvent.ACTION_DOWN,p[0],p[1],0);
        MotionEvent up = MotionEvent.obtain(downTime,downTime+80L,MotionEvent.ACTION_UP,p[0],p[1],0);
        try {
            ins.sendPointerSync(down);
            ins.sendPointerSync(up);
        } finally {
            down.recycle();
            up.recycle();
        }
        SystemClock.sleep(420L);
    }

    @Before
    public void freshState() throws Exception {
        waitForPageReady();
        rule.getScenario().onActivity(MainActivity::resetWebAppForTesting);
        waitForPageReady();
        waitFor("document.documentElement.getAttribute('data-ghz-interaction-ready')==='2'");
        waitFor("document.querySelector('[data-action=\"skip-placement\"]')");
    }

    @Test
    public void physicalSystemTouchesDriveWholeCriticalInteractionPath() throws Exception {
        systemTap("[data-action='skip-placement']");
        waitFor("JSON.parse(localStorage.getItem('ghazal_deutsch_state_v1')||'{}').onboardingDone===true");
        waitFor("document.body.innerText.indexOf('برنامه امروز')>=0");

        systemTap("[data-nav='path']");
        waitFor("document.body.innerText.indexOf('مسیر تسلط')>=0");
        waitFor("document.querySelector('[data-action=\"select-level\"]')");

        systemTap("[data-nav='practice']");
        waitFor("document.body.innerText.indexOf('تمرین فعال')>=0");
        waitFor("document.querySelector('[data-action=\"start-listening\"]')");

        systemTap("[data-nav='migration']");
        waitFor("document.body.innerText.indexOf('بسته مهاجرت')>=0");
        waitFor("document.querySelector('[data-action=\"open-pack\"]')");

        systemTap("[data-nav='profile']");
        waitFor("document.body.innerText.indexOf('پیشرفت غزل')>=0");
        waitFor("document.querySelector('[data-action=\"export-backup\"]')");

        systemTap("[data-nav='home']");
        waitFor("document.body.innerText.indexOf('برنامه امروز')>=0");

        systemTap("[data-action='open-lesson']");
        waitFor("document.getElementById('modal').hidden===false");
        waitFor("document.querySelector('#modal-content [data-action=\"close-modal\"]')");
        systemTap("#modal-content [data-action='close-modal']");
        waitFor("document.getElementById('modal').hidden===true");

        systemTap("[data-nav='practice']");
        waitFor("document.querySelector('[data-r12=\"hub\"]')");
        systemTap("[data-r12='hub']");
        waitFor("document.getElementById('modal').hidden===false");
        waitFor("document.querySelector('[data-r12=\"close\"]')");
        systemTap("[data-r12='close']");
        waitFor("document.getElementById('modal').hidden===true");

        assertTrue(evalBool("window.GhazalInteractionRescue && window.GhazalInteractionRescue.diagnostics().ready===true"));
        assertTrue(evalBool("window.GhazalInteractionRescue.diagnostics().normalCount + window.GhazalInteractionRescue.diagnostics().rescueCount >= 8"));
    }
}
