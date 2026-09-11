import { describe, expect, it } from 'vitest';
import type { Session } from '../../apps/web/src/lib/supabase-auth';
import {
  nextSessionSnapshot,
  type SessionSnapshot,
} from '../../apps/web/src/lib/use-recall-session';

const signedIn = (token: string): Session =>
  ({ access_token: token, user: { id: 'user-1' } }) as unknown as Session;
const resting: SessionSnapshot = { session: signedIn('token-a'), loading: false, ended: false };

describe('what an Auth event does to the session state', () => {
  it('keeps the same state when the tab regains focus with the same user and token', () => {
    expect(nextSessionSnapshot(resting, 'SIGNED_IN', signedIn('token-a'), false)).toBe(resting);
  });

  it('takes a refreshed token', () => {
    const next = nextSessionSnapshot(resting, 'TOKEN_REFRESHED', signedIn('token-b'), false);
    expect(next.session?.access_token).toBe('token-b');
  });

  it('explains a sign-out nobody asked for, but not one the person asked for', () => {
    expect(nextSessionSnapshot(resting, 'SIGNED_OUT', null, false).ended).toBe(true);
    expect(nextSessionSnapshot(resting, 'SIGNED_OUT', null, true).ended).toBe(false);
  });

  it('clears the explanation when someone signs in again', () => {
    const ended: SessionSnapshot = { session: null, loading: false, ended: true };
    expect(nextSessionSnapshot(ended, 'SIGNED_IN', signedIn('token-c'), false).ended).toBe(false);
  });
});
