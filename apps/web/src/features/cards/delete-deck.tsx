'use client';
import { useState, type ComponentProps } from 'react';
import { AlertDialog, Button, IconButton, RadioGroup, Select, Tooltip } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import type { Deck, DeckRemoval } from '@recall/contracts';
import { ErrorNotice } from '@/components/feedback';
import { useAnnounce } from '@/components/status-announcer';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';

interface DeleteDeckProps {
  deck: Deck;
  decks: Deck[];
  client: RecallClient;
  done: () => void;
}
type RemoveDeck = (removal: DeckRemoval) => Promise<boolean>;
interface DeckRemovalDialogProps {
  deck: Deck;
  others: Deck[];
  action: AsyncAction;
  remove: RemoveDeck;
}

/** Delete the deck the library is filtered by. Example: <DeleteDeckButton deck={deck} decks={decks} client={client} done={refresh} />. */
export function DeleteDeckButton(props: DeleteDeckProps): React.JSX.Element | null {
  const { deck } = props;
  const others = props.decks.filter((other) => other.id !== deck.id);
  const { action, remove } = useDeckRemoval(props, others);
  // A tenant always keeps one deck, so the last one offers no delete at all.
  if (!others.length) return null;
  if (!deck.card_count)
    return (
      <Tooltip content="Delete this empty deck">
        <DeleteDeckTrigger
          deck={deck}
          busy={action.busy}
          onClick={() => void remove({ cards: 'delete' })}
        />
      </Tooltip>
    );
  return <DeckRemovalDialog deck={deck} others={others} action={action} remove={remove} />;
}

// The control that had focus leaves with the deck, so the outcome is announced instead of shown beside it.
function useDeckRemoval(
  { deck, client, done }: DeleteDeckProps,
  others: Deck[],
): { action: AsyncAction; remove: RemoveDeck } {
  const action = useAsyncAction();
  const announce = useAnnounce();
  const remove = async (removal: DeckRemoval): Promise<boolean> => {
    const removed = await action.run(() => client.deleteDeck(deck.id, removal));
    if (!removed) return false;
    done();
    announce(describeDeckRemoval(deck, others, removal));
    return true;
  };
  return { action, remove };
}

// Tooltips and dialog triggers hand their event handlers and ref to this component, so it passes every other prop to
// the button; dropping them left the tooltip without the pointer events that open it.
function DeleteDeckTrigger({
  deck,
  busy,
  ...button
}: { deck: Deck; busy: boolean } & Omit<
  ComponentProps<typeof IconButton>,
  'children'
>): React.JSX.Element {
  return (
    <IconButton
      {...button}
      className="delete-deck-trigger"
      size="3"
      variant="ghost"
      color="red"
      aria-label={`Delete deck ${deck.name}`}
      loading={busy}
    >
      <Trash2 size={17} />
    </IconButton>
  );
}

interface DeckRemovalChoice {
  keepCards: boolean;
  setKeepCards: (keep: boolean) => void;
  target: string;
  setTarget: (id: string) => void;
}

function DeckRemovalDialog({
  deck,
  others,
  action,
  remove,
}: DeckRemovalDialogProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const choice = useDeckRemovalChoice(others);
  const confirm = (): void => {
    const removal: DeckRemoval = choice.keepCards
      ? { cards: 'move', target: choice.target }
      : { cards: 'delete' };
    void remove(removal).then((removed) => {
      if (removed) setOpen(false);
    });
  };
  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !action.busy && setOpen(next)}>
      {/* Radix passes tooltip props to its content, so the tooltip sits outside the dialog trigger. */}
      <Tooltip content="Delete deck">
        <AlertDialog.Trigger>
          <DeleteDeckTrigger deck={deck} busy={false} />
        </AlertDialog.Trigger>
      </Tooltip>
      <AlertDialog.Content maxWidth="460px">
        <AlertDialog.Title>Delete “{deck.name}”?</AlertDialog.Title>
        <AlertDialog.Description>{describeDeckCards(deck)}</AlertDialog.Description>
        <DeckRemovalOptions choice={choice} others={others} />
        {action.error && <ErrorNotice message={action.error} />}
        <DeckRemovalActions busy={action.busy} confirm={confirm} />
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

// Moving the cards to the first other deck is the default, the choice that loses nothing.
function useDeckRemovalChoice(others: Deck[]): DeckRemovalChoice {
  const [keepCards, setKeepCards] = useState(true);
  const [target, setTarget] = useState(others[0]?.id ?? '');
  return { keepCards, setKeepCards, target, setTarget };
}

function DeckRemovalOptions({
  choice,
  others,
}: {
  choice: DeckRemovalChoice;
  others: Deck[];
}): React.JSX.Element {
  return (
    <RadioGroup.Root
      className="deck-removal-choice"
      value={choice.keepCards ? 'move' : 'delete'}
      onValueChange={(value) => choice.setKeepCards(value === 'move')}
    >
      <RadioGroup.Item value="move">Move the cards to another deck</RadioGroup.Item>
      {choice.keepCards && (
        <Select.Root value={choice.target} onValueChange={choice.setTarget}>
          <Select.Trigger aria-label="Deck for the cards" />
          <Select.Content>
            {others.map((other) => (
              <Select.Item key={other.id} value={other.id}>
                {other.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
      <RadioGroup.Item value="delete">Delete the cards with the deck</RadioGroup.Item>
    </RadioGroup.Root>
  );
}

function DeckRemovalActions({
  busy,
  confirm,
}: {
  busy: boolean;
  confirm: () => void;
}): React.JSX.Element {
  return (
    <div className="dialog-actions">
      <AlertDialog.Cancel>
        <Button variant="soft" color="gray" disabled={busy}>
          Keep deck
        </Button>
      </AlertDialog.Cancel>
      <Button color="red" loading={busy} onClick={confirm}>
        Delete deck
      </Button>
    </div>
  );
}

function describeDeckCards(deck: Deck): string {
  const held = deck.card_count === 1 ? 'card lives' : 'cards live';
  return `${deck.card_count} ${held} in this deck. Choose what happens to them.`;
}

function describeDeckRemoval(deck: Deck, others: Deck[], removal: DeckRemoval): string {
  if (!deck.card_count) return `Deck “${deck.name}” deleted`;
  if (removal.cards === 'delete') return `Deck “${deck.name}” and its cards deleted`;
  const target = others.find((other) => other.id === removal.target);
  return `Deck “${deck.name}” deleted. Its cards moved to “${target?.name ?? 'another deck'}”`;
}
