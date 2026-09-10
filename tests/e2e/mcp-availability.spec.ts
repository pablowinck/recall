import { expect, test } from '@playwright/test';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { createMcpApp } from '../../apps/mcp/src/server';

class FakeUnavailableStudyApi {
  readonly server = createServer((_request, response) => {
    response.writeHead(502, { 'Content-Type': 'text/html' });
    response.end('<html>Temporary gateway error</html>');
  });
}

async function listenLocally(server: Server): Promise<string> {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Invalid listener; expected an allocated TCP port.');
  return `http://127.0.0.1:${address.port}`;
}

async function closeLocalServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

test('MCP reports a gateway outage without rejecting a valid-looking token as expired', async () => {
  const upstream = new FakeUnavailableStudyApi();
  const upstreamUrl = await listenLocally(upstream.server);
  const mcp = createServer(createMcpApp(upstreamUrl));
  try {
    const mcpUrl = await listenLocally(mcp);
    const response = await fetch(`${mcpUrl}/mcp`, {
      method: 'POST',
      headers: { Authorization: 'Bearer synthetic-test-token' },
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'The study service is temporarily unavailable. Please try again.',
    });
  } finally {
    await closeLocalServer(mcp);
    await closeLocalServer(upstream.server);
  }
});
