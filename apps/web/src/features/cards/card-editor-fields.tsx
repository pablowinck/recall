import { Button, Select, TextArea, TextField } from '@radix-ui/themes';
import { Plus } from 'lucide-react';
import { useState, type ComponentProps, type KeyboardEvent } from 'react';
import type { Deck } from '@recall/contracts';
import { ErrorNotice } from '@/components/feedback';
import { isCommandEnter, isSaveShortcut } from './editor-keys';
import type { CardEditorProps, CardEditorState } from './use-card-editor';

/** Keep card fields independent of request state. Example: <CardEditorFields editor={props} state={state} />. */
export function CardEditorFields({
  editor,
  state,
}: {
  editor: CardEditorProps;
  state: CardEditorState;
}): React.JSX.Element {
  return (
    <fieldset className="form-fields" aria-label="Card details" disabled={state.action.busy}>
      <DeckField state={state} />
      <FrontField value={editor.card?.front} />
      <BackField value={editor.card?.back} />
      <TagsField tags={editor.card?.tags ?? []} />
    </fieldset>
  );
}

function DeckField({ state }: { state: CardEditorState }): React.JSX.Element {
  if (state.creatingDeck) {
    return <InlineDeckCreator state={state} />;
  }
  return (
    <div>
      <div className="deck-field-header">
        <label htmlFor="card-deck-select" className="deck-field-label">
          Deck
        </label>
        <button
          type="button"
          className="inline-deck-btn"
          onClick={() => state.setCreatingDeck(true)}
        >
          <Plus size={14} />
          <span>New deck</span>
        </button>
      </div>
      <DeckSelect decks={state.decks} selected={state.deck} change={state.setDeck} />
    </div>
  );
}

// The "New deck" button above is the one way to add a deck here; an item inside the list only doubled it.
function DeckSelect({
  decks,
  selected,
  change,
}: {
  decks: Deck[];
  selected: string;
  change: (id: string) => void;
}): React.JSX.Element {
  return (
    <Select.Root value={selected} onValueChange={change}>
      <Select.Trigger id="card-deck-select" aria-label="Deck" />
      <Select.Content>
        {decks.map((deck) => (
          <Select.Item key={deck.id} value={deck.id}>
            {deck.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

interface InlineDeckName {
  name: string;
  setName: (name: string) => void;
  submit: () => Promise<void>;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

// Escape is handled by the editor dialog, which closes this inline form before the editor itself.
function useInlineDeckName(state: CardEditorState): InlineDeckName {
  const [name, setName] = useState('');
  const submit = async (): Promise<void> => {
    if (!name.trim() || state.deckAction.busy) return;
    await state.createInlineDeck(name);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (!isCommandEnter(event)) return;
    event.preventDefault();
    void submit();
  };
  return { name, setName, submit, onKeyDown };
}

function InlineDeckCreator({ state }: { state: CardEditorState }): React.JSX.Element {
  const deckName = useInlineDeckName(state);
  const busy = state.deckAction.busy;
  return (
    <div className="inline-deck-box">
      <InlineDeckHeader busy={busy} cancel={() => state.setCreatingDeck(false)} />
      <div className="inline-deck-inputs">
        <TextField.Root
          id="inline-deck-name"
          value={deckName.name}
          onChange={(event) => deckName.setName(event.target.value)}
          onKeyDown={deckName.onKeyDown}
          maxLength={80}
          placeholder="e.g. Spanish Vocabulary"
          disabled={busy}
          autoFocus
        />
        <Button
          type="button"
          size="2"
          onClick={() => void deckName.submit()}
          loading={busy}
          disabled={!deckName.name.trim()}
        >
          Add
        </Button>
      </div>
      {state.deckAction.error && <ErrorNotice message={state.deckAction.error} />}
    </div>
  );
}

function InlineDeckHeader({
  busy,
  cancel,
}: {
  busy: boolean;
  cancel: () => void;
}): React.JSX.Element {
  return (
    <div className="deck-field-header">
      <label htmlFor="inline-deck-name" className="deck-field-label">
        New deck name
      </label>
      <button
        type="button"
        className="inline-deck-btn"
        aria-label="Cancel new deck"
        onClick={cancel}
        disabled={busy}
      >
        Cancel
      </button>
    </div>
  );
}

function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
  if (isSaveShortcut(event)) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

// A plain Enter in the last field used to save and close the editor by surprise; Cmd/Ctrl+Enter saves.
function submitOnlyWithModifier(event: KeyboardEvent<HTMLInputElement>): void {
  if (!isCommandEnter(event)) return;
  event.preventDefault();
  if (isSaveShortcut(event)) event.currentTarget.form?.requestSubmit();
}

function FrontField({ value }: { value?: string }): React.JSX.Element {
  const attributes: ComponentProps<typeof TextArea> = {
    name: 'front',
    defaultValue: value,
    placeholder: 'What would you like to remember?',
    required: true,
    maxLength: 4000,
    rows: 4,
    autoFocus: !value,
    onKeyDown: handleEditorKeyDown,
  };
  return (
    <label>
      Front <span className="field-hint">The question or prompt</span>
      <TextArea {...attributes} />
    </label>
  );
}

function BackField({ value }: { value?: string }): React.JSX.Element {
  const attributes: ComponentProps<typeof TextArea> = {
    name: 'back',
    defaultValue: value,
    placeholder: 'Write the answer, with an example if it helps.',
    required: true,
    maxLength: 8000,
    rows: 5,
    onKeyDown: handleEditorKeyDown,
  };
  return (
    <label>
      Back <span className="field-hint">The answer · **bold**, *italic*, `code`, - lists</span>
      <TextArea {...attributes} />
    </label>
  );
}

function TagsField({ tags }: { tags: string[] }): React.JSX.Element {
  return (
    <label>
      Tags <span className="field-hint">Comma-separated, up to 12</span>
      <TextField.Root
        name="tags"
        defaultValue={tags.join(', ')}
        placeholder="learning, vocabulary"
        onKeyDown={submitOnlyWithModifier}
      />
    </label>
  );
}
