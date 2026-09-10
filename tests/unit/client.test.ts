import { expect, it } from 'vitest';
import { RecallClient, RecallApiError } from '../../packages/client/src/index';

class FakeHttpTransport {
  requests: RequestInit[] = [];
  constructor(private readonly status: number) {}
  fetch: typeof fetch = async (_url, init) => {
    this.requests.push(init ?? {});
    return new Response(
      JSON.stringify(this.status === 200 ? { decks: [], stats: {} } : { error: 'Session expired' }),
      { status: this.status, headers: { 'Content-Type': 'application/json' } },
    );
  };
}

class FakeGatewayTransport {
  fetch: typeof fetch = async () =>
    new Response('<html>Gateway unavailable</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });
}

it('forwards the current token and prevents caching personal content', async () => {
  const transport = new FakeHttpTransport(200);
  const client = new RecallClient({
    baseUrl: 'http://recall.test',
    token: async () => 'test-token',
    fetcher: transport.fetch,
  });
  await client.workspace();
  expect(transport.requests[0]?.headers).toMatchObject({ Authorization: 'Bearer test-token' });
  expect(transport.requests[0]?.cache).toBe('no-store');
});

it('preserves actionable server failures', async () => {
  const transport = new FakeHttpTransport(401);
  const client = new RecallClient({
    baseUrl: 'http://recall.test',
    token: async () => 'expired',
    fetcher: transport.fetch,
  });
  await expect(client.workspace()).rejects.toBeInstanceOf(RecallApiError);
});

it('turns an HTML gateway page into a recoverable API error', async () => {
  const transport = new FakeGatewayTransport();
  const client = new RecallClient({
    baseUrl: 'http://recall.test',
    token: async () => 'valid-session',
    fetcher: transport.fetch,
  });
  await expect(client.workspace()).rejects.toMatchObject({
    status: 502,
    message: 'The service returned an invalid response. Please try again.',
  });
});
