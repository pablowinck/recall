import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Keep the private workspace out of search results. Example: GET /robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    // Rules match by prefix: a bare "/app" also blocked /apple-icon, the logo in the structured data.
    rules: [{ userAgent: '*', allow: '/', disallow: ['/app$', '/app/', '/app?', '/oauth/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
