'use client';
import { useState } from 'react';
import { Theme, IconButton } from '@radix-ui/themes';
import { Moon, Sun, LogOut } from 'lucide-react';
import type { Flashcard } from '@recall/contracts';
import { useRecallSession } from '@/lib/use-recall-session';
import { useAppearance } from '@/lib/use-appearance';
import { LoadingState, ErrorNotice } from '@/components/feedback';
import { RecallBrand } from '@/components/brand';
import { AuthScreen } from '../auth/auth-screen';
import { CardEditor } from '../cards/card-editor';
import { LibraryView } from '../cards/library-view';
import { StudyView } from '../study/study-view';
import { ConnectionsView } from '../connections/connections-view';
import { WorkspaceNavigation, type WorkspaceView } from './navigation';
import { TodayView } from './today-view';
import { useWorkspace } from './use-workspace';

/** Raiz reiniciada por identidade para não reutilizar conteúdo entre contas. Exemplo: <RecallWorkspace />. */
export function RecallWorkspace(): React.JSX.Element {
  const account = useRecallSession();
  const [appearance, toggleTheme] = useAppearance();
  return (
    <Theme
      accentColor="blue"
      grayColor="slate"
      radius="large"
      scaling="100%"
      appearance={appearance}
    >
      <div className={`recall-root ${appearance}`}>
        {account.loading ? (
          <LoadingState />
        ) : account.session ? (
          <AuthenticatedWorkspace
            key={account.session.user.id}
            account={account}
            dark={appearance === 'dark'}
            toggleTheme={toggleTheme}
          />
        ) : (
          <AuthScreen auth={account.auth} />
        )}
      </div>
    </Theme>
  );
}

interface AuthenticatedProps {
  account: ReturnType<typeof useRecallSession>;
  dark: boolean;
  toggleTheme: () => void;
}

function AuthenticatedWorkspace({
  account,
  dark,
  toggleTheme,
}: AuthenticatedProps): React.JSX.Element {
  const [view, setView] = useState<WorkspaceView>('today');
  const [editing, setEditing] = useState<Flashcard | null | undefined>(undefined);
  const [revision, setRevision] = useState(0);
  const [studyDeck, setStudyDeck] = useState<string | undefined>();
  const { workspace, error, refresh } = useWorkspace(account.client);
  const updated = (): void => {
    setRevision((current) => current + 1);
    void refresh();
  };
  const startStudy = (deck?: string): void => {
    setStudyDeck(deck);
    setView('study');
  };
  const navigate = (next: WorkspaceView): void => {
    setView(next);
    if (next === 'today') void refresh();
  };
  const signOut = (): void => {
    void account.auth.auth.signOut({ scope: 'local' });
  };
  return (
    <div className={`app-shell ${view === 'study' ? 'is-studying' : ''}`}>
      <WorkspaceNavigation
        view={view}
        navigate={navigate}
        email={account.session?.user.email ?? ''}
        dark={dark}
        toggleTheme={toggleTheme}
        signOut={signOut}
      />
      <div className="mobile-top">
        <RecallBrand />
        <div>
          <IconButton
            variant="ghost"
            aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
            onClick={toggleTheme}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <IconButton variant="ghost" aria-label="Sair da conta" onClick={signOut}>
            <LogOut size={19} />
          </IconButton>
        </div>
      </div>
      <main id="main-content" className="page-content">
        {error && <ErrorNotice message={error} retry={() => void refresh()} />}
        {!workspace ? (
          !error && <LoadingState />
        ) : (
          <>
            {view === 'today' && (
              <TodayView
                workspace={workspace}
                study={startStudy}
                create={() => setEditing(null)}
                browse={() => navigate('library')}
              />
            )}
            {view === 'library' && (
              <LibraryView
                client={account.client}
                decks={workspace.decks}
                revision={revision}
                create={() => setEditing(null)}
                edit={setEditing}
                refresh={updated}
              />
            )}
            {view === 'study' && (
              <StudyView client={account.client} deck={studyDeck} exit={() => navigate('today')} />
            )}
            {view === 'connections' && <ConnectionsView client={account.client} />}
            {editing !== undefined && (
              <CardEditor
                key={editing?.id ?? 'new'}
                client={account.client}
                decks={workspace.decks}
                card={editing ?? undefined}
                close={() => setEditing(undefined)}
                saved={updated}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
