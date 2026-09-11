import { describe, expect, it } from 'vitest';
import { EMPTY_LIBRARY_QUERY } from '../../apps/web/src/features/cards/library-query';
import {
  workspaceAddressFrom,
  workspacePath,
  workspaceTitle,
  type WorkspaceAddress,
} from '../../apps/web/src/features/workspace/workspace-url';

const DECK = '4f0b6f1e-0000-4000-8000-000000000000';

function addressOf(
  view: WorkspaceAddress['view'],
  parts: Partial<WorkspaceAddress> = {},
): WorkspaceAddress {
  return { view, library: EMPTY_LIBRARY_QUERY, ...parts };
}

function read(href: string): WorkspaceAddress {
  const url = new URL(href, 'https://recall.test');
  return workspaceAddressFrom(url.pathname, url.searchParams);
}

describe('workspace addresses', () => {
  it('gives every view its own path', () => {
    expect(workspacePath(addressOf('today'))).toBe('/app');
    expect(workspacePath(addressOf('library'))).toBe('/app/library');
    expect(workspacePath(addressOf('study'))).toBe('/app/study');
  });

  it('keeps a deck review’s deck in its address, and reads back only a deck id', () => {
    expect(workspacePath(addressOf('study', { studyDeck: DECK }))).toBe(`/app/study?deck=${DECK}`);
    expect(workspacePath(addressOf('library', { studyDeck: DECK }))).toBe('/app/library');
    expect(read(`/app/study?deck=${DECK}`).studyDeck).toBe(DECK);
    expect(read('/app/study?deck=../workspace').studyDeck).toBeUndefined();
    expect(read('/app/study').studyDeck).toBeUndefined();
  });

  it('keeps the library’s search, deck and page, counting pages from 1', () => {
    const library = { search: 'capital portugal', deck: DECK, page: 2 };
    const path = workspacePath(addressOf('library', { library }));
    expect(path).toBe(`/app/library?q=capital+portugal&deck=${DECK}&page=3`);
    expect(read(path)).toEqual(addressOf('library', { library }));
    expect(workspacePath(addressOf('today', { library }))).toBe('/app');
  });

  it('reads only the library filters it can use', () => {
    expect(read('/app/library?deck=not-a-deck&page=abc').library).toEqual(EMPTY_LIBRARY_QUERY);
    expect(read('/app/library?page=-3').library.page).toBe(0);
    expect(read(`/app/library?q=${'a'.repeat(300)}`).library.search).toHaveLength(200);
    expect(read(`/app/study?q=verbs&deck=${DECK}`).library).toEqual(EMPTY_LIBRARY_QUERY);
  });

  it('reads the view back from an address', () => {
    expect(read('/app/library').view).toBe('library');
    expect(read('/app/connections').view).toBe('connections');
    expect(read('/app').view).toBe('today');
  });

  it('falls back to Today for an unknown address', () => {
    expect(read('/app/nowhere').view).toBe('today');
    expect(read('/').view).toBe('today');
  });

  it('names each view for tabs and the history menu', () => {
    expect(workspaceTitle('library')).toBe('Library · Recall');
    expect(workspaceTitle('study')).toBe('Review session · Recall');
  });
});
