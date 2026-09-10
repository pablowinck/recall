import { describe, expect, it } from 'vitest';
import { secretAfterRevoke } from '../../apps/web/src/features/connections/connection-secret';

const secret = { id: 'new', token: 'recall_new', clientId: 'claude-code' as const };

describe('one-time token after a revoke', () => {
  it('stays on screen when another connection is revoked', () => {
    expect(secretAfterRevoke(secret, 'older')).toBe(secret);
  });

  it('disappears when its own connection is revoked', () => {
    expect(secretAfterRevoke(secret, 'new')).toBeNull();
  });
});
