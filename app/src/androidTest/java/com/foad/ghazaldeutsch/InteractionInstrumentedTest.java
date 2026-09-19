package com.foad.ghazaldeutsch;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.webkit.WebView;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.atomic.AtomicReference;

@RunWith(AndroidJUnit4.class)
public class InteractionInstrumentedTest {
    @Rule
    public ActivityScenarioRule<MainActivity> rule = new ActivityScenarioRule<>(MainActivity.class);

    private JSONObject snapshot() throws Exception {
        AtomicReference<String> ref = new AtomicReference<>("{}");
        rule.getScenario().onActivity(activity -> ref.set(activity.getInteractionQaState()));
        return new JSONObject(ref.get());
    }

    private JSONObject uiMap() throws Exception {
        JSONObject state = snapshot();
        String raw = state.optString("uiMap", "{}");
        return new JSONObject(raw.isEmpty() ? "{}" : raw);
    }

    private JSONArray rows() throws Exception {
        return uiMap().optJSONArray("map") == null ? new JSONArray() : uiMap().getJSONArray("map");
    }

    private JSONObject findVisible(String descriptor) throws Exception {
        JSONArray rows = rows();
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.getJSONObject(i);
            if (descriptor.equals(row.optString("id")) && row.optBoolean("visible", true)) return row;
        }
        return null;
    }

    private int countVisible(String descriptor) throws Exception {
        int count = 0;
        JSONArray rows = rows();
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.getJSONObject(i);
            if (descriptor.equals(row.optString("id")) && row.optBoolean("visible", true)) count++;
        }
        return count;
    }

    private void waitForDescriptor(String descriptor) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 9000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (findVisible(descriptor) != null) return;
            SystemClock.sleep(120L);
        }
        assertNotNull("Timed out waiting for visible control " + descriptor + " map=" + uiMap(), findVisible(descriptor));
    }

    private void waitForCount(String descriptor, int minimum) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 9000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (countVisible(descriptor) >= minimum) return;
            SystemClock.sleep(120L);
        }
        assertTrue("Timed out waiting for " + minimum + " controls " + descriptor + " map=" + uiMap(), countVisible(descriptor) >= minimum);
    }

    private void waitForRecorded(String descriptor) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 5000L;
        while (SystemClock.uptimeMillis() < deadline) {
            String last = snapshot().optString("lastAction", "");
            if (last.startsWith(descriptor + "|")) return;
            SystemClock.sleep(100L);
        }
        assertTrue("Interaction was not recorded for " + descriptor + " state=" + snapshot(), false);
    }

    private void physicalTap(String descriptor) throws Exception {
        waitForDescriptor(descriptor);
        JSONObject map = uiMap();
        JSONArray rows = map.getJSONArray("map");
        JSONObject hit = null;
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.getJSONObject(i);
            if (descriptor.equals(row.optString("id")) && row.optBoolean("visible", true)) {
                hit = row;
                break;
            }
        }
        assertNotNull("No visible hit target " + descriptor, hit);
        final float density = (float) map.optDouble("density", 1.0);
        final float px = (float) ((hit.getDouble("x") + hit.getDouble("width") / 2.0) * density);
        final float py = (float) ((hit.getDouble("y") + hit.getDouble("height") / 2.0) * density);

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
        waitForRecorded(descriptor);
        SystemClock.sleep(350L);
    }

    @Before
    public void resetFirstRun() throws Exception {
        rule.getScenario().onActivity(activity -> {
            activity.getSharedPreferences("ghazal_interaction_qa", MainActivity.MODE_PRIVATE).edit().clear().commit();
            WebView w = activity.webViewForTesting();
            w.loadUrl("javascript:(function(){try{localStorage.clear();location.reload();}catch(e){location.reload();}})()");
        });
        waitForDescriptor("action:skip-placement");
    }

    @Test
    public void physicalTouchesDriveCoreAppRoutesAndLessonModal() throws Exception {
        physicalTap("action:skip-placement");
        waitForDescriptor("nav:path");

        physicalTap("nav:path");
        waitForDescriptor("action:select-level");

        physicalTap("nav:practice");
        waitForDescriptor("action:start-listening");

        physicalTap("nav:migration");
        waitForCount("action:open-pack", 2);

        physicalTap("nav:profile");
        waitForDescriptor("action:export-backup");

        physicalTap("nav:home");
        waitForDescriptor("action:open-lesson");

        physicalTap("action:open-lesson");
        waitForDescriptor("action:answer-lesson");
        waitForDescriptor("action:close-modal");
        physicalTap("action:close-modal");

        JSONObject state = snapshot();
        assertTrue("No interactions recorded", state.optInt("count", 0) >= 8);
    }

    @Test
    public void dynamicallyInjectedReleaseControlsReceivePhysicalTouches() throws Exception {
        physicalTap("action:skip-placement");
        waitForDescriptor("nav:practice");
        physicalTap("nav:practice");

        waitForDescriptor("r12:hub");
        physicalTap("r12:hub");
        waitForDescriptor("r12:product");
        waitForDescriptor("r12:close");
        physicalTap("r12:close");

        JSONObject state = snapshot();
        assertTrue("Stage 5/6 interaction was not recorded", state.optString("lastAction", "").startsWith("r12:close|"));
    }
}
