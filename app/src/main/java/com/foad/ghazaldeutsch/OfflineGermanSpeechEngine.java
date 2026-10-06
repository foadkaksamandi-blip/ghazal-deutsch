package com.foad.ghazaldeutsch;

import android.content.Context;
import android.content.res.AssetManager;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONArray;
import org.json.JSONObject;
import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class OfflineGermanSpeechEngine {
    interface Callback {
        void onState(String state, String message);
        void onResult(String text);
        void onError(String message);
    }

    private static final String MODEL_ASSET = "vosk-model-small-de-0.15";
    private static final String MODEL_VERSION = "de-small-0.15";
    private static final String HINT_PREFIX = "GHZ_HINT|";
    private static final float SAMPLE_RATE = 16000.0f;
    private static final int LISTEN_TIMEOUT_MS = 9000;

    private final Context context;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final Object lock = new Object();

    private Model model;
    private SpeechService speechService;
    private Recognizer recognizer;
    private boolean destroyed;
    private int generation;

    OfflineGermanSpeechEngine(Context context) {
        this.context = context.getApplicationContext();
    }

    void start(Callback callback) {
        start("", callback);
    }

    void start(String hint, Callback callback) {
        final int current;
        synchronized (lock) {
            if (destroyed) {
                callback.onError("موتور گفتار آفلاین بسته شده است");
                return;
            }
            generation++;
            current = generation;
            stopSessionLocked();
        }
        callback.onState("preparing", "موتور آفلاین آلمانی در حال آماده‌شدن…");
        worker.execute(() -> prepareAndListen(current, hint, callback));
    }

    private void prepareAndListen(int current, String hint, Callback callback) {
        try {
            Model readyModel = ensureModel(callback);
            boolean lessonMode = hasLessonHint(hint);
            synchronized (lock) {
                if (destroyed || current != generation) return;

                // The small German 0.15 model is more reliable for natural multi-part
                // sentences when we keep its full vocabulary graph. The lesson hint is
                // used to rank N-best hypotheses instead of constraining the decoder.
                recognizer = new Recognizer(readyModel, SAMPLE_RATE);
                if (lessonMode) recognizer.setMaxAlternatives(5);
                recognizer.setWords(true);
                recognizer.setPartialWords(true);
                speechService = new SpeechService(recognizer, SAMPLE_RATE);
            }
            main.post(() -> {
                synchronized (lock) {
                    if (destroyed || current != generation || speechService == null) return;
                    callback.onState("ready", lessonMode
                            ? "تشخیص آفلاین کامل با الگوی همین درس آماده است؛ شروع کن"
                            : "تشخیص گفتار آفلاین آماده است؛ شروع کن");
                    final StringBuilder transcript = new StringBuilder();
                    final String[] lastPartial = new String[]{""};
                    boolean started = speechService.startListening(new RecognitionListener() {
                        private void appendSegment(String text) {
                            String clean = text == null ? "" : text.trim();
                            if (clean.isEmpty()) return;
                            if (transcript.length() > 0) transcript.append(' ');
                            transcript.append(clean);
                        }

                        private String combined(String tail) {
                            String cleanTail = tail == null ? "" : tail.trim();
                            if (transcript.length() == 0) return cleanTail;
                            if (cleanTail.isEmpty()) return transcript.toString().trim();
                            return (transcript.toString() + " " + cleanTail).trim();
                        }

                        @Override public void onPartialResult(String hypothesis) {
                            if (!isCurrent(current)) return;
                            String partial = jsonText(hypothesis, "partial");
                            lastPartial[0] = partial;
                            String live = combined(partial);
                            if (!live.isEmpty()) callback.onState("listening", "شنیدم: " + live);
                        }

                        @Override public void onResult(String hypothesis) {
                            if (!isCurrent(current)) return;
                            String text = bestText(hypothesis, hint);
                            if (text.isEmpty()) return;
                            appendSegment(text);
                            lastPartial[0] = "";
                            callback.onState("listening", "شنیدم تا اینجا: " + transcript.toString().trim());
                        }

                        @Override public void onFinalResult(String hypothesis) {
                            if (!isCurrent(current)) return;
                            String text = bestText(hypothesis, hint);
                            appendSegment(text);
                            String complete = transcript.toString().trim();
                            if (!complete.isEmpty()) finishWithResult(current, callback, complete);
                            else finishWithError(current, callback, "صدایی به متن تبدیل نشد؛ دوباره واضح‌تر بگو");
                        }

                        @Override public void onError(Exception exception) {
                            if (!isCurrent(current)) return;
                            String detail = exception == null ? "" : String.valueOf(exception.getMessage());
                            String message = detail.toLowerCase(Locale.ROOT).contains("microphone")
                                    ? "میکروفون در اختیار برنامه دیگری است؛ آن را ببند و دوباره امتحان کن"
                                    : "موتور گفتار آفلاین نتوانست صدا را دریافت کند؛ دوباره امتحان کن";
                            finishWithError(current, callback, message);
                        }

                        @Override public void onTimeout() {
                            if (!isCurrent(current)) return;
                            String complete = combined(lastPartial[0]);
                            if (!complete.isEmpty()) finishWithResult(current, callback, complete);
                            else finishWithError(current, callback, "زمان شنیدن تمام شد؛ جمله را دوباره بگو");
                        }
                    }, LISTEN_TIMEOUT_MS);
                    if (!started) finishWithError(current, callback, "میکروفون شروع نشد؛ دوباره امتحان کن");
                }
            });
        } catch (Exception exception) {
            main.post(() -> {
                if (!isCurrent(current)) return;
                finishWithError(current, callback, "موتور آفلاین آلمانی آماده نشد؛ نسخه برنامه را دوباره نصب کن");
            });
        }
    }

    private static boolean hasLessonHint(String hint) {
        return hint != null && hint.startsWith(HINT_PREFIX) && !hint.substring(HINT_PREFIX.length()).trim().isEmpty();
    }

    private static List<String> hintAnchors(String hint) {
        List<String> anchors = new ArrayList<>();
        if (!hasLessonHint(hint)) return anchors;

        String raw = hint.substring(HINT_PREFIX.length()).trim();
        String prepared = raw.toLowerCase(Locale.GERMAN)
                .replace('…', ' ')
                .replaceAll("\\.{2,}", " / ")
                .replaceAll("[^\\p{L}\\p{N}äöüßÄÖÜ/\\- ]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        for (String part : prepared.split("/")) {
            String clean = normalizeGerman(part);
            if (!clean.isEmpty() && clean.split(" ").length >= 2) anchors.add(clean);
        }
        return anchors;
    }

    private static String normalizeGerman(String value) {
        if (value == null) return "";
        return value.toLowerCase(Locale.GERMAN)
                .replace("ß", "ss")
                .replaceAll("[^\\p{L}\\p{N}äöü ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static int orderedAnchorMatches(String text, List<String> anchors) {
        if (anchors.isEmpty()) return 0;
        String normalized = normalizeGerman(text);
        int cursor = 0;
        int matched = 0;
        for (String anchor : anchors) {
            int at = normalized.indexOf(anchor, cursor);
            if (at < 0) continue;
            matched++;
            cursor = at + anchor.length();
        }
        return matched;
    }

    private static int anchorTokenOverlap(String text, List<String> anchors) {
        String normalized = " " + normalizeGerman(text) + " ";
        int overlap = 0;
        for (String anchor : anchors) {
            for (String token : anchor.split(" ")) {
                if (!token.isEmpty() && normalized.contains(" " + token + " ")) overlap++;
            }
        }
        return overlap;
    }

    private static double lessonRelevance(String text, String hint, double confidence) {
        List<String> anchors = hintAnchors(hint);
        if (anchors.isEmpty()) return confidence;
        return orderedAnchorMatches(text, anchors) * 1000.0
                + anchorTokenOverlap(text, anchors) * 20.0
                + confidence;
    }

    private static String bestText(String hypothesis, String hint) {
        if (hypothesis == null || hypothesis.trim().isEmpty()) return "";
        try {
            JSONObject root = new JSONObject(hypothesis);
            String direct = root.optString("text", "").trim();
            JSONArray alternatives = root.optJSONArray("alternatives");
            if (alternatives == null || alternatives.length() == 0) return direct;

            String best = direct;
            double bestScore = direct.isEmpty() ? Double.NEGATIVE_INFINITY : lessonRelevance(direct, hint, 0.0);
            for (int i = 0; i < alternatives.length(); i++) {
                JSONObject alternative = alternatives.optJSONObject(i);
                if (alternative == null) continue;
                String text = alternative.optString("text", "").trim();
                if (text.isEmpty()) continue;
                double confidence = alternative.optDouble("confidence", 0.0);
                double score = lessonRelevance(text, hint, confidence);
                if (score > bestScore) {
                    bestScore = score;
                    best = text;
                }
            }
            return best;
        } catch (Exception ignored) {
            return "";
        }
    }

    private Model ensureModel(Callback callback) throws IOException {
        synchronized (lock) {
            if (model != null) return model;
        }
        File root = new File(context.getFilesDir(), "vosk/" + MODEL_VERSION);
        File marker = new File(root, ".ready");
        File finalModel = new File(root, MODEL_ASSET);
        if (!marker.isFile() || !new File(finalModel, "am/final.mdl").isFile()) {
            deleteRecursively(root);
            if (!root.mkdirs() && !root.isDirectory()) throw new IOException("Cannot create model directory");
            main.post(() -> callback.onState("preparing", "در حال آماده‌سازی مدل آلمانی داخل گوشی…"));
            copyAssetTree(context.getAssets(), MODEL_ASSET, finalModel);
            if (!new File(finalModel, "am/final.mdl").isFile() || !new File(finalModel, "conf/mfcc.conf").isFile()) {
                throw new IOException("Incomplete German model");
            }
            try (FileOutputStream out = new FileOutputStream(marker)) {
                out.write(MODEL_VERSION.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }
        }
        Model loaded = new Model(finalModel.getAbsolutePath());
        synchronized (lock) {
            if (destroyed) {
                loaded.close();
                throw new IOException("Engine destroyed");
            }
            if (model == null) model = loaded;
            else loaded.close();
            return model;
        }
    }

    private static void deleteRecursively(File file) throws IOException {
        if (file == null || !file.exists()) return;
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children == null) throw new IOException("Cannot list directory " + file.getAbsolutePath());
            for (File child : children) deleteRecursively(child);
        }
        if (!file.delete() && file.exists()) throw new IOException("Cannot delete " + file.getAbsolutePath());
    }

    private static void copyAssetTree(AssetManager assets, String assetPath, File destination) throws IOException {
        String[] children = assets.list(assetPath);
        if (children == null) throw new IOException("Cannot list asset " + assetPath);
        if (children.length == 0) {
            File parent = destination.getParentFile();
            if (parent != null && !parent.isDirectory() && !parent.mkdirs()) throw new IOException("Cannot create asset directory");
            try (InputStream input = assets.open(assetPath); OutputStream output = new FileOutputStream(destination)) {
                byte[] buffer = new byte[64 * 1024];
                int read;
                while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
            }
            return;
        }
        if (!destination.isDirectory() && !destination.mkdirs()) throw new IOException("Cannot create asset tree");
        for (String child : children) {
            copyAssetTree(assets, assetPath + "/" + child, new File(destination, child));
        }
    }

    private static String jsonText(String json, String key) {
        if (json == null || json.trim().isEmpty()) return "";
        try { return new JSONObject(json).optString(key, "").trim(); }
        catch (Exception ignored) { return ""; }
    }

    private boolean isCurrent(int current) {
        synchronized (lock) { return !destroyed && current == generation; }
    }

    private void finishWithResult(int current, Callback callback, String text) {
        synchronized (lock) {
            if (destroyed || current != generation) return;
            generation++;
            stopSessionLocked();
        }
        callback.onState("done", "");
        callback.onResult(text);
    }

    private void finishWithError(int current, Callback callback, String message) {
        synchronized (lock) {
            if (destroyed || current != generation) return;
            generation++;
            stopSessionLocked();
        }
        callback.onState("idle", "");
        callback.onError(message);
    }

    void stop() {
        synchronized (lock) {
            generation++;
            stopSessionLocked();
        }
    }

    private void stopSessionLocked() {
        if (speechService != null) {
            try { speechService.cancel(); } catch (Exception ignored) { }
            try { speechService.shutdown(); } catch (Exception ignored) { }
            speechService = null;
        }
        if (recognizer != null) {
            try { recognizer.close(); } catch (Exception ignored) { }
            recognizer = null;
        }
    }

    void shutdown() {
        synchronized (lock) {
            if (destroyed) return;
            destroyed = true;
            generation++;
            stopSessionLocked();
            if (model != null) {
                try { model.close(); } catch (Exception ignored) { }
                model = null;
            }
        }
        worker.shutdownNow();
    }

    static boolean bundledModelExpected() {
        return true;
    }
}
