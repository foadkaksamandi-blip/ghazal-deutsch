package com.foad.ghazaldeutsch;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import java.util.Calendar;

public final class NotificationScheduler {
    public static final String CHANNEL_ID = "ghazal_daily_learning";
    private static final String PREFS = "notification_settings";
    private static final String KEY_ENABLED = "enabled";
    private static final String KEY_HOUR = "hour";
    private static final String KEY_MINUTE = "minute";
    private static final String KEY_TITLE = "title";
    private static final String KEY_BODY = "body";
    private static final int REQUEST_CODE = 7842;

    private NotificationScheduler() {}

    public static void scheduleDaily(Context context, int hour, int minute, String title, String body) {
        int safeHour = Math.max(0, Math.min(23, hour));
        int safeMinute = Math.max(0, Math.min(59, minute));
        String safeTitle = title == null || title.trim().isEmpty() ? "GHAZAL" : title;
        String safeBody = body == null || body.trim().isEmpty()
                ? "وقت تمرین کوتاه آلمانی رسیده است."
                : body;

        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_ENABLED, true)
                .putInt(KEY_HOUR, safeHour)
                .putInt(KEY_MINUTE, safeMinute)
                .putString(KEY_TITLE, safeTitle)
                .putString(KEY_BODY, safeBody)
                .apply();

        Calendar next = Calendar.getInstance();
        next.set(Calendar.HOUR_OF_DAY, safeHour);
        next.set(Calendar.MINUTE, safeMinute);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (next.getTimeInMillis() <= System.currentTimeMillis()) {
            next.add(Calendar.DAY_OF_YEAR, 1);
        }

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    next.getTimeInMillis(),
                    pendingIntent(context, safeTitle, safeBody)
            );
        }
    }

    public static void rescheduleFromPreferences(Context context) {
        SharedPreferences preferences = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!preferences.getBoolean(KEY_ENABLED, false)) return;
        scheduleDaily(
                context,
                preferences.getInt(KEY_HOUR, 19),
                preferences.getInt(KEY_MINUTE, 0),
                preferences.getString(KEY_TITLE, "GHAZAL"),
                preferences.getString(KEY_BODY, "وقت تمرین کوتاه آلمانی رسیده است.")
        );
    }

    public static void cancel(Context context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_ENABLED, false)
                .apply();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            alarmManager.cancel(pendingIntent(context, "", ""));
        }
    }

    private static PendingIntent pendingIntent(Context context, String title, String body) {
        Intent intent = new Intent(context, NotificationReceiver.class)
                .putExtra("title", title)
                .putExtra("body", body);
        return PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
