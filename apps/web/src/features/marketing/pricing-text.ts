import { SITE_URL } from '@/lib/site';
import { REPOSITORY_URL } from './github-repo';

// What an agent comparing tools needs to know about cost. Keep it in step with the landing page's cost answer.
export const PRICING_TEXT = [
  '# Recall pricing',
  '',
  '> Recall is free to use. There are no paid plans, trials or usage fees.',
  '',
  `- Hosted app: ${SITE_URL}/app, free with every feature, including the MCP server for AI assistants.`,
  `- Self-hosting: the source code is MIT licensed at ${REPOSITORY_URL}.`,
  `- How assistants use Recall: ${SITE_URL}/llms.txt`,
].join('\n');
