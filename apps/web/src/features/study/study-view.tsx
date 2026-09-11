import { useRef } from 'react';
import type { RecallClient } from '@recall/client';
import type { Deck } from '@recall/contracts';
import { ErrorNotice, LoadingState } from '@/components/feedback';
import { useStudySession, type StudySessionState } from './use-study-session';
import { useStudyKeyboard } from './use-study-keyboard';
import { StudyProgress, ReviewContent, StudyActions } from './study-components';
import { SessionComplete } from './session-complete';
import { useStudyBarOverlap } from './use-study-bar-overlap';

interface StudyViewProps {
  client: RecallClient;
  /** The signed-in person, so a reload never continues another account's review. */
  user: string;
  deck?: string;
  decks: Deck[];
  expectedTotal: number;
  exit: () => void;
}

/** Keep study content separate from session controls. Example: <StudyView client={client} user={userId} decks={decks} expectedTotal={26} exit={exit} />. */
export function StudyView(props: StudyViewProps): React.JSX.Element {
  const session = useStudySession(props.client, { user: props.user, deck: props.deck });
  useStudyKeyboard(session);
  if (session.loading) return <LoadingState label="Loading your cards…" />;
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
  const screen = useRef<HTMLElement>(null);
  useStudyBarOverlap(screen);
  const current = session.queue[0];
  const deckName = view.decks.find((deck) => deck.id === current?.card.deck_id)?.name;
  return (
    <section ref={screen} className="study-view view-enter">
      <StudyProgress session={session} expectedTotal={view.expectedTotal} exit={view.exit} />
      <ReviewContent
        current={current}
        deckName={deckName}
        revealed={session.revealed}
        onReveal={session.reveal}
      />
      {session.error && (
        // With no card left, the rating button the person pressed is gone, so Try again takes focus.
        <ErrorNotice
          message={session.error}
          retry={() => void session.reload()}
          focusRetry={!current}
        />
      )}
      <StudyActions session={session} />
    </section>
  );
}
