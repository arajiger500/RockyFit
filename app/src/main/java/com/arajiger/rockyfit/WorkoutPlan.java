package com.arajiger.rockyfit;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

/** Deterministic workouts based on the calendar, no server or account required. */
public final class WorkoutPlan {
    public static final LocalDate FIRST_MONDAY = LocalDate.of(2026, 10, 19);

    public static final class Exercise {
        public final String name;
        public final String detail;
        Exercise(String name, String detail) {
            this.name = name;
            this.detail = detail;
        }
    }

    public enum Session { A, B, REST }

    private WorkoutPlan() {}

    public static Session forDate(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        if (day != DayOfWeek.MONDAY && day != DayOfWeek.THURSDAY && day != DayOfWeek.SATURDAY) {
            return Session.REST;
        }
        LocalDate monday = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        long weeks = ChronoUnit.WEEKS.between(FIRST_MONDAY, monday);
        boolean evenWeek = Math.floorMod(weeks, 2) == 0;
        boolean aDay = day == DayOfWeek.THURSDAY ? !evenWeek : evenWeek;
        return aDay ? Session.A : Session.B;
    }

    public static LocalDate nextWorkout(LocalDate date) {
        LocalDate candidate = date.plusDays(1);
        while (forDate(candidate) == Session.REST) candidate = candidate.plusDays(1);
        return candidate;
    }

    public static Exercise[] exercises(Session session) {
        if (session == Session.A) {
            return new Exercise[] {
                new Exercise("Leg press", "2 sets  ×  10–12 reps  ·  90s rest"),
                new Exercise("Chest press", "2 sets  ×  8–12 reps  ·  90s rest"),
                new Exercise("Lat pulldown", "2 sets  ×  8–12 reps  ·  90s rest"),
                new Exercise("Seated leg curl", "2 sets  ×  10–12 reps  ·  60s rest"),
                new Exercise("Seated cable row", "2 sets  ×  10–12 reps  ·  60s rest"),
                new Exercise("Plank", "2 sets  ×  20–30 seconds  ·  45s rest")
            };
        }
        if (session == Session.B) {
            return new Exercise[] {
                new Exercise("Leg press", "2 sets  ×  10–12 reps  ·  90s rest"),
                new Exercise("Incline chest press", "2 sets  ×  8–12 reps  ·  90s rest"),
                new Exercise("Seated cable row", "2 sets  ×  10–12 reps  ·  90s rest"),
                new Exercise("Glute bridge", "2 sets  ×  10–15 reps  ·  60s rest"),
                new Exercise("Dumbbell shoulder press", "2 sets  ×  8–12 reps  ·  60s rest"),
                new Exercise("Biceps curls", "2 sets  ×  10–15 reps  ·  60s rest")
            };
        }
        return new Exercise[0];
    }
}
