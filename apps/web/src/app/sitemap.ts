import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** List the public pages worth indexing. Example: GET /sitemap.xml. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Built with each deploy, so the date marks the last release that could have changed the page.
  return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];
}
