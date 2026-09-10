import { expect, it } from 'vitest';
import {
  AuthApiError,
  AuthRetryableFetchError,
  type AuthError,
  type UserResponse,
} from '@supabase/supabase-js';
import { SupabaseAuthenticator } from '../../apps/api/src/authentication';

class FakeIdentityProvider {
  constructor(private readonly rejection: AuthError) {}
  auth = {
    getUser: async (): Promise<UserResponse> => ({ data: { user: null }, error: this.rejection }),
  };
}

class FakeTokenRepository {
  async resolveToken(): Promise<string | null> {
    return null;
  }
}

const jwtRequest = { headers: { authorization: 'Bearer sample-jwt' } } as Parameters<
  SupabaseAuthenticator['verify']
>[0];

it.each([429, 503])('does not label Auth HTTP %s as an expired user session', async (status) => {
  const authenticator = new SupabaseAuthenticator(
    new FakeIdentityProvider(
      new AuthApiError('Upstream unavailable', status, 'unexpected_failure'),
    ),
    new FakeTokenRepository(),
  );
  await expect(authenticator.verify(jwtRequest)).rejects.toMatchObject({ status: 503 });
});

it('preserves retryable network failures as service unavailability', async () => {
  const authenticator = new SupabaseAuthenticator(
    new FakeIdentityProvider(new AuthRetryableFetchError('Connection failed', 0)),
    new FakeTokenRepository(),
  );
  await expect(authenticator.verify(jwtRequest)).rejects.toMatchObject({ status: 503 });
});

it('continues to reject an expired JWT as unauthorized', async () => {
  const authenticator = new SupabaseAuthenticator(
    new FakeIdentityProvider(new AuthApiError('Expired JWT', 401, 'bad_jwt')),
    new FakeTokenRepository(),
  );
  await expect(authenticator.verify(jwtRequest)).rejects.toMatchObject({ status: 401 });
});
