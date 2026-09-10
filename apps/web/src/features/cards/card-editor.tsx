'use client';
import { useState, type FormEvent } from 'react';
import { AlertDialog, Button, Dialog, Select, TextArea, TextField } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import type { Deck, Flashcard } from '@recall/contracts';
import { describeFailure, ErrorNotice } from '@/components/feedback';

interface EditorProps {
  client: RecallClient;
  decks: Deck[];
  card?: Flashcard;
  close: () => void;
  saved: () => void;
}

/** Use one editor to create and update cards. Example: <CardEditor {...props} />. */
export function CardEditor(props: EditorProps): React.JSX.Element {
  const [deck, setDeck] = useState(props.card?.deck_id ?? props.decks[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const fields = new FormData(event.currentTarget);
    const draft = {
      deck_id: deck,
      front: String(fields.get('front')),
      back: String(fields.get('back')),
      tags: String(fields.get('tags'))
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    try {
      if (props.card) await props.client.updateCard(props.card.id, draft);
      else await props.client.createCard(draft);
      props.saved();
      props.close();
    } catch (failure) {
      setError(describeFailure(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !busy) props.close();
      }}
    >
      <Dialog.Content maxWidth="640px" className="card-editor">
        <Dialog.Title>{props.card ? 'Edit card' : 'New card'}</Dialog.Title>
        <Dialog.Description size="2" mb="5">
          One idea per card. One question that helps you remember.
        </Dialog.Description>
        <form onSubmit={submit}>
          <div className="form-fields">
            <label>
              Deck
              <Select.Root value={deck} onValueChange={setDeck}>
                <Select.Trigger aria-label="Deck" />
                <Select.Content>
                  {props.decks.map((item) => (
                    <Select.Item key={item.id} value={item.id}>
                      {item.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>
            <label>
              Front <span className="field-hint">The question or prompt</span>
              <TextArea
                name="front"
                defaultValue={props.card?.front}
                placeholder="What would you like to remember?"
                required
                maxLength={4000}
                rows={4}
              />
            </label>
            <label>
              Back <span className="field-hint">The answer, with an example</span>
              <TextArea
                name="back"
                defaultValue={props.card?.back}
                placeholder="Write the answer, with an example if it helps."
                required
                maxLength={8000}
                rows={5}
              />
            </label>
            <label>
              Tags <span className="field-hint">Comma-separated, up to 12</span>
              <TextField.Root
                name="tags"
                defaultValue={props.card?.tags.join(', ')}
                placeholder="learning, vocabulary"
              />
            </label>
          </div>
          {error && <ErrorNotice message={error} />}
          <div className="dialog-actions">
            {props.card && (
              <DeleteCard
                client={props.client}
                id={props.card.id}
                done={() => {
                  props.saved();
                  props.close();
                }}
              />
            )}
            <Button type="button" variant="soft" color="gray" onClick={props.close} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              {props.card ? 'Save changes' : 'Create card'}
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function DeleteCard({
  client,
  id,
  done,
}: {
  client: RecallClient;
  id: string;
  done: () => void;
}): React.JSX.Element {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const remove = async (): Promise<void> => {
    setBusy(true);
    try {
      await client.deleteCard(id);
      done();
    } catch (failure) {
      setError(describeFailure(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button
          type="button"
          variant="ghost"
          color="red"
          className="delete-button"
          aria-label="Delete card"
        >
          <Trash2 size={18} />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="420px">
        <AlertDialog.Title>Delete this card?</AlertDialog.Title>
        <AlertDialog.Description>
          The card and its review history will be deleted. This cannot be undone.
        </AlertDialog.Description>
        {error && <ErrorNotice message={error} />}
        <div className="dialog-actions">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Keep card
            </Button>
          </AlertDialog.Cancel>
          <Button color="red" onClick={() => void remove()} loading={busy}>
            Delete permanently
          </Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
