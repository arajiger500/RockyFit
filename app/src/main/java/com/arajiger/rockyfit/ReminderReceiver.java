package com.arajiger.rockyfit;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ReminderReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        ReminderScheduler.showWorkoutNotification(context);
        ReminderScheduler.schedule(context);
    }
}
