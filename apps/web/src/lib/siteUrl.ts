/**
 * Public site URL for metadata, sitemap, robots, and canonical resolution.
 */
const FALLBACK = 'https://weirheresolutions.com';

export function getPublicSiteUrl(): string {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw) return FALLBACK;
  try {
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    return FALLBACK;
  }
}

export function getSiteOrigin(): string {
  try {
    return new URL(getPublicSiteUrl()).origin;
  } catch {
    return 'https://weirheresolutions.com';
  }
}

/** Use with root `metadataBase`: relative `canonical` resolves to absolute URLs. */
export function withCanonical(
  pathname: string,
): { alternates: { canonical: string } } {
  const path =
    pathname === '/' || pathname === ''
      ? '/'
      : pathname.startsWith('/')
        ? pathname
        : `/${pathname}`;
  return { alternates: { canonical: path } };
}
