import { describe, expect, it } from 'vitest';
import { describeConsent } from '../../apps/web/src/features/auth/oauth-consent';

const request = {
  redirect_uri: 'http://localhost:33418/callback',
  client: { name: 'Claude Code' },
  user: { email: 'learner@example.com' },
  scope: 'email profile',
};

describe('the consent question', () => {
  it('names the assistant and where the browser returns', () => {
    expect(describeConsent(request)).toEqual({
      clientName: 'Claude Code',
      redirectHost: 'localhost:33418',
      email: 'learner@example.com',
    });
  });

  it('never lets a registered name crowd the question', () => {
    const named = describeConsent({ ...request, client: { name: 'A'.repeat(200) } });
    expect(named.clientName).toHaveLength(60);
    expect(describeConsent({ ...request, client: { name: '   ' } }).clientName).toBe(
      'An assistant',
    );
  });

  it('shows a malformed redirect as written instead of failing', () => {
    expect(describeConsent({ ...request, redirect_uri: 'not a url' }).redirectHost).toBe(
      'not a url',
    );
  });
});
