import { useEffect, useEffectEvent } from 'react';
import type { WorkspaceView } from './navigation-types';
import { viewFromPath, workspacePath } from './workspace-url';

/**
 * Give each view its own address, so Back and Forward move between views instead of leaving the app.
 * Example: useWorkspaceHistory(view, openView).
 */
export function useWorkspaceHistory(
  view: WorkspaceView,
  openView: (view: WorkspaceView) => void,
): void {
  const open = useEffectEvent(openView);
  useEffect(() => {
    const path = workspacePath(view);
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
  }, [view]);
  useEffect(() => {
    const followHistory = (): void => open(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', followHistory);
    return () => window.removeEventListener('popstate', followHistory);
  }, []);
}
