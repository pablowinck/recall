/** What Recall says wherever a request never reaches it, so every screen uses the same words. */
export const CONNECTION_FAILURE = 'Can’t reach Recall. Check your connection and try again.';

/** Describe unknown failures without leaking implementation details. Example: describeFailure(error). */
export function describeFailure(error: unknown): string {
  if (error instanceof TypeError) return CONNECTION_FAILURE;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
