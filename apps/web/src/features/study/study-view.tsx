import type { RecallClient } from '@recall/client';
import type { Deck } from '@recall/contracts';
import { ErrorNotice, LoadingState } from '@/components/feedback';
import { useStudySession, type StudySessionState } from './use-study-session';
import { useStudyKeyboard } from './use-study-keyboard';
import { StudyProgress, ReviewContent, StudyActions } from './study-components';
import { SessionComplete } from './session-complete';

interface StudyViewProps {
  client: RecallClient;
  deck?: string;
  decks: Deck[];
  expectedTotal: number;
  exit: () => void;
}

/** Keep study content separate from session controls. Example: <StudyView client={client} decks={decks} expectedTotal={26} exit={exit} />. */
export function StudyView(props: StudyViewProps): React.JSX.Element {
  const session = useStudySession(props.client, props.deck);
  useStudyKeyboard(session);
  if (session.loading) return <LoadingState label="Loading your cards…" />;
  if (session.refilling && !session.queue.length)
    return <LoadingState label="Checking for more cards…" />;
  if (!session.queue.length && !session.error)
    return <SessionComplete session={session} exit={props.exit} />;
  return <StudyScreen session={session} view={props} />;
}

function StudyScreen({
  session,
  view,
}: {
  session: StudySessionState;
  view: StudyViewProps;
}): React.JSX.Element {
  const current = session.queue[0];
  const deckName = view.decks.find((deck) => deck.id === current?.card.deck_id)?.name;
  return (
    <section className="study-view view-enter">
      <StudyProgress session={session} expectedTotal={view.expectedTotal} exit={view.exit} />
      <ReviewContent
        current={current}
        deckName={deckName}
        revealed={session.revealed}
        onReveal={session.reveal}
      />
      {session.error && <ErrorNotice message={session.error} retry={() => void session.reload()} />}
      <StudyActions session={session} />
    </section>
  );
}
