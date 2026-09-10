import { Button, Select, TextArea, TextField } from '@radix-ui/themes';
import { Plus } from 'lucide-react';
import { useState, type ComponentProps, type KeyboardEvent } from 'react';
import type { Deck } from '@recall/contracts';
import { ErrorNotice } from '@/components/feedback';
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
      <DeckSelect
        decks={state.decks}
        selected={state.deck}
        change={state.setDeck}
        startCreating={() => state.setCreatingDeck(true)}
      />
    </div>
  );
}

function DeckSelect({
  decks,
  selected,
  change,
  startCreating,
}: {
  decks: Deck[];
  selected: string;
  change: (id: string) => void;
  startCreating: () => void;
}): React.JSX.Element {
  const onValueChange = (value: string): void => {
    if (value === '__create_new__') startCreating();
    else change(value);
  };
  return (
    <Select.Root value={selected} onValueChange={onValueChange}>
      <Select.Trigger id="card-deck-select" aria-label="Deck" />
      <Select.Content>
        {decks.map((deck) => (
          <Select.Item key={deck.id} value={deck.id}>
            {deck.name}
          </Select.Item>
        ))}
        <Select.Separator />
        <Select.Item value="__create_new__">+ Create new deck...</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}

function InlineDeckCreator({ state }: { state: CardEditorState }): React.JSX.Element {
  const [name, setName] = useState('');
  const submitInline = async (): Promise<void> => {
    if (!name.trim() || state.deckAction.busy) return;
    await state.createInlineDeck(name);
  };
  // Escape is handled by the editor dialog, which closes this inline form before the editor itself.
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    void submitInline();
  };
  return (
    <div className="inline-deck-box">
      <div className="deck-field-header">
        <span className="deck-field-label">New deck name</span>
        <button
          type="button"
          className="inline-deck-btn"
          onClick={() => state.setCreatingDeck(false)}
          disabled={state.deckAction.busy}
        >
          Cancel
        </button>
      </div>
      <div className="inline-deck-inputs">
        <TextField.Root
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={80}
          placeholder="e.g. Spanish Vocabulary"
          disabled={state.deckAction.busy}
          autoFocus
        />
        <Button
          type="button"
          size="2"
          onClick={() => void submitInline()}
          loading={state.deckAction.busy}
          disabled={!name.trim()}
        >
          Add
        </Button>
      </div>
      {state.deckAction.error && <ErrorNotice message={state.deckAction.error} />}
    </div>
  );
}

function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

// A plain Enter in the last field used to save and close the editor by surprise; Cmd/Ctrl+Enter saves.
function submitOnlyWithModifier(event: KeyboardEvent<HTMLInputElement>): void {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  if (event.metaKey || event.ctrlKey) event.currentTarget.form?.requestSubmit();
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
