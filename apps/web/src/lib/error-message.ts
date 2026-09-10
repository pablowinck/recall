/** Describe unknown failures without leaking implementation details. Example: describeFailure(error). */
export function describeFailure(error: unknown): string {
  if (error instanceof TypeError) return 'Can’t reach Recall. Check your connection and try again.';
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
