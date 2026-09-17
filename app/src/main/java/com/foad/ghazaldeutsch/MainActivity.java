package com.foad.ghazaldeutsch;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int REQUEST_NOTIFICATIONS = 4101;
    private static final int REQUEST_EXPORT = 4102;
    private static final int REQUEST_IMPORT = 4103;
    private static final int MAX_BACKUP_BYTES = 2_000_000;

    private WebView webView;
    private TextToSpeech textToSpeech;
    private String pendingBackupJson;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureSystemBars();
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
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    void speakGerman(String text) {
        if (text == null || text.trim().isEmpty() || textToSpeech == null) {
            return;
        }
        runOnUiThread(() -> textToSpeech.speak(
                text,
                TextToSpeech.QUEUE_FLUSH,
                null,
                "ghazal-deutsch-utterance"
        ));
    }

    void stopSpeaking() {
        if (textToSpeech != null) {
            runOnUiThread(() -> textToSpeech.stop());
        }
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
            return "1.0.0";
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_NOTIFICATIONS) {
            notifyWebPermissionState(hasNotificationPermission());
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
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
                "Boolean(window.androidBack && window.androidBack())",
                value -> {
                    if (!"true".equals(value)) {
                        finish();
                    }
                }
        );
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        if (webView != null) {
            webView.removeJavascriptInterface("GhazalAndroid");
            webView.destroy();
        }
        super.onDestroy();
    }
}
