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
  onDeckCreated?: (deck: Deck) => void;
}
export interface CardEditorState {
  decks: Deck[];
  deck: string;
  setDeck: (id: string) => void;
  creatingDeck: boolean;
  setCreatingDeck: (creating: boolean) => void;
  deckAction: AsyncAction;
  createInlineDeck: (name: string) => Promise<void>;
  action: AsyncAction;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

/** Coordinate one save and inline deck creation without discarding fields. Example: useCardEditor(props). */
export function useCardEditor(props: CardEditorProps): CardEditorState {
  const [decks, setDecks] = useState<Deck[]>(props.decks);
  const [deck, setDeck] = useState(props.card?.deck_id ?? props.decks[0]?.id ?? '');
  const [creatingDeck, setCreatingDeck] = useState(false);
  const action = useAsyncAction();
  const deckAction = useAsyncAction();

  const createInlineDeck = async (name: string): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) return;
    let created: Deck | null = null;
    const ok = await deckAction.run(async () => {
      created = await props.client.createDeck(trimmed);
    });
    if (ok && created) {
      const newDeck: Deck = created;
      setDecks((current) => [...current, newDeck]);
      setDeck(newDeck.id);
      setCreatingDeck(false);
      props.onDeckCreated?.(newDeck);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const draft = buildCardDraft(new FormData(event.currentTarget), deck);
    void action.run(() => saveEditedCard(props, draft));
  };

  return {
    decks,
    deck,
    setDeck,
    creatingDeck,
    setCreatingDeck,
    deckAction,
    createInlineDeck,
    action,
    submit,
  };
}

async function saveEditedCard(props: CardEditorProps, draft: CardDraft): Promise<void> {
  if (props.card) await props.client.updateCard(props.card.id, draft);
  else await props.client.createCard(draft);
  props.saved();
  props.close();
}
