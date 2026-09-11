import { useEffect, useEffectEvent, useRef, type RefObject } from 'react';
import { focusPageHeading } from '@/components/page-heading';
import { useDocumentTitle } from '@/lib/use-document-title';
import type { WorkspaceView } from './navigation-types';
import {
  workspaceAddressFrom,
  workspacePath,
  workspaceTitle,
  type WorkspaceAddress,
} from './workspace-url';

// Safari refuses more than 100 history changes in 30 seconds, so the address follows a search once typing pauses.
const FILTER_ADDRESS_DELAY_MS = 400;

interface WaitingAddress {
  path: string;
  timer: number;
}

/**
 * Give each view its own address, so Back and Forward move between views instead of leaving the app, and a reload
 * keeps a review's deck and the library's search, deck and page. Example: useWorkspaceHistory(address, openAddress).
 */
export function useWorkspaceHistory(
  address: WorkspaceAddress,
  openAddress: (address: WorkspaceAddress) => void,
): void {
  const open = useEffectEvent(openAddress);
  const shown = useRef<WorkspaceView | null>(null);
  const waiting = useRef<WaitingAddress | null>(null);
  const path = workspacePath(address);
  const { view } = address;
  useEffect(() => {
    const previous = shown.current;
    shown.current = view;
    // The first view settles its address at once, so an address the workspace does not know, such as /app/settings,
    // gives way to the view it opened.
    if (previous === null) replaceAddress(path);
    // A new search, deck or page replaces the entry, so Back leaves the library instead of stepping through filters.
    else if (previous === view) replaceAddressSoon(waiting, path);
    else enterView(waiting, path);
  }, [path, view]);
  useEffect(() => () => cancelWaitingAddress(waiting), []);
  // Called after the history effect, so the title names the new history entry rather than the one being left.
  useDocumentTitle(workspaceTitle(view));
  useEffect(() => {
    const followHistory = (): void => open(readWorkspaceAddress());
    window.addEventListener('popstate', followHistory);
    return () => window.removeEventListener('popstate', followHistory);
  }, []);
}

function enterView(waiting: RefObject<WaitingAddress | null>, path: string): void {
  // The entry being left keeps a search typed just before leaving it.
  writeWaitingAddress(waiting);
  if (currentWorkspacePath() !== path) {
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0 });
  }
  // A new view replaces the one being read, so focus moves to its title; the first view keeps the page's start.
  focusPageHeading();
}

function replaceAddressSoon(waiting: RefObject<WaitingAddress | null>, path: string): void {
  cancelWaitingAddress(waiting);
  if (locationShows(path)) return;
  const timer = window.setTimeout(() => writeWaitingAddress(waiting), FILTER_ADDRESS_DELAY_MS);
  waiting.current = { path, timer };
}

// After Back or Forward, the entry a waiting address belonged to is no longer current, so it stays as it was.
function writeWaitingAddress(waiting: RefObject<WaitingAddress | null>): void {
  const address = waiting.current;
  cancelWaitingAddress(waiting);
  if (address && window.location.pathname === pathnameOf(address.path))
    replaceAddress(address.path);
}

function cancelWaitingAddress(waiting: RefObject<WaitingAddress | null>): void {
  window.clearTimeout(waiting.current?.timer);
  waiting.current = null;
}

function replaceAddress(path: string): void {
  if (!locationShows(path)) window.history.replaceState(window.history.state, '', path);
}

// Parameters the workspace ignores, such as ?new=1, don't count, so they never add or replace an entry.
function locationShows(path: string): boolean {
  return window.location.pathname === pathnameOf(path) && currentWorkspacePath() === path;
}

function pathnameOf(path: string): string {
  return path.split('?')[0]!;
}

function currentWorkspacePath(): string {
  return workspacePath(readWorkspaceAddress());
}

function readWorkspaceAddress(): WorkspaceAddress {
  return workspaceAddressFrom(
    window.location.pathname,
    new URLSearchParams(window.location.search),
  );
}
