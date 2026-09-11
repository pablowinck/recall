import { serverCardResponse } from '@/features/marketing/mcp-server-card';

export const dynamic = 'force-static';

/** Point MCP clients and agent scanners at Recall's server. Example: GET /.well-known/mcp. */
export function GET(): Response {
  return serverCardResponse('application/json');
}
