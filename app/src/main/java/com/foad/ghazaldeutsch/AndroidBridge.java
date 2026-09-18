package com.foad.ghazaldeutsch;

import android.webkit.JavascriptInterface;

import java.lang.ref.WeakReference;

public final class AndroidBridge {
    private final WeakReference<MainActivity> activityReference;

    AndroidBridge(MainActivity activity) {
        activityReference = new WeakReference<>(activity);
    }

    @JavascriptInterface
    public void speak(String text) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.speakGerman(text);
    }

    @JavascriptInterface
    public void stopSpeaking() {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.stopSpeaking();
    }

    @JavascriptInterface
    public void setTextZoom(int percent) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.setTextZoom(percent);
    }

    @JavascriptInterface
    public void setSpeechRate(double rate) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.setSpeechRate((float) rate);
    }

    @JavascriptInterface
    public void startSpeechRecognition(String prompt) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.startSpeechRecognition(prompt);
    }

    @JavascriptInterface
    public void scheduleDailyReminder(int hour, int minute, String title, String body) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.scheduleReminder(hour, minute, title, body);
    }

    @JavascriptInterface
    public void cancelDailyReminder() {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.cancelReminder();
    }

    @JavascriptInterface
    public void requestNotificationPermission() {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.requestNotificationPermission();
    }

    @JavascriptInterface
    public boolean hasNotificationPermission() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.hasNotificationPermission();
    }

    @JavascriptInterface
    public void openNotificationSettings() {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.openNotificationSettings();
    }

    @JavascriptInterface
    public boolean isAppLockEnabled() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.isAppLockEnabled();
    }

    @JavascriptInterface
    public boolean isDeviceSecurityAvailable() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.isDeviceSecurityAvailable();
    }

    @JavascriptInterface
    public void setAppLockEnabled(boolean enabled) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.setAppLockEnabled(enabled);
    }

    @JavascriptInterface
    public void lockNow() {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.lockNow();
    }

    @JavascriptInterface
    public boolean isPrivacyScreenEnabled() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.isPrivacyScreenEnabled();
    }

    @JavascriptInterface
    public void setPrivacyScreenEnabled(boolean enabled) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.setPrivacyScreenEnabled(enabled);
    }

    @JavascriptInterface
    public boolean isDeviceCompromised() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.isDeviceCompromised();
    }

    @JavascriptInterface
    public void exportBackup(String json) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.startBackupExport(json);
    }

    @JavascriptInterface
    public void importBackup() {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.startBackupImport();
    }

    @JavascriptInterface
    public void exportSecureBackup(String json, String passphrase) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.exportSecureBackup(json, passphrase);
    }

    @JavascriptInterface
    public void importSecureBackup(String passphrase) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.importSecureBackup(passphrase);
    }

    @JavascriptInterface
    public void saveSecureSnapshot(String json) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.saveSecureSnapshot(json);
    }

    @JavascriptInterface
    public String loadSecureSnapshot() {
        MainActivity activity = activityReference.get();
        return activity == null ? "" : activity.loadSecureSnapshot();
    }

    @JavascriptInterface
    public void exportProgressPdf(String json) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.exportProgressPdf(json);
    }

    @JavascriptInterface
    public boolean isSpeechRecognitionAvailable() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.isSpeechRecognitionAvailable();
    }

    @JavascriptInterface
    public boolean isTextToSpeechReady() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.isTextToSpeechReady();
    }

    @JavascriptInterface
    public boolean isDebuggableBuild() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.isDebuggableBuild();
    }

    @JavascriptInterface
    public boolean verifyBundledAssets() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.verifyBundledAssets();
    }

    @JavascriptInterface
    public boolean runCryptoSelfTest() {
        MainActivity activity = activityReference.get();
        return activity != null && activity.runCryptoSelfTest();
    }

    @JavascriptInterface
    public String getSecurityReport() {
        MainActivity activity = activityReference.get();
        return activity == null ? "{}" : activity.getSecurityReport();
    }

    @JavascriptInterface
    public void clearSecureSnapshot() {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.clearSecureSnapshot();
    }

    @JavascriptInterface
    public String getDeviceReport() {
        MainActivity activity = activityReference.get();
        return activity == null ? "{}" : activity.getDeviceReport();
    }

    @JavascriptInterface
    public void exportQaEvidence(String json) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.exportQaEvidence(json);
    }

    @JavascriptInterface
    public String getAppVersion() {
        MainActivity activity = activityReference.get();
        return activity == null ? "14.0.0" : activity.appVersion();
    }

    @JavascriptInterface
    public void toast(String message) {
        MainActivity activity = activityReference.get();
        if (activity != null) activity.showToast(message);
    }
}
