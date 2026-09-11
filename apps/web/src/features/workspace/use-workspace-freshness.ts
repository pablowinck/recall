import { useEffect, useEffectEvent } from 'react';

const REFRESH_INTERVAL_MS = 60_000;
// Coming back fires several events at once, a tab shown and its window focused, and focus also returns from the
// browser's own menus and dialogs, so one return refreshes once and returns refresh at most this often.
const RETURN_GAP_MS = 10_000;

interface FreshnessOptions {
  everyMinute?: boolean;
}
interface ReturnHandlers {
  online: () => void;
  returned: () => void;
}

/**
 * Keep an open view current: refresh when the tab or its window comes back and when the network returns, and once a
 * minute while it stays visible unless the view would shift under a reader. Example: useWorkspaceFreshness(view === 'today', refresh).
 */
export function useWorkspaceFreshness(
  active: boolean,
  refresh: () => void,
  { everyMinute = true }: FreshnessOptions = {},
): void {
  const onRefresh = useEffectEvent(refresh);
  useEffect(() => {
    if (!active) return;
    const refreshNow = (): void => onRefresh();
    const timer = everyMinute
      ? window.setInterval(whenVisible(refreshNow), REFRESH_INTERVAL_MS)
      : 0;
    const stopListening = listenForReturns({
      online: whenVisible(refreshNow),
      returned: whenVisible(atMostEvery(RETURN_GAP_MS, refreshNow)),
    });
    return () => {
      window.clearInterval(timer);
      stopListening();
    };
  }, [active, everyMinute]);
}

// An assistant in a window beside the browser adds cards while the tab stays visible, so focusing the window again
// counts as coming back. pageshow covers a page the browser restores from its back-forward cache.
function listenForReturns({ online, returned }: ReturnHandlers): () => void {
  document.addEventListener('visibilitychange', returned);
  window.addEventListener('focus', returned);
  window.addEventListener('pageshow', returned);
  window.addEventListener('online', online);
  return () => {
    document.removeEventListener('visibilitychange', returned);
    window.removeEventListener('focus', returned);
    window.removeEventListener('pageshow', returned);
    window.removeEventListener('online', online);
  };
}

// A hidden tab has nothing to show, and its hiding must not use up the refresh its return is owed.
function whenVisible(run: () => void): () => void {
  return () => {
    if (document.visibilityState === 'visible') run();
  };
}

function atMostEvery(gap: number, run: () => void): () => void {
  let last = Number.NEGATIVE_INFINITY;
  return () => {
    const now = Date.now();
    if (now - last < gap) return;
    last = now;
    run();
  };
}
