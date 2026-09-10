'use client';
import { Dialog } from '@radix-ui/themes';
import { ErrorNotice } from '@/components/feedback';
import { CardEditorFields } from './card-editor-fields';
import { CardEditorActions } from './card-editor-actions';
import { useCardEditor, type CardEditorProps, type CardEditorState } from './use-card-editor';

/** Use one editor to create and update cards. Example: <CardEditor {...props} />. */
export function CardEditor(props: CardEditorProps): React.JSX.Element {
  const state = useCardEditor(props);
  const changeOpen = (open: boolean): void => {
    if (!open && !state.action.busy) props.close();
  };
  return (
    <Dialog.Root open onOpenChange={changeOpen}>
      <CardEditorContent editor={props} state={state} />
    </Dialog.Root>
  );
}

function CardEditorContent({
  editor,
  state,
}: {
  editor: CardEditorProps;
  state: CardEditorState;
}): React.JSX.Element {
  return (
    <Dialog.Content maxWidth="640px" className="card-editor">
      <CardEditorHeader hasCard={Boolean(editor.card)} />
      <form onSubmit={state.submit}>
        <CardEditorFields editor={editor} state={state} />
        {state.action.error && <ErrorNotice message={state.action.error} />}
        <CardEditorActions editor={editor} busy={state.action.busy} />
      </form>
    </Dialog.Content>
  );
}

function CardEditorHeader({ hasCard }: { hasCard: boolean }): React.JSX.Element {
  return (
    <>
      <Dialog.Title>{hasCard ? 'Edit card' : 'New card'}</Dialog.Title>
      <Dialog.Description size="2" mb="5">
        One idea per card. One question that helps you remember.
      </Dialog.Description>
    </>
  );
}
