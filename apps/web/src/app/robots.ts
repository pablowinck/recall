import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Keep the private workspace out of search results. Example: GET /robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/app' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
