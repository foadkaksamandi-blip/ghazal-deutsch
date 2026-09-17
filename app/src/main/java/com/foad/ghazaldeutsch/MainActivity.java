package com.foad.ghazaldeutsch;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Locale;
import java.util.concurrent.Executor;

public class MainActivity extends FragmentActivity {
    private static final int REQUEST_NOTIFICATIONS = 4101;
    private static final int REQUEST_EXPORT = 4102;
    private static final int REQUEST_IMPORT = 4103;
    private static final int REQUEST_AUDIO = 4104;
    private static final int MAX_BACKUP_BYTES = 2_000_000;
    private static final long RELOCK_AFTER_MS = 15_000L;
    private static final String SECURITY_PREFS = "ghazal_security";

    private WebView webView;
    private TextToSpeech textToSpeech;
    private SpeechRecognizer speechRecognizer;
    private String pendingBackupJson;
    private String pendingSpeechPrompt;
    private SharedPreferences securityPreferences;
    private boolean appUnlocked = false;
    private boolean authInProgress = false;
    private long backgroundedAt = 0L;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        securityPreferences = getSharedPreferences(SECURITY_PREFS, MODE_PRIVATE);
        configureSystemBars();
        applyPrivacyScreen();
        createNotificationChannel();
        initializeTextToSpeech();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(9, 9, 9));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.addJavascriptInterface(new AndroidBridge(this), "GhazalAndroid");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                return uri == null || !"file".equalsIgnoreCase(uri.getScheme());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return url == null || !url.startsWith("file:///android_asset/");
            }
        });

        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
        webView.setVisibility(isAppLockEnabled() ? View.INVISIBLE : View.VISIBLE);
        appUnlocked = !isAppLockEnabled();
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
            }
        });
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
        runOnUiThread(() -> textToSpeech.speak(
                text,
                TextToSpeech.QUEUE_FLUSH,
                null,
                "ghazal-deutsch-utterance"
        ));
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
            runOnUiThread(() -> requestPermissions(
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    REQUEST_NOTIFICATIONS
            ));
        } else {
            notifyWebPermissionState(true);
        }
    }

    void openNotificationSettings() {
        runOnUiThread(() -> {
            Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
            startActivity(intent);
        });
    }

    void scheduleReminder(int hour, int minute, String title, String body) {
        NotificationScheduler.scheduleDaily(this, hour, minute, title, body);
    }

    void cancelReminder() {
        NotificationScheduler.cancel(this);
    }

    boolean isAppLockEnabled() {
        return securityPreferences != null && securityPreferences.getBoolean("app_lock", true);
    }

    void setAppLockEnabled(boolean enabled) {
        if (securityPreferences == null) return;
        securityPreferences.edit().putBoolean("app_lock", enabled).apply();
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
        int authenticators = BiometricManager.Authenticators.BIOMETRIC_WEAK
                | BiometricManager.Authenticators.DEVICE_CREDENTIAL;
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

    boolean isPrivacyScreenEnabled() {
        return securityPreferences != null && securityPreferences.getBoolean("privacy_screen", false);
    }

    void setPrivacyScreenEnabled(boolean enabled) {
        if (securityPreferences == null) return;
        securityPreferences.edit().putBoolean("privacy_screen", enabled).apply();
        runOnUiThread(this::applyPrivacyScreen);
    }

    private void applyPrivacyScreen() {
        if (securityPreferences != null && securityPreferences.getBoolean("privacy_screen", false)) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
        }
    }

    private void authenticateUser() {
        if (!isAppLockEnabled()) {
            appUnlocked = true;
            if (webView != null) webView.setVisibility(View.VISIBLE);
            return;
        }
        if (authInProgress) return;

        int authenticators = BiometricManager.Authenticators.BIOMETRIC_WEAK
                | BiometricManager.Authenticators.DEVICE_CREDENTIAL;
        if (BiometricManager.from(this).canAuthenticate(authenticators) != BiometricManager.BIOMETRIC_SUCCESS) {
            appUnlocked = true;
            if (webView != null) webView.setVisibility(View.VISIBLE);
            showToast("قفل امن گوشی فعال نیست؛ از تنظیمات گوشی PIN یا اثر انگشت اضافه کن");
            notifyAuthenticationState(true);
            return;
        }

        authInProgress = true;
        Executor executor = ContextCompat.getMainExecutor(this);
        BiometricPrompt biometricPrompt = new BiometricPrompt(this, executor,
                new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                        super.onAuthenticationSucceeded(result);
                        authInProgress = false;
                        appUnlocked = true;
                        backgroundedAt = 0L;
                        if (webView != null) webView.setVisibility(View.VISIBLE);
                        notifyAuthenticationState(true);
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, CharSequence errString) {
                        super.onAuthenticationError(errorCode, errString);
                        authInProgress = false;
                        appUnlocked = false;
                        notifyAuthenticationState(false);
                        if (!isFinishing()) finish();
                    }

                    @Override
                    public void onAuthenticationFailed() {
                        super.onAuthenticationFailed();
                        notifyAuthenticationState(false);
                    }
                });

        BiometricPrompt.PromptInfo.Builder builder = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("قفل امن GHAZAL")
                .setSubtitle("با اثر انگشت، تشخیص چهره پشتیبانی‌شده یا قفل خود گوشی وارد شو")
                .setConfirmationRequired(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            builder.setAllowedAuthenticators(authenticators);
        } else {
            builder.setDeviceCredentialAllowed(true);
        }
        biometricPrompt.authenticate(builder.build());
    }

    private void notifyAuthenticationState(boolean unlocked) {
        if (webView == null) return;
        runOnUiThread(() -> webView.evaluateJavascript(
                "window.onAppAuthenticationChanged && window.onAppAuthenticationChanged(" + unlocked + ")",
                null
        ));
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
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onPartialResults(Bundle partialResults) { }
            @Override public void onEvent(int eventType, Bundle params) { }

            @Override
            public void onError(int error) {
                notifySpeechError(speechErrorMessage(error));
            }

            @Override
            public void onResults(Bundle results) {
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
        if (pendingSpeechPrompt != null && !pendingSpeechPrompt.isEmpty()) {
            intent.putExtra(RecognizerIntent.EXTRA_PROMPT, pendingSpeechPrompt);
        }
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
        runOnUiThread(() -> webView.evaluateJavascript(
                "window.onSpeechResult && window.onSpeechResult(" + quoted + ")",
                null
        ));
    }

    private void notifySpeechError(String message) {
        if (webView == null) return;
        String quoted = JSONObject.quote(message == null ? "" : message);
        runOnUiThread(() -> webView.evaluateJavascript(
                "window.onSpeechError && window.onSpeechError(" + quoted + ")",
                null
        ));
    }

    void startBackupExport(String json) {
        if (json == null || json.length() > MAX_BACKUP_BYTES) {
            showToast("حجم فایل پشتیبان معتبر نیست");
            return;
        }
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

    void showToast(String message) {
        runOnUiThread(() -> Toast.makeText(this, message, Toast.LENGTH_SHORT).show());
    }

    String appVersion() {
        try {
            return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (PackageManager.NameNotFoundException exception) {
            return "2.0.0";
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_NOTIFICATIONS) {
            notifyWebPermissionState(hasNotificationPermission());
        } else if (requestCode == REQUEST_AUDIO) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                beginSpeechRecognition();
            } else {
                notifySpeechError("برای تمرین گفتاری باید اجازه میکروفون فعال باشد");
            }
        }
    }

    private void notifyWebPermissionState(boolean granted) {
        if (webView == null) return;
        runOnUiThread(() -> webView.evaluateJavascript(
                "window.onNotificationPermissionChanged && window.onNotificationPermissionChanged(" + granted + ")",
                null
        ));
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
                webView.evaluateJavascript(
                        "window.receiveImportedBackup && window.receiveImportedBackup(" + quoted + ")",
                        null
                );
            }
        } catch (Exception exception) {
            showToast("خواندن یا ذخیره فایل انجام نشد");
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
        if (webView == null || webView.getVisibility() != View.VISIBLE) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
                "Boolean(window.androidBack && window.androidBack())",
                value -> {
                    if (!"true".equals(value)) finish();
                }
        );
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        if (speechRecognizer != null) {
            speechRecognizer.cancel();
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        if (webView != null) {
            webView.removeJavascriptInterface("GhazalAndroid");
            webView.destroy();
        }
        super.onDestroy();
    }
}
