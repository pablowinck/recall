import Link from 'next/link';
import { RecallBrand } from '@/components/brand';
import { GitHubStars } from './github-stars';

/** Open the page with the one thing Recall does differently. Example: <LandingHero stars={null} />. */
export function LandingHero({ stars }: { stars: number | null }): React.JSX.Element {
  return (
    <header className="landing-hero">
      <nav className="landing-nav" aria-label="Landing navigation">
        <Link className="landing-home" href="/">
          <RecallBrand />
        </Link>
        <div className="landing-nav-actions">
          <GitHubStars stars={stars} />
          <Link className="landing-signin" href="/app">
            Sign in
          </Link>
        </div>
      </nav>
      <p className="landing-eyebrow">Flashcards your AI fills through MCP</p>
      <h1>
        Your AI writes the cards.
        <br />
        Recall makes them stick.
      </h1>
      <p className="landing-lead">
        Recall is a free, open-source flashcard app for people who study for hours. Ask Claude Code,
        Codex, Cursor or another MCP assistant to turn what you’re learning into cards, and Recall
        schedules every review so each one comes back before you’re likely to forget it.
      </p>
      <div className="landing-actions">
        <Link className="landing-cta" href="/app?new=1">
          Create a free account
        </Link>
        <Link className="landing-secondary" href="#how-it-works">
          See how it works
        </Link>
      </div>
      <p className="landing-note">
        Sign up with email. Connect an assistant when you’re ready, or write cards yourself.
      </p>
    </header>
  );
}
