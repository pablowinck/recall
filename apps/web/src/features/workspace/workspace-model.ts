import type { Flashcard, Workspace } from '@recall/contracts';
import type { RecallClient } from '@recall/client';
import type { useRecallSession } from '@/lib/use-recall-session';
import type { WorkspaceView } from './navigation-types';

export type RecallAccount = ReturnType<typeof useRecallSession>;
export interface WorkspaceUiState {
  view: WorkspaceView;
  editing: Flashcard | null | undefined;
  revision: number;
  studyDeck?: string;
  editorDeck?: string;
}
export interface WorkspaceActions {
  navigate: (view: WorkspaceView) => void;
  startStudy: (deck?: string) => void;
  edit: (card: Flashcard | null | undefined, preferredDeckId?: string) => void;
  updated: () => void;
  signOut: () => void;
  refresh: () => void;
}
export interface WorkspaceModel extends WorkspaceUiState {
  workspace: Workspace | null;
  error: string;
  client: RecallClient;
  email: string;
  actions: WorkspaceActions;
}
export type LoadedWorkspaceModel = WorkspaceModel & { workspace: Workspace };
