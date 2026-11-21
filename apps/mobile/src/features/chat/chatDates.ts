import { isSameDay } from '@/features/trips';
import { formatDate, formatDayMonth, formatTime } from '@/lib/format';

function yesterdayOf(now: Date) {
  const date = new Date(now);
  date.setDate(date.getDate() - 1);
  return date;
}

/** Day divider in a thread: "Today", "Yesterday", "Monday, 19 Oct". */
export function dayLabel(iso: string, now: Date): string {
  if (isSameDay(iso, now)) return 'Today';
  if (isSameDay(iso, yesterdayOf(now))) return 'Yesterday';
  return formatDate(iso);
}

/** Time on a room card: "10:19" today, "Yesterday", then "17 Oct". */
export function roomTimeLabel(iso: string, now: Date): string {
  if (isSameDay(iso, now)) return formatTime(iso);
  if (isSameDay(iso, yesterdayOf(now))) return 'Yesterday';
  return formatDayMonth(iso);
}
