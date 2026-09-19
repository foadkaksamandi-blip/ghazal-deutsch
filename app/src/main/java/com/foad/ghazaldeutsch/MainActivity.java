package com.foad.ghazaldeutsch;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.ActivityManager;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.Signature;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Debug;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.util.Base64;
import android.view.View;
import android.view.MotionEvent;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import org.json.JSONObject;
import org.json.JSONArray;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Executor;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;

public class MainActivity extends FragmentActivity {
    private static final int REQUEST_NOTIFICATIONS = 4101;
    private static final int REQUEST_EXPORT = 4102;
    private static final int REQUEST_IMPORT = 4103;
    private static final int REQUEST_AUDIO = 4104;
    private static final int REQUEST_SECURE_EXPORT = 4105;
    private static final int REQUEST_SECURE_IMPORT = 4106;
    private static final int REQUEST_PDF_EXPORT = 4107;
    private static final int REQUEST_QA_EXPORT = 4108;
    private static final int MAX_BACKUP_BYTES = 8_000_000;
    private static final long RELOCK_AFTER_MS = 5_000L;
    private static final String SECURITY_PREFS = "ghazal_security";
    private static final String SNAPSHOT_ALIAS = "GHAZAL_SNAPSHOT_AES_V1";
    private static final String SNAPSHOT_PREF = "secure_snapshot";

    private WebView webView;
    private TextToSpeech textToSpeech;
    private SpeechRecognizer speechRecognizer;
    private String pendingBackupJson;
    private String pendingSpeechPrompt;
    private String pendingSecureBackupJson;
    private String pendingSecurePassphrase;
    private String pendingSecureImportPassphrase;
    private String pendingReportJson;
    private String pendingQaEvidenceJson;
    private SharedPreferences securityPreferences;
    private boolean appUnlocked = false;
    private boolean authInProgress = false;
    private boolean ttsReady = false;
    private long backgroundedAt = 0L;
    private float rescueDownX;
    private float rescueDownY;
    private long rescueDownAt;
    private boolean rescueMoved;
    private volatile boolean pageReadyForTesting = false;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (BuildConfig.FINAL_RELEASE_BUILD && (!BuildConfig.PRODUCTION_SIGNING_ENABLED || !isProductionSigned())) {
            Toast.makeText(this, "اعتبار نسخه نهایی GHAZAL تأیید نشد", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        securityPreferences = getSharedPreferences(SECURITY_PREFS, MODE_PRIVATE);
        migrateSecurityDefaultsForTouchFix();
        configureSystemBars();
        applyPrivacyScreen();
        createNotificationChannel();
        initializeTextToSpeech();

        WebView.setWebContentsDebuggingEnabled(false);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(9, 9, 9));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSaveFormData(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setGeolocationEnabled(false);
        settings.setDatabaseEnabled(false);
        settings.setSafeBrowsingEnabled(true);

        CookieManager.getInstance().setAcceptCookie(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        // Compatibility hotfix: MIUI/Xiaomi screen-recorder and accessibility overlays can
        // mark WebView touches as obscured and cause every in-app button to appear dead.
        // The app has no payment/auth form inside the WebView; native biometric prompts
        // remain protected by Android. Keep touch filtering off and preserve the other
        // WebView/network hardening controls.
        webView.setFilterTouchesWhenObscured(false);
        webView.setClickable(true);
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.requestFocus(View.FOCUS_DOWN);
        installNativeTouchRescue();
        webView.addJavascriptInterface(new AndroidBridge(this), "GhazalAndroid");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageCommitVisible(WebView view, String url) {
                super.onPageCommitVisible(view, url);
                pageReadyForTesting = true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                pageReadyForTesting = true;
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                return uri == null || !"file".equalsIgnoreCase(uri.getScheme());
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request == null ? null : request.getUrl();
                if (uri != null) {
                    String scheme = uri.getScheme();
                    if (scheme != null && !"file".equalsIgnoreCase(scheme) && !"data".equalsIgnoreCase(scheme)) {
                        return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return url == null || !url.startsWith("file:///android_asset/");
            }
        });

        setContentView(webView);
        pageReadyForTesting = false;
        webView.loadUrl("file:///android_asset/index.html");
        webView.setVisibility(isAppLockEnabled() ? View.INVISIBLE : View.VISIBLE);
        appUnlocked = !isAppLockEnabled();
    }

    @SuppressLint("ClickableViewAccessibility")
    private void installNativeTouchRescue() {
        final float slop = 18f * getResources().getDisplayMetrics().density;
        webView.setOnTouchListener((view, event) -> {
            if (event == null) return false;
            switch (event.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    rescueDownX = event.getX();
                    rescueDownY = event.getY();
                    rescueDownAt = System.currentTimeMillis();
                    rescueMoved = false;
                    break;
                case MotionEvent.ACTION_MOVE:
                    if (Math.abs(event.getX() - rescueDownX) > slop || Math.abs(event.getY() - rescueDownY) > slop) {
                        rescueMoved = true;
                    }
                    break;
                case MotionEvent.ACTION_CANCEL:
                    rescueMoved = true;
                    break;
                case MotionEvent.ACTION_UP:
                    long elapsed = System.currentTimeMillis() - rescueDownAt;
                    if (!rescueMoved && elapsed >= 0L && elapsed <= 900L) {
                        final float x = event.getX();
                        final float y = event.getY();
                        final long gestureAt = System.currentTimeMillis();
                        webView.postDelayed(() -> {
                            if (webView == null) return;
                            String js = "(function(){try{if(window.GhazalInteractionRescue&&typeof window.GhazalInteractionRescue.nativeTap==='function'){window.GhazalInteractionRescue.nativeTap(" + x + "," + y + "," + gestureAt + ");}}catch(e){}})();";
                            webView.evaluateJavascript(js, null);
                        }, 135L);
                    }
                    break;
                default:
                    break;
            }
            return false;
        });
    }

    WebView webViewForTesting() {
        return webView;
    }

    boolean isPageReadyForTesting() {
        if (webView == null) return false;
        String url = webView.getUrl();
        if (url == null || !url.startsWith("file:///android_asset/")) return false;
        return pageReadyForTesting || webView.getProgress() >= 80 || webView.getContentHeight() > 0;
    }

    String getWebViewTestState() {
        JSONObject out = new JSONObject();
        try {
            out.put("readyFlag", pageReadyForTesting);
            out.put("progress", webView == null ? -1 : webView.getProgress());
            out.put("url", webView == null ? JSONObject.NULL : webView.getUrl());
            out.put("contentHeight", webView == null ? -1 : webView.getContentHeight());
            out.put("visibility", webView == null ? -1 : webView.getVisibility());
            out.put("attached", webView != null && webView.isAttachedToWindow());
        } catch (Exception ignored) { }
        return out.toString();
    }

    void resetWebAppForTesting() {
        if (webView == null) return;
        pageReadyForTesting = false;
        WebStorage.getInstance().deleteAllData();
        webView.clearHistory();
        webView.clearCache(true);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!isAppLockEnabled()) {
            appUnlocked = true;
            if (webView != null) webView.setVisibility(View.VISIBLE);
            return;
        }
        boolean stale = backgroundedAt > 0L && System.currentTimeMillis() - backgroundedAt >= RELOCK_AFTER_MS;
        if (!appUnlocked || stale) {
            appUnlocked = false;
            if (webView != null) webView.setVisibility(View.INVISIBLE);
            if (webView != null) webView.postDelayed(this::authenticateUser, 160L);
        }
    }

    @Override
    protected void onStop() {
        if (!isChangingConfigurations()) {
            backgroundedAt = System.currentTimeMillis();
            if (isAppLockEnabled()) {
                appUnlocked = false;
                if (webView != null) webView.setVisibility(View.INVISIBLE);
            }
        }
        super.onStop();
    }

    private void configureSystemBars() {
        getWindow().setStatusBarColor(Color.rgb(5, 5, 5));
        getWindow().setNavigationBarColor(Color.rgb(5, 5, 5));
        getWindow().getDecorView().setSystemUiVisibility(0);
    }

    private void initializeTextToSpeech() {
        textToSpeech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                textToSpeech.setLanguage(Locale.GERMAN);
                textToSpeech.setSpeechRate(0.88f);
                ttsReady = true;
            }
        });
    }

    void setTextZoom(int percent) {
        int safe = Math.max(85, Math.min(140, percent));
        if (webView != null) runOnUiThread(() -> webView.getSettings().setTextZoom(safe));
    }

    void setSpeechRate(float rate) {
        float safe = Math.max(0.55f, Math.min(1.35f, rate));
        if (textToSpeech != null) runOnUiThread(() -> textToSpeech.setSpeechRate(safe));
    }

    private void createNotificationChannel() {
        NotificationChannel channel = new NotificationChannel(
                NotificationScheduler.CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription(getString(R.string.notification_channel_description));
        channel.enableVibration(true);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }

    void speakGerman(String text) {
        if (text == null || text.trim().isEmpty() || textToSpeech == null) return;
        runOnUiThread(() -> textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ghazal-deutsch-utterance"));
    }

    void stopSpeaking() {
        if (textToSpeech != null) runOnUiThread(() -> textToSpeech.stop());
    }

    boolean hasNotificationPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
                || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotificationPermission()) {
            runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_NOTIFICATIONS));
        } else notifyWebPermissionState(true);
    }

    void openNotificationSettings() {
        runOnUiThread(() -> {
            Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
            startActivity(intent);
        });
    }

    void scheduleReminder(int hour, int minute, String title, String body) {
        NotificationScheduler.scheduleDaily(this, hour, minute, title, body);
    }

    void cancelReminder() {
        NotificationScheduler.cancel(this);
    }

    void recordUiInteraction(String descriptor) {
        if (!BuildConfig.QA_INTERNAL_TOOLS_ENABLED) return;
        SharedPreferences prefs = getSharedPreferences("ghazal_interaction_qa", MODE_PRIVATE);
        int count = prefs.getInt("count", 0) + 1;
        prefs.edit()
                .putString("last_action", descriptor == null ? "" : descriptor)
                .putLong("last_action_at", System.currentTimeMillis())
                .putInt("count", count)
                .apply();
    }

    void publishInteractionMap(String json) {
        if (!BuildConfig.QA_INTERNAL_TOOLS_ENABLED || webView == null) return;
        final String payload = json == null || json.trim().isEmpty() ? "[]" : json;
        runOnUiThread(() -> {
            if (webView == null) return;
            int[] location = new int[]{0, 0};
            webView.getLocationOnScreen(location);
            JSONObject wrapper = new JSONObject();
            try {
                wrapper.put("map", new JSONArray(payload));
                wrapper.put("viewX", location[0]);
                wrapper.put("viewY", location[1]);
                wrapper.put("density", getResources().getDisplayMetrics().density);
                wrapper.put("width", webView.getWidth());
                wrapper.put("height", webView.getHeight());
                wrapper.put("updatedAt", System.currentTimeMillis());
            } catch (Exception ignored) { }
            getSharedPreferences("ghazal_interaction_qa", MODE_PRIVATE)
                    .edit().putString("ui_map", wrapper.toString()).apply();
        });
    }

    String getInteractionQaState() {
        if (!BuildConfig.QA_INTERNAL_TOOLS_ENABLED) return "{}";
        SharedPreferences prefs = getSharedPreferences("ghazal_interaction_qa", MODE_PRIVATE);
        JSONObject out = new JSONObject();
        try {
            out.put("lastAction", prefs.getString("last_action", ""));
            out.put("lastActionAt", prefs.getLong("last_action_at", 0L));
            out.put("count", prefs.getInt("count", 0));
            out.put("uiMap", prefs.getString("ui_map", "{}"));
        } catch (Exception ignored) { }
        return out.toString();
    }

    boolean isAppLockEnabled() {
        return securityPreferences != null && securityPreferences.getBoolean("app_lock", false);
    }

    void setAppLockEnabled(boolean enabled) {
        if (securityPreferences == null) return;
        securityPreferences.edit()
                .putBoolean("app_lock", enabled)
                .putBoolean("app_lock_user_selected", true)
                .apply();
        runOnUiThread(() -> {
            if (enabled) {
                appUnlocked = false;
                if (webView != null) webView.setVisibility(View.INVISIBLE);
                authenticateUser();
            } else {
                appUnlocked = true;
                if (webView != null) webView.setVisibility(View.VISIBLE);
                notifyAuthenticationState(true);
            }
        });
    }

    boolean isDeviceSecurityAvailable() {
        int authenticators = BiometricManager.Authenticators.BIOMETRIC_WEAK | BiometricManager.Authenticators.DEVICE_CREDENTIAL;
        return BiometricManager.from(this).canAuthenticate(authenticators) == BiometricManager.BIOMETRIC_SUCCESS;
    }

    void lockNow() {
        if (!isAppLockEnabled()) return;
        runOnUiThread(() -> {
            appUnlocked = false;
            if (webView != null) webView.setVisibility(View.INVISIBLE);
            authenticateUser();
        });
    }

    private void migrateSecurityDefaultsForTouchFix() {
        if (securityPreferences == null) return;
        if (!securityPreferences.getBoolean("touch_compat_v14_0_1", false)) {
            SharedPreferences.Editor editor = securityPreferences.edit()
                    .putBoolean("touch_compat_v14_0_1", true);
            if (!securityPreferences.getBoolean("privacy_user_selected", false)) {
                editor.putBoolean("privacy_screen", false);
            }
            if (!securityPreferences.getBoolean("app_lock_user_selected", false)) {
                editor.putBoolean("app_lock", false);
            }
            editor.apply();
        }
    }

    boolean isPrivacyScreenEnabled() {
        return securityPreferences != null && securityPreferences.getBoolean("privacy_screen", false);
    }

    void setPrivacyScreenEnabled(boolean enabled) {
        if (securityPreferences == null) return;
        securityPreferences.edit()
                .putBoolean("privacy_screen", enabled)
                .putBoolean("privacy_user_selected", true)
                .apply();
        runOnUiThread(this::applyPrivacyScreen);
    }

    private void applyPrivacyScreen() {
        if (securityPreferences != null && securityPreferences.getBoolean("privacy_screen", false)) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        } else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }

    boolean isDeviceCompromised() {
        if (Build.TAGS != null && Build.TAGS.contains("test-keys")) return true;
        String[] paths = {"/system/app/Superuser.apk","/sbin/su","/system/bin/su","/system/xbin/su","/data/local/xbin/su","/data/local/bin/su","/system/sd/xbin/su","/system/bin/failsafe/su","/data/local/su","/su/bin/su"};
        for (String path : paths) if (new File(path).exists()) return true;
        String[] packages = {"com.topjohnwu.magisk","eu.chainfire.supersu","com.noshufou.android.su","com.koushikdutta.superuser"};
        for (String packageName : packages) {
            try { getPackageManager().getPackageInfo(packageName, 0); return true; }
            catch (PackageManager.NameNotFoundException ignored) { }
        }
        return false;
    }

    private void authenticateUser() {
        if (!isAppLockEnabled()) {
            appUnlocked = true;
            if (webView != null) webView.setVisibility(View.VISIBLE);
            return;
        }
        if (authInProgress) return;

        int authenticators = BiometricManager.Authenticators.BIOMETRIC_WEAK | BiometricManager.Authenticators.DEVICE_CREDENTIAL;
        if (BiometricManager.from(this).canAuthenticate(authenticators) != BiometricManager.BIOMETRIC_SUCCESS) {
            appUnlocked = false;
            if (webView != null) webView.setVisibility(View.INVISIBLE);
            showToast("برای ورود امن، PIN/رمز یا اثر انگشت گوشی را فعال کن");
            finish();
            return;
        }

        authInProgress = true;
        Executor executor = ContextCompat.getMainExecutor(this);
        BiometricPrompt biometricPrompt = new BiometricPrompt(this, executor, new BiometricPrompt.AuthenticationCallback() {
            @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                authInProgress = false;
                appUnlocked = true;
                backgroundedAt = 0L;
                if (webView != null) webView.setVisibility(View.VISIBLE);
                notifyAuthenticationState(true);
            }
            @Override public void onAuthenticationError(int errorCode, CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                authInProgress = false;
                appUnlocked = false;
                notifyAuthenticationState(false);
                if (!isFinishing()) finish();
            }
            @Override public void onAuthenticationFailed() {
                super.onAuthenticationFailed();
                notifyAuthenticationState(false);
            }
        });

        BiometricPrompt.PromptInfo.Builder builder = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("قفل امن GHAZAL")
                .setSubtitle("با اثر انگشت، تشخیص چهره پشتیبانی‌شده یا قفل خود گوشی وارد شو")
                .setConfirmationRequired(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) builder.setAllowedAuthenticators(authenticators);
        else builder.setDeviceCredentialAllowed(true);
        biometricPrompt.authenticate(builder.build());
    }

    private void notifyAuthenticationState(boolean unlocked) {
        if (webView == null) return;
        runOnUiThread(() -> webView.evaluateJavascript("window.onAppAuthenticationChanged && window.onAppAuthenticationChanged(" + unlocked + ")", null));
    }

    void startSpeechRecognition(String prompt) {
        pendingSpeechPrompt = prompt == null ? "" : prompt;
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_AUDIO));
            return;
        }
        runOnUiThread(this::beginSpeechRecognition);
    }

    private void beginSpeechRecognition() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            notifySpeechError("تشخیص گفتار روی این گوشی در دسترس نیست");
            return;
        }
        if (speechRecognizer != null) { speechRecognizer.destroy(); speechRecognizer = null; }
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onPartialResults(Bundle partialResults) { }
            @Override public void onEvent(int eventType, Bundle params) { }
            @Override public void onError(int error) { notifySpeechError(speechErrorMessage(error)); }
            @Override public void onResults(Bundle results) {
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                String text = matches != null && !matches.isEmpty() ? matches.get(0) : "";
                notifySpeechResult(text);
            }
        });

        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "de-DE");
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "de-DE");
        intent.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, true);
        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        if (pendingSpeechPrompt != null && !pendingSpeechPrompt.isEmpty()) intent.putExtra(RecognizerIntent.EXTRA_PROMPT, pendingSpeechPrompt);
        speechRecognizer.startListening(intent);
    }

    private String speechErrorMessage(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_NO_MATCH: return "جمله تشخیص داده نشد؛ دوباره واضح‌تر بگو";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: return "صدایی دریافت نشد؛ دوباره امتحان کن";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "اجازه میکروفون فعال نیست";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "بسته تشخیص گفتار آفلاین در دسترس نیست یا سرویس گفتار مشکل دارد";
            default: return "تشخیص گفتار انجام نشد؛ دوباره امتحان کن";
        }
    }

    private void notifySpeechResult(String text) {
        if (webView == null) return;
        String quoted = JSONObject.quote(text == null ? "" : text);
        runOnUiThread(() -> webView.evaluateJavascript("window.onSpeechResult && window.onSpeechResult(" + quoted + ")", null));
    }

    private void notifySpeechError(String message) {
        if (webView == null) return;
        String quoted = JSONObject.quote(message == null ? "" : message);
        runOnUiThread(() -> webView.evaluateJavascript("window.onSpeechError && window.onSpeechError(" + quoted + ")", null));
    }

    void startBackupExport(String json) {
        if (json == null || json.length() > MAX_BACKUP_BYTES) { showToast("حجم فایل پشتیبان معتبر نیست"); return; }
        pendingBackupJson = json;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, "GHAZAL-backup.json");
        runOnUiThread(() -> startActivityForResult(intent, REQUEST_EXPORT));
    }

    void startBackupImport() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        runOnUiThread(() -> startActivityForResult(intent, REQUEST_IMPORT));
    }

    void exportSecureBackup(String json, String passphrase) {
        if (json == null || json.length() > MAX_BACKUP_BYTES || passphrase == null || passphrase.length() < 8) { showToast("اطلاعات یا رمز پشتیبان معتبر نیست"); return; }
        pendingSecureBackupJson = json;
        pendingSecurePassphrase = passphrase;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/octet-stream");
        intent.putExtra(Intent.EXTRA_TITLE, "GHAZAL-secure-backup.ghz");
        runOnUiThread(() -> startActivityForResult(intent, REQUEST_SECURE_EXPORT));
    }

    void importSecureBackup(String passphrase) {
        if (passphrase == null || passphrase.length() < 8) { showToast("رمز معتبر نیست"); return; }
        pendingSecureImportPassphrase = passphrase;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        runOnUiThread(() -> startActivityForResult(intent, REQUEST_SECURE_IMPORT));
    }

    private byte[] encryptPortable(String plain, String passphrase) throws Exception {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16]; random.nextBytes(salt);
        byte[] iv = new byte[12]; random.nextBytes(iv);
        int iterations = 310_000;
        PBEKeySpec spec = new PBEKeySpec(passphrase.toCharArray(), salt, iterations, 256);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        SecretKey key;
        try { key = new SecretKeySpec(factory.generateSecret(spec).getEncoded(), "AES"); }
        finally { spec.clearPassword(); }
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
        byte[] encrypted = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
        JSONObject out = new JSONObject();
        out.put("v",2);
        out.put("kdf","PBKDF2WithHmacSHA256");
        out.put("iterations",iterations);
        out.put("salt", Base64.encodeToString(salt, Base64.NO_WRAP));
        out.put("iv", Base64.encodeToString(iv, Base64.NO_WRAP));
        out.put("cipher", Base64.encodeToString(encrypted, Base64.NO_WRAP));
        return out.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String decryptPortable(String payload, String passphrase) throws Exception {
        JSONObject in = new JSONObject(payload);
        int version = in.optInt("v",0);
        if (version != 1 && version != 2) throw new IllegalArgumentException("Unsupported backup");
        int iterations = version == 1 ? 120_000 : in.optInt("iterations",310_000);
        if (iterations < 120_000 || iterations > 1_000_000) throw new IllegalArgumentException("Invalid KDF");
        byte[] salt = Base64.decode(in.getString("salt"), Base64.NO_WRAP);
        byte[] iv = Base64.decode(in.getString("iv"), Base64.NO_WRAP);
        byte[] encrypted = Base64.decode(in.getString("cipher"), Base64.NO_WRAP);
        PBEKeySpec spec = new PBEKeySpec(passphrase.toCharArray(), salt, iterations, 256);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        SecretKey key;
        try { key = new SecretKeySpec(factory.generateSecret(spec).getEncoded(), "AES"); }
        finally { spec.clearPassword(); }
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
        return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
    }

    void saveSecureSnapshot(String json) {
        if (json == null || json.length() > MAX_BACKUP_BYTES || securityPreferences == null) return;
        try {
            SecretKey key = getSnapshotKey();
            byte[] iv = new byte[12]; new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(json.getBytes(StandardCharsets.UTF_8));
            JSONObject payload = new JSONObject();
            payload.put("iv", Base64.encodeToString(iv, Base64.NO_WRAP));
            payload.put("cipher", Base64.encodeToString(encrypted, Base64.NO_WRAP));
            securityPreferences.edit().putString(SNAPSHOT_PREF, payload.toString()).apply();
        } catch (Exception ignored) { }
    }

    String loadSecureSnapshot() {
        if (securityPreferences == null) return "";
        String payload = securityPreferences.getString(SNAPSHOT_PREF, "");
        if (payload == null || payload.isEmpty()) return "";
        try {
            JSONObject in = new JSONObject(payload);
            byte[] iv = Base64.decode(in.getString("iv"), Base64.NO_WRAP);
            byte[] encrypted = Base64.decode(in.getString("cipher"), Base64.NO_WRAP);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, getSnapshotKey(), new GCMParameterSpec(128, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception ignored) { return ""; }
    }

    private SecretKey getSnapshotKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        if (keyStore.containsAlias(SNAPSHOT_ALIAS)) return ((KeyStore.SecretKeyEntry) keyStore.getEntry(SNAPSHOT_ALIAS, null)).getSecretKey();
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(SNAPSHOT_ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build());
        return generator.generateKey();
    }

    boolean isSpeechRecognitionAvailable() {
        return SpeechRecognizer.isRecognitionAvailable(this);
    }

    boolean isTextToSpeechReady() {
        return ttsReady;
    }

    boolean isDebuggableBuild() {
        return (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    boolean isRuntimeHookRisk() {
        if (Debug.isDebuggerConnected() || Debug.waitingForDebugger()) return true;
        try {
            File status = new File("/proc/self/status");
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(new java.io.FileInputStream(status), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("TracerPid:")) {
                        int pid = Integer.parseInt(line.substring(line.indexOf(':') + 1).trim());
                        if (pid != 0) return true;
                    }
                }
            }
        } catch (Exception ignored) { }
        try {
            File maps = new File("/proc/self/maps");
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(new java.io.FileInputStream(maps), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String low = line.toLowerCase(Locale.ROOT);
                    if (low.contains("frida") || low.contains("xposed") || low.contains("substrate") || low.contains("zygisk") || low.contains("riru")) return true;
                }
            }
        } catch (Exception ignored) { }
        String[] packages = {"org.lsposed.manager","de.robv.android.xposed.installer","com.saurik.substrate"};
        for (String packageName : packages) {
            try { getPackageManager().getPackageInfo(packageName, 0); return true; }
            catch (PackageManager.NameNotFoundException ignored) { }
        }
        return false;
    }

    String signingCertificateSha256() {
        try {
            PackageInfo info;
            Signature[] signatures;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                info = getPackageManager().getPackageInfo(getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
                if (info.signingInfo == null) return "";
                signatures = info.signingInfo.hasMultipleSigners()
                        ? info.signingInfo.getApkContentsSigners()
                        : info.signingInfo.getSigningCertificateHistory();
            } else {
                info = getPackageManager().getPackageInfo(getPackageName(), PackageManager.GET_SIGNATURES);
                signatures = info.signatures;
            }
            if (signatures == null || signatures.length == 0) return "";
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(signatures[0].toByteArray());
            StringBuilder out = new StringBuilder();
            for (byte b : hash) out.append(String.format(Locale.ROOT, "%02x", b));
            return out.toString();
        } catch (Exception ignored) { return ""; }
    }

    boolean isProductionSigned() {
        if (!BuildConfig.PRODUCTION_SIGNING_ENABLED) return false;
        String expected = BuildConfig.EXPECTED_CERT_SHA256 == null ? "" : BuildConfig.EXPECTED_CERT_SHA256.replace(":", "").trim().toLowerCase(Locale.ROOT);
        String actual = signingCertificateSha256().replace(":", "").trim().toLowerCase(Locale.ROOT);
        return !expected.isEmpty() && expected.equals(actual);
    }

    String installerSource() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                String source = getPackageManager().getInstallSourceInfo(getPackageName()).getInstallingPackageName();
                return source == null ? "sideload" : source;
            }
            String source = getPackageManager().getInstallerPackageName(getPackageName());
            return source == null ? "sideload" : source;
        } catch (Exception ignored) { return "unknown"; }
    }

    boolean runCryptoSelfTest() {
        try {
            byte[] iv = new byte[12]; new SecureRandom().nextBytes(iv);
            SecretKey key = getSnapshotKey();
            Cipher enc = Cipher.getInstance("AES/GCM/NoPadding");
            enc.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
            byte[] cipherText = enc.doFinal("GHAZAL-CRYPTO-SELFTEST".getBytes(StandardCharsets.UTF_8));
            Cipher dec = Cipher.getInstance("AES/GCM/NoPadding");
            dec.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
            return "GHAZAL-CRYPTO-SELFTEST".equals(new String(dec.doFinal(cipherText), StandardCharsets.UTF_8));
        } catch (Exception ignored) { return false; }
    }

    private String sha256Asset(String path) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream input = getAssets().open(path)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = input.read(buffer)) != -1) digest.update(buffer, 0, read);
        }
        StringBuilder out = new StringBuilder();
        for (byte b : digest.digest()) out.append(String.format(Locale.ROOT, "%02x", b));
        return out.toString();
    }

    boolean verifyBundledAssets() {
        try {
            String manifest;
            try (InputStream input = getAssets().open("security/asset-integrity.json");
                 BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
                StringBuilder b = new StringBuilder(); String line;
                while ((line = reader.readLine()) != null) b.append(line);
                manifest = b.toString();
            }
            JSONObject root = new JSONObject(manifest);
            JSONObject files = root.getJSONObject("files");
            Iterator<String> keys = files.keys();
            int checked = 0;
            while (keys.hasNext()) {
                String path = keys.next();
                String expected = files.getString(path);
                if (!expected.equalsIgnoreCase(sha256Asset(path))) return false;
                checked++;
            }
            return checked >= 10;
        } catch (Exception ignored) { return false; }
    }

    void clearSecureSnapshot() {
        if (securityPreferences != null) securityPreferences.edit().remove(SNAPSHOT_PREF).apply();
    }

    String getSecurityReport() {
        JSONObject out = new JSONObject();
        try {
            out.put("version", appVersion());
            out.put("appLock", isAppLockEnabled());
            out.put("deviceSecurity", isDeviceSecurityAvailable());
            out.put("privacyScreen", isPrivacyScreenEnabled());
            out.put("rootRisk", isDeviceCompromised());
            out.put("hookRisk", isRuntimeHookRisk());
            out.put("debugger", Debug.isDebuggerConnected() || Debug.waitingForDebugger());
            out.put("debuggable", isDebuggableBuild());
            out.put("assetIntegrity", verifyBundledAssets());
            out.put("cryptoSelfTest", runCryptoSelfTest());
            out.put("speechRecognition", isSpeechRecognitionAvailable());
            out.put("ttsReady", isTextToSpeechReady());
            out.put("signingSha256", signingCertificateSha256());
            out.put("productionSigned", isProductionSigned());
            out.put("installer", installerSource());
            out.put("cleartextDisabled", true);
            out.put("webViewDebugging", false);
        } catch (Exception ignored) { }
        return out.toString();
    }

    String getReleaseInfo() {
        JSONObject out = new JSONObject();
        try {
            PackageInfo pkg = getPackageManager().getPackageInfo(getPackageName(), 0);
            out.put("version", pkg.versionName == null ? appVersion() : pkg.versionName);
            out.put("versionCode", Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? pkg.getLongVersionCode() : pkg.versionCode);
            out.put("packageName", getPackageName());
            out.put("channel", BuildConfig.RELEASE_CHANNEL);
            out.put("finalReleaseBuild", BuildConfig.FINAL_RELEASE_BUILD);
            out.put("qaToolsEnabled", BuildConfig.QA_INTERNAL_TOOLS_ENABLED);
            out.put("productionSigningConfigured", BuildConfig.PRODUCTION_SIGNING_ENABLED);
            out.put("productionSigned", isProductionSigned());
            out.put("signingSha256", signingCertificateSha256());
            out.put("debuggable", isDebuggableBuild());
            out.put("assetIntegrity", verifyBundledAssets());
            out.put("cryptoSelfTest", runCryptoSelfTest());
            out.put("rootRisk", isDeviceCompromised());
            out.put("hookRisk", isRuntimeHookRisk());
            out.put("installer", installerSource());
            out.put("offlineCore", true);
            out.put("internetPermission", false);
        } catch (Exception ignored) { }
        return out.toString();
    }

    String getDeviceReport() {
        JSONObject out = new JSONObject();
        try {
            out.put("version", appVersion());
            out.put("manufacturer", Build.MANUFACTURER);
            out.put("brand", Build.BRAND);
            out.put("model", Build.MODEL);
            out.put("device", Build.DEVICE);
            out.put("androidRelease", Build.VERSION.RELEASE);
            out.put("sdk", Build.VERSION.SDK_INT);
            out.put("abis", new JSONArray(Build.SUPPORTED_ABIS));
            out.put("processors", Runtime.getRuntime().availableProcessors());
            out.put("javaMaxMemoryMb", Runtime.getRuntime().maxMemory() / (1024L * 1024L));
            ActivityManager manager = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
            if (manager != null) {
                ActivityManager.MemoryInfo info = new ActivityManager.MemoryInfo();
                manager.getMemoryInfo(info);
                out.put("totalMemoryMb", info.totalMem / (1024L * 1024L));
                out.put("availableMemoryMb", info.availMem / (1024L * 1024L));
                out.put("lowMemory", info.lowMemory);
            }
            out.put("speechRecognition", isSpeechRecognitionAvailable());
            out.put("ttsReady", isTextToSpeechReady());
            out.put("notificationPermission", hasNotificationPermission());
            out.put("appLock", isAppLockEnabled());
            out.put("privacyScreen", isPrivacyScreenEnabled());
            out.put("rootRisk", isDeviceCompromised());
            out.put("hookRisk", isRuntimeHookRisk());
            out.put("debuggable", isDebuggableBuild());
            out.put("assetIntegrity", verifyBundledAssets());
            out.put("cryptoSelfTest", runCryptoSelfTest());
            out.put("signingSha256", signingCertificateSha256());
            out.put("productionSigned", isProductionSigned());
            out.put("installer", installerSource());
            out.put("cleartextDisabled", true);
        } catch (Exception ignored) { }
        return out.toString();
    }

    void exportQaEvidence(String json) {
        if (json == null || json.length() > MAX_BACKUP_BYTES) { showToast("گزارش QA معتبر نیست"); return; }
        pendingQaEvidenceJson = json;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, "GHAZAL-stage7-QA-evidence.json");
        runOnUiThread(() -> startActivityForResult(intent, REQUEST_QA_EXPORT));
    }

    void exportProgressPdf(String json) {
        if (json == null || json.length() > MAX_BACKUP_BYTES) { showToast("گزارش معتبر نیست"); return; }
        pendingReportJson = json;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/pdf");
        intent.putExtra(Intent.EXTRA_TITLE, "GHAZAL-progress-report.pdf");
        runOnUiThread(() -> startActivityForResult(intent, REQUEST_PDF_EXPORT));
    }

    private void writeReportPdf(Uri uri, String json) throws Exception {
        JSONObject report = new JSONObject(json);
        PdfDocument document = new PdfDocument();
        PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(595,842,1).create();
        PdfDocument.Page page = document.startPage(pageInfo);
        Canvas canvas = page.getCanvas();
        Paint title = new Paint(Paint.ANTI_ALIAS_FLAG); title.setColor(Color.BLACK); title.setTextSize(24f); title.setFakeBoldText(true);
        Paint text = new Paint(Paint.ANTI_ALIAS_FLAG); text.setColor(Color.DKGRAY); text.setTextSize(12f);
        Paint strong = new Paint(Paint.ANTI_ALIAS_FLAG); strong.setColor(Color.BLACK); strong.setTextSize(13f); strong.setFakeBoldText(true);
        int y = 55;
        canvas.drawText("GHAZAL — Progress Report",40,y,title); y+=32;
        canvas.drawText("Generated: "+report.optString("generatedAt",""),40,y,text); y+=20;
        JSONObject profile = report.optJSONObject("profile");
        String reportName = profile != null ? profile.optString("name","Learner") : report.optString("name","Ghazal");
        String reportLevel = profile != null ? profile.optString("level","A1") : report.optString("level","A1");
        canvas.drawText("Name: "+reportName+"   CEFR: "+reportLevel,40,y,strong); y+=28;
        JSONObject progress=report.optJSONObject("progress");
        if(progress!=null){canvas.drawText("Completed lessons: "+progress.optInt("completedLessons",0),40,y,text);y+=18;canvas.drawText("XP: "+progress.optInt("xp",0)+"   Streak: "+progress.optInt("streak",0),40,y,text);y+=28;}
        canvas.drawText("Skill averages",40,y,strong); y+=22;
        JSONObject skills=report.optJSONObject("skills");
        if(skills!=null){Iterator<String> keys=skills.keys();while(keys.hasNext()&&y<760){String key=keys.next();if("errors".equals(key))continue;JSONObject s=skills.optJSONObject(key);if(s==null)continue;canvas.drawText(key+": "+s.optInt("avg",0)+"%  attempts="+s.optInt("attempts",0),55,y,text);y+=18;}}
        y+=12;canvas.drawText("Security note: this report contains learning metrics only.",40,Math.min(y,790),text);
        document.finishPage(page);
        try(OutputStream output=getContentResolver().openOutputStream(uri,"wt")){if(output==null)throw new IOException("Cannot open PDF output");document.writeTo(output);}finally{document.close();}
    }

    void showToast(String message) {
        runOnUiThread(() -> Toast.makeText(this, message, Toast.LENGTH_SHORT).show());
    }

    String appVersion() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; }
        catch (PackageManager.NameNotFoundException exception) { return "14.0.2"; }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_NOTIFICATIONS) notifyWebPermissionState(hasNotificationPermission());
        else if (requestCode == REQUEST_AUDIO) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) beginSpeechRecognition();
            else notifySpeechError("برای تمرین گفتاری باید اجازه میکروفون فعال باشد");
        }
    }

    private void notifyWebPermissionState(boolean granted) {
        if (webView == null) return;
        runOnUiThread(() -> webView.evaluateJavascript("window.onNotificationPermissionChanged && window.onNotificationPermissionChanged(" + granted + ")", null));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri = data.getData();
        try {
            if (requestCode == REQUEST_EXPORT && pendingBackupJson != null) {
                try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                    if (output == null) throw new IOException("Cannot open output");
                    output.write(pendingBackupJson.getBytes(StandardCharsets.UTF_8));
                }
                pendingBackupJson = null;
                showToast("فایل پشتیبان ذخیره شد");
            } else if (requestCode == REQUEST_IMPORT) {
                String imported = readText(uri);
                String quoted = JSONObject.quote(imported);
                webView.evaluateJavascript("window.receiveImportedBackup && window.receiveImportedBackup(" + quoted + ")", null);
            } else if (requestCode == REQUEST_SECURE_EXPORT && pendingSecureBackupJson != null && pendingSecurePassphrase != null) {
                byte[] encrypted = encryptPortable(pendingSecureBackupJson, pendingSecurePassphrase);
                try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                    if (output == null) throw new IOException("Cannot open secure output");
                    output.write(encrypted);
                }
                pendingSecureBackupJson = null;
                pendingSecurePassphrase = null;
                showToast("پشتیبان رمزگذاری‌شده ذخیره شد");
            } else if (requestCode == REQUEST_SECURE_IMPORT && pendingSecureImportPassphrase != null) {
                String payload = readText(uri);
                String decrypted = decryptPortable(payload, pendingSecureImportPassphrase);
                pendingSecureImportPassphrase = null;
                String quoted = JSONObject.quote(decrypted);
                webView.evaluateJavascript("window.onSecureBackupImported && window.onSecureBackupImported(" + quoted + ")", null);
            } else if (requestCode == REQUEST_PDF_EXPORT && pendingReportJson != null) {
                writeReportPdf(uri, pendingReportJson);
                pendingReportJson = null;
                showToast("گزارش PDF ذخیره شد");
            } else if (requestCode == REQUEST_QA_EXPORT && pendingQaEvidenceJson != null) {
                try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                    if (output == null) throw new IOException("Cannot open QA output");
                    output.write(pendingQaEvidenceJson.getBytes(StandardCharsets.UTF_8));
                }
                pendingQaEvidenceJson = null;
                showToast("گزارش QA ذخیره شد");
            }
        } catch (Exception exception) {
            pendingSecureBackupJson = null;
            pendingSecurePassphrase = null;
            pendingSecureImportPassphrase = null;
            pendingQaEvidenceJson = null;
            showToast("عملیات فایل انجام نشد؛ رمز یا فایل را بررسی کن");
        }
    }

    private String readText(Uri uri) throws IOException {
        StringBuilder builder = new StringBuilder();
        try (InputStream input = getContentResolver().openInputStream(uri);
             BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            char[] buffer = new char[4096];
            int read;
            int total = 0;
            while ((read = reader.read(buffer)) != -1) {
                total += read;
                if (total > MAX_BACKUP_BYTES) throw new IOException("Backup too large");
                builder.append(buffer, 0, read);
            }
        }
        return builder.toString();
    }

    @Override
    public void onBackPressed() {
        if (webView == null || webView.getVisibility() != View.VISIBLE) { super.onBackPressed(); return; }
        webView.evaluateJavascript("Boolean(window.androidBack && window.androidBack())", value -> { if (!"true".equals(value)) finish(); });
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) { textToSpeech.stop(); textToSpeech.shutdown(); }
        if (speechRecognizer != null) { speechRecognizer.cancel(); speechRecognizer.destroy(); speechRecognizer = null; }
        if (webView != null) { webView.removeJavascriptInterface("GhazalAndroid"); webView.destroy(); }
        super.onDestroy();
    }
}
