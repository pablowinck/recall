import { describe, expect, it } from 'vitest';
import {
  connectionClients,
  findConnectionClient,
} from '../../apps/web/src/features/connections/connection-clients';

const endpoint = 'https://recall.example/mcp';
const token = 'recall_0123456789abcdef';

describe('assistant connection setup', () => {
  it('points every assistant at the Recall MCP endpoint', () => {
    for (const client of connectionClients)
      expect(client.setup(endpoint, token)).toContain(endpoint);
  });

  it('includes the new token except where the assistant prompts for it', () => {
    const prompted = connectionClients.filter(
      (client) => !client.setup(endpoint, token).includes(token),
    );
    expect(prompted.map((client) => client.id)).toEqual(['vscode']);
  });

  it('produces valid JSON for assistants configured with JSON files', () => {
    for (const id of ['cursor', 'vscode', 'claude-desktop', 'gemini-cli']) {
      expect(() => JSON.parse(findConnectionClient(id).setup(endpoint, token))).not.toThrow();
    }
  });

  it('falls back to the generic setup for an unknown assistant', () => {
    expect(findConnectionClient('unknown').id).toBe('other');
  });
});
