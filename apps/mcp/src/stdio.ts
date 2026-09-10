import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { RecallClient } from '@recall/client';
import { createRecallMcp } from './tools.js';

const token = process.env.RECALL_MCP_TOKEN;
if (!token) throw new Error('Missing RECALL_MCP_TOKEN; expected a personal recall_ token.');
const client = new RecallClient({
  baseUrl: process.env.RECALL_API_URL ?? 'http://localhost:3211',
  token: async () => token,
});
const server = createRecallMcp(client);
await server.connect(new StdioServerTransport());
