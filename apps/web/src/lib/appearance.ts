export type Appearance = 'light' | 'dark';

export const APPEARANCE_STORAGE_KEY = 'recall-appearance';
const THEME_COLORS: Record<Appearance, string> = { light: '#f1f0ef', dark: '#0a0a09' };

/**
 * Runs in <head> before the first paint so a dark preference never flashes light.
 * It follows the OS setting until the person explicitly toggles. Example: <script>{appearanceBootstrapScript}</script>.
 */
export const appearanceBootstrapScript = `(function(){try{var s=localStorage.getItem('${APPEARANCE_STORAGE_KEY}');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

/** Read the appearance applied to the document. Example: readAppearance() === 'dark'. */
export function readAppearance(): Appearance {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Apply an appearance to the document, its native controls and the browser chrome color. Example: applyAppearance('dark'). */
export function applyAppearance(appearance: Appearance): void {
  const root = document.documentElement;
  root.classList.toggle('dark', appearance === 'dark');
  root.style.colorScheme = appearance;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLORS[appearance]));
}

/** Read an explicit choice; null means "follow the operating system". Example: readStoredAppearance(). */
export function readStoredAppearance(): Appearance | null {
  try {
    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

/** Persist an explicit choice when storage is available. Example: storeAppearance('light'). */
export function storeAppearance(appearance: Appearance): void {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
  } catch {
    // Private browsing can block storage; the choice still applies to this page.
  }
}
