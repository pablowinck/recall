import { Button } from '@radix-ui/themes';
import { ArrowRight, BookOpen, Check, Flame, Layers2, Plus } from 'lucide-react';
import type { Workspace } from '@recall/contracts';

interface TodayProps {
  workspace: Workspace;
  study: (deck?: string) => void;
  create: () => void;
  browse: () => void;
}

/** Prioritize the next useful study action. Example: <TodayView {...props} />. */
export function TodayView(props: TodayProps): React.JSX.Element {
  const { stats, decks } = props.workspace;
  return (
    <div className="view-enter">
      <header className="page-header">
        <div>
          <span className="eyebrow">A LITTLE, EVERY DAY</span>
          <h1>
            A good day
            <br className="mobile-break" /> to remember.
          </h1>
          <p>Your next discovery starts here.</p>
        </div>
        <Button variant="soft" onClick={props.create}>
          <Plus size={17} />
          New card
        </Button>
      </header>
      <StudyInvitation stats={stats} study={() => props.study()} create={props.create} />
      <div className="stats-grid">
        <StatCard icon={<Check size={19} />} value={stats.reviewed_today} label="reviews today" />
        <StatCard icon={<Layers2 size={19} />} value={stats.total} label="cards in your library" />
        <StatCard icon={<Flame size={19} />} value={stats.streak} label="day streak" />
      </div>
      <section className="decks-section">
        <div className="section-heading">
          <h2>Your decks</h2>
          <button className="text-button" onClick={props.browse}>
            Browse library <ArrowRight size={16} />
          </button>
        </div>
        <div className="deck-list">
          {decks.map((deck) => (
            <button
              key={deck.id}
              className="deck-row"
              onClick={() => (deck.due_count ? props.study(deck.id) : props.browse())}
            >
              <span className="deck-icon">
                <BookOpen size={23} strokeWidth={1.5} />
              </span>
              <span className="deck-description">
                <strong>{deck.name}</strong>
                <span>{deck.card_count} cards</span>
              </span>
              <span className={`due-badge ${deck.due_count ? '' : 'neutral'}`}>
                {deck.due_count ? `${deck.due_count} due for review` : 'Up to date'}
              </span>
              <ArrowRight className="deck-arrow" size={18} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function StudyInvitation({
  stats,
  study,
  create,
}: {
  stats: Workspace['stats'];
  study: () => void;
  create: () => void;
}): React.JSX.Element {
  const empty = stats.total === 0;
  return (
    <section className="study-invitation">
      <div>
        <span className="eyebrow">YOUR NEXT SESSION</span>
        <h2>
          {empty ? (
            'Every memory starts\nwith a card.'
          ) : stats.due ? (
            <>
              <strong>{stats.due}</strong> {stats.due === 1 ? 'card waiting' : 'cards waiting'}
              <br />
              for you.
            </>
          ) : (
            'All caught up.\nNicely done.'
          )}
        </h2>
        <p>
          {empty
            ? 'Save a word, an idea, or that question that keeps coming back.'
            : stats.due
              ? 'Try to recall it, reveal the answer, and tell us how it went.'
              : 'Your next reviews will appear here when they are due.'}
        </p>
        <Button size="3" onClick={empty || !stats.due ? create : study}>
          {empty || !stats.due ? 'Create a card' : 'Start reviewing'}
          <ArrowRight size={18} />
        </Button>
      </div>
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
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}): React.JSX.Element {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}
