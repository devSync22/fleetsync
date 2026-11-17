/** "Good morning" before 12:00, "Good afternoon" before 17:00, then "Good evening". */
export function greetingFor(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** First word of the full name: "Kasun Jayasinghe" → "Kasun". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
