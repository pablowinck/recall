import { Button } from '@radix-ui/themes';
import { RecallBrand } from '@/components/brand';
import type { ConsentSummary } from './oauth-consent';

interface OAuthConsentPanelProps {
  summary: ConsentSummary;
  busy: boolean;
  decide: (allow: boolean) => void;
  switchAccount: () => void;
}

/** Ask plainly whether an assistant may use this account. Example: <OAuthConsentPanel {...props} />. */
export function OAuthConsentPanel({
  summary,
  busy,
  decide,
  switchAccount,
}: OAuthConsentPanelProps): React.JSX.Element {
  return (
    <main className="consent">
      <section className="consent-card" aria-labelledby="consent-title">
        <RecallBrand />
        <h1 id="consent-title">Allow {summary.clientName} to use Recall?</h1>
        <p>
          It will be able to read, create, edit and delete your cards and decks, and record your
          reviews.
        </p>
        <p className="consent-meta">After you answer, you’ll return to {summary.redirectHost}.</p>
        <div className="consent-actions">
          <Button
            size="3"
            variant="soft"
            color="gray"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Don’t allow
          </Button>
          <Button size="3" loading={busy} onClick={() => decide(true)}>
            Allow
          </Button>
        </div>
        <p className="consent-account">
          Signed in as {summary.email}.{' '}
          <button type="button" className="text-button" onClick={switchAccount} disabled={busy}>
            Use another account
          </button>
        </p>
      </section>
    </main>
  );
}
