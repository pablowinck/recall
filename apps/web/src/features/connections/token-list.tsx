import { Button, Spinner } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import type { AccessToken } from '@recall/contracts';
import { ConfirmAction } from '@/components/confirm-action';
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
      {model.loading && (
        <div role="status">
          <Spinner />
          Loading connections…
        </div>
      )}
      {!model.loading && !model.tokens.length && (
        <p className="muted">You have not created a connection yet.</p>
      )}
      {model.tokens.map((token) => (
        <TokenRow key={token.id} token={token} revoke={() => model.revoke(token.id)} />
      ))}
    </section>
  );
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

function TokenMetadata({ token }: { token: AccessToken }): React.JSX.Element {
  return (
    <div>
      <strong>{token.name}</strong>
      <span>
        {token.prefix}… · expires {new Date(token.expires_at).toLocaleDateString('en-US')}
      </span>
    </div>
  );
}
