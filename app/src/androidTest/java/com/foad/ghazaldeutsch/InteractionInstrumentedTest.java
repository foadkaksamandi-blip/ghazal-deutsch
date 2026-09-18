package com.foad.ghazaldeutsch;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.webkit.WebView;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.json.JSONArray;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

@RunWith(AndroidJUnit4.class)
public class InteractionInstrumentedTest {
    @Rule
    public ActivityScenarioRule<MainActivity> rule = new ActivityScenarioRule<>(MainActivity.class);

    private String eval(String script) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>("null");
        rule.getScenario().onActivity(activity ->
                activity.webViewForTesting().evaluateJavascript(script, value -> {
                    result.set(value == null ? "null" : value);
                    latch.countDown();
                })
        );
        assertTrue("evaluateJavascript timeout: " + script, latch.await(6, TimeUnit.SECONDS));
        return result.get();
    }

    private boolean evalBool(String script) throws Exception {
        return "true".equals(eval(script));
    }

    private void waitFor(String expression) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 7000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (evalBool("(function(){try{return !!(" + expression + ");}catch(e){return false;}})()")) return;
            SystemClock.sleep(120L);
        }
        assertTrue("Timed out waiting for: " + expression, false);
    }

    private float[] center(String selector) throws Exception {
        String escaped = selector.replace("\\", "\\\\").replace("'", "\\'");
        String value = eval("(function(){var e=document.querySelector('" + escaped + "');"
                + "if(!e)return null;var r=e.getBoundingClientRect();"
                + "return [r.left+r.width/2,r.top+r.height/2,window.devicePixelRatio||1,r.width,r.height];})()");
        JSONArray a = new JSONArray(value);
        assertTrue("Element has zero width: " + selector, a.getDouble(3) > 2);
        assertTrue("Element has zero height: " + selector, a.getDouble(4) > 2);
        return new float[]{(float)a.getDouble(0), (float)a.getDouble(1), (float)a.getDouble(2)};
    }

    private void physicalTap(String selector) throws Exception {
        float[] c = center(selector);
        final float px = c[0] * c[2];
        final float py = c[1] * c[2];
        rule.getScenario().onActivity(activity -> {
            WebView w = activity.webViewForTesting();
            long down = SystemClock.uptimeMillis();
            MotionEvent d = MotionEvent.obtain(down, down, MotionEvent.ACTION_DOWN, px, py, 0);
            MotionEvent u = MotionEvent.obtain(down, down + 70L, MotionEvent.ACTION_UP, px, py, 0);
            try {
                w.dispatchTouchEvent(d);
                w.dispatchTouchEvent(u);
            } finally {
                d.recycle();
                u.recycle();
            }
        });
        SystemClock.sleep(500L);
    }

    @Before
    public void resetAppState() throws Exception {
        waitFor("document.readyState==='complete'");
        eval("(function(){localStorage.clear();location.reload();return true;})()");
        waitFor("document.documentElement.getAttribute('data-ghz-interaction-ready')==='2'");
        waitFor("document.querySelector('[data-action=\"skip-placement\"]')");
    }

    @Test
    public void physicalTouchesDriveTheRealAppAcrossCoreRoutesAndModal() throws Exception {
        // First-run entry is a physical WebView touch, not a programmatic JS click.
        physicalTap("[data-action='skip-placement']");
        waitFor("JSON.parse(localStorage.getItem('ghazal_deutsch_state_v1')||'{}').onboardingDone===true");
        waitFor("document.body.innerText.indexOf('برنامه امروز')>=0");

        // Main bottom navigation.
        physicalTap("[data-nav='path']");
        waitFor("document.body.innerText.indexOf('مسیر تسلط')>=0");

        physicalTap("[data-nav='practice']");
        waitFor("document.body.innerText.indexOf('تمرین فعال')>=0");

        physicalTap("[data-nav='migration']");
        waitFor("document.body.innerText.indexOf('بسته مهاجرت')>=0");

        physicalTap("[data-nav='profile']");
        waitFor("document.body.innerText.indexOf('پیشرفت غزل')>=0");

        physicalTap("[data-nav='home']");
        waitFor("document.body.innerText.indexOf('برنامه امروز')>=0");

        // Open and close a real lesson modal by touch.
        physicalTap("[data-action='open-lesson']");
        waitFor("document.getElementById('modal') && document.getElementById('modal').hidden===false");
        waitFor("document.querySelector('#modal-content [data-action=\"close-modal\"]')");
        physicalTap("#modal-content [data-action='close-modal']");
        waitFor("document.getElementById('modal').hidden===true");

        // Ensure the global rescue/interaction kernel actually observed activity.
        assertTrue(evalBool("window.GhazalInteractionRescue && window.GhazalInteractionRescue.diagnostics().ready===true"));
        assertTrue(evalBool("window.GhazalInteractionRescue.diagnostics().normalCount + window.GhazalInteractionRescue.diagnostics().rescueCount > 0"));
    }

    @Test
    public void extensionButtonsRemainInteractiveAfterDynamicInjection() throws Exception {
        physicalTap("[data-action='skip-placement']");
        waitFor("document.body.innerText.indexOf('برنامه امروز')>=0");
        physicalTap("[data-nav='practice']");
        waitFor("document.body.innerText.indexOf('تمرین فعال')>=0");

        waitFor("document.querySelector('[data-r12=\"hub\"]')");
        physicalTap("[data-r12='hub']");
        waitFor("document.getElementById('modal').hidden===false");
        waitFor("document.body.innerText.indexOf('Professional Product')>=0 || document.body.innerText.indexOf('Stage 5 + 6')>=0");

        waitFor("document.querySelector('[data-r12=\"close\"]')");
        physicalTap("[data-r12='close']");
        waitFor("document.getElementById('modal').hidden===true");
    }
}
