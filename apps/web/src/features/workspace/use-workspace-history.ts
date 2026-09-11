import { useEffect, useEffectEvent, useRef } from 'react';
import { focusPageHeading } from '@/components/page-heading';
import type { WorkspaceView } from './navigation-types';
import { viewFromPath, workspacePath, workspaceTitle } from './workspace-url';

/**
 * Give each view its own address, so Back and Forward move between views instead of leaving the app.
 * Example: useWorkspaceHistory(view, openView).
 */
export function useWorkspaceHistory(
  view: WorkspaceView,
  openView: (view: WorkspaceView) => void,
): void {
  const open = useEffectEvent(openView);
  const shown = useRef<WorkspaceView | null>(null);
  useEffect(() => {
    const path = workspacePath(view);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0 });
    }
    // Set after pushState, so the title names the new history entry rather than the one being left.
    document.title = workspaceTitle(view);
    // A new view replaces the one being read, so focus moves to its title; the first view keeps the page's start.
    if (shown.current !== null && shown.current !== view) focusPageHeading();
    shown.current = view;
  }, [view]);
  useEffect(() => {
    const followHistory = (): void => open(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', followHistory);
    return () => window.removeEventListener('popstate', followHistory);
  }, []);
}
