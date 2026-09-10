import { Button } from '@radix-ui/themes';
import { ArrowRight, Layers2 } from 'lucide-react';
import type { WorkspaceStats } from '@recall/contracts';

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
        <span className="eyebrow">YOUR NEXT SESSION</span>
        <InvitationHeadline stats={props.stats} />
        <p>{describeNextSession(props.stats)}</p>
        <InvitationAction {...props} />
      </div>
      <InvitationIllustration />
    </section>
  );
}

function InvitationHeadline({ stats }: { stats: WorkspaceStats }): React.JSX.Element {
  if (!stats.total) return <h2>{'Every memory starts\nwith a card.'}</h2>;
  if (!stats.due) return <h2>{'All caught up.\nNicely done.'}</h2>;
  return (
    <h2>
      <strong>{stats.due}</strong> {stats.due === 1 ? 'card waiting' : 'cards waiting'}
      <br />
      for you.
    </h2>
  );
}

function describeNextSession(stats: WorkspaceStats): string {
  if (!stats.total) return 'Save a word, an idea, or that question that keeps coming back.';
  if (stats.due) return 'Try to recall it, reveal the answer, and tell us how it went.';
  return 'Your next reviews will appear here when they are due.';
}

function InvitationAction({ stats, study, create }: StudyInvitationProps): React.JSX.Element {
  const ready = stats.total > 0 && stats.due > 0;
  return (
    <Button size="3" onClick={ready ? study : create}>
      {ready ? 'Start reviewing' : 'Create a card'}
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
