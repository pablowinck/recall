import { expect, it } from 'vitest';
import { cardDraftSchema } from '../../packages/contracts/src/index';
import {
  buildCardDraft,
  describeTagProblem,
  describeTextProblem,
  TAG_LIMITS,
  TEXT_LIMITS,
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

it('names the side of a card that is too long, and by how much', () => {
  expect(describeTextProblem({ front: 'Q', back: 'A' })).toBeNull();
  expect(describeTextProblem({ front: 'x'.repeat(4010), back: 'A' })).toBe(
    'The front is 10 characters over its 4,000-character limit. Shorten it to save.',
  );
  expect(describeTextProblem({ front: 'Q', back: 'x'.repeat(8001) })).toBe(
    'The back is 1 character over its 8,000-character limit. Shorten it to save.',
  );
});

it('keeps the editor’s text limits in step with the shared card schema', () => {
  const card = { deck_id: '4f0b6f1e-0000-4000-8000-000000000000', tags: [] };
  const front = 'x'.repeat(TEXT_LIMITS.front);
  const back = 'x'.repeat(TEXT_LIMITS.back);
  expect(cardDraftSchema.safeParse({ ...card, front, back }).success).toBe(true);
  expect(cardDraftSchema.safeParse({ ...card, front: `${front}x`, back: 'A' }).success).toBe(false);
  expect(cardDraftSchema.safeParse({ ...card, front: 'Q', back: `${back}x` }).success).toBe(false);
});

it('keeps one spelling of a tag typed again in another case', () => {
  const fields = new FormData();
  fields.set('front', 'Question');
  fields.set('back', 'Answer');
  fields.set('tags', 'Portuguese, portuguese, grammar, PORTUGUESE');
  expect(buildCardDraft(fields, 'deck-id').tags).toEqual(['Portuguese', 'grammar']);
});
