'use client';
import { useState } from 'react';
import { useRecallSession } from '@/lib/use-recall-session';
import { useAppearance } from '@/lib/use-appearance';
import { LoadingState } from '@/components/feedback';
import { RecallTheme } from '@/components/recall-theme';
import { AuthScreen } from '../auth/auth-screen';
import type { WorkspaceView } from './navigation-types';
import type { RecallAccount } from './workspace-model';
import {
  AuthenticatedWorkspace,
  type AuthenticatedWorkspaceProps,
} from './authenticated-workspace';

interface RecallWorkspaceProps {
  initialView: WorkspaceView;
  initialStudyDeck?: string;
  startSignedUp?: boolean;
}

/** Reset workspace state by identity to prevent cross-account content reuse. Example: <RecallWorkspace initialView="today" />. */
export function RecallWorkspace({
  initialView,
  initialStudyDeck,
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
        initialStudyDeck={initialStudyDeck}
        startSignedUp={startSignedUp}
      />
    </RecallTheme>
  );
}

function SessionGate(
  props: AuthenticatedWorkspaceProps & { startSignedUp: boolean },
): React.JSX.Element {
  const initialView = useStartingView(props.account, props.initialView);
  const hadSession = useHadSession(props.account);
  if (props.account.loading) return <LoadingState />;
  if (!props.account.session)
    return (
      <AuthScreen
        auth={props.account.auth}
        startSignedUp={props.startSignedUp && !hadSession}
        sessionEnded={props.account.ended}
      />
    );
  return (
    <AuthenticatedWorkspace
      key={props.account.session.user.id}
      {...props}
      initialView={initialView}
    />
  );
}

// A reload resumes a review, but signing in starts on Today: nobody signs in to land in the middle of a session.
function useStartingView(account: RecallAccount, requested: WorkspaceView): WorkspaceView {
  const [signedInHere, setSignedInHere] = useState(false);
  if (!account.loading && !account.session && !signedInHere) setSignedInHere(true);
  return signedInHere && requested === 'study' ? 'today' : requested;
}

// The landing page's "Create a free account" opens sign-up, but once this tab has signed in, signing out or an ended
// session should show the sign-in form.
function useHadSession(account: RecallAccount): boolean {
  const [hadSession, setHadSession] = useState(false);
  if (account.session && !hadSession) setHadSession(true);
  return hadSession;
}
