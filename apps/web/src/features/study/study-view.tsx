import type { RecallClient } from '@recall/client';
import { ErrorNotice, LoadingState } from '@/components/feedback';
import { useStudySession } from './use-study-session';
import { useStudyKeyboard } from './use-study-keyboard';
import { StudyProgress, ReviewContent, StudyActions } from './study-components';
import { SessionComplete } from './session-complete';

interface StudyViewProps {
  client: RecallClient;
  deck?: string;
  exit: () => void;
}

/** Keep study content separate from session controls. Example: <StudyView client={client} exit={exit} />. */
export function StudyView({ client, deck, exit }: StudyViewProps): React.JSX.Element {
  const session = useStudySession(client, deck);
  useStudyKeyboard(session);
  if (session.loading) return <LoadingState />;
  if (!session.queue.length && !session.error)
    return <SessionComplete session={session} exit={exit} />;
  return (
    <section className="study-view view-enter">
      <StudyProgress session={session} exit={exit} />
      <ReviewContent
        current={session.queue[0]}
        revealed={session.revealed}
        onReveal={session.reveal}
      />
      {session.error && <ErrorNotice message={session.error} retry={() => void session.reload()} />}
      <StudyActions session={session} />
    </section>
  );
}
