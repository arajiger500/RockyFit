package com.arajiger.rockyfit;

import java.time.DayOfWeek;
import java.time.LocalDate;

/** Dorm-friendly, bench-free plan. Monday/Thursday/Saturday strength; optional Tue/Fri movement. */
public final class WorkoutPlan {
    public static final class Exercise {
        public final String name;
        public final String detail;
        Exercise(String name, String detail) {
            this.name = name;
            this.detail = detail;
        }
    }
    public enum Session { A, B, C, ACTIVE, REST }

    private WorkoutPlan() {}

    public static boolean isStrength(Session session) {
        return session == Session.A || session == Session.B || session == Session.C;
    }

    public static Session forDate(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        switch (day) {
            case MONDAY: return Session.A;
            case TUESDAY: return Session.ACTIVE;
            case THURSDAY: return Session.B;
            case FRIDAY: return Session.ACTIVE;
            case SATURDAY: return Session.C;
            default: return Session.REST;
        }
    }

    public static LocalDate nextWorkout(LocalDate date) {
        LocalDate candidate = date.plusDays(1);
        while (!isStrength(forDate(candidate))) candidate = candidate.plusDays(1);
        return candidate;
    }

    public static Exercise[] exercises(Session session) {
        if (session == Session.A) {
            return new Exercise[] {
                new Exercise("Bodyweight or goblet squat", "2 sets × 8–12 reps · 75s rest"),
                new Exercise("Dumbbell floor press", "2 sets × 8–12 reps · 75s rest"),
                new Exercise("One-arm dumbbell row", "2 sets × 8–12 per side · 75s rest"),
                new Exercise("Dumbbell Romanian deadlift", "2 sets × 8–12 reps · 75s rest"),
                new Exercise("Standing calf raise", "2 sets × 12–15 reps · 45s rest"),
                new Exercise("Dead bug", "2 sets × 6–10 per side · 45s rest")
            };
        }
        if (session == Session.B) {
            return new Exercise[] {
                new Exercise("Supported split squat", "2 sets × 6–10 per leg · 75s rest"),
                new Exercise("Wall or sturdy-desk push-up", "2 sets × 6–12 reps · 75s rest"),
                new Exercise("Bent-over dumbbell row", "2 sets × 8–12 reps · 75s rest"),
                new Exercise("Glute bridge", "2 sets × 12–15 reps · 60s rest"),
                new Exercise("Dumbbell curl (if manageable)", "2 sets × 8–12 reps · 60s rest"),
                new Exercise("Bird dog", "2 sets × 8 per side · 45s rest")
            };
        }
        if (session == Session.C) {
            return new Exercise[] {
                new Exercise("Bodyweight or goblet squat", "2 sets × 8–12 reps · 75s rest"),
                new Exercise("Single-arm dumbbell floor press", "2 sets × 8–12 per side · 75s rest"),
                new Exercise("One-arm dumbbell row", "2 sets × 8–12 per side · 75s rest"),
                new Exercise("Dumbbell Romanian deadlift", "2 sets × 10–12 reps · 75s rest"),
                new Exercise("Close-grip wall push-up", "2 sets × 8–12 reps · 60s rest"),
                new Exercise("Side plank from knees", "2 sets × 15–25 sec per side · 45s rest")
            };
        }
        if (session == Session.ACTIVE) {
            return new Exercise[] {
                new Exercise("Easy walk (optional)", "10–20 min · comfortable pace"),
                new Exercise("Gentle mobility (optional)", "5–8 min · no forcing range"),
                new Exercise("Relaxed stretching (optional)", "3–5 min · stop if painful")
            };
        }
        return new Exercise[0];
    }
}
