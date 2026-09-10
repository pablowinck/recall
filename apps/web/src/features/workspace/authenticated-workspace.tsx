import type { NavigationProps } from './navigation-types';
import type { RecallAccount } from './workspace-model';
import { useWorkspaceModel } from './use-workspace-model';
import { WorkspaceShell } from './workspace-shell';
import { WorkspaceContent } from './workspace-content';

export interface AuthenticatedWorkspaceProps {
  account: RecallAccount;
  dark: boolean;
  toggleTheme: () => void;
}

/** Keep identity-scoped state below the keyed authentication gate. Example: <AuthenticatedWorkspace {...props} />. */
export function AuthenticatedWorkspace({
  account,
  dark,
  toggleTheme,
}: AuthenticatedWorkspaceProps): React.JSX.Element {
  const model = useWorkspaceModel(account);
  const navigation: NavigationProps = {
    view: model.view,
    email: model.email,
    navigate: model.actions.navigate,
    signOut: model.actions.signOut,
    dark,
    toggleTheme,
  };
  return (
    <WorkspaceShell navigation={navigation} studying={model.view === 'study'}>
      <WorkspaceContent model={model} />
    </WorkspaceShell>
  );
}
