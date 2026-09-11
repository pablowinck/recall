import { LLMS_TEXT } from '@/features/marketing/llms-text';

export const dynamic = 'force-static';

/** Tell AI assistants when and how to use Recall, in Markdown. Example: GET /llms.txt. */
export function GET(): Response {
  return new Response(`${LLMS_TEXT}\n`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      Vary: 'Accept',
    },
  });
}
