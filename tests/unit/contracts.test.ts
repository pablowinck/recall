import { describe, expect, it } from 'vitest';
import {
  cardDraftSchema,
  cardPatchSchema,
  reviewInputSchema,
} from '../../packages/contracts/src/index';

describe('public input boundaries', () => {
  it('rejects whitespace-only questions and unbounded card content', () => {
    const base = { deck_id: crypto.randomUUID(), front: 'word', back: 'meaning' };
    expect(cardDraftSchema.safeParse({ ...base, front: '   ' }).success).toBe(false);
    expect(cardDraftSchema.safeParse({ ...base, back: 'x'.repeat(8001) }).success).toBe(false);
    expect(cardDraftSchema.parse(base).tags).toEqual([]);
  });
  it('does not accept tenant or scheduler changes through card editing', () => {
    const patch = cardPatchSchema.parse({
      front: 'new',
      tenant_id: crypto.randomUUID(),
      schedule: { reps: 99 },
    });
    expect(patch).toEqual({ front: 'new' });
  });
  it('requires a bounded rating and optimistic version', () => {
    expect(
      reviewInputSchema.safeParse({ rating: 5, version: 0, request_id: crypto.randomUUID() })
        .success,
    ).toBe(false);
    expect(
      reviewInputSchema.safeParse({ rating: 3, version: -1, request_id: crypto.randomUUID() })
        .success,
    ).toBe(false);
  });
});
