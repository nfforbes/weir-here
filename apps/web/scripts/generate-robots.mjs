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

function buildRobotsTxt() {
  const base = getBaseUrl();
  return [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /dashboard/',
    'Disallow: /auth/',
    'Disallow: /api/',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
}

async function main() {
  const outPath = path.resolve(process.cwd(), 'public', 'robots.txt');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buildRobotsTxt(), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[robots] wrote ${outPath}`);
}

await main();

