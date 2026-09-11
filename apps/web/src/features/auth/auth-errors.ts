const UNREACHABLE = 'Can’t reach Recall. Check your connection and try again.';
const KNOWN_FAILURES: [needle: string, message: string][] = [
  ['Invalid login', 'Incorrect email or password. Check your details and try again.'],
  ['Email not confirmed', 'Confirm your email first: the link is in your inbox.'],
  ['User already registered', 'That email already has an account. Sign in instead.'],
  ['Password should be', 'Use a password with at least 10 characters.'],
  ['Unable to validate email address', 'That email address doesn’t look right.'],
  ['For security purposes', 'Too many attempts just now. Wait a moment and try again.'],
  ['rate limit', 'Too many attempts just now. Wait a moment and try again.'],
  // A request that never reaches the service fails in the browser’s own words: Chrome, Firefox, then Safari.
  ['Failed to fetch', UNREACHABLE],
  ['NetworkError', UNREACHABLE],
  ['Load failed', UNREACHABLE],
];

/**
 * Say what an authentication failure means, without repeating the service's wording.
 * Example: describeAuthFailure('Invalid login credentials').
 */
export function describeAuthFailure(message: string): string {
  const spoken = message.toLowerCase();
  const known = KNOWN_FAILURES.find(([needle]) => spoken.includes(needle.toLowerCase()));
  return known ? known[1] : 'We couldn’t complete that. Please try again.';
}
