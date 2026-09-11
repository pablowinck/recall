import { useEffect, useEffectEvent, useRef } from 'react';
import { focusPageHeading } from '@/components/page-heading';
import { useDocumentTitle } from '@/lib/use-document-title';
import type { WorkspaceView } from './navigation-types';
import { studyDeckFrom, viewFromPath, workspacePath, workspaceTitle } from './workspace-url';

/**
 * Give each view its own address, so Back and Forward move between views instead of leaving the app, and a deck
 * review keeps its deck through a reload. Example: useWorkspaceHistory(view, studyDeck, openView).
 */
export function useWorkspaceHistory(
  view: WorkspaceView,
  studyDeck: string | undefined,
  openView: (view: WorkspaceView, studyDeck?: string) => void,
): void {
  const open = useEffectEvent(openView);
  const shown = useRef<WorkspaceView | null>(null);
  useEffect(() => {
    const path = workspacePath(view, studyDeck);
    if (currentWorkspacePath() !== path) {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0 });
    }
    // A new view replaces the one being read, so focus moves to its title; the first view keeps the page's start.
    if (shown.current !== null && shown.current !== view) focusPageHeading();
    shown.current = view;
  }, [view, studyDeck]);
  // Called after the history effect, so the title names the new history entry rather than the one being left.
  useDocumentTitle(workspaceTitle(view));
  useEffect(() => {
    const followHistory = (): void => open(viewFromPath(window.location.pathname), readStudyDeck());
    window.addEventListener('popstate', followHistory);
    return () => window.removeEventListener('popstate', followHistory);
  }, []);
}

// Compares addresses as the workspace reads them, so unrelated parameters such as ?new=1 never add a history entry.
function currentWorkspacePath(): string {
  return workspacePath(viewFromPath(window.location.pathname), readStudyDeck());
}

function readStudyDeck(): string | undefined {
  return studyDeckFrom(new URLSearchParams(window.location.search).get('deck'));
}
