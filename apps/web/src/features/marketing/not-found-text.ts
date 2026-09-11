import { SITE_URL } from '@/lib/site';
import { REPOSITORY_URL } from './github-repo';

// The 404 an agent reads when it asks for Markdown: the same ways back as not-found.tsx, as plain links.
export const NOT_FOUND_TEXT = [
  '# Page not found',
  '',
  'This Recall page does not exist. These do:',
  '',
  `- What Recall is: ${SITE_URL}/`,
  `- How AI assistants use Recall, with the MCP endpoint and tools: ${SITE_URL}/llms.txt`,
  `- Sign in to your cards: ${SITE_URL}/app`,
  `- Sitemap: ${SITE_URL}/sitemap.xml`,
  `- Source code and docs: ${REPOSITORY_URL}`,
].join('\n');
