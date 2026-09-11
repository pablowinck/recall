import { GitHubMark } from './github-mark';
import { formatStars, REPOSITORY_URL } from './github-repo';

/** Link to the source with its star count once it has one. Example: <GitHubStars stars={12} />. */
export function GitHubStars({ stars }: { stars: number | null }): React.JSX.Element {
  // A brand-new repository reads better as an invitation than as a zero.
  const count = stars ? formatStars(stars) : null;
  return (
    <a
      className="landing-github"
      href={REPOSITORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={count ? `Recall on GitHub, ${count} stars` : 'Star Recall on GitHub'}
    >
      <GitHubMark />
      <span aria-hidden="true">{count ? `★ ${count}` : 'Star'}</span>
    </a>
  );
}
