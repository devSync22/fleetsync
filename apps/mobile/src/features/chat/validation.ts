export const MESSAGE_MAX_LENGTH = 1000;

/** Null when the message can be sent; used by the composer and again by the service. */
export function validateMessage(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return 'Type a message first.';
  if (trimmed.length > MESSAGE_MAX_LENGTH) return `Messages can be up to ${MESSAGE_MAX_LENGTH} characters.`;
  return null;
}
