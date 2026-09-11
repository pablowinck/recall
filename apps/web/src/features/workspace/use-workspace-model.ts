import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { signOutOnRequest } from '@/lib/use-recall-session';
import { EMPTY_LIBRARY_QUERY } from '../cards/library-query';
import { forgetSessionProgress, sessionProgressStorage } from '../study/session-progress';
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
import type { WorkspaceAddress } from './workspace-url';

type UpdateWorkspaceUi = Dispatch<SetStateAction<WorkspaceUiState>>;

/** Separate navigation commands from presentation. Example: useWorkspaceModel(account, workspaceAddressFrom(path, query)). */
export function useWorkspaceModel(
  account: RecallAccount,
  initialAddress: WorkspaceAddress,
): WorkspaceModel {
  const [state, update] = useState<WorkspaceUiState>({
    view: initialAddress.view,
    studyDeck: initialAddress.studyDeck,
    editing: undefined,
    revision: 0,
    libraryQuery: initialAddress.library,
    reviewReady: true,
  });
  const remote = useWorkspace(account.client);
  useWorkspaceHistory(
    { view: state.view, studyDeck: state.studyDeck, library: state.libraryQuery },
    (address) => update((current) => followAddress(current, address)),
  );
  useFreshOnArrival(state.view, state.studyDeck, remote.refresh, update);
  useWorkspaceFreshness(state.view === 'today', () => void remote.refresh());
  const actions = {
    ...createViewActions(update),
    ...createAccountActions(account, update, remote.refresh),
  };
  // Cards an assistant adds show up when the person returns to the library; no timer shifts the list mid-read.
  useWorkspaceFreshness(state.view === 'library', actions.updated, { everyMinute: false });
  return {
    ...state,
    workspace: remote.workspace,
    error: remote.error,
    client: account.client,
    userId: account.session?.user.id ?? '',
    email: account.session?.user.email ?? '',
    actions,
  };
}

// Back and Forward move between views. The library's filters come from the address only on returning to the library,
// so a trip through another view keeps them, as the tabs do; an entry for the same view is the card editor's.
function followAddress(current: WorkspaceUiState, address: WorkspaceAddress): WorkspaceUiState {
  if (address.view === current.view) return current;
  const libraryQuery = address.view === 'library' ? address.library : current.libraryQuery;
  const reviewReady = address.view === 'study' ? false : current.reviewReady;
  return {
    ...current,
    view: address.view,
    studyDeck: address.studyDeck,
    libraryQuery,
    reviewReady,
  };
}

// Back, Forward and the end of a review can arrive at Today, the library or a review with counts and decks from minutes
// ago, so arriving reloads the workspace, and a review waits for that reload so its total counts the cards due now.
// The first view needs no reload, since the workspace is loading already, and Connections shows nothing from it.
function useFreshOnArrival(
  view: WorkspaceView,
  studyDeck: string | undefined,
  refresh: () => Promise<void>,
  update: UpdateWorkspaceUi,
): void {
  const arrivals = useRef(0);
  useEffect(() => {
    const arrival = ++arrivals.current;
    if (arrival === 1 || view === 'connections') return;
    void refresh().then(() => {
      // Only the latest arrival's reload opens a review; an earlier one may have been overtaken.
      if (view === 'study' && arrival === arrivals.current)
        update((current) => ({ ...current, reviewReady: true }));
    });
  }, [view, studyDeck, refresh, update]);
}

function createViewActions(
  update: UpdateWorkspaceUi,
): Pick<WorkspaceActions, 'navigate' | 'startStudy' | 'browse' | 'setLibraryQuery' | 'edit'> {
  return {
    navigate: (view) => update((current) => ({ ...current, view })),
    // A review started here counts from zero; only a reload continues one.
    startStudy: (studyDeck) => {
      forgetSessionProgress(sessionProgressStorage());
      update((current) => ({ ...current, studyDeck, view: 'study', reviewReady: false }));
    },
    browse: (deck) =>
      update((current) => ({
        ...current,
        view: 'library',
        libraryQuery: { ...EMPTY_LIBRARY_QUERY, deck: deck ?? '' },
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
