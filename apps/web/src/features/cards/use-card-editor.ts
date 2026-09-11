import { useRef, useState, type FormEvent, type RefObject } from 'react';
import type { RecallClient } from '@recall/client';
import type { CardDraft, Deck, Flashcard } from '@recall/contracts';
import { useAnnounce } from '@/components/status-announcer';
import { hasStatus } from '@/lib/api-status';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import {
  buildCardDraft,
  describeTagProblem,
  describeTextProblem,
  hasDraftChanges,
} from './card-draft';
import { chooseInitialDeck } from './initial-deck';
import { explainDeckFailure } from './deck-errors';
import { rememberLastDeck } from './last-deck';

export interface CardEditorProps {
  client: RecallClient;
  decks: Deck[];
  card?: Flashcard;
  preferredDeckId?: string;
  close: () => void;
  saved: () => void;
  onDeckCreated?: (deck: Deck) => void;
}
interface InlineDeckState {
  decks: Deck[];
  creatingDeck: boolean;
  setCreatingDeck: (creating: boolean) => void;
  deckAction: AsyncAction;
  createInlineDeck: (name: string) => Promise<void>;
}
interface EditorOutcome {
  save: (draft: CardDraft) => Promise<void>;
  remove: () => Promise<void>;
  removed: RefObject<boolean>;
}
export interface CardEditorState extends InlineDeckState {
  deck: string;
  setDeck: (id: string) => void;
  action: AsyncAction;
  form: RefObject<HTMLFormElement | null>;
  hasChanges: () => boolean;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  remove: () => Promise<void>;
  removed: RefObject<boolean>;
}

/** Coordinate one save, inline deck creation and change detection. Example: useCardEditor(props). */
export function useCardEditor(props: CardEditorProps): CardEditorState {
  const [deck, setDeck] = useState(() => chooseInitialDeck(props));
  const inline = useInlineDeck(props, setDeck);
  const outcome = useEditorOutcome(props);
  const action = useAsyncAction();
  const form = useRef<HTMLFormElement>(null);
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const draft = buildCardDraft(new FormData(event.currentTarget), deck);
    void action.run(() => outcome.save(draft));
  };
  const hasChanges = (): boolean => {
    if (!form.current) return false;
    return hasDraftChanges(buildCardDraft(new FormData(form.current), deck), props.card);
  };
  const { remove, removed } = outcome;
  return { ...inline, deck, setDeck, action, form, hasChanges, submit, remove, removed };
}

// Saving or deleting closes the editor, away from where the person was working, so each says what happened.
function useEditorOutcome(props: CardEditorProps): EditorOutcome {
  const announce = useAnnounce();
  const removed = useRef(false);
  const conflictShown = useRef(false);
  const finish = (message: string): void => {
    props.saved();
    props.close();
    announce(message);
  };
  const save = async (draft: CardDraft): Promise<void> => {
    const textProblem = describeTextProblem(draft);
    if (textProblem) throw new Error(textProblem);
    const tagProblem = describeTagProblem(draft.tags);
    if (tagProblem) throw new Error(tagProblem);
    if (props.card) await updateCard(props.client, props.card, draft, conflictShown);
    else await createCard(props.client, draft);
    finish(props.card ? 'Card saved' : 'Card created');
  };
  const remove = async (): Promise<void> => {
    if (!props.card) return;
    await props.client.deleteCard(props.card.id);
    removed.current = true;
    finish('Card deleted');
  };
  return { save, remove, removed };
}

function useInlineDeck(props: CardEditorProps, select: (id: string) => void): InlineDeckState {
  const [decks, setDecks] = useState<Deck[]>(props.decks);
  const [creatingDeck, setCreatingDeck] = useState(false);
  const deckAction = useAsyncAction();
  const createInlineDeck = async (name: string): Promise<void> => {
    const created = await createDeckOnce(props.client, deckAction, name);
    if (!created) return;
    setDecks((current) => [...current, created]);
    select(created.id);
    setCreatingDeck(false);
    props.onDeckCreated?.(created);
  };
  return { decks, creatingDeck, setCreatingDeck, deckAction, createInlineDeck };
}

async function createDeckOnce(
  client: RecallClient,
  action: AsyncAction,
  name: string,
): Promise<Deck | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  let created: Deck | null = null;
  await action.run(async () => {
    created = await client.createDeck(trimmed).catch(explainDeckFailure);
  });
  return created;
}

async function createCard(client: RecallClient, draft: CardDraft): Promise<void> {
  await client.createCard(draft);
  rememberLastDeck(draft.deck_id);
}

const CONFLICT_MESSAGE =
  'This card changed after you opened it, perhaps through your assistant. Save again to replace that change with yours, or close without saving to keep it.';

// The editor sends the version it opened, so an edit made meanwhile is never overwritten silently. Once the conflict
// has been explained, saving again replaces the other change on purpose.
async function updateCard(
  client: RecallClient,
  card: Flashcard,
  draft: CardDraft,
  conflictShown: RefObject<boolean>,
): Promise<void> {
  const version = conflictShown.current ? undefined : card.version;
  try {
    await client.updateCard(card.id, { ...draft, version });
  } catch (failure) {
    if (conflictShown.current || !hasStatus(failure, 409)) throw failure;
    conflictShown.current = true;
    throw new Error(CONFLICT_MESSAGE);
  }
}
