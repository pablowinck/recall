import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** List the public pages worth indexing. Example: GET /sitemap.xml. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: 'weekly', priority: 1 }];
}
