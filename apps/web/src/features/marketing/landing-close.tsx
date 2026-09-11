import Link from 'next/link';

/** Close with one concrete first step. Example: <LandingClose />. */
export function LandingClose(): React.JSX.Element {
  return (
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
  );
}
