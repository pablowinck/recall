import { describe, expect, it } from 'vitest';
import { describeAuthFailure } from '../../apps/web/src/features/auth/auth-errors';

describe('what an authentication failure says', () => {
  it('turns invalid credentials into one message for both fields', () => {
    expect(describeAuthFailure('Invalid login credentials')).toBe(
      'Incorrect email or password. Check your details and try again.',
    );
  });

  it('points a returning account at signing in', () => {
    expect(describeAuthFailure('User already registered')).toBe(
      'That email already has an account. Sign in instead.',
    );
  });

  it('states the password rule instead of the service minimum', () => {
    expect(describeAuthFailure('Password should be at least 6 characters')).toBe(
      'Use a password with at least 10 characters.',
    );
  });

  it('keeps an unknown failure generic', () => {
    expect(describeAuthFailure('unexpected_failure')).toBe(
      'We couldn’t complete that. Please try again.',
    );
  });
});

it('says Recall is unreachable when the request never arrives, in each browser’s wording', () => {
  for (const wording of [
    'Failed to fetch',
    'NetworkError when attempting to fetch resource.',
    'Load failed',
  ])
    expect(describeAuthFailure(wording)).toBe(
      'Can’t reach Recall. Check your connection and try again.',
    );
});
