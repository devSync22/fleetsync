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
