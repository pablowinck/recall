import { useCallback, useEffect, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { Workspace } from '@recall/contracts';
import { describeFailure } from '@/components/feedback';

/** Load workspace statistics without fabricated values. Example: useWorkspace(client). */
export function useWorkspace(client: RecallClient): {
  workspace: Workspace | null;
  error: string;
  refresh: () => Promise<void>;
} {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setWorkspace(await client.workspace());
      setError('');
    } catch (failure) {
      setError(describeFailure(failure));
    }
  }, [client]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { workspace, error, refresh };
}
