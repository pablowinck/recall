import { MCP_URL, SITE_URL } from '@/lib/site';
import { REPOSITORY_URL } from './github-repo';

// The MCP registry's server.json shape, served from the site so clients and registries find the server without
// reading docs. The version follows the server's own in apps/mcp/src/tools.ts.
export const MCP_SERVER_CARD = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
  name: 'io.github.pablowinck/recall',
  title: 'Recall',
  description: 'Create, search and study FSRS flashcards in your Recall account.',
  version: '0.1.0',
  websiteUrl: `${SITE_URL}/`,
  repository: { url: REPOSITORY_URL, source: 'github', subfolder: 'apps/mcp' },
  remotes: [
    {
      type: 'streamable-http',
      url: MCP_URL,
      headers: [
        {
          name: 'Authorization',
          value: 'Bearer {token}',
          isRequired: true,
          isSecret: true,
          variables: {
            token: {
              description: `Personal token created at ${SITE_URL}/app/connections`,
              isRequired: true,
              isSecret: true,
            },
          },
        },
      ],
    },
  ],
} as const;

/** The server card as a JSON response with the given media type. Example: serverCardResponse('application/json'). */
export function serverCardResponse(mediaType: string): Response {
  return new Response(`${JSON.stringify(MCP_SERVER_CARD, null, 2)}\n`, {
    headers: {
      'Content-Type': `${mediaType}; charset=utf-8`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
