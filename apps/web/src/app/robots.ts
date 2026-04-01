import type { MetadataRoute } from 'next';
import { getPublicSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/auth/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
