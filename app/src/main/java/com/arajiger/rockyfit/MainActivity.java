package com.arajiger.rockyfit;

import android.Manifest;
import android.app.Activity;
import android.app.TimePickerDialog;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;
import android.content.res.ColorStateList;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int BG = Color.rgb(16, 20, 25);
    private static final int SURFACE = Color.rgb(29, 35, 41);
    private static final int ACCENT = Color.rgb(198, 250, 112);
    private static final int TEXT = Color.rgb(244, 246, 245);
    private static final int SUBTLE = Color.rgb(160, 173, 170);
    private static final int PERMISSION_REQUEST = 42;

    private LinearLayout root;
    private LocalDate selectedDate = LocalDate.now();
    private final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy", Locale.ENGLISH);
    private final DateTimeFormatter shortDate = DateTimeFormatter.ofPattern("EEE d MMM", Locale.ENGLISH);

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        ReminderScheduler.initChannel(this);
        selectedDate = LocalDate.now();
        render();
        requestPermissionOnce();
    }

    @Override public void onResume() {
        super.onResume();
        ReminderScheduler.schedule(this);
    }

    private void requestPermissionOnce() {
        if (Build.VERSION.SDK_INT >= 33 &&
                checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED &&
                !ReminderScheduler.prefs(this).getBoolean("asked_permission", false)) {
            ReminderScheduler.prefs(this).edit().putBoolean("asked_permission", true).apply();
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, PERMISSION_REQUEST);
        }
    }

    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] grants) {
        super.onRequestPermissionsResult(code, permissions, grants);
        if (code == PERMISSION_REQUEST) {
            ReminderScheduler.schedule(this);
            render();
        }
    }

    private int dp(float n) { return (int) (getResources().getDisplayMetrics().density * n + 0.5f); }

    private GradientDrawable background(int fill, int radius) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(fill);
        d.setCornerRadius(dp(radius));
        return d;
    }

    private GradientDrawable outline(int fill) {
        GradientDrawable d = background(fill, 18);
        d.setStroke(dp(1), Color.rgb(54, 65, 67));
        return d;
    }

    private TextView text(String value, float sp, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextColor(color);
        v.setTextSize(sp);
        v.setFontFeatureSettings("kern");
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return v;
    }

    private LinearLayout vertical() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        return l;
    }

    private LinearLayout horizontal() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.HORIZONTAL);
        l.setGravity(Gravity.CENTER_VERTICAL);
        return l;
    }

    private void topMargin(LinearLayout container, View child, int px) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);
        lp.topMargin = dp(px);
        container.addView(child, lp);
    }

    private TextView action(String label, Runnable onClick) {
        TextView b = text(label, 15, TEXT, true);
        b.setGravity(Gravity.CENTER);
        b.setPadding(dp(14), dp(10), dp(14), dp(10));
        b.setBackground(outline(SURFACE));
        b.setOnClickListener(v -> onClick.run());
        return b;
    }

    private LinearLayout card() {
        LinearLayout c = vertical();
        c.setPadding(dp(18), dp(18), dp(18), dp(18));
        c.setBackground(outline(SURFACE));
        return c;
    }

    private String getTime(SharedPreferences p) {
        return String.format(Locale.US, "%02d:%02d", p.getInt(ReminderScheduler.HOUR, 17),
                p.getInt(ReminderScheduler.MINUTE, 0));
    }

    private void render() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);
        root = vertical();
        root.setPadding(dp(20), dp(26), dp(20), dp(40));
        scroll.addView(root);
        setContentView(scroll);

        TextView brand = text("ROCKY  /  FIT", 14, ACCENT, true);
        brand.setLetterSpacing(0.18f);
        root.addView(brand);

        TextView headline = text("Show up. Get stronger.", 28, TEXT, true);
        topMargin(root, headline, 12);
        TextView sub = text("3 strength days + 2 optional easy days · 45 min max", 13, SUBTLE, false);
        topMargin(root, sub, 6);

        LinearLayout nav = horizontal();
        TextView left = action("‹", () -> { selectedDate = selectedDate.minusDays(1); render(); });
        TextView middle = action("TODAY", () -> { selectedDate = LocalDate.now(); render(); });
        TextView right = action("›", () -> { selectedDate = selectedDate.plusDays(1); render(); });
        nav.addView(left, new LinearLayout.LayoutParams(dp(54), dp(44)));
        LinearLayout.LayoutParams mid = new LinearLayout.LayoutParams(0, dp(44), 1);
        mid.leftMargin = dp(8); mid.rightMargin = dp(8);
        nav.addView(middle, mid);
        nav.addView(right, new LinearLayout.LayoutParams(dp(54), dp(44)));
        topMargin(root, nav, 24);

        TextView date = text(selectedDate.format(dateFormat).toUpperCase(Locale.ENGLISH), 12, SUBTLE, true);
        date.setLetterSpacing(0.08f);
        topMargin(root, date, 22);

        WorkoutPlan.Session session = WorkoutPlan.forDate(selectedDate);
        LinearLayout hero = card();
        hero.setBackground(background(WorkoutPlan.isStrength(session) ? ACCENT : SURFACE, 20));
        if (WorkoutPlan.isStrength(session)) {
            hero.addView(text("DORM FULL BODY  /  " + session.name(), 12, BG, true));
            TextView title = text("WORKOUT " + session.name(), 32, BG, true);
            topMargin(hero, title, 6);
            topMargin(hero, text("30–45 min · Warm up 5–8 min · No bench needed", 13, BG, false), 4);
        } else if (session == WorkoutPlan.Session.ACTIVE) {
            hero.addView(text("OPTIONAL MOVEMENT", 12, SUBTLE, true));
            TextView title = text("Easy day", 27, TEXT, true);
            topMargin(hero, title, 6);
            topMargin(hero, text("Walk or move gently. No hard lifting today.", 13, SUBTLE, false), 6);
        } else {
            hero.addView(text("RECOVERY DAY", 12, SUBTLE, true));
            TextView title = text("Rest & recharge", 27, TEXT, true);
            topMargin(hero, title, 6);
            topMargin(hero, text("No workout required. Recover for the next session.", 13, SUBTLE, false), 6);
        }
        topMargin(root, hero, 10);

        if (session != WorkoutPlan.Session.REST) {
            TextView workoutLabel = text(session == WorkoutPlan.Session.ACTIVE ? "OPTIONAL EASY MOVEMENT" : "TODAY'S EXERCISES", 12, SUBTLE, true);
            workoutLabel.setLetterSpacing(0.08f);
            topMargin(root, workoutLabel, 24);
            WorkoutPlan.Exercise[] exercises = WorkoutPlan.exercises(session);
            SharedPreferences prefs = ReminderScheduler.prefs(this);
            int completed = 0;
            for (int i = 0; i < exercises.length; i++) {
                if (prefs.getBoolean("done_" + selectedDate + "_" + i, false)) completed++;
            }
            TextView progress = text(completed + " / " + exercises.length + " completed", 13, ACCENT, true);
            topMargin(root, progress, 7);

            for (int i = 0; i < exercises.length; i++) {
                final int idx = i;
                WorkoutPlan.Exercise exercise = exercises[i];
                LinearLayout row = horizontal();
                row.setPadding(dp(14), dp(13), dp(14), dp(13));
                row.setBackground(outline(SURFACE));
                LinearLayout labels = vertical();
                labels.addView(text(exercise.name, 16, TEXT, true));
                topMargin(labels, text(exercise.detail, 12, SUBTLE, false), 5);
                row.addView(labels, new LinearLayout.LayoutParams(0, -2, 1));
                CheckBox check = new CheckBox(this);
                check.setButtonTintList(new ColorStateList(
                        new int[][] { new int[] { android.R.attr.state_checked }, new int[] {} },
                        new int[] { ACCENT, SUBTLE }));
                String key = "done_" + selectedDate + "_" + idx;
                check.setChecked(prefs.getBoolean(key, false));
                check.setContentDescription("Mark " + exercise.name + " complete");
                check.setOnCheckedChangeListener((b, yes) -> {
                    prefs.edit().putBoolean(key, yes).apply();
                    int count = 0;
                    for (int j = 0; j < exercises.length; j++) {
                        if (prefs.getBoolean("done_" + selectedDate + "_" + j, false)) count++;
                    }
                    progress.setText(count + " / " + exercises.length + " completed");
                });
                row.addView(check);
                topMargin(root, row, 8);
            }
            TextView form = text("Use weights you can control, keep 2–3 reps in reserve, and secure adjustable plates with collars.",
                    12, SUBTLE, false);
            form.setLineSpacing(dp(3), 1);
            topMargin(root, form, 16);
        }

        LocalDate next = WorkoutPlan.nextWorkout(selectedDate);
        LinearLayout upcoming = card();
        upcoming.addView(text("NEXT SESSION", 11, SUBTLE, true));
        topMargin(upcoming, text(next.format(shortDate) + "  ·  Workout " + WorkoutPlan.forDate(next), 17, TEXT, true), 9);
        topMargin(root, upcoming, 26);

        SharedPreferences prefs = ReminderScheduler.prefs(this);
        LinearLayout reminders = card();
        reminders.addView(text("REMINDERS", 12, SUBTLE, true));
        LinearLayout settingRow = horizontal();
        TextView reminderText = text("Workout-day notifications", 15, TEXT, true);
        settingRow.addView(reminderText, new LinearLayout.LayoutParams(0, -2, 1));
        Switch toggle = new Switch(this);
        toggle.setThumbTintList(new ColorStateList(
                new int[][] { new int[] { android.R.attr.state_checked }, new int[] {} },
                new int[] { ACCENT, SUBTLE }));
        toggle.setChecked(prefs.getBoolean(ReminderScheduler.ENABLED, true));
        toggle.setOnCheckedChangeListener((button, enabled) -> {
            prefs.edit().putBoolean(ReminderScheduler.ENABLED, enabled).apply();
            if (enabled && !ReminderScheduler.hasPermission(this) && Build.VERSION.SDK_INT >= 33) {
                requestPermissions(new String[]{ Manifest.permission.POST_NOTIFICATIONS }, PERMISSION_REQUEST);
            }
            ReminderScheduler.schedule(this);
            render();
        });
        settingRow.addView(toggle);
        topMargin(reminders, settingRow, 12);
        TextView time = action("TIME   " + getTime(prefs) + "   CHANGE", () -> {
            TimePickerDialog picker = new TimePickerDialog(this,
                    (view, hour, minute) -> {
                        prefs.edit().putInt(ReminderScheduler.HOUR, hour)
                                .putInt(ReminderScheduler.MINUTE, minute).apply();
                        ReminderScheduler.schedule(this);
                        render();
                    }, prefs.getInt(ReminderScheduler.HOUR, 17),
                    prefs.getInt(ReminderScheduler.MINUTE, 0), true);
            picker.show();
        });
        topMargin(reminders, time, 15);
        TextView hint = text(ReminderScheduler.hasPermission(this)
                ? "Local-time reminder on Mon / Thu / Sat. Android may delay delivery to save battery."
                : "Notification permission is off. Enable it in Android settings if reminders don't appear.",
                12, SUBTLE, false);
        hint.setLineSpacing(dp(2), 1);
        topMargin(reminders, hint, 12);
        topMargin(root, reminders, 12);

        TextView footer = text("NO ACCOUNT   ·   NO ADS   ·   WORKS OFFLINE", 11, SUBTLE, true);
        footer.setGravity(Gravity.CENTER);
        footer.setLetterSpacing(0.10f);
        topMargin(root, footer, 30);
    }
}
