import { describe, expect, it } from 'vitest';
import { explainDeckFailure } from '../../apps/web/src/features/cards/deck-errors';

describe('a rejected deck name', () => {
  it('explains a duplicate in the reader’s words', () => {
    expect(() => explainDeckFailure({ status: 409 })).toThrow(
      'You already have a deck with that name.',
    );
  });

  it('passes other failures through untouched', () => {
    const failure = new Error('Service unavailable');
    expect(() => explainDeckFailure(failure)).toThrow(failure);
  });
});
