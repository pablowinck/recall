import { useState, type FormEvent } from 'react';
import type { RecallClient } from '@recall/client';
import type { CardDraft, Deck, Flashcard } from '@recall/contracts';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { buildCardDraft } from './card-draft';

export interface CardEditorProps {
  client: RecallClient;
  decks: Deck[];
  card?: Flashcard;
  close: () => void;
  saved: () => void;
}
export interface CardEditorState {
  deck: string;
  setDeck: (id: string) => void;
  action: AsyncAction;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

/** Coordinate one save without discarding fields on failure. Example: useCardEditor(props). */
export function useCardEditor(props: CardEditorProps): CardEditorState {
  const [deck, setDeck] = useState(props.card?.deck_id ?? props.decks[0]?.id ?? '');
  const action = useAsyncAction();
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const draft = buildCardDraft(new FormData(event.currentTarget), deck);
    void action.run(() => saveEditedCard(props, draft));
  };
  return { deck, setDeck, action, submit };
}

async function saveEditedCard(props: CardEditorProps, draft: CardDraft): Promise<void> {
  if (props.card) await props.client.updateCard(props.card.id, draft);
  else await props.client.createCard(draft);
  props.saved();
  props.close();
}
