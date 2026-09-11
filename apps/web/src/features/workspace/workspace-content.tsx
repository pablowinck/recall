import type { Deck } from '@recall/contracts';
import { ErrorNotice, ErrorState, LoadingState } from '@/components/feedback';
import { CardEditor } from '../cards/card-editor';
import { LibraryView } from '../cards/library-view';
import type { LibraryQuery } from '../cards/library-query';
import { StudyView } from '../study/study-view';
import { ConnectionsView } from '../connections/connections-view';
import { TodayView } from './today-view';
import type { WorkspaceView } from './navigation-types';
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
      {model.error && showsWorkspaceData(model.view) && (
        <ErrorNotice message={model.error} retry={model.actions.refresh} />
      )}
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
      browse={model.actions.browse}
    />
  );
}

function LibraryWorkspace({ model }: { model: LoadedWorkspaceModel }): React.JSX.Element {
  const decks = model.workspace.decks;
  return (
    <LibraryView
      client={model.client}
      decks={decks}
      revision={model.revision}
      query={withKnownDeck(model.libraryQuery, decks)}
      changeQuery={model.actions.setLibraryQuery}
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
      // A deck deleted since its review address was saved is ignored, so the review covers every due card.
      deck={studyDeck?.id}
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

// A failed refresh of decks and stats concerns Today and the library; a review and Connections work without it.
function showsWorkspaceData(view: WorkspaceView): boolean {
  return view === 'today' || view === 'library';
}

// A deck deleted since its library address was saved, perhaps by an assistant, would filter to nothing, so the library
// shows every deck instead.
function withKnownDeck(query: LibraryQuery, decks: Deck[]): LibraryQuery {
  if (!query.deck || decks.some((deck) => deck.id === query.deck)) return query;
  return { ...query, deck: '', page: 0 };
}
