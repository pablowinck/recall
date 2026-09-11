import { NOT_FOUND_TEXT } from '@/features/marketing/not-found-text';

export const dynamic = 'force-static';

/** The 404 for agents that ask for Markdown; next.config.ts rewrites unknown paths here. Example: GET /nowhere with Accept: text/markdown. */
export function GET(): Response {
  return new Response(`${NOT_FOUND_TEXT}\n`, {
    status: 404,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' },
  });
}
