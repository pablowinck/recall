import Link from 'next/link';
import { ExampleCard } from '@/components/example-card';

/** Open the page with the one thing Recall does differently, beside a card it makes. Example: <LandingHero />. */
export function LandingHero(): React.JSX.Element {
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow">Spaced repetition flashcards</p>
        <h1 id="hero-title">
          <span className="landing-h1-line">Your AI writes the cards.</span>{' '}
          <span className="landing-h1-line">Recall makes them stick.</span>
        </h1>
        <p className="landing-lead">
          A free, open-source flashcard app for people who study for hours. Your AI assistant turns
          what you learn into cards, and Recall brings each one back before you’re likely to forget
          it.
        </p>
        <div className="landing-actions">
          <Link className="landing-cta" href="/app?new=1">
            Create a free account
          </Link>
          {/* A plain anchor: next/link would prefetch this page to scroll within it. */}
          <a className="landing-secondary" href="#how-it-works">
            See how it works
          </a>
        </div>
        <p className="landing-note">
          Works with Claude Code, Codex, Cursor, VS Code, Claude Desktop and Gemini CLI, not yet
          with ChatGPT or claude.ai. You can always write cards yourself.
        </p>
      </div>
      <ExampleCard />
    </section>
  );
}
