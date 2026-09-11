export type Appearance = 'light' | 'dark';

export const APPEARANCE_STORAGE_KEY = 'recall-appearance';
const THEME_COLORS: Record<Appearance, string> = { light: '#f1f0ef', dark: '#0a0a09' };

/**
 * Runs in <head> before the first paint so a dark preference never flashes light.
 * It follows the OS setting until the person explicitly toggles. A saved choice also adds a theme-color tag ahead
 * of the system ones, which browsers read first and React 19 skips when it hydrates the head.
 * Example: <script>{appearanceBootstrapScript}</script>.
 */
export const appearanceBootstrapScript = `(function(){try{var s=localStorage.getItem('${APPEARANCE_STORAGE_KEY}');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';if(s){var m=document.createElement('meta');m.name='theme-color';m.content=d?'${THEME_COLORS.dark}':'${THEME_COLORS.light}';document.head.prepend(m);}}catch(e){}})();`;

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
