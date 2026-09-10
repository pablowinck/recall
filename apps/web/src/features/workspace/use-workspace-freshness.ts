import { useEffect, useEffectEvent } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

/**
 * Keep an open Today current: refresh when the tab comes back, when the network returns and once a
 * minute while it stays visible. Example: useWorkspaceFreshness(view === 'today', refresh).
 */
export function useWorkspaceFreshness(active: boolean, refresh: () => void): void {
  const onRefresh = useEffectEvent(refresh);
  useEffect(() => {
    if (!active) return;
    const refreshWhenVisible = (): void => {
      if (document.visibilityState === 'visible') onRefresh();
    };
    const timer = window.setInterval(refreshWhenVisible, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('online', refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('online', refreshWhenVisible);
    };
  }, [active]);
}
