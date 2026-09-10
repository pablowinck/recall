import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({ name: 'codex-local-verification', version: '0.1.0' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['scripts/launch-codex-local.mjs'],
  stderr: 'pipe',
});
await client.connect(transport);
try {
  const tools = await client.listTools();
  const listed = await client.callTool({ name: 'list_flashcards', arguments: { limit: 200 } });
  if (listed.isError)
    throw new Error('Local MCP card read failed; expected successful tool result');
  const content = listed.content as Array<{ type: string; text?: string }>;
  const payload = JSON.parse(content.find((item) => item.type === 'text')!.text!) as {
    total: number;
  };
  if (payload.total !== 64)
    throw new Error(`Local MCP returned ${payload.total} cards; expected 64`);
  process.stdout.write(
    JSON.stringify({
      transport: 'stdio',
      tools: tools.tools.length,
      cards: payload.total,
      verified: true,
    }) + '\n',
  );
} finally {
  await client.close();
}
