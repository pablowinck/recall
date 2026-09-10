import type { Workspace } from '@recall/contracts';
import { NewCardButton, PageHeading } from '@/components/page-heading';
import { StudyInvitation } from './study-invitation';
import { StudyStats } from './study-stats';
import { DeckList } from './deck-list';

interface TodayProps {
  workspace: Workspace;
  study: (deck?: string) => void;
  create: () => void;
  browse: (deck?: string) => void;
}

/** Prioritize the next useful study action. Example: <TodayView {...props} />. */
export function TodayView(props: TodayProps): React.JSX.Element {
  return (
    <div className="view-enter">
      <TodayHeading create={props.create} />
      <StudyInvitation
        stats={props.workspace.stats}
        study={() => props.study()}
        create={props.create}
      />
      <StudyStats stats={props.workspace.stats} />
      <DeckList decks={props.workspace.decks} study={props.study} browse={props.browse} />
    </div>
  );
}

function TodayHeading({ create }: { create: () => void }): React.JSX.Element {
  return (
    <PageHeading
      eyebrow={formatToday(new Date())}
      title="Today"
      action={<NewCardButton variant="soft" onClick={create} />}
    />
  );
}

function formatToday(now: Date): string {
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
