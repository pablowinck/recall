'use client';
import type { RecallClient } from '@recall/client';
import { PageHeading } from '@/components/page-heading';
import { ErrorNotice } from '@/components/feedback';
import { useConnections } from './use-connections';
import { ConnectionIntro } from './connection-intro';
import { SecretPanel } from './secret-panel';
import { TokenList } from './token-list';

/** Manage personal connections without exposing previous tokens. Example: <ConnectionsView client={client} />. */
export function ConnectionsView({ client }: { client: RecallClient }): React.JSX.Element {
  const model = useConnections(client);
  return (
    <div className="view-enter connections-view">
      <PageHeading
        title="Connections"
        description="Use Recall inside Claude, Codex, Cursor and other assistants that support MCP."
      />
      <ConnectionIntro model={model} />
      {model.error && <ErrorNotice message={model.error} />}
      {model.secret && <SecretPanel secret={model.secret} clear={model.clear} />}
      <TokenList model={model} />
    </div>
  );
}
