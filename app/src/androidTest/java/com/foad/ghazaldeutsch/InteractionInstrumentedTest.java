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
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.atomic.AtomicReference;\nimport java.util.concurrent.atomic.AtomicBoolean;

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
        JSONArray map = uiMap().optJSONArray("map");
        return map == null ? new JSONArray() : map;
    }

    private JSONObject findVisible(String descriptor) throws Exception {
        JSONArray rows = rows();
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.getJSONObject(i);
            if (descriptor.equals(row.optString("id")) && row.optBoolean("visible", true)) return row;
        }
        return null;
    }

    private void waitForDescriptor(String descriptor) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 12000L;
        while (SystemClock.uptimeMillis() < deadline) {
            if (findVisible(descriptor) != null) return;
            SystemClock.sleep(120L);
        }
        assertNotNull("Timed out waiting for visible control " + descriptor + " state=" + snapshot(), findVisible(descriptor));
    }

    private void waitForRecorded(String descriptor, int previousCount) throws Exception {
        long deadline = SystemClock.uptimeMillis() + 6000L;
        while (SystemClock.uptimeMillis() < deadline) {
            JSONObject state = snapshot();
            if (state.optInt("count", 0) > previousCount
                    && state.optString("lastAction", "").startsWith(descriptor + "|")) return;
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
        final int before = snapshot().optInt("count", 0);

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

        waitForRecorded(descriptor, before);
        SystemClock.sleep(350L);
    }

    @Test
    public void physicalTouchesDriveWholeCriticalInteractionPath() throws Exception {
        // Fresh emulator/application data must present the first-run entry.
        waitForDescriptor("action:skip-placement");
        physicalTap("action:skip-placement");

        // Main navigation.
        waitForDescriptor("nav:path");
        physicalTap("nav:path");
        waitForDescriptor("action:select-level");

        physicalTap("nav:practice");
        waitForDescriptor("action:start-listening");

        physicalTap("nav:migration");
        waitForDescriptor("action:open-pack");

        physicalTap("nav:profile");
        waitForDescriptor("action:export-backup");

        physicalTap("nav:home");
        waitForDescriptor("action:open-lesson");

        // Real lesson modal open/close.
        physicalTap("action:open-lesson");
        waitForDescriptor("action:answer-lesson");
        waitForDescriptor("action:close-modal");
        physicalTap("action:close-modal");

        // Dynamic release UI uses a separate delegated dispatcher.
        physicalTap("nav:practice");
        waitForDescriptor("r12:hub");
        physicalTap("r12:hub");
        waitForDescriptor("r12:product");
        waitForDescriptor("r12:close");
        physicalTap("r12:close");

        JSONObject state = snapshot();
        assertTrue("No physical interactions were recorded: " + state, state.optInt("count", 0) >= 10);
    }
}
