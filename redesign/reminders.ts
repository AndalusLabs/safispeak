/* SafiSpeak redesign — daily learning reminder.
   The onboarding asks permission ("My reminders help make learning a habit!");
   this module actually delivers on that promise: one repeating local
   notification at the user's reminder time. Every call is guarded — on web or
   without the native module it silently no-ops. */

import { Platform } from 'react-native';

const REMINDER_MESSAGES = [
  'Yallah! Your Darija words are waiting 🇲🇦',
  'Two minutes of Darija keeps the streak alive!',
  "Safi misses you — let's learn a few words!",
  'Salam! Ready for today’s lesson?',
];

function notif(): any | null {
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications');
  } catch {
    return null;
  }
}

/** Schedule (or reschedule) the daily reminder. time = 'HH:MM'. */
export async function scheduleDailyReminder(time: string): Promise<void> {
  const Notifications = notif();
  if (!Notifications) return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const [h, m] = time.split(':').map((n: string) => parseInt(n, 10));
    const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'SafiSpeak',
        body: msg,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DAILY ?? 'daily',
        hour: Number.isFinite(h) ? h : 20,
        minute: Number.isFinite(m) ? m : 0,
      },
    });
  } catch {
    // reminders must never crash the app
  }
}

/** Remove all scheduled reminders (user turned the toggle off). */
export async function cancelDailyReminder(): Promise<void> {
  const Notifications = notif();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
