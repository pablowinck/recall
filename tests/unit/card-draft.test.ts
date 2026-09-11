import { expect, it } from 'vitest';
import { cardDraftSchema } from '../../packages/contracts/src/index';
import {
  buildCardDraft,
  describeTagProblem,
  TAG_LIMITS,
} from '../../apps/web/src/features/cards/card-draft';

it('keeps multilingual learning content intact while cleaning tag separators', () => {
  const fields = new FormData();
  fields.set('front', 'Que signifie déjà ?');
  fields.set('back', 'Uma explicação em português.\nUn esempio italiano.');
  fields.set('tags', ' French,  review , , travel ');
  expect(buildCardDraft(fields, 'deck-id')).toEqual({
    deck_id: 'deck-id',
    front: 'Que signifie déjà ?',
    back: 'Uma explicação em português.\nUn esempio italiano.',
    tags: ['French', 'review', 'travel'],
  });
});

it('names the tag limit a card breaks before it reaches the server', () => {
  expect(describeTagProblem(['grammar', 'travel'])).toBeNull();
  const thirteen = Array.from({ length: 13 }, (_, index) => `tag-${index}`);
  expect(describeTagProblem(thirteen)).toBe('Use up to 12 tags.');
  expect(describeTagProblem(['x'.repeat(41)])).toBe('Keep each tag to 40 characters or fewer.');
});

it('keeps the editor’s tag limits in step with the shared card schema', () => {
  const card = { deck_id: '4f0b6f1e-0000-4000-8000-000000000000', front: 'Q', back: 'A' };
  const full = Array.from({ length: TAG_LIMITS.count }, () => 'x'.repeat(TAG_LIMITS.length));
  expect(cardDraftSchema.safeParse({ ...card, tags: full }).success).toBe(true);
  expect(cardDraftSchema.safeParse({ ...card, tags: [...full, 'one more'] }).success).toBe(false);
  const long = ['x'.repeat(TAG_LIMITS.length + 1)];
  expect(cardDraftSchema.safeParse({ ...card, tags: long }).success).toBe(false);
});
