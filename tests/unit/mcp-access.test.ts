import { expect, it } from 'vitest';
import { RecallApiError } from '@recall/client';
import type { Workspace } from '@recall/contracts';
import { checkApiAccess } from '../../apps/mcp/src/access-check';

class FakeWorkspaceApi {
  constructor(private readonly failure?: Error) {}
  async workspace(): Promise<Workspace> {
    if (this.failure) throw this.failure;
    return { decks: [], stats: { total: 0, due: 0, fresh: 0, reviewed_today: 0, streak: 0 } };
  }
}

it('permits a verified workspace', async () => {
  expect(await checkApiAccess(new FakeWorkspaceApi())).toBeNull();
});

it('rejects invalid credentials without calling them an outage', async () => {
  const rejection = await checkApiAccess(new FakeWorkspaceApi(new RecallApiError(401, 'Expired')));
  expect(rejection?.status).toBe(401);
});

it.each([500, 502, 503])('preserves HTTP %s upstream failures as retriable', async (status) => {
  const rejection = await checkApiAccess(
    new FakeWorkspaceApi(new RecallApiError(status, 'Unavailable')),
  );
  expect(rejection?.status).toBe(503);
});

it('treats network failures as temporary service unavailability', async () => {
  const rejection = await checkApiAccess(new FakeWorkspaceApi(new TypeError('Fetch failed')));
  expect(rejection?.status).toBe(503);
});
