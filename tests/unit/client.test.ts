import { expect, it } from 'vitest';
import { RecallClient, RecallApiError } from '../../packages/client/src/index';

class FakeHttpTransport {
  requests: RequestInit[] = [];
  constructor(private readonly status: number) {}
  fetch: typeof fetch = async (_url, init) => {
    this.requests.push(init ?? {});
    return new Response(
      JSON.stringify(this.status === 200 ? { decks: [], stats: {} } : { error: 'Sessão expirada' }),
      { status: this.status, headers: { 'Content-Type': 'application/json' } },
    );
  };
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
