import { supportChatUrl } from '@/lib/support-link';
import { REPOSITORY_URL } from './github-repo';

/** The page's contentinfo landmark: licence, source and a person to talk to. Example: <LandingFooter />. */
export function LandingFooter(): React.JSX.Element {
  return (
    <footer className="landing-footer">
      <span>Recall</span>
      <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
        Open source (MIT) on GitHub<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      <a href={supportChatUrl()} target="_blank" rel="noopener noreferrer">
        Questions? Message us on WhatsApp
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </footer>
  );
}
