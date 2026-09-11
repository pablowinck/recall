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

async function listenMcp(
  discovery?: Parameters<typeof createMcpApp>[1],
): Promise<{ server: Server; base: string }> {
  const server = createMcpApp('http://127.0.0.1:9', discovery).listen(0, '127.0.0.1');
  return { server, base: await listenLocally(server) };
}

test('an unauthenticated MCP request tells an OAuth client where to sign in', async () => {
  const { server, base } = await listenMcp({
    authIssuer: 'https://auth.example.test/auth/v1',
    publicUrl: 'https://mcp.example.test',
  });
  try {
    const rejected = await fetch(`${base}/mcp`, { method: 'POST', body: '{}' });
    expect(rejected.status).toBe(401);
    expect(rejected.headers.get('www-authenticate')).toBe(
      'Bearer resource_metadata="https://mcp.example.test/.well-known/oauth-protected-resource/mcp"',
    );
    const metadata = await fetch(`${base}/.well-known/oauth-protected-resource/mcp`);
    expect(await metadata.json()).toMatchObject({
      resource: 'https://mcp.example.test/mcp',
      authorization_servers: ['https://auth.example.test/auth/v1'],
      bearer_methods_supported: ['header'],
    });
  } finally {
    await closeLocalServer(server);
  }
});

test('without an issuer the MCP server stays token-only', async () => {
  const { server, base } = await listenMcp();
  try {
    const rejected = await fetch(`${base}/mcp`, { method: 'POST', body: '{}' });
    expect(rejected.status).toBe(401);
    expect(rejected.headers.get('www-authenticate')).toBeNull();
    expect((await fetch(`${base}/.well-known/oauth-protected-resource/mcp`)).status).toBe(404);
  } finally {
    await closeLocalServer(server);
  }
});
