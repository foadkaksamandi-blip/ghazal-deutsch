package com.foad.ghazaldeutsch;

import android.Manifest;
import android.content.pm.PackageManager;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;

import org.json.JSONObject;

import java.util.Map;
import java.util.WeakHashMap;

final class OfflineSpeechJsBridge {
    private static final int REQUEST_OFFLINE_AUDIO = 5110;
    private static final Map<MainActivity, OfflineGermanSpeechEngine> ENGINES = new WeakHashMap<>();

    private OfflineSpeechJsBridge() { }

    static void start(MainActivity activity, String prompt) {
        if (activity == null || activity.isFinishing()) return;
        if (activity.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            activity.runOnUiThread(() -> {
                activity.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_OFFLINE_AUDIO);
                activity.showToast("اجازه میکروفون را فعال کن؛ سپس یک‌بار دیگر «شروع صحبت» را بزن");
            });
            return;
        }

        activity.stopSpeaking();
        OfflineGermanSpeechEngine engine;
        synchronized (ENGINES) {
            engine = ENGINES.get(activity);
            if (engine == null) {
                engine = new OfflineGermanSpeechEngine(activity);
                ENGINES.put(activity, engine);
            }
        }

        engine.start(new OfflineGermanSpeechEngine.Callback() {
            @Override public void onState(String state, String message) {
                send(activity, "window.onSpeechState && window.onSpeechState(" +
                        JSONObject.quote(state == null ? "" : state) + "," +
                        JSONObject.quote(message == null ? "" : message) + ")");
            }

            @Override public void onResult(String text) {
                send(activity, "window.onSpeechResult && window.onSpeechResult(" +
                        JSONObject.quote(text == null ? "" : text) + ")");
            }

            @Override public void onError(String message) {
                send(activity, "window.onSpeechError && window.onSpeechError(" +
                        JSONObject.quote(message == null ? "تشخیص گفتار انجام نشد" : message) + ")");
            }
        });
    }

    static void shutdown(MainActivity activity) {
        OfflineGermanSpeechEngine engine;
        synchronized (ENGINES) { engine = ENGINES.remove(activity); }
        if (engine != null) engine.shutdown();
    }

    private static void send(MainActivity activity, String script) {
        activity.runOnUiThread(() -> {
            WebView webView = findWebView(activity.getWindow().getDecorView());
            if (webView != null) webView.evaluateJavascript(script, null);
        });
    }

    private static WebView findWebView(View view) {
        if (view instanceof WebView) return (WebView) view;
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) {
                WebView found = findWebView(group.getChildAt(i));
                if (found != null) return found;
            }
        }
        return null;
    }
}
