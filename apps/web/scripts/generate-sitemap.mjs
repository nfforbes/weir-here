import fs from 'node:fs/promises';
import path from 'node:path';

const FALLBACK_BASE = 'https://weirheresolutions.com';

function getBaseUrl() {
  const raw = (process.env.APP_BASE_URL || '').trim();
  if (!raw) return FALLBACK_BASE;
  try {
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    return FALLBACK_BASE;
  }
}

const staticRoutes = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about/carla', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about/patsy', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/industries', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/jobs', priority: 0.9, changeFrequency: 'daily' },
  { path: '/testimonials', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/solutions', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/solutions/employers', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/job-seekers', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/registered-nurses', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/licensed-practical-nurses', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/geriatric-nurses', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/physicians-advanced-practice', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/medical-professionals', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/domestic-care', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/certified-babysitter', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/solutions/housekeeping', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/solutions/tutoring', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/solutions/support-staff', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/solutions/travel-temporary-staffing', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/security', priority: 0.3, changeFrequency: 'yearly' },
];

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildXml() {
  const base = getBaseUrl();
  // Deterministic: stable file for caching, no per-request timestamp.
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = staticRoutes
    .map(({ path: p, priority, changeFrequency }) => {
      const loc = p === '/' ? `${base}/` : `${base}${p}`;
      return [
        '<url>',
        `<loc>${esc(loc)}</loc>`,
        `<lastmod>${esc(lastmod)}</lastmod>`,
        `<changefreq>${esc(changeFrequency)}</changefreq>`,
        `<priority>${esc(priority)}</priority>`,
        '</url>',
      ].join('');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

async function main() {
  const outPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buildXml(), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[sitemap] wrote ${outPath}`);
}

await main();

