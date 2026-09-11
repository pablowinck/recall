import Link from 'next/link';
import { supportChatUrl } from '@/lib/support-link';
import { REPOSITORY_URL } from './github-repo';

/** Close with one concrete first step and a way to reach a person. Example: <LandingClose />. */
export function LandingClose(): React.JSX.Element {
  return (
    <>
      <section className="landing-close" aria-labelledby="close-title">
        <h2 id="close-title">Start with one card</h2>
        <p>
          Create a free account, connect your assistant and ask for your first card. Or write it
          yourself.
        </p>
        <Link className="landing-cta" href="/app?new=1">
          Create a free account
        </Link>
        <p className="landing-close-signin">
          Already have an account? <Link href="/app">Sign in</Link>
        </p>
      </section>
      <footer className="landing-footer">
        <span>Recall</span>
        <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
          Open source (MIT) on GitHub
        </a>
        <a href={supportChatUrl()} target="_blank" rel="noopener noreferrer">
          Questions? Message us on WhatsApp
        </a>
      </footer>
    </>
  );
}
