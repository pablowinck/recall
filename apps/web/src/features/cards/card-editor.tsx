'use client';
import { useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import { ErrorNotice } from '@/components/feedback';
import { CardEditorFields } from './card-editor-fields';
import { CardEditorActions } from './card-editor-actions';
import { DiscardDraftDialog } from './discard-draft-dialog';
import { useCardEditor, type CardEditorProps, type CardEditorState } from './use-card-editor';

interface EditorDismissal {
  confirming: boolean;
  request: () => void;
  keepEditing: () => void;
}

/** Use one editor to create and update cards without losing typed text. Example: <CardEditor {...props} />. */
export function CardEditor(props: CardEditorProps): React.JSX.Element {
  const state = useCardEditor(props);
  const dismissal = useEditorDismissal(props, state);
  return (
    <Dialog.Root open>
      <CardEditorContent editor={props} state={state} dismissal={dismissal} />
      <DiscardDraftDialog
        open={dismissal.confirming}
        editing={Boolean(props.card)}
        keepEditing={dismissal.keepEditing}
        discard={props.close}
      />
    </Dialog.Root>
  );
}

function useEditorDismissal(props: CardEditorProps, state: CardEditorState): EditorDismissal {
  const [confirming, setConfirming] = useState(false);
  const request = (): void => {
    if (state.action.busy) return;
    if (state.hasChanges()) setConfirming(true);
    else props.close();
  };
  return { confirming, request, keepEditing: () => setConfirming(false) };
}

function CardEditorContent({
  editor,
  state,
  dismissal,
}: {
  editor: CardEditorProps;
  state: CardEditorState;
  dismissal: EditorDismissal;
}): React.JSX.Element {
  const opener = useOpener();
  return (
    <Dialog.Content
      maxWidth="640px"
      className="card-editor"
      {...createDismissHandlers(state, dismissal)}
      onCloseAutoFocus={(event) => restoreOpenerFocus(event, opener)}
    >
      <CardEditorHeader hasCard={Boolean(editor.card)} />
      <form ref={state.form} onSubmit={state.submit}>
        <CardEditorFields editor={editor} state={state} />
        {state.action.error && <ErrorNotice message={state.action.error} />}
        <CardEditorActions editor={editor} busy={state.action.busy} cancel={dismissal.request} />
      </form>
    </Dialog.Content>
  );
}

function createDismissHandlers(
  state: CardEditorState,
  dismissal: EditorDismissal,
): {
  onEscapeKeyDown: (event: KeyboardEvent) => void;
  onPointerDownOutside: (event: Event) => void;
} {
  return {
    onEscapeKeyDown: (event) => {
      event.preventDefault();
      // Radix handles Escape before the inline deck field sees it, so close that form first.
      if (state.creatingDeck) state.setCreatingDeck(false);
      else dismissal.request();
    },
    onPointerDownOutside: (event) => {
      event.preventDefault();
      dismissal.request();
    },
  };
}

// The editor opens from several places without a Dialog.Trigger, so remember what had focus.
function useOpener(): HTMLElement | null {
  const [opener] = useState(() =>
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null),
  );
  return opener;
}

function restoreOpenerFocus(event: Event, opener: HTMLElement | null): void {
  if (!opener?.isConnected || opener === document.body) return;
  event.preventDefault();
  opener.focus();
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
