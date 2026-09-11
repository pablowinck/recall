import { StatusAnnouncer } from '@/components/status-announcer';
import { IssuedConnectionProvider } from '../connections/issued-connection';
import type { NavigationProps } from './navigation-types';
import type { RecallAccount } from './workspace-model';
import type { WorkspaceAddress } from './workspace-url';
import { useWorkspaceModel } from './use-workspace-model';
import { WorkspaceShell } from './workspace-shell';
import { WorkspaceContent } from './workspace-content';

export interface AuthenticatedWorkspaceProps {
  account: RecallAccount;
  dark: boolean;
  toggleTheme: () => void;
  /** Where the page's address pointed: a view, a review's deck, or the library's search, deck and page. */
  initialAddress: WorkspaceAddress;
}

/** Keep identity-scoped state below the keyed authentication gate. Example: <AuthenticatedWorkspace {...props} />. */
export function AuthenticatedWorkspace({
  account,
  dark,
  toggleTheme,
  initialAddress,
}: AuthenticatedWorkspaceProps): React.JSX.Element {
  const model = useWorkspaceModel(account, initialAddress);
  const navigation: NavigationProps = {
    view: model.view,
    email: model.email,
    navigate: model.actions.navigate,
    signOut: model.actions.signOut,
    dark,
    toggleTheme,
  };
  return (
    <StatusAnnouncer>
      <IssuedConnectionProvider>
        <WorkspaceShell navigation={navigation} studying={model.view === 'study'}>
          <WorkspaceContent model={model} />
        </WorkspaceShell>
      </IssuedConnectionProvider>
    </StatusAnnouncer>
  );
}
