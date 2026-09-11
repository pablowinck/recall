import { useSyncExternalStore } from 'react';

const HOVER_POINTER = '(hover: hover) and (pointer: fine)';

/** Tell whether the primary pointer can hover, so hover-only help stays off touch screens. Example: const canHover = useHoverPointer(). */
export function useHoverPointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(HOVER_POINTER).matches,
    () => false,
  );
}

function subscribe(changed: () => void): () => void {
  const query = matchMedia(HOVER_POINTER);
  query.addEventListener('change', changed);
  return () => query.removeEventListener('change', changed);
}
