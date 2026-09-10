import { Button, Spinner } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import type { AccessToken } from '@recall/contracts';
import { ConfirmAction } from '@/components/confirm-action';
import { ErrorNotice } from '@/components/feedback';
import type { ConnectionsModel } from './use-connections';

const revokeCopy = {
  title: 'Revoke this connection?',
  description:
    'The agent will lose access through this token. You can create another connection later.',
  confirmLabel: 'Revoke connection',
  cancelLabel: 'Keep connection',
};

/** List metadata only, never previously issued secrets. Example: <TokenList model={model} />. */
export function TokenList({ model }: { model: ConnectionsModel }): React.JSX.Element {
  return (
    <section className="tokens-section">
      <h2>Your connections</h2>
      <TokenListStatus model={model} />
      {model.tokens.map((token) => (
        <TokenRow key={token.id} token={token} revoke={() => model.revoke(token.id)} />
      ))}
    </section>
  );
}

// A failed load must not claim there are no connections; it offers a retry instead.
function TokenListStatus({ model }: { model: ConnectionsModel }): React.JSX.Element | null {
  if (model.loading)
    return (
      <div role="status" className="tokens-loading">
        <Spinner />
        Loading connections…
      </div>
    );
  if (model.loadError)
    return <ErrorNotice message={model.loadError} retry={() => void model.reloadTokens()} />;
  if (!model.tokens.length) return <p className="muted">You have not created a connection yet.</p>;
  return null;
}

function TokenRow({
  token,
  revoke,
}: {
  token: AccessToken;
  revoke: () => Promise<void>;
}): React.JSX.Element {
  const trigger = (
    <Button variant="ghost" color="gray" aria-label={`Revoke connection ${token.name}`}>
      <Trash2 size={18} />
    </Button>
  );
  return (
    <div className="token-row">
      <TokenMetadata token={token} />
      <ConfirmAction {...revokeCopy} trigger={trigger} onConfirm={revoke} />
    </div>
  );
}

const tokenDate: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

function TokenMetadata({ token }: { token: AccessToken }): React.JSX.Element {
  const created = new Date(token.created_at).toLocaleDateString('en-US', tokenDate);
  const expires = new Date(token.expires_at).toLocaleDateString('en-US', tokenDate);
  return (
    <div>
      <strong>{token.name}</strong>
      <span>
        {token.prefix}… · Created {created} · Expires {expires}
      </span>
    </div>
  );
}
