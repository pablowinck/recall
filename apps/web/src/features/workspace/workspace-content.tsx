import { ErrorNotice, ErrorState, LoadingState } from '@/components/feedback';
import { CardEditor } from '../cards/card-editor';
import { LibraryView } from '../cards/library-view';
import { StudyView } from '../study/study-view';
import { ConnectionsView } from '../connections/connections-view';
import { TodayView } from './today-view';
import type { LoadedWorkspaceModel, WorkspaceModel } from './workspace-model';

/** Render only the selected authenticated working view. Example: <WorkspaceContent model={model} />. */
export function WorkspaceContent({ model }: { model: WorkspaceModel }): React.JSX.Element {
  if (!model.workspace && model.error)
    return (
      <ErrorState
        title="Couldn’t load Recall"
        message={model.error}
        retry={model.actions.refresh}
      />
    );
  return (
    <>
      {model.error && <ErrorNotice message={model.error} retry={model.actions.refresh} />}
      <LoadedWorkspace model={model} />
    </>
  );
}

function LoadedWorkspace({ model }: { model: WorkspaceModel }): React.JSX.Element | null {
  if (!model.workspace) return model.error ? null : <LoadingState />;
  const loaded: LoadedWorkspaceModel = { ...model, workspace: model.workspace };
  return (
    <>
      <SelectedWorkspaceView model={loaded} />
      <WorkspaceEditor model={loaded} />
    </>
  );
}

function SelectedWorkspaceView({ model }: { model: LoadedWorkspaceModel }): React.JSX.Element {
  const views = {
    today: TodayWorkspace,
    library: LibraryWorkspace,
    study: StudyWorkspace,
    connections: ConnectionsWorkspace,
  };
  const SelectedView = views[model.view];
  return <SelectedView model={model} />;
}

function TodayWorkspace({ model }: { model: LoadedWorkspaceModel }): React.JSX.Element {
  return (
    <TodayView
      workspace={model.workspace}
      study={model.actions.startStudy}
      create={() => model.actions.edit(null)}
      browse={() => model.actions.navigate('library')}
    />
  );
}

function LibraryWorkspace({ model }: { model: LoadedWorkspaceModel }): React.JSX.Element {
  return (
    <LibraryView
      client={model.client}
      decks={model.workspace.decks}
      revision={model.revision}
      create={(preferredDeckId) => model.actions.edit(null, preferredDeckId)}
      edit={model.actions.edit}
      refresh={model.actions.updated}
    />
  );
}

function StudyWorkspace({ model }: { model: LoadedWorkspaceModel }): React.JSX.Element {
  const { decks, stats } = model.workspace;
  const studyDeck = decks.find((deck) => deck.id === model.studyDeck);
  return (
    <StudyView
      client={model.client}
      deck={model.studyDeck}
      decks={decks}
      expectedTotal={studyDeck ? studyDeck.due_count : stats.due}
      exit={() => model.actions.navigate('today')}
    />
  );
}

function ConnectionsWorkspace({ model }: { model: LoadedWorkspaceModel }): React.JSX.Element {
  const client = model.client;
  return <ConnectionsView client={client} />;
}

function WorkspaceEditor({ model }: { model: LoadedWorkspaceModel }): React.JSX.Element | null {
  if (model.editing === undefined) return null;
  return (
    <CardEditor
      key={model.editing?.id ?? 'new'}
      client={model.client}
      decks={model.workspace.decks}
      card={model.editing ?? undefined}
      preferredDeckId={model.editorDeck}
      close={() => model.actions.edit(undefined)}
      saved={model.actions.updated}
      onDeckCreated={model.actions.refresh}
    />
  );
}
