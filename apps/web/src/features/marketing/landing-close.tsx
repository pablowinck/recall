import Link from 'next/link';
import { supportChatUrl } from '@/lib/support-link';

/** Close with the same invitation and a way to reach a person. Example: <LandingClose />. */
export function LandingClose(): React.JSX.Element {
  return (
    <>
      <section className="landing-close" aria-labelledby="close-title">
        <h2 id="close-title">Start with one card</h2>
        <p>
          Create an account, connect your assistant, and let the next thing you learn become a card
          you will actually remember.
        </p>
        <Link className="landing-cta" href="/app?new=1">
          Create your account
        </Link>
      </section>
      <footer className="landing-footer">
        <span>Recall</span>
        <a href={supportChatUrl()} target="_blank" rel="noopener noreferrer">
          Talk to us on WhatsApp
        </a>
        <a href="https://github.com/pablowinck/recall" target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
      </footer>
    </>
  );
}
