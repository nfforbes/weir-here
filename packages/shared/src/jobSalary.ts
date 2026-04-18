import type { ISalaryRange } from './types';

/** True when a job should show a salary range (omitted when both bounds are zero / unset). */
export function jobHasDisplayableSalary(
  salaryRange: ISalaryRange | null | undefined,
): boolean {
  if (!salaryRange) return false;
  const min = Number(salaryRange.min);
  const max = Number(salaryRange.max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
  return min !== 0 || max !== 0;
}

/** Plain-text salary line for chips and mobile, or `null` when none should be shown. */
export function formatJobSalaryPlain(
  salaryRange: ISalaryRange | null | undefined,
): string | null {
  if (!salaryRange || !jobHasDisplayableSalary(salaryRange)) return null;
  const { currency, min, max } = salaryRange;
  return `${currency} ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`;
}
