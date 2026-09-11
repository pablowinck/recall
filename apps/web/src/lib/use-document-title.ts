import { useEffect } from 'react';

/**
 * Name the browser tab while a screen is shown. Next commits the route's metadata title just after the first render,
 * which replaces a title set once, so the title is set again whenever the head's title changes. One screen at a time
 * should name the tab. Example: useDocumentTitle('Sign in · Recall').
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const apply = (): void => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
}
