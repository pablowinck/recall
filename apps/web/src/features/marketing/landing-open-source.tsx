import { GitHubMark } from './github-mark';
import { CONTRIBUTING_URL, formatStars, REPOSITORY_URL } from './github-repo';

/** Invite people to read, star and improve the code. Example: <LandingOpenSource stars={3} />. */
export function LandingOpenSource({ stars }: { stars: number | null }): React.JSX.Element {
  return (
    <section className="landing-section landing-open-source" aria-labelledby="source-title">
      <h2 id="source-title">Built in the open</h2>
      <p>
        The web app, the API and its row-level security, and the MCP server your assistant talks to
        are all public on GitHub. Read how it works, open an issue, or send a pull request.
      </p>
      <div className="landing-actions">
        <a
          className="landing-cta landing-cta-ink"
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubMark />
          {stars ? `Star on GitHub · ${formatStars(stars)}` : 'Star on GitHub'}
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        <a
          className="landing-secondary"
          href={CONTRIBUTING_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          How to contribute<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
