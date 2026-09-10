import { expect, it } from 'vitest';
import { buildCardDraft } from '../../apps/web/src/features/cards/card-draft';

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
