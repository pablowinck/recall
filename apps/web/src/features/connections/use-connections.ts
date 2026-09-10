import { useCallback, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { AccessToken } from '@recall/contracts';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { useRemoteResource, type RemoteResource } from '@/lib/use-remote-resource';

export interface ConnectionsModel {
  tokens: AccessToken[];
  loading: boolean;
  error: string;
  busy: boolean;
  secret: string;
  create: () => void;
  revoke: (id: string) => Promise<void>;
  clear: () => void;
}
interface ConnectionContext {
  client: RecallClient;
  resource: RemoteResource<AccessToken[]>;
  action: AsyncAction;
  showSecret: (token: string) => void;
}

/** Keep secrets local to the connection view and serialize creation. Example: useConnections(client). */
export function useConnections(client: RecallClient): ConnectionsModel {
  const read = useCallback(() => client.tokens(), [client]);
  const resource = useRemoteResource(read);
  const action = useAsyncAction();
  const [secret, showSecret] = useState('');
  const context = { client, resource, action, showSecret };
  return {
    tokens: resource.value ?? [],
    loading: resource.loading,
    error: action.error || resource.error,
    busy: action.busy,
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
    clear: () => context.showSecret(''),
  };
}

async function issueConnection(context: ConnectionContext): Promise<void> {
  const created = await context.client.createToken('Codex');
  context.showSecret(created.token);
  await context.resource.refresh();
}

async function revokeConnection(context: ConnectionContext, id: string): Promise<void> {
  await context.client.revokeToken(id);
  context.showSecret('');
  await context.resource.refresh();
}
