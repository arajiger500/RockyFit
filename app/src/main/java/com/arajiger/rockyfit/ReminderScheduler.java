package com.arajiger.rockyfit;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class ReminderScheduler {
    static final String PREFS = "rockyfit_prefs";
    static final String ENABLED = "reminders_enabled";
    static final String HOUR = "reminder_hour";
    static final String MINUTE = "reminder_minute";
    private static final String CHANNEL = "training_reminders";
    private static final int ID = 4200;

    private ReminderScheduler() {}

    static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void initChannel(Context context) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL, "Workout reminders", NotificationManager.IMPORTANCE_DEFAULT);
            channel.setDescription("Reminders for your Monday, Thursday and Saturday workouts");
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            manager.createNotificationChannel(channel);
        }
    }

    private static PendingIntent pending(Context context) {
        Intent intent = new Intent(context, ReminderReceiver.class);
        return PendingIntent.getBroadcast(context, 300, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static boolean hasPermission(Context context) {
        return Build.VERSION.SDK_INT < 33 ||
                context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    public static void schedule(Context context) {
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null) return;
        PendingIntent intent = pending(context);
        alarms.cancel(intent);
        SharedPreferences prefs = prefs(context);
        if (!prefs.getBoolean(ENABLED, true) || !hasPermission(context)) return;

        ZoneId zone = ZoneId.systemDefault();
        ZonedDateTime now = ZonedDateTime.now(zone);
        LocalTime desired = LocalTime.of(prefs.getInt(HOUR, 17), prefs.getInt(MINUTE, 0));
        LocalDate day = now.toLocalDate();
        ZonedDateTime when = LocalDateTime.of(day, desired).atZone(zone);
        if (!when.isAfter(now.plusMinutes(1)) || !WorkoutPlan.isStrength(WorkoutPlan.forDate(day))) {
            day = WorkoutPlan.nextWorkout(day);
            when = LocalDateTime.of(day, desired).atZone(zone);
        }
        // Inexact alarm: Android battery management may delay it.
        alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when.toInstant().toEpochMilli(), intent);
    }

    public static void showWorkoutNotification(Context context) {
        if (!prefs(context).getBoolean(ENABLED, true) || !hasPermission(context)) return;
        WorkoutPlan.Session session = WorkoutPlan.forDate(LocalDate.now());
        if (!WorkoutPlan.isStrength(session)) return;
        initChannel(context);
        Intent openApp = new Intent(context, MainActivity.class);
        openApp.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent action = PendingIntent.getActivity(context, 301, openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification notification = new Notification.Builder(context, CHANNEL)
                .setSmallIcon(com.arajiger.rockyfit.R.drawable.ic_barbell)
                .setContentTitle("RockyFit · Workout " + session)
                .setContentText("Your 30–45 min dorm workout is ready. Tap for exercises.")
                .setContentIntent(action)
                .setAutoCancel(true)
                .build();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(ID, notification);
    }
}
