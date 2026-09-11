'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type Announce = (message: string) => void;

const AnnounceContext = createContext<Announce>(() => undefined);
// A dialog that just closed hides the page from assistive technology until it unmounts, and a repeated
// message speaks again only after the region empties, so each message lands a moment after it is sent.
const ANNOUNCE_DELAY_MS = 150;

/** One polite live region for outcomes that happen away from focus, such as a deleted card. Example: <StatusAnnouncer>{shell}</StatusAnnouncer>. */
export function StatusAnnouncer({ children }: { children: ReactNode }): React.JSX.Element {
  const [message, setMessage] = useState('');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const announce = useCallback((next: string) => {
    window.clearTimeout(timer.current);
    setMessage('');
    timer.current = window.setTimeout(() => setMessage(next), ANNOUNCE_DELAY_MS);
  }, []);
  return (
    <AnnounceContext value={announce}>
      {children}
      <p className="visually-hidden" role="status">
        {message}
      </p>
    </AnnounceContext>
  );
}

/** Say an outcome in the workspace's status region. Example: const announce = useAnnounce(); announce('Card deleted'). */
export function useAnnounce(): Announce {
  return useContext(AnnounceContext);
}
