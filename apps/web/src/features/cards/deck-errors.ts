/**
 * Turn a rejected deck name into words a reader can act on, and leave other failures alone.
 * Example: client.createDeck(name).catch(explainDeckFailure).
 */
export function explainDeckFailure(error: unknown): never {
  if (readStatus(error) === 409) throw new Error('You already have a deck with that name.');
  throw error;
}

// The client throws RecallApiError, but a duck-typed read keeps this usable from tests and workers.
function readStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}
