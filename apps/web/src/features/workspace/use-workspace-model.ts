import { useState, type Dispatch, type SetStateAction } from 'react';
import { signOutOnRequest } from '@/lib/use-recall-session';
import { useWorkspace } from './use-workspace';
import { useWorkspaceFreshness } from './use-workspace-freshness';
import { useWorkspaceHistory } from './use-workspace-history';
import type { WorkspaceView } from './navigation-types';
import type {
  RecallAccount,
  WorkspaceActions,
  WorkspaceModel,
  WorkspaceUiState,
} from './workspace-model';

type UpdateWorkspaceUi = Dispatch<SetStateAction<WorkspaceUiState>>;

/** Separate navigation commands from presentation. Example: useWorkspaceModel(account, 'library'). */
export function useWorkspaceModel(
  account: RecallAccount,
  initialView: WorkspaceView,
  initialStudyDeck?: string,
): WorkspaceModel {
  const [state, update] = useState<WorkspaceUiState>({
    view: initialView,
    studyDeck: initialStudyDeck,
    editing: undefined,
    revision: 0,
    libraryQuery: { search: '', deck: '', page: 0 },
  });
  const remote = useWorkspace(account.client);
  useWorkspaceHistory(state.view, state.studyDeck, (view, studyDeck) =>
    update((current) => ({ ...current, view, studyDeck })),
  );
  useWorkspaceFreshness(state.view === 'today', () => void remote.refresh());
  const actions = {
    ...createViewActions(update, remote.refresh),
    ...createAccountActions(account, update, remote.refresh),
  };
  // Cards an assistant adds show up when the person returns to the library; no timer shifts the list mid-read.
  useWorkspaceFreshness(state.view === 'library', actions.updated, { everyMinute: false });
  return {
    ...state,
    workspace: remote.workspace,
    error: remote.error,
    client: account.client,
    email: account.session?.user.email ?? '',
    actions,
  };
}

function createViewActions(
  update: UpdateWorkspaceUi,
  refresh: () => Promise<void>,
): Pick<WorkspaceActions, 'navigate' | 'startStudy' | 'browse' | 'setLibraryQuery' | 'edit'> {
  return {
    navigate: (view) => {
      update((current) => ({ ...current, view }));
      if (view === 'today') void refresh();
    },
    startStudy: (studyDeck) => update((current) => ({ ...current, studyDeck, view: 'study' })),
    browse: (deck) =>
      update((current) => ({
        ...current,
        view: 'library',
        libraryQuery: { search: '', deck: deck ?? '', page: 0 },
      })),
    setLibraryQuery: (libraryQuery) => update((current) => ({ ...current, libraryQuery })),
    edit: (editing, editorDeck) => update((current) => ({ ...current, editing, editorDeck })),
  };
}

function createAccountActions(
  account: RecallAccount,
  update: UpdateWorkspaceUi,
  refresh: () => Promise<void>,
): Pick<WorkspaceActions, 'updated' | 'signOut' | 'refresh'> {
  return {
    updated: () => {
      update((current) => ({ ...current, revision: current.revision + 1 }));
      void refresh();
    },
    signOut: () => {
      void signOutOnRequest(account.auth);
    },
    refresh: () => {
      void refresh();
    },
  };
}
