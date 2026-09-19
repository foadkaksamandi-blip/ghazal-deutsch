package com.foad.ghazaldeutsch;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.webkit.WebView;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.json.JSONArray;
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

    private String eval(String script) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>("null");
        rule.getScenario().onActivity(activity -> {
            WebView webView = activity.webViewForTesting();
            assertNotNull(webView);
            webView.evaluateJavascript(script, value -> {
                result.set(value == null ? "null" : value);
                latch.countDown();
            });
        });
        assertTrue("evaluateJavascript timeout: " + script, latch.await(8, TimeUnit.SECONDS));
        return result.get();
    }

    private boolean evalBool(String script) throws Exception {
        return "true".equals(eval("(function(){try{return !!(" + script + ");}catch(e){return false;}})()"));
    }

    private boolean pageReady() {
        AtomicBoolean ready = new AtomicBoolean(false);
        rule.getScenario().onActivity(activity -> ready.set(activity.isPageReadyForTesting()));
        return ready.get();
    }

    private void waitForPageReady() throws Exception {
        long deadline = SystemClock.uptimeMillis() + 15000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (pageReady()) return;
            SystemClock.sleep(120L);
        }
        assertTrue("Timed out waiting for WebView onPageFinished", false);
    }

    private void waitFor(String expression, String label) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 12000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (evalBool(expression)) return;
            SystemClock.sleep(120L);
        }
        String body = eval("(document.body&&document.body.innerText?document.body.innerText.slice(0,1500):'NO_BODY')");
        String href = eval("location.href");
        assertTrue("Timed out waiting for " + label + " href=" + href + " body=" + body, false);
    }

    private float[] center(String selector) throws Exception {
        String q = selector.replace("\\", "\\\\").replace("'", "\\'");
        String value = eval("(function(){"
                + "var e=document.querySelector('" + q + "');"
                + "if(!e)return null;"
                + "var r=e.getBoundingClientRect();"
                + "var s=getComputedStyle(e);"
                + "return [r.left+r.width/2,r.top+r.height/2,window.devicePixelRatio||1,r.width,r.height,"
                + "s.display,s.visibility,s.pointerEvents];"
                + "})()");
        assertTrue("No selector or geometry for " + selector + " value=" + value, value != null && !"null".equals(value));
        JSONArray a = new JSONArray(value);
        assertTrue("Zero width for " + selector + " value=" + value, a.getDouble(3) > 2);
        assertTrue("Zero height for " + selector + " value=" + value, a.getDouble(4) > 2);
        assertTrue("display:none for " + selector, !"none".equals(a.getString(5)));
        assertTrue("visibility:hidden for " + selector, !"hidden".equals(a.getString(6)));
        assertTrue("pointer-events:none for " + selector, !"none".equals(a.getString(7)));
        return new float[]{(float)a.getDouble(0), (float)a.getDouble(1), (float)a.getDouble(2)};
    }

    private void physicalTap(String selector) throws Exception {
        String q = selector.replace("\\", "\\\\").replace("'", "\\'");
        eval("(function(){var e=document.querySelector('" + q + "');if(e)e.scrollIntoView({block:'center',inline:'center'});return !!e;})()");
        SystemClock.sleep(180L);
        float[] c = center(selector);
        final float px = c[0] * c[2];
        final float py = c[1] * c[2];
        rule.getScenario().onActivity(activity -> {
            WebView w = activity.webViewForTesting();
            long down = SystemClock.uptimeMillis();
            MotionEvent d = MotionEvent.obtain(down, down, MotionEvent.ACTION_DOWN, px, py, 0);
            MotionEvent u = MotionEvent.obtain(down, down + 80L, MotionEvent.ACTION_UP, px, py, 0);
            try {
                assertTrue("ACTION_DOWN was not accepted for " + selector, w.dispatchTouchEvent(d));
                assertTrue("ACTION_UP was not accepted for " + selector, w.dispatchTouchEvent(u));
            } finally {
                d.recycle();
                u.recycle();
            }
        });
        SystemClock.sleep(500L);
    }

    private void freshFirstRun() throws Exception {
        waitForPageReady();
        waitFor("document.readyState==='complete'", "document complete");
        eval("(function(){localStorage.clear();sessionStorage.clear();location.reload();return true;})()");
        SystemClock.sleep(400L);
        waitFor("document.readyState==='complete'", "reload complete");
        waitFor("document.documentElement.getAttribute('data-ghz-interaction-ready')==='2'", "interaction kernel");
        waitFor("!!document.querySelector('[data-action=\"skip-placement\"]')", "first-run skip button");
    }

    @Test
    public void physicalTouchesDriveWholeCriticalInteractionPath() throws Exception {
        freshFirstRun();

        // First-run entry: a real MotionEvent must enter the app.
        physicalTap("[data-action='skip-placement']");
        waitFor("JSON.parse(localStorage.getItem('ghazal_deutsch_state_v1')||'{}').onboardingDone===true", "onboarding completion");
        waitFor("document.body.innerText.indexOf('برنامه امروز')>=0", "home screen");

        // Main bottom navigation.
        physicalTap("[data-nav='path']");
        waitFor("document.body.innerText.indexOf('مسیر تسلط')>=0", "path screen");

        physicalTap("[data-nav='practice']");
        waitFor("document.body.innerText.indexOf('تمرین فعال')>=0", "practice screen");

        physicalTap("[data-nav='migration']");
        waitFor("document.body.innerText.indexOf('بسته مهاجرت')>=0", "migration screen");

        physicalTap("[data-nav='profile']");
        waitFor("document.body.innerText.indexOf('پیشرفت غزل')>=0", "profile screen");

        physicalTap("[data-nav='home']");
        waitFor("document.body.innerText.indexOf('برنامه امروز')>=0", "home return");

        // Open and close a real lesson modal.
        waitFor("!!document.querySelector('[data-action=\"open-lesson\"]')", "lesson button");
        physicalTap("[data-action='open-lesson']");
        waitFor("document.getElementById('modal') && document.getElementById('modal').hidden===false", "lesson modal open");
        waitFor("!!document.querySelector('#modal-content [data-action=\"close-modal\"]')", "lesson close button");
        physicalTap("#modal-content [data-action='close-modal']");
        waitFor("document.getElementById('modal').hidden===true", "lesson modal close");

        // Dynamic Stage 5/6 UI has its own delegated event namespace.
        physicalTap("[data-nav='practice']");
        waitFor("!!document.querySelector('[data-r12=\"hub\"]')", "Stage 5/6 hub button");
        physicalTap("[data-r12='hub']");
        waitFor("document.getElementById('modal').hidden===false", "Stage 5/6 modal open");
        waitFor("!!document.querySelector('[data-r12=\"close\"]')", "Stage 5/6 close button");
        physicalTap("[data-r12='close']");
        waitFor("document.getElementById('modal').hidden===true", "Stage 5/6 modal close");
        // A delayed Android fallback must not click through the now-closed modal
        // and re-open the hub underneath.
        SystemClock.sleep(650L);
        assertTrue("Stage 5/6 modal reopened after close (ghost-tap regression)",
                evalBool("document.getElementById('modal').hidden===true"));

        assertTrue("Interaction kernel did not remain alive",
                evalBool("window.GhazalInteractionRescue && window.GhazalInteractionRescue.diagnostics().ready===true"));
        assertTrue("No browser/rescue interactions were observed",
                evalBool("window.GhazalInteractionRescue.diagnostics().normalCount + window.GhazalInteractionRescue.diagnostics().rescueCount >= 8"));
    }
}
