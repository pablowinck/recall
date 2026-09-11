import { PRICING_TEXT } from '@/features/marketing/pricing-text';

export const dynamic = 'force-static';

/** Tell agents what Recall costs, in Markdown. Example: GET /pricing.md. */
export function GET(): Response {
  return new Response(`${PRICING_TEXT}\n`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
