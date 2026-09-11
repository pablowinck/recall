import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import type { RecallClient } from '@recall/client';
import type { AccessToken } from '@recall/contracts';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { useRemoteResource, type RemoteResource } from '@/lib/use-remote-resource';
import { findConnectionClient, type ConnectionClientId } from './connection-clients';
import { markSecretCopied, secretAfterRevoke, type IssuedConnection } from './connection-secret';
import { useIssuedConnection } from './issued-connection';

export type { IssuedConnection } from './connection-secret';

export interface ConnectionsModel {
  tokens: AccessToken[];
  loading: boolean;
  actionError: string;
  loadError: string;
  reloadTokens: () => Promise<void>;
  busy: boolean;
  clientId: ConnectionClientId;
  chooseClient: (id: ConnectionClientId) => void;
  secret: IssuedConnection | null;
  create: () => void;
  revoke: (id: string) => Promise<void>;
  clear: () => void;
  markCopied: () => void;
}
interface ConnectionContext {
  client: RecallClient;
  resource: RemoteResource<AccessToken[]>;
  action: AsyncAction;
  clientId: ConnectionClientId;
  showSecret: Dispatch<SetStateAction<IssuedConnection | null>>;
}

/** Keep a new token until it is dismissed, even across views, and serialize creation. Example: useConnections(client). */
export function useConnections(client: RecallClient): ConnectionsModel {
  const read = useCallback(() => client.tokens(), [client]);
  const resource = useRemoteResource(read);
  const action = useAsyncAction();
  const [secret, showSecret] = useIssuedConnection();
  const [chosenClient, chooseClient] = useState<ConnectionClientId>('claude-code');
  // While a token is on screen, the picker names the assistant that token was made for.
  const clientId = secret?.clientId ?? chosenClient;
  const context = { client, resource, action, clientId, showSecret };
  return {
    tokens: resource.value ?? [],
    loading: resource.loading,
    actionError: action.error,
    loadError: resource.error,
    reloadTokens: resource.refresh,
    busy: action.busy,
    clientId,
    chooseClient,
    secret,
    ...connectionActions(context),
  };
}

function connectionActions(
  context: ConnectionContext,
): Pick<ConnectionsModel, 'create' | 'revoke' | 'clear' | 'markCopied'> {
  return {
    create: () => {
      void context.action.run(() => issueConnection(context));
    },
    revoke: (id) => revokeConnection(context, id),
    clear: () => context.showSecret(null),
    markCopied: () => context.showSecret(markSecretCopied),
  };
}

// Naming the token after the assistant makes the connection list recognizable later.
async function issueConnection(context: ConnectionContext): Promise<void> {
  const assistant = findConnectionClient(context.clientId);
  const created = await context.client.createToken(assistant.name);
  context.showSecret({
    id: created.id,
    token: created.token,
    clientId: assistant.id,
    copied: false,
  });
  await context.resource.refresh();
}

async function revokeConnection(context: ConnectionContext, id: string): Promise<void> {
  await context.client.revokeToken(id);
  context.showSecret((current) => secretAfterRevoke(current, id));
  await context.resource.refresh();
}
