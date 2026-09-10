'use client';
import type { RecallClient } from '@recall/client';
import { PageHeading } from '@/components/page-heading';
import { ErrorNotice } from '@/components/feedback';
import { useConnections } from './use-connections';
import { ConnectionHelp, ConnectionIntro } from './connection-intro';
import { SecretPanel } from './secret-panel';
import { TokenList } from './token-list';

/** Manage personal connections without exposing previous tokens. Example: <ConnectionsView client={client} />. */
export function ConnectionsView({ client }: { client: RecallClient }): React.JSX.Element {
  const model = useConnections(client);
  return (
    <div className="view-enter connections-view">
      <PageHeading
        eyebrow="LEARN WITH YOUR TOOLS"
        title="Connections."
        description="Turn a conversation into new flashcards."
      />
      <ConnectionIntro model={model} />
      {model.error && <ErrorNotice message={model.error} />}
      {model.secret && <SecretPanel token={model.secret} clear={model.clear} />}
      <TokenList model={model} />
      <ConnectionHelp />
    </div>
  );
}
