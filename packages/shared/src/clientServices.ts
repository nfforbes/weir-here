export const CLIENT_SERVICE_OPTIONS_KEY = 'CLIENT_SERVICE_OPTIONS';

/** Select value when the user enters a custom service name. */
export const CLIENT_SERVICE_OTHER_VALUE = '__other__';

export function parseClientServiceOptions(raw: string | undefined | null): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map((item) => String(item).trim()).filter(Boolean))];
  } catch {
    return [];
  }
}

export function serializeClientServiceOptions(options: string[]): string {
  const unique = [...new Set(options.map((s) => s.trim()).filter(Boolean))];
  return JSON.stringify(unique);
}
