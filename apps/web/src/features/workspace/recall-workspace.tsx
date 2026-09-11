'use client';
import { useRecallSession } from '@/lib/use-recall-session';
import { useAppearance } from '@/lib/use-appearance';
import { LoadingState } from '@/components/feedback';
import { RecallTheme } from '@/components/recall-theme';
import { AuthScreen } from '../auth/auth-screen';
import type { WorkspaceView } from './navigation-types';
import {
  AuthenticatedWorkspace,
  type AuthenticatedWorkspaceProps,
} from './authenticated-workspace';

interface RecallWorkspaceProps {
  initialView: WorkspaceView;
  startSignedUp?: boolean;
}

/** Reset workspace state by identity to prevent cross-account content reuse. Example: <RecallWorkspace initialView="today" />. */
export function RecallWorkspace({
  initialView,
  startSignedUp = false,
}: RecallWorkspaceProps): React.JSX.Element {
  const account = useRecallSession();
  const [appearance, toggleTheme] = useAppearance();
  return (
    <RecallTheme>
      <SessionGate
        account={account}
        dark={appearance === 'dark'}
        toggleTheme={toggleTheme}
        initialView={initialView}
        startSignedUp={startSignedUp}
      />
    </RecallTheme>
  );
}

function SessionGate(
  props: AuthenticatedWorkspaceProps & { startSignedUp: boolean },
): React.JSX.Element {
  if (props.account.loading) return <LoadingState />;
  if (!props.account.session)
    return <AuthScreen auth={props.account.auth} startSignedUp={props.startSignedUp} />;
  return <AuthenticatedWorkspace key={props.account.session.user.id} {...props} />;
}
