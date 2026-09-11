import { useEffect, type RefObject } from 'react';

/**
 * Mark the study view while the card runs beneath its pinned bar, so the bar shows its material and hairline only
 * then, the way toolbars do. Example: useStudyBarOverlap(screen).
 */
export function useStudyBarOverlap(screen: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = screen.current;
    if (!root) return undefined;
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      root.toggleAttribute('data-bar-over-card', isBarOverCard(root));
    };
    const schedule = (): void => {
      frame ||= window.requestAnimationFrame(measure);
    };
    const stopWatching = watchLayout(root, schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      stopWatching();
    };
  }, [screen]);
}

// Revealing an answer resizes the view, and scrolling or resizing the window moves the card under the bar.
function watchLayout(root: HTMLElement, changed: () => void): () => void {
  const resizes = new ResizeObserver(changed);
  resizes.observe(root);
  window.addEventListener('scroll', changed, { passive: true });
  window.addEventListener('resize', changed);
  return () => {
    resizes.disconnect();
    window.removeEventListener('scroll', changed);
    window.removeEventListener('resize', changed);
  };
}

function isBarOverCard(root: HTMLElement): boolean {
  const card = root.querySelector('.review-card');
  const bar = root.querySelector('.reveal-action, .rating-section');
  if (!card || !bar) return false;
  return bar.getBoundingClientRect().top < card.getBoundingClientRect().bottom - 1;
}
