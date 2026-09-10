import { Button } from '@radix-ui/themes';
import { ArrowRight, Layers2 } from 'lucide-react';
import type { WorkspaceStats } from '@recall/contracts';
import { describeDueMix } from './session-summary';

interface StudyInvitationProps {
  stats: WorkspaceStats;
  study: () => void;
  create: () => void;
}

/** Make the next study action clear from actual due counts. Example: <StudyInvitation {...props} />. */
export function StudyInvitation(props: StudyInvitationProps): React.JSX.Element {
  return (
    <section className="study-invitation">
      <div>
        <InvitationHeadline stats={props.stats} />
        <p>{describeNextSession(props.stats)}</p>
        <InvitationAction {...props} />
      </div>
      <InvitationIllustration />
    </section>
  );
}

function InvitationHeadline({ stats }: { stats: WorkspaceStats }): React.JSX.Element {
  if (!stats.total) return <h2>Every memory starts with a card</h2>;
  if (!stats.due) return <h2>All caught up</h2>;
  return (
    <h2>
      <strong>{stats.due}</strong> {stats.due === 1 ? 'card' : 'cards'} to review
    </h2>
  );
}

function describeNextSession(stats: WorkspaceStats): string {
  if (!stats.total)
    return 'Write a question and its answer. Recall schedules every review for you.';
  if (!stats.due) return 'New reviews appear here when they’re due.';
  return describeDueMix(stats);
}

function InvitationAction({ stats, study, create }: StudyInvitationProps): React.JSX.Element {
  const ready = stats.total > 0 && stats.due > 0;
  return (
    <Button size="3" onClick={ready ? study : create}>
      {ready ? 'Start reviewing' : stats.total ? 'Add a card' : 'Create your first card'}
      <ArrowRight size={18} />
    </Button>
  );
}

function InvitationIllustration(): React.JSX.Element {
  return (
    <div className="invitation-art" aria-hidden="true">
      <div className="mini-card back" />
      <div className="mini-card front">
        <Layers2 size={34} strokeWidth={1.2} />
        <span>
          One step
          <br />
          at a time.
        </span>
      </div>
    </div>
  );
}
