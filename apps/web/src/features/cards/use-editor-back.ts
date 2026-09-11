import { useEffect, useEffectEvent } from 'react';

const EDITOR_ENTRY = 'recallEditor';

/**
 * Let browser Back close the card editor instead of changing the view beneath it, or leaving Recall with the draft.
 * Opening the editor adds a history entry at the same address; Back asks the editor to close, which still confirms
 * before discarding typed text. Example: useEditorBack(dismissal.request).
 */
export function useEditorBack(requestClose: () => void): void {
  const close = useEffectEvent(requestClose);
  useEffect(() => {
    let added = false;
    // Added after a tick, so React's development double mount leaves no stray entry behind.
    const timer = window.setTimeout(() => {
      addEditorEntry();
      added = true;
    }, 0);
    const onBack = (): void => {
      if (!added) return;
      // The editor may stay open, for a draft to confirm or a save in flight, so its entry returns first; when the
      // editor closes, cleanup removes the entry again.
      addEditorEntry();
      close();
    };
    window.addEventListener('popstate', onBack);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('popstate', onBack);
      if (added && window.history.state?.[EDITOR_ENTRY]) window.history.back();
    };
  }, []);
}

function addEditorEntry(): void {
  window.history.pushState({ [EDITOR_ENTRY]: true }, '', window.location.href);
}
