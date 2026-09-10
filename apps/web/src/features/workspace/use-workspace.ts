import { useCallback } from 'react';
import type { RecallClient } from '@recall/client';
import type { Workspace } from '@recall/contracts';
import { useRemoteResource } from '@/lib/use-remote-resource';

/** Load workspace statistics without fabricated values. Example: useWorkspace(client). */
export function useWorkspace(client: RecallClient): {
  workspace: Workspace | null;
  error: string;
  refresh: () => Promise<void>;
} {
  const read = useCallback(() => client.workspace(), [client]);
  const resource = useRemoteResource(read);
  return { workspace: resource.value, error: resource.error, refresh: resource.refresh };
}
