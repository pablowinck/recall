import { useState, type Dispatch, type SetStateAction } from 'react';
import { useWorkspace } from './use-workspace';
import type {
  RecallAccount,
  WorkspaceActions,
  WorkspaceModel,
  WorkspaceUiState,
} from './workspace-model';

type UpdateWorkspaceUi = Dispatch<SetStateAction<WorkspaceUiState>>;

/** Separate navigation commands from presentation. Example: useWorkspaceModel(account). */
export function useWorkspaceModel(account: RecallAccount): WorkspaceModel {
  const [state, update] = useState<WorkspaceUiState>({
    view: 'today',
    editing: undefined,
    revision: 0,
  });
  const remote = useWorkspace(account.client);
  const actions = {
    ...createViewActions(update, remote.refresh),
    ...createAccountActions(account, update, remote.refresh),
  };
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
): Pick<WorkspaceActions, 'navigate' | 'startStudy' | 'edit'> {
  return {
    navigate: (view) => {
      update((current) => ({ ...current, view }));
      if (view === 'today') void refresh();
    },
    startStudy: (studyDeck) => update((current) => ({ ...current, studyDeck, view: 'study' })),
    edit: (editing) => update((current) => ({ ...current, editing })),
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
      void account.auth.auth.signOut({ scope: 'local' });
    },
    refresh: () => {
      void refresh();
    },
  };
}
