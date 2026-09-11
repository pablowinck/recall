import Link from 'next/link';
import { RecallBrand } from '@/components/brand';
import { GitHubStars } from './github-stars';

/** The landing page banner: home, source and sign in. Example: <LandingNav stars={12} />. */
export function LandingNav({ stars }: { stars: number | null }): React.JSX.Element {
  return (
    <header className="landing-nav">
      <Link className="landing-home" href="/">
        <RecallBrand />
      </Link>
      <div className="landing-nav-actions">
        <GitHubStars stars={stars} />
        <Link className="landing-signin" href="/app">
          Sign in
        </Link>
      </div>
    </header>
  );
}
