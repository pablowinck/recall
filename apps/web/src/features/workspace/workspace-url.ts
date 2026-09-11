import type { WorkspaceView } from './navigation-types';

export const WORKSPACE_ROOT = '/app';
const VIEW_PATHS: Record<WorkspaceView, string> = {
  today: WORKSPACE_ROOT,
  library: `${WORKSPACE_ROOT}/library`,
  connections: `${WORKSPACE_ROOT}/connections`,
  study: `${WORKSPACE_ROOT}/study`,
};

/** The address of a workspace view. Example: workspacePath('library') === '/app/library'. */
export function workspacePath(view: WorkspaceView): string {
  return VIEW_PATHS[view];
}

/** The view an address opens, defaulting to Today. Example: viewFromPath('/app/library'). */
export function viewFromPath(path: string): WorkspaceView {
  const [segment] = path.replace(WORKSPACE_ROOT, '').split('/').filter(Boolean);
  const views = Object.keys(VIEW_PATHS) as WorkspaceView[];
  return views.find((view) => view === segment) ?? 'today';
}
