import { useEffect, useEffectEvent } from 'react';

const DIALOG_ENTRY = 'recallDialog';

interface OpenDialog {
  close: () => void;
  entryAdded: boolean;
}

// The open dialogs, innermost last, so Back closes only the dialog in front.
const openDialogs: OpenDialog[] = [];
let leftEntries = 0;
let ownTraversals = 0;
let listening = false;

/**
 * Let browser Back close the dialog in front instead of changing the view beneath it or leaving Recall. An open dialog
 * adds a history entry at the same address; Back asks it to close, and it may still confirm before discarding typed
 * text. Example: useDialogBack(open, () => setOpen(false)).
 */
export function useDialogBack(open: boolean, requestClose: () => void): void {
  const close = useEffectEvent(requestClose);
  useEffect(() => {
    if (!open) return;
    const dialog: OpenDialog = { close: () => close(), entryAdded: false };
    openDialogs.push(dialog);
    listenForBack();
    // Added after a tick, so React's development double mount leaves no stray entry behind.
    const timer = window.setTimeout(() => {
      addDialogEntry();
      dialog.entryAdded = true;
    }, 0);
    return () => {
      window.clearTimeout(timer);
      forgetDialog(dialog);
    };
  }, [open]);
}

function listenForBack(): void {
  if (listening) return;
  listening = true;
  window.addEventListener('popstate', closeFrontDialog);
}

// Removing the entries of closed dialogs is Recall's own step back, not the person pressing Back.
function closeFrontDialog(): void {
  if (ownTraversals > 0) {
    ownTraversals -= 1;
    return;
  }
  const front = openDialogs.at(-1);
  if (!front) {
    skipClosedDialogEntry();
    return;
  }
  if (!front.entryAdded) return;
  // The dialog may stay open, for a draft to confirm or a save in flight, so its entry returns first; closing removes
  // it again.
  addDialogEntry();
  front.close();
}

// Forward after Back closed a dialog lands on the entry that dialog left, where there is nothing to show, so Recall
// steps back over it instead of making Forward, and then Back, seem to do nothing.
function skipClosedDialogEntry(): void {
  if (!window.history.state?.[DIALOG_ENTRY]) return;
  ownTraversals += 1;
  window.history.back();
}

// Dialogs that close together, such as a confirmation and the editor behind it, remove their entries in one step.
function forgetDialog(dialog: OpenDialog): void {
  openDialogs.splice(openDialogs.indexOf(dialog), 1);
  if (!dialog.entryAdded) return;
  leftEntries += 1;
  if (leftEntries > 1) return;
  queueMicrotask(() => {
    const count = leftEntries;
    leftEntries = 0;
    if (!window.history.state?.[DIALOG_ENTRY]) return;
    ownTraversals += 1;
    window.history.go(-count);
  });
}

function addDialogEntry(): void {
  window.history.pushState({ [DIALOG_ENTRY]: true }, '', window.location.href);
}
