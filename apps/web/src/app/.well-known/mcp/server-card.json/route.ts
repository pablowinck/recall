import { serverCardResponse } from '@/features/marketing/mcp-server-card';

export const dynamic = 'force-static';

/** The same card at the path proposed for MCP server cards. Example: GET /.well-known/mcp/server-card.json. */
export function GET(): Response {
  return serverCardResponse('application/mcp-server-card+json');
}
