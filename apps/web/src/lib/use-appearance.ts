'use client';
import { useSyncExternalStore } from 'react';
import {
  applyAppearance,
  readAppearance,
  readStoredAppearance,
  storeAppearance,
  type Appearance,
} from './appearance';

const systemDark = '(prefers-color-scheme: dark)';

/** Track the document appearance and toggle it explicitly. Example: const [appearance, toggle] = useAppearance(). */
export function useAppearance(): [Appearance, () => void] {
  const appearance = useSyncExternalStore<Appearance>(
    subscribeToAppearance,
    readAppearance,
    readServerAppearance,
  );
  const toggle = (): void => {
    const next: Appearance = readAppearance() === 'dark' ? 'light' : 'dark';
    storeAppearance(next);
    applyAppearance(next);
  };
  return [appearance, toggle];
}

// The server cannot know the preference; the head script corrects the document before paint.
function readServerAppearance(): Appearance {
  return 'light';
}

function subscribeToAppearance(notify: () => void): () => void {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const media = matchMedia(systemDark);
  const followSystem = (): void => {
    if (!readStoredAppearance()) applyAppearance(media.matches ? 'dark' : 'light');
  };
  media.addEventListener('change', followSystem);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', followSystem);
  };
}
