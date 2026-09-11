import Link from 'next/link';
import { RecallBrand } from '@/components/brand';

/** Open the page with the one thing Recall does differently. Example: <LandingHero />. */
export function LandingHero(): React.JSX.Element {
  return (
    <header className="landing-hero">
      <nav className="landing-nav" aria-label="Landing navigation">
        <RecallBrand />
        <Link className="landing-signin" href="/app">
          Sign in
        </Link>
      </nav>
      <p className="landing-eyebrow">Spaced repetition, connected to your assistant</p>
      <h1>
        Your AI writes the cards.
        <br />
        Recall makes them stick.
      </h1>
      <p className="landing-lead">
        Claude, Codex, Cursor and other MCP assistants create flashcards while you work. Recall
        schedules every review, so what you learn today is still there in a month.
      </p>
      <div className="landing-actions">
        <Link className="landing-cta" href="/app?new=1">
          Create your account
        </Link>
        <Link className="landing-secondary" href="#how-it-works">
          See how it works
        </Link>
      </div>
      <p className="landing-note">Free to use. Your cards stay yours.</p>
    </header>
  );
}
