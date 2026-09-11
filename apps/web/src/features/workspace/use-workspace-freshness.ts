import { useEffect, useEffectEvent } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

interface FreshnessOptions {
  everyMinute?: boolean;
}

/**
 * Keep an open view current: refresh when the tab comes back and when the network returns, and once a minute
 * while it stays visible unless the view would shift under a reader. Example: useWorkspaceFreshness(view === 'today', refresh).
 */
export function useWorkspaceFreshness(
  active: boolean,
  refresh: () => void,
  { everyMinute = true }: FreshnessOptions = {},
): void {
  const onRefresh = useEffectEvent(refresh);
  useEffect(() => {
    if (!active) return;
    const refreshWhenVisible = (): void => {
      if (document.visibilityState === 'visible') onRefresh();
    };
    const timer = everyMinute ? window.setInterval(refreshWhenVisible, REFRESH_INTERVAL_MS) : 0;
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('online', refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('online', refreshWhenVisible);
    };
  }, [active, everyMinute]);
}
