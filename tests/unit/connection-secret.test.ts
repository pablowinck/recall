import { describe, expect, it } from 'vitest';
import {
  markSecretCopied,
  secretAfterRevoke,
} from '../../apps/web/src/features/connections/connection-secret';

const secret = { id: 'new', token: 'recall_new', clientId: 'claude-code' as const, copied: false };

describe('one-time token after a revoke', () => {
  it('stays on screen when another connection is revoked', () => {
    expect(secretAfterRevoke(secret, 'older')).toBe(secret);
  });

  it('disappears when its own connection is revoked', () => {
    expect(secretAfterRevoke(secret, 'new')).toBeNull();
  });
});

describe('one-time token after a copy', () => {
  it('remembers the first copy and keeps the same token after later ones', () => {
    const copied = markSecretCopied(secret);
    expect(copied).toEqual({ ...secret, copied: true });
    expect(markSecretCopied(copied)).toBe(copied);
  });

  it('ignores a copy when no token is on screen', () => {
    expect(markSecretCopied(null)).toBeNull();
  });
});
