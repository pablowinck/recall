import { useCallback, useEffect, useRef, useState } from 'react';
import { readLatestResource, type ResourceSnapshot } from './remote-resource-state';

export interface RemoteResource<T> extends ResourceSnapshot<T> {
  refresh: () => Promise<void>;
}

/** Ignore stale responses and results arriving after unmount. Example: useRemoteResource(readTokens). */
export function useRemoteResource<T>(read: () => Promise<T>): RemoteResource<T> {
  const [snapshot, update] = useState<ResourceSnapshot<T>>({
    value: null,
    loading: true,
    error: '',
  });
  const sequence = useRef(0);
  const refresh = useCallback(() => readLatestResource({ read, sequence, update }), [read]);
  useEffect(() => {
    void refresh();
    return () => {
      sequence.current += 1;
    };
  }, [refresh]);
  return { ...snapshot, refresh };
}
