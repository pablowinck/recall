'use client';
import { useEffect, useState } from 'react';
import { AlertDialog, Button, TextField } from '@radix-ui/themes';
import { Cable, Copy, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import type { AccessToken } from '@recall/contracts';
import { describeFailure, ErrorNotice } from '@/components/feedback';

/** Manage personal connections without exposing previous tokens. Example: <ConnectionsView client={client} />. */
export function ConnectionsView({ client }: { client: RecallClient }): React.JSX.Element {
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = async (): Promise<void> => {
    try {
      setTokens(await client.tokens());
    } catch (failure) {
      setError(describeFailure(failure));
    }
  };
  useEffect(() => {
    void refresh();
  }, [client]);
  const create = async (): Promise<void> => {
    setBusy(true);
    setError('');
    try {
      const created = await client.createToken('Codex');
      setSecret(created.token);
      await refresh();
    } catch (failure) {
      setError(describeFailure(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="view-enter connections-view">
      <header className="page-header">
        <div>
          <span className="eyebrow">LEARN WITH YOUR TOOLS</span>
          <h1>Connections.</h1>
          <p>Turn a conversation into new flashcards.</p>
        </div>
      </header>
      <section className="connection-intro">
        <span className="connection-icon">
          <Cable size={28} strokeWidth={1.5} />
        </span>
        <h2>Recall in Codex and other agents</h2>
        <p>
          Create, organize, and find cards during a conversation. Each connection can access only
          your workspace.
        </p>
        <div className="endpoint-box">
          <span>MCP endpoint</span>
          <code>{process.env.NEXT_PUBLIC_MCP_URL}</code>
        </div>
        <Button size="3" onClick={() => void create()} loading={busy}>
          <Plus size={17} />
          Create personal connection
        </Button>
        <p className="privacy-note">
          <ShieldCheck size={15} />
          Valid for 90 days. Revoke it whenever you like.
        </p>
      </section>
      {error && <ErrorNotice message={error} />}
      {secret && <NewSecret token={secret} clear={() => setSecret('')} />}
      <section className="tokens-section">
        <h2>Your connections</h2>
        {!tokens.length && <p className="muted">You have not created a connection yet.</p>}
        {tokens.map((token) => (
          <TokenRow
            key={token.id}
            token={token}
            revoke={async () => {
              await client.revokeToken(token.id);
              setSecret('');
              await refresh();
            }}
          />
        ))}
      </section>
      <details className="connection-help">
        <summary>How to connect to Codex</summary>
        <p>
          Configure an HTTP MCP server with the endpoint above and use your token as a Bearer token.
          Store the secret in an environment variable, never in a repository.
        </p>
        <pre>{`[mcp_servers.recall]\nurl = "${process.env.NEXT_PUBLIC_MCP_URL}"\nbearer_token_env_var = "RECALL_MCP_TOKEN"`}</pre>
        <p>
          Then ask: “List my Recall decks” or “Create a flashcard about a topic I want to learn”.
        </p>
      </details>
    </div>
  );
}

function NewSecret({ token, clear }: { token: string; clear: () => void }): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setError('Select and copy the token manually.');
    }
  };
  return (
    <section className="new-secret">
      <h2>Save your token</h2>
      <p>It is shown only once. Anyone with this token can access your cards.</p>
      <TextField.Root aria-label="New personal token" readOnly value={token} />
      <div className="dialog-actions">
        <Button variant="soft" onClick={clear}>
          I saved it
        </Button>
        <Button onClick={() => void copy()}>
          <Copy size={16} />
          {copied ? 'Copied' : 'Copy token'}
        </Button>
      </div>
      {error && <p role="status">{error}</p>}
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
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const remove = async (): Promise<void> => {
    setBusy(true);
    try {
      await revoke();
      setOpen(false);
    } catch (failure) {
      setError(describeFailure(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="token-row">
      <div>
        <strong>{token.name}</strong>
        <span>
          {token.prefix}… · expires {new Date(token.expires_at).toLocaleDateString('en-US')}
        </span>
      </div>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger>
          <Button variant="ghost" color="gray" aria-label={`Revoke connection ${token.name}`}>
            <Trash2 size={18} />
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content maxWidth="420px">
          <AlertDialog.Title>Revoke this connection?</AlertDialog.Title>
          <AlertDialog.Description>
            The agent will lose access through this token. You can create another connection later.
          </AlertDialog.Description>
          {error && <ErrorNotice message={error} />}
          <div className="dialog-actions">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Keep connection
              </Button>
            </AlertDialog.Cancel>
            <Button color="red" onClick={() => void remove()} loading={busy}>
              Revoke connection
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
}
