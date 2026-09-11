import { useRef } from 'react';
import { Button, Spinner } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import type { AccessToken } from '@recall/contracts';
import { ConfirmAction } from '@/components/confirm-action';
import { ErrorNotice } from '@/components/feedback';
import { useAnnounce } from '@/components/status-announcer';
import type { ConnectionsModel } from './use-connections';

const revokeCopy = {
  title: 'Revoke this connection?',
  description:
    'The assistant using this token will lose access. You can create another connection later.',
  confirmLabel: 'Revoke connection',
  cancelLabel: 'Keep connection',
};

/** List metadata only, never previously issued secrets. Example: <TokenList model={model} />. */
export function TokenList({ model }: { model: ConnectionsModel }): React.JSX.Element {
  const heading = useRef<HTMLHeadingElement>(null);
  const announce = useAnnounce();
  const revoke = async (token: AccessToken): Promise<void> => {
    await model.revoke(token.id);
    announce(`Connection ${token.name} revoked`);
  };
  return (
    <section className="tokens-section">
      {/* A revoked row leaves with its button, so focus comes here instead of falling to the page. */}
      <h2 ref={heading} tabIndex={-1}>
        Your connections
      </h2>
      <TokenListStatus model={model} />
      {model.tokens.length > 0 && (
        <div className="token-list">
          {model.tokens.map((token) => (
            <TokenRow
              key={token.id}
              token={token}
              revoke={() => revoke(token)}
              focusAfterRevoke={() => heading.current?.focus()}
            />
          ))}
        </div>
      )}
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
  focusAfterRevoke,
}: {
  token: AccessToken;
  revoke: () => Promise<void>;
  focusAfterRevoke: () => void;
}): React.JSX.Element {
  // Connections can share an assistant's name, so the token prefix tells their revoke buttons apart.
  const trigger = (
    <Button
      variant="ghost"
      color="gray"
      aria-label={`Revoke connection ${token.name}, ${token.prefix}…`}
    >
      <Trash2 size={18} />
    </Button>
  );
  return (
    <div className="token-row">
      <TokenMetadata token={token} />
      <ConfirmAction
        {...revokeCopy}
        trigger={trigger}
        onConfirm={revoke}
        focusAfterConfirm={focusAfterRevoke}
      />
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
