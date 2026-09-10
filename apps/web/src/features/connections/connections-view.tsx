'use client';
import { useEffect, useState } from 'react';
import { AlertDialog, Button, TextField } from '@radix-ui/themes';
import { Cable, Copy, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import type { AccessToken } from '@recall/contracts';
import { describeFailure, ErrorNotice } from '@/components/feedback';

/** Gerencia conexões pessoais sem expor tokens anteriores. Exemplo: <ConnectionsView client={client} />. */
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
          <span className="eyebrow">APRENDA COM SUAS FERRAMENTAS</span>
          <h1>Conexões.</h1>
          <p>Transforme uma conversa em novos cartões.</p>
        </div>
      </header>
      <section className="connection-intro">
        <span className="connection-icon">
          <Cable size={28} strokeWidth={1.5} />
        </span>
        <h2>Recall no Codex e em outros agentes</h2>
        <p>
          Crie, organize e consulte seus cartões durante uma conversa. Cada conexão acessa apenas o
          seu espaço.
        </p>
        <div className="endpoint-box">
          <span>Endereço MCP</span>
          <code>{process.env.NEXT_PUBLIC_MCP_URL}</code>
        </div>
        <Button size="3" onClick={() => void create()} loading={busy}>
          <Plus size={17} />
          Criar conexão pessoal
        </Button>
        <p className="privacy-note">
          <ShieldCheck size={15} />
          Validade de 90 dias. Revogue quando quiser.
        </p>
      </section>
      {error && <ErrorNotice message={error} />}
      {secret && <NewSecret token={secret} clear={() => setSecret('')} />}
      <section className="tokens-section">
        <h2>Suas conexões</h2>
        {!tokens.length && <p className="muted">Você ainda não criou uma conexão.</p>}
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
        <summary>Como conectar no Codex</summary>
        <p>
          Configure um servidor MCP HTTP com o endereço acima e use o token como Bearer token.
          Guarde o segredo em uma variável de ambiente, nunca em um repositório.
        </p>
        <pre>{`[mcp_servers.recall]\nurl = "${process.env.NEXT_PUBLIC_MCP_URL}"\nbearer_token_env_var = "RECALL_MCP_TOKEN"`}</pre>
        <p>Depois, peça: “Liste meus baralhos no Recall” ou “Crie um cartão explicando I’d”.</p>
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
      setError('Selecione e copie o token manualmente.');
    }
  };
  return (
    <section className="new-secret">
      <h2>Guarde seu token</h2>
      <p>Ele aparece somente agora. Quem tiver este token poderá acessar seus cartões.</p>
      <TextField.Root aria-label="Novo token pessoal" readOnly value={token} />
      <div className="dialog-actions">
        <Button variant="soft" onClick={clear}>
          Já guardei
        </Button>
        <Button onClick={() => void copy()}>
          <Copy size={16} />
          {copied ? 'Copiado' : 'Copiar token'}
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
          {token.prefix}… · até {new Date(token.expires_at).toLocaleDateString('pt-BR')}
        </span>
      </div>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger>
          <Button variant="ghost" color="gray" aria-label={`Revogar conexão ${token.name}`}>
            <Trash2 size={18} />
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content maxWidth="420px">
          <AlertDialog.Title>Revogar esta conexão?</AlertDialog.Title>
          <AlertDialog.Description>
            O agente deixará de acessar seus cartões com este token. Você pode criar outra conexão
            depois.
          </AlertDialog.Description>
          {error && <ErrorNotice message={error} />}
          <div className="dialog-actions">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Manter conexão
              </Button>
            </AlertDialog.Cancel>
            <Button color="red" onClick={() => void remove()} loading={busy}>
              Revogar conexão
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
}
