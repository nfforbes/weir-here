import type { MetadataRoute } from 'next';
import { getPublicSiteUrl } from '@/lib/siteUrl';

/** Fully static sitemap — no DB/env-only crashes; safe URL join for hosts. */
export const dynamic = 'force-static';

const staticRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const now = new Date();
  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: path === '/' ? `${base}/` : `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
