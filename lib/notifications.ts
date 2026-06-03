/**
 * Push notification scheduling. Everything here is defensive: it no-ops on
 * web / simulators / denied permission rather than throwing, so screens that
 * call it never crash.
 *
 * Notifications are scheduled with native triggers, so they fire without the
 * app open (laundry timers, the Sunday grocery review, the weekly laundry day).
 */
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { DeliveryTime } from '@/stores/userStore';
import { weekdayName } from '@/lib/date';

let handlerSet = false;

export function configureNotificationHandler() {
  if (handlerSet || Platform.OS === 'web') return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !Device.isDevice) return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  } catch {
    return false;
  }
}

async function schedule(
  content: Notifications.NotificationContentInput,
  trigger: Notifications.NotificationTriggerInput,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    return await Notifications.scheduleNotificationAsync({ content, trigger });
  } catch {
    return null;
  }
}

// ── Laundry stage timers ──────────────────────────────────────────────────

export function scheduleLaundryStageDone(
  stage: 'wash' | 'dry',
  secondsFromNow: number,
): Promise<string | null> {
  const body =
    stage === 'wash'
      ? 'wash is done — pop it in the dryer when you can.'
      : "dry's finished — fold while it's warm.";
  return schedule(
    { title: 'laundry', body },
    {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(secondsFromNow)),
      repeats: false,
    },
  );
}

// ── Weekly laundry-day reminder ─────────────────────────────────────────────

export function scheduleLaundryDay(day: number, hour = 10): Promise<string | null> {
  return schedule(
    { title: 'laundry day', body: `it's ${weekdayName(day).toLowerCase()} — a good day for a load.` },
    {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: ((day % 7) + 7) % 7 + 1, // expo weekday: 1 = Sunday
      hour,
      minute: 0,
    },
  );
}

// ── Sunday grocery review ───────────────────────────────────────────────────

/**
 * Smart review time = desired delivery − store delivery estimate − 10 min buffer.
 * Returns the weekday/hour/minute to notify at.
 */
export function computeReviewTime(
  delivery: DeliveryTime,
  storeEstimateMin = 45,
): { weekday: number; hour: number; minute: number } {
  let total = delivery.hour * 60 + delivery.minute - storeEstimateMin - 10;
  let day = delivery.day;
  while (total < 0) {
    total += 24 * 60;
    day = (day + 6) % 7; // previous day
  }
  return { weekday: (day % 7) + 1, hour: Math.floor(total / 60), minute: total % 60 };
}

export function scheduleGroceryReview(delivery: DeliveryTime): Promise<string | null> {
  const { weekday, hour, minute } = computeReviewTime(delivery);
  return schedule(
    { title: 'groceries', body: 'your grocery order is ready to review.' },
    {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
    },
  );
}

export async function cancelAllScheduled(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* ignore */
  }
}
