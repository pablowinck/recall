import { describe, expect, it } from 'vitest';
import {
  MCP_SERVER_CARD,
  serverCardResponse,
} from '../../apps/web/src/features/marketing/mcp-server-card';

describe('the MCP server card on the site', () => {
  it('fits the limits the MCP registry sets for a server entry', () => {
    expect(MCP_SERVER_CARD.name).toMatch(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
    expect(MCP_SERVER_CARD.title.length).toBeLessThanOrEqual(100);
    expect(MCP_SERVER_CARD.description.length).toBeLessThanOrEqual(100);
    expect(MCP_SERVER_CARD.remotes[0].url).toMatch(/^https?:\/\/\S+\/mcp$/);
  });

  it('serves the same card under the media type each path asks for', async () => {
    const response = serverCardResponse('application/mcp-server-card+json');
    expect(response.headers.get('content-type')).toBe(
      'application/mcp-server-card+json; charset=utf-8',
    );
    await expect(response.json()).resolves.toEqual(MCP_SERVER_CARD);
  });
});
