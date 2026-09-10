import { useEffect, useEffectEvent } from 'react';

/**
 * Let the browser confirm a reload or a closed tab while the editor holds unsaved text.
 * Example: useUnsavedDraftWarning(state.hasChanges).
 */
export function useUnsavedDraftWarning(hasChanges: () => boolean): void {
  const isDirty = useEffectEvent(hasChanges);
  useEffect(() => {
    const confirmLeaving = (event: BeforeUnloadEvent): void => {
      if (isDirty()) event.preventDefault();
    };
    window.addEventListener('beforeunload', confirmLeaving);
    return () => window.removeEventListener('beforeunload', confirmLeaving);
  }, []);
}
