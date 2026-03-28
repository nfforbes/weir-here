/**
 * Turn API / catch / mistaken DOM Event values into a safe string for UI and Redux.
 * Avoids `new Error(event)` → "[object Event]" and invalid React text children.
 */
export function toUserErrorMessage(value: unknown, fallback: string): string {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    const t = value.trim();
    return t || fallback;
  }
  if (value instanceof Error) {
    const m = value.message?.trim();
    return m || fallback;
  }
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    if (typeof rec.error === 'string' && rec.error.trim()) return rec.error.trim();
    if (typeof rec.message === 'string' && rec.message.trim()) return rec.message.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}
