/**
 * Display formatters matching the Figma frames. Pure functions, no locale APIs,
 * so the output is identical on Hermes (Android/iOS) and web.
 */

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Adds thousands separators: 1200 → "1,200", 2.5 → "2.5". */
function groupThousands(value: number, fractionDigits = 0): string {
  const [whole, fraction] = Math.abs(value).toFixed(fractionDigits).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${value < 0 ? '-' : ''}${grouped}${fraction ? `.${fraction}` : ''}`;
}

/** Plain number with thousands separators: 84274 → "84,274". */
export function formatNumber(value: number): string {
  return groupThousands(value, Number.isInteger(value) ? 0 : 1);
}

/** Sri Lankan rupees: 12500 → "LKR 12,500"; 12500.5 → "LKR 12,500.50". */
export function formatLKR(amount: number): string {
  const hasCents = !Number.isInteger(amount);
  return `LKR ${groupThousands(amount, hasCents ? 2 : 0)}`;
}

/**
 * Date as shown in the mobile frames.
 * - `long` (default): "Monday, 19 Oct"
 * - `short`: "Wed 22 Oct"
 */
export function formatDate(value: DateInput, style: 'long' | 'short' = 'long'): string {
  const date = toDate(value);
  const weekday = WEEKDAYS[date.getDay()];
  const dayMonth = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return style === 'short' ? `${weekday.slice(0, 3)} ${dayMonth}` : `${weekday}, ${dayMonth}`;
}

/** 24-hour time: "09:30". */
export function formatTime(value: DateInput): string {
  const date = toDate(value);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Kilometres: 38 → "38 km", 1200 → "1,200 km", 2.45 → "2.5 km". */
export function formatDistance(km: number): string {
  const fractionDigits = Number.isInteger(km) ? 0 : 1;
  return `${groupThousands(km, fractionDigits)} km`;
}

/** Tonnes: 2.1 → "2.1 t", 3.5 → "3.5 t", 4 → "4 t". */
export function formatWeight(tonnes: number): string {
  const fractionDigits = Number.isInteger(tonnes) ? 0 : 1;
  return `${groupThousands(tonnes, fractionDigits)} t`;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Full month name: "October". */
export function formatMonth(value: DateInput): string {
  return MONTH_NAMES[toDate(value).getMonth()];
}

/** Day and month: "17 Oct". */
export function formatDayMonth(value: DateInput): string {
  const date = toDate(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** Day, month and year: "14 Aug 2028". */
export function formatFullDate(value: DateInput): string {
  const date = toDate(value);
  return `${formatDayMonth(date)} ${date.getFullYear()}`;
}

/** Short month and year: "Mar 2023". */
export function formatMonthYear(value: DateInput): string {
  const date = toDate(value);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Date and time: "17 Oct 2026, 10:12", or "17 Oct, 10:12" without the year. */
export function formatDateTime(value: DateInput, { withYear = true }: { withYear?: boolean } = {}): string {
  const date = toDate(value);
  const year = withYear ? ` ${date.getFullYear()}` : '';
  return `${formatDayMonth(date)}${year}, ${formatTime(date)}`;
}

/** File size as shown in upload lists: 655360 → "640 KB", 1153434 → "1.1 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
