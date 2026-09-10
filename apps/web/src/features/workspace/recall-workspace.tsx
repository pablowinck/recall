'use client';
import { useRecallSession } from '@/lib/use-recall-session';
import { useAppearance } from '@/lib/use-appearance';
import { LoadingState } from '@/components/feedback';
import { RecallTheme } from '@/components/recall-theme';
import { AuthScreen } from '../auth/auth-screen';
import {
  AuthenticatedWorkspace,
  type AuthenticatedWorkspaceProps,
} from './authenticated-workspace';

/** Reset workspace state by identity to prevent cross-account content reuse. Example: <RecallWorkspace />. */
export function RecallWorkspace(): React.JSX.Element {
  const account = useRecallSession();
  const [appearance, toggleTheme] = useAppearance();
  return (
    <RecallTheme>
      <SessionGate account={account} dark={appearance === 'dark'} toggleTheme={toggleTheme} />
    </RecallTheme>
  );
}

function SessionGate(props: AuthenticatedWorkspaceProps): React.JSX.Element {
  if (props.account.loading) return <LoadingState />;
  if (!props.account.session) return <AuthScreen auth={props.account.auth} />;
  return <AuthenticatedWorkspace key={props.account.session.user.id} {...props} />;
}
