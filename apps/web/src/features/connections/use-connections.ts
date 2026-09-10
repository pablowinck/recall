import { useCallback, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { AccessToken } from '@recall/contracts';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { useRemoteResource, type RemoteResource } from '@/lib/use-remote-resource';
import { findConnectionClient, type ConnectionClientId } from './connection-clients';

/** A token shown once, together with the assistant it was created for. */
export interface IssuedConnection {
  token: string;
  clientId: ConnectionClientId;
}
export interface ConnectionsModel {
  tokens: AccessToken[];
  loading: boolean;
  error: string;
  busy: boolean;
  clientId: ConnectionClientId;
  chooseClient: (id: ConnectionClientId) => void;
  secret: IssuedConnection | null;
  create: () => void;
  revoke: (id: string) => Promise<void>;
  clear: () => void;
}
interface ConnectionContext {
  client: RecallClient;
  resource: RemoteResource<AccessToken[]>;
  action: AsyncAction;
  clientId: ConnectionClientId;
  showSecret: (secret: IssuedConnection | null) => void;
}

/** Keep secrets local to the connection view and serialize creation. Example: useConnections(client). */
export function useConnections(client: RecallClient): ConnectionsModel {
  const read = useCallback(() => client.tokens(), [client]);
  const resource = useRemoteResource(read);
  const action = useAsyncAction();
  const [secret, showSecret] = useState<IssuedConnection | null>(null);
  const [clientId, chooseClient] = useState<ConnectionClientId>('claude-code');
  const context = { client, resource, action, clientId, showSecret };
  return {
    tokens: resource.value ?? [],
    loading: resource.loading,
    error: action.error || resource.error,
    busy: action.busy,
    clientId,
    chooseClient,
    secret,
    ...connectionActions(context),
  };
}

function connectionActions(
  context: ConnectionContext,
): Pick<ConnectionsModel, 'create' | 'revoke' | 'clear'> {
  return {
    create: () => {
      void context.action.run(() => issueConnection(context));
    },
    revoke: (id) => revokeConnection(context, id),
    clear: () => context.showSecret(null),
  };
}

// Naming the token after the assistant makes the connection list recognizable later.
async function issueConnection(context: ConnectionContext): Promise<void> {
  const assistant = findConnectionClient(context.clientId);
  const created = await context.client.createToken(assistant.name);
  context.showSecret({ token: created.token, clientId: assistant.id });
  await context.resource.refresh();
}

async function revokeConnection(context: ConnectionContext, id: string): Promise<void> {
  await context.client.revokeToken(id);
  context.showSecret(null);
  await context.resource.refresh();
}
