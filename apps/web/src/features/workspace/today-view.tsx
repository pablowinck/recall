import type { Workspace } from '@recall/contracts';
import { NewCardButton, PageHeading } from '@/components/page-heading';
import { StudyInvitation } from './study-invitation';
import { StudyStats } from './study-stats';
import { DeckList } from './deck-list';

interface TodayProps {
  workspace: Workspace;
  study: (deck?: string) => void;
  create: () => void;
  browse: () => void;
}

/** Prioritize the next useful study action. Example: <TodayView {...props} />. */
export function TodayView(props: TodayProps): React.JSX.Element {
  const title = (
    <>
      A good day
      <br className="mobile-break" /> to remember.
    </>
  );
  return (
    <div className="view-enter">
      <PageHeading
        eyebrow="A LITTLE, EVERY DAY"
        title={title}
        description="Your next discovery starts here."
        action={<NewCardButton variant="soft" onClick={props.create} />}
      />
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
