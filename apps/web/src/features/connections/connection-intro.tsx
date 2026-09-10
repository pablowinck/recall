import { Button } from '@radix-ui/themes';
import { Cable, Plus, ShieldCheck } from 'lucide-react';
import type { ConnectionsModel } from './use-connections';

/** Explain what an agent connection can access before creating it. Example: <ConnectionIntro model={model} />. */
export function ConnectionIntro({ model }: { model: ConnectionsModel }): React.JSX.Element {
  return (
    <section className="connection-intro">
      <span className="connection-icon">
        <Cable size={28} strokeWidth={1.5} />
      </span>
      <ConnectionDescription />
      <ConnectionEndpoint />
      <Button size="3" onClick={model.create} loading={model.busy}>
        <Plus size={17} />
        Create personal connection
      </Button>
      <p className="privacy-note">
        <ShieldCheck size={15} />
        Valid for 90 days. Revoke it whenever you like.
      </p>
    </section>
  );
}

function ConnectionDescription(): React.JSX.Element {
  return (
    <>
      <h2>Recall in Codex and other agents</h2>
      <p>
        Create, organize, and find cards during a conversation. Each connection can access only your
        workspace.
      </p>
    </>
  );
}

function ConnectionEndpoint(): React.JSX.Element {
  return (
    <div className="endpoint-box">
      <span>MCP endpoint</span>
      <code>{process.env.NEXT_PUBLIC_MCP_URL}</code>
    </div>
  );
}

/** Provide copyable configuration without embedding a secret. Example: <ConnectionHelp />. */
export function ConnectionHelp(): React.JSX.Element {
  const example = `[mcp_servers.recall]\nurl = "${process.env.NEXT_PUBLIC_MCP_URL}"\nbearer_token_env_var = "RECALL_MCP_TOKEN"`;
  return (
    <details className="connection-help">
      <summary>How to connect to Codex</summary>
      <p>
        Configure an HTTP MCP server with the endpoint above and use your token as a Bearer token.
        Store the secret in an environment variable, never in a repository.
      </p>
      <pre>{example}</pre>
      <p>Then ask: “List my Recall decks” or “Create a flashcard about a topic I want to learn”.</p>
    </details>
  );
}
