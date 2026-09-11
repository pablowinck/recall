'use client';
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { IssuedConnection } from './connection-secret';

type IssuedConnectionSlot = [
  IssuedConnection | null,
  Dispatch<SetStateAction<IssuedConnection | null>>,
];

const IssuedConnectionContext = createContext<IssuedConnectionSlot | null>(null);

/**
 * Hold a new token while the person visits other views, so leaving Connections does not destroy the
 * only copy. It lives in memory, and the workspace is keyed by account, so signing out drops it.
 * Example: <IssuedConnectionProvider>{workspace}</IssuedConnectionProvider>.
 */
export function IssuedConnectionProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const slot = useState<IssuedConnection | null>(null);
  return <IssuedConnectionContext value={slot}>{children}</IssuedConnectionContext>;
}

/** The workspace's slot for a new token, or one local to the view outside a workspace. Example: const [secret, showSecret] = useIssuedConnection(). */
export function useIssuedConnection(): IssuedConnectionSlot {
  const shared = useContext(IssuedConnectionContext);
  const local = useState<IssuedConnection | null>(null);
  return shared ?? local;
}
