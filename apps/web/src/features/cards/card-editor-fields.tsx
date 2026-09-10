import { Select, TextArea, TextField } from '@radix-ui/themes';
import type { ComponentProps } from 'react';
import type { Deck } from '@recall/contracts';
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
      <DeckField decks={editor.decks} selected={state.deck} change={state.setDeck} />
      <FrontField value={editor.card?.front} />
      <BackField value={editor.card?.back} />
      <TagsField tags={editor.card?.tags ?? []} />
    </fieldset>
  );
}

function DeckField({
  decks,
  selected,
  change,
}: {
  decks: Deck[];
  selected: string;
  change: (id: string) => void;
}): React.JSX.Element {
  return (
    <label>
      Deck
      <Select.Root value={selected} onValueChange={change}>
        <Select.Trigger aria-label="Deck" />
        <Select.Content>
          {decks.map((deck) => (
            <Select.Item key={deck.id} value={deck.id}>
              {deck.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </label>
  );
}

function FrontField({ value }: { value?: string }): React.JSX.Element {
  const attributes: ComponentProps<typeof TextArea> = {
    name: 'front',
    defaultValue: value,
    placeholder: 'What would you like to remember?',
    required: true,
    maxLength: 4000,
    rows: 4,
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
  };
  return (
    <label>
      Back <span className="field-hint">The answer, with an example</span>
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
      />
    </label>
  );
}
