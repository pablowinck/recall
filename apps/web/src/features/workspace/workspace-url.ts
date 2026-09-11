import type { WorkspaceView } from './navigation-types';

export const WORKSPACE_ROOT = '/app';
const VIEW_PATHS: Record<WorkspaceView, string> = {
  today: WORKSPACE_ROOT,
  library: `${WORKSPACE_ROOT}/library`,
  connections: `${WORKSPACE_ROOT}/connections`,
  study: `${WORKSPACE_ROOT}/study`,
};

// Only a deck id travels from an address to the API; anything else opens a review of every deck.
const DECK_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VIEW_TITLES: Record<WorkspaceView, string> = {
  today: 'Today',
  library: 'Library',
  connections: 'Connections',
  study: 'Review session',
};

/** Name a view for browser tabs and the history menu. Example: workspaceTitle('library'). */
export function workspaceTitle(view: WorkspaceView): string {
  return `${VIEW_TITLES[view]} · Recall`;
}

/** The address of a workspace view; a deck review keeps its deck. Example: workspacePath('study', deckId). */
export function workspacePath(view: WorkspaceView, studyDeck?: string): string {
  const path = VIEW_PATHS[view];
  return view === 'study' && studyDeck ? `${path}?deck=${studyDeck}` : path;
}

/** The deck a review address names, when it is a deck id. Example: studyDeckFrom(query.get('deck')). */
export function studyDeckFrom(value: string | null | undefined): string | undefined {
  return value && DECK_ID.test(value) ? value : undefined;
}

/** The view an address opens, defaulting to Today. Example: viewFromPath('/app/library'). */
export function viewFromPath(path: string): WorkspaceView {
  const [segment] = path.replace(WORKSPACE_ROOT, '').split('/').filter(Boolean);
  const views = Object.keys(VIEW_PATHS) as WorkspaceView[];
  return views.find((view) => view === segment) ?? 'today';
}
