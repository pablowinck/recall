'use client';
import { useRef, useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import { ErrorNotice } from '@/components/feedback';
import { focusPageHeading } from '@/components/page-heading';
import { useDialogBack } from '@/lib/use-dialog-back';
import { CardEditorFields } from './card-editor-fields';
import { CardEditorActions } from './card-editor-actions';
import { DiscardDraftDialog } from './discard-draft-dialog';
import { useCardEditor, type CardEditorProps, type CardEditorState } from './use-card-editor';
import { useUnsavedDraftWarning } from './use-unsaved-draft-warning';

interface EditorDismissal {
  confirming: boolean;
  request: () => void;
  keepEditing: () => void;
  /** The field that had focus when the discard question opened. */
  returnFocus: () => HTMLElement | null;
}

/** Use one editor to create and update cards without losing typed text. Example: <CardEditor {...props} />. */
export function CardEditor(props: CardEditorProps): React.JSX.Element {
  const state = useCardEditor(props);
  const dismissal = useEditorDismissal(props, state);
  useUnsavedDraftWarning(state.hasChanges);
  useDialogBack(true, dismissal.request);
  return (
    <Dialog.Root open>
      <CardEditorContent editor={props} state={state} dismissal={dismissal} />
      <DiscardDraftDialog
        open={dismissal.confirming}
        editing={Boolean(props.card)}
        keepEditing={dismissal.keepEditing}
        returnFocus={dismissal.returnFocus}
        discard={props.close}
      />
    </Dialog.Root>
  );
}

function useEditorDismissal(props: CardEditorProps, state: CardEditorState): EditorDismissal {
  const [confirming, setConfirming] = useState(false);
  const focused = useRef<HTMLElement | null>(null);
  const request = (): void => {
    if (state.action.busy) return;
    if (!state.hasChanges()) return props.close();
    focused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setConfirming(true);
  };
  return {
    confirming,
    request,
    keepEditing: () => setConfirming(false),
    returnFocus: () => focused.current,
  };
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
      onCloseAutoFocus={(event) => restoreFocus(event, opener, state.removed.current)}
    >
      <CardEditorHeader hasCard={Boolean(editor.card)} />
      <form ref={state.form} onSubmit={state.submit}>
        <CardEditorFields editor={editor} state={state} />
        {state.action.error && <ErrorNotice message={state.action.error} />}
        <CardEditorActions
          editor={editor}
          busy={state.action.busy}
          cancel={dismissal.request}
          remove={state.remove}
        />
      </form>
    </Dialog.Content>
  );
}

type OutsideEvent = Event & { detail: { originalEvent: MouseEvent } };

function createDismissHandlers(
  state: CardEditorState,
  dismissal: EditorDismissal,
): {
  onEscapeKeyDown: (event: KeyboardEvent) => void;
  onPointerDownOutside: (event: Event) => void;
} {
  return {
    onEscapeKeyDown: (event) => {
      // The discard question above may have handled this Escape already; asking again as it closes would reopen it.
      if (event.defaultPrevented) return;
      event.preventDefault();
      // Radix handles Escape before the inline deck field sees it, so close that form first.
      if (state.creatingDeck) state.setCreatingDeck(false);
      else dismissal.request();
    },
    onPointerDownOutside: (event) => {
      event.preventDefault();
      // A right-click outside opens a context menu; it must not put a draft at risk.
      if ((event as OutsideEvent).detail.originalEvent.button !== 0) return;
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

// A deleted card takes its library tile with it, so focus moves to the view's title instead of the opener.
function restoreFocus(event: Event, opener: HTMLElement | null, removed: boolean): void {
  if (removed) {
    event.preventDefault();
    focusPageHeading();
    return;
  }
  if (!opener?.isConnected || opener === document.body) return;
  event.preventDefault();
  opener.focus();
}

function CardEditorHeader({ hasCard }: { hasCard: boolean }): React.JSX.Element {
  return (
    <>
      <Dialog.Title>{hasCard ? 'Edit card' : 'New card'}</Dialog.Title>
      <Dialog.Description mb="5">
        One idea per card. One question that helps you remember.
      </Dialog.Description>
    </>
  );
}
