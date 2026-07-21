export const PROVIDER_SPECIALTY_OPTIONS_KEY = 'PROVIDER_SPECIALTY_OPTIONS';

/** Select value when the user enters a custom specialty name. */
export const PROVIDER_SPECIALTY_OTHER_VALUE = '__other__';

export function parseProviderSpecialtyOptions(raw: string | undefined | null): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map((item) => String(item).trim()).filter(Boolean))];
  } catch {
    return [];
  }
}

export function serializeProviderSpecialtyOptions(options: string[]): string {
  const unique = [...new Set(options.map((s) => s.trim()).filter(Boolean))];
  return JSON.stringify(unique);
}

export function normalizeSpecialties(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
}
