'use client';
import { useState } from 'react';
import { AlertDialog, Button, IconButton, RadioGroup, Select } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import type { Deck, DeckRemoval } from '@recall/contracts';
import { ErrorNotice } from '@/components/feedback';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';

interface DeleteDeckProps {
  deck: Deck;
  decks: Deck[];
  client: RecallClient;
  done: () => void;
}
interface DeckRemovalDialogProps {
  deck: Deck;
  others: Deck[];
  action: AsyncAction;
  remove: (removal: DeckRemoval) => Promise<boolean>;
}

/** Delete the deck the library is filtered by. Example: <DeleteDeckButton deck={deck} decks={decks} client={client} done={refresh} />. */
export function DeleteDeckButton({
  deck,
  decks,
  client,
  done,
}: DeleteDeckProps): React.JSX.Element | null {
  const others = decks.filter((other) => other.id !== deck.id);
  const action = useAsyncAction();
  const remove = async (removal: DeckRemoval): Promise<boolean> => {
    const removed = await action.run(() => client.deleteDeck(deck.id, removal));
    if (removed) done();
    return Boolean(removed);
  };
  // A tenant always keeps one deck, so the last one offers no delete at all.
  if (!others.length) return null;
  if (!deck.card_count)
    return (
      <DeleteDeckTrigger
        deck={deck}
        busy={action.busy}
        onClick={() => void remove({ cards: 'delete' })}
      />
    );
  return <DeckRemovalDialog deck={deck} others={others} action={action} remove={remove} />;
}

function DeleteDeckTrigger({
  deck,
  busy,
  onClick,
}: {
  deck: Deck;
  busy: boolean;
  onClick?: () => void;
}): React.JSX.Element {
  return (
    <IconButton
      variant="ghost"
      color="red"
      aria-label={`Delete deck ${deck.name}`}
      loading={busy}
      onClick={onClick}
    >
      <Trash2 size={17} />
    </IconButton>
  );
}

function DeckRemovalDialog({
  deck,
  others,
  action,
  remove,
}: DeckRemovalDialogProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [keepCards, setKeepCards] = useState(true);
  const [target, setTarget] = useState(others[0]?.id ?? '');
  const confirm = (): void => {
    const removal: DeckRemoval = keepCards ? { cards: 'move', target } : { cards: 'delete' };
    void remove(removal).then((removed) => {
      if (removed) setOpen(false);
    });
  };
  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !action.busy && setOpen(next)}>
      <AlertDialog.Trigger>
        <DeleteDeckTrigger deck={deck} busy={false} />
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="460px">
        <AlertDialog.Title>Delete “{deck.name}”?</AlertDialog.Title>
        <AlertDialog.Description>{describeDeckCards(deck)}</AlertDialog.Description>
        <RadioGroup.Root
          className="deck-removal-choice"
          value={keepCards ? 'move' : 'delete'}
          onValueChange={(value) => setKeepCards(value === 'move')}
        >
          <RadioGroup.Item value="move">Move the cards to another deck</RadioGroup.Item>
          {keepCards && (
            <Select.Root value={target} onValueChange={setTarget}>
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
        {action.error && <ErrorNotice message={action.error} />}
        <div className="dialog-actions">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" disabled={action.busy}>
              Keep deck
            </Button>
          </AlertDialog.Cancel>
          <Button color="red" loading={action.busy} onClick={confirm}>
            Delete deck
          </Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

function describeDeckCards(deck: Deck): string {
  const held = deck.card_count === 1 ? 'card lives' : 'cards live';
  return `${deck.card_count} ${held} in this deck. Choose what happens to them.`;
}
