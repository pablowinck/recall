import { Button, Select, TextArea, TextField } from '@radix-ui/themes';
import { Plus } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import type { Deck } from '@recall/contracts';
import { ErrorNotice } from '@/components/feedback';
import { TEXT_LIMITS } from './card-draft';
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
  const focus = useInlineDeckReturn(state);
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
          ref={focus.newDeck}
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
        trigger={focus.select}
      />
    </div>
  );
}

// The "New deck" button above is the one way to add a deck here; an item inside the list only doubled it.
function DeckSelect({
  decks,
  selected,
  change,
  trigger,
}: {
  decks: Deck[];
  selected: string;
  change: (id: string) => void;
  trigger: RefObject<HTMLButtonElement | null>;
}): React.JSX.Element {
  return (
    <Select.Root value={selected} onValueChange={change}>
      <Select.Trigger ref={trigger} id="card-deck-select" aria-label="Deck" />
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
  const length = useTextLength(value);
  const attributes: ComponentProps<typeof TextArea> = {
    id: 'card-front',
    name: 'front',
    'aria-describedby': 'card-front-hint',
    dir: 'auto',
    defaultValue: value,
    placeholder: 'What would you like to remember?',
    required: true,
    rows: 4,
    autoFocus: !value,
    onKeyDown: handleEditorKeyDown,
    onInput: length.track,
  };
  return (
    <EditorField id="card-front" label="Front" hint="The question or prompt">
      <TextArea {...attributes} />
      <TextLimit length={length.value} limit={TEXT_LIMITS.front} />
    </EditorField>
  );
}

function BackField({ value }: { value?: string }): React.JSX.Element {
  const length = useTextLength(value);
  const attributes: ComponentProps<typeof TextArea> = {
    id: 'card-back',
    name: 'back',
    'aria-describedby': 'card-back-hint',
    dir: 'auto',
    defaultValue: value,
    placeholder: 'Write the answer, with an example if it helps.',
    required: true,
    rows: 5,
    onKeyDown: handleEditorKeyDown,
    onInput: length.track,
  };
  return (
    <EditorField
      id="card-back"
      label="Back"
      hint="The answer · **bold**, *italic*, `code`, - lists"
    >
      <TextArea {...attributes} />
      <TextLimit length={length.value} limit={TEXT_LIMITS.back} />
    </EditorField>
  );
}

function TagsField({ tags }: { tags: string[] }): React.JSX.Element {
  return (
    <EditorField id="card-tags" label="Tags" hint="Comma-separated, up to 12">
      <TextField.Root
        id="card-tags"
        aria-describedby="card-tags-hint"
        name="tags"
        dir="auto"
        autoCapitalize="none"
        defaultValue={tags.join(', ')}
        placeholder="learning, vocabulary"
        onKeyDown={submitOnlyWithModifier}
      />
    </EditorField>
  );
}

interface TextLength {
  value: number;
  track: (event: FormEvent<HTMLTextAreaElement>) => void;
}

// The fields stay uncontrolled; only their length is tracked, for the limit count.
function useTextLength(initial = ''): TextLength {
  const [value, setValue] = useState(initial.length);
  return { value, track: (event) => setValue(event.currentTarget.value.length) };
}

// The fields used to cut a long paste short without a word. Past 90% of a limit the count appears instead, and
// saving over it says by how much. Screen readers hear those numbers on save rather than on every keystroke.
function TextLimit({ length, limit }: { length: number; limit: number }): React.JSX.Element | null {
  if (length < limit * 0.9) return null;
  return (
    <span className={`text-limit ${length > limit ? 'is-over' : ''}`} aria-hidden="true">
      {length.toLocaleString('en-US')} / {limit.toLocaleString('en-US')}
    </span>
  );
}

interface InlineDeckReturn {
  newDeck: RefObject<HTMLButtonElement | null>;
  select: RefObject<HTMLButtonElement | null>;
}

// Closing the inline deck form removes the focused field. Cancel or Escape returns focus to "New deck"; adding a deck
// moves it to the deck list, which reads the new deck as the choice.
function useInlineDeckReturn(state: CardEditorState): InlineDeckReturn {
  const newDeck = useRef<HTMLButtonElement>(null);
  const select = useRef<HTMLButtonElement>(null);
  const deckWhenOpened = useRef<string | null>(null);
  useEffect(() => {
    if (state.creatingDeck) {
      deckWhenOpened.current ??= state.deck;
      return;
    }
    const opened = deckWhenOpened.current;
    deckWhenOpened.current = null;
    if (opened === null) return;
    (opened === state.deck ? newDeck : select).current?.focus();
  }, [state.creatingDeck, state.deck]);
  return { newDeck, select };
}

// The label names the field and the hint describes it, so a screen reader hears "Back" and then the hint instead of
// one long name with Markdown in it. On screen the hint shares the label's row, like the deck field's header.
function EditorField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="editor-field">
      <div className="editor-field-label">
        <label htmlFor={id}>{label}</label>
        <span id={`${id}-hint`} className="field-hint">
          {hint}
        </span>
      </div>
      {children}
    </div>
  );
}
