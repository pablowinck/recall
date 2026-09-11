import { expect, it } from 'vitest';
import { RecallApiError } from '../../packages/client/src/index';
import { hasStatus } from '../../apps/web/src/lib/api-status';

it('reads an HTTP status from any copy of the client error', () => {
  expect(hasStatus(new RecallApiError(409, 'This card changed after you opened it.'), 409)).toBe(
    true,
  );
  expect(hasStatus({ status: 409 }, 409)).toBe(true);
  expect(hasStatus(new RecallApiError(404, 'Card not found.'), 409)).toBe(false);
  expect(hasStatus(new TypeError('Failed to fetch'), 409)).toBe(false);
  expect(hasStatus(null, 409)).toBe(false);
});
