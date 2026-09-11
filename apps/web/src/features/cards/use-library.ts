import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { RecallClient } from '@recall/client';
import type { CardPage } from '@recall/contracts';
import { describeFailure } from '@/lib/error-message';
import { encodeLibraryQuery, type LibraryQuery } from './library-query';

export interface LibraryLoad {
  result: CardPage;
  loading: boolean;
  error: string;
}
type LibrarySetter = Dispatch<SetStateAction<LibraryLoad>>;

/** Paginate results and discard stale search responses. Example: useLibrary(client, query, revision). */
export function useLibrary(
  client: RecallClient,
  query: LibraryQuery,
  revision: number,
): LibraryLoad {
  const [response, setResponse] = useState<LibraryLoad>({
    result: { cards: [], total: 0 },
    loading: true,
    error: '',
  });
  const encoded = encodeLibraryQuery(query);
  useEffect(() => startLibraryRequest(client, encoded, setResponse), [client, encoded, revision]);
  return response;
}

function startLibraryRequest(
  client: RecallClient,
  query: string,
  update: LibrarySetter,
): () => void {
  let active = true;
  update((current) => ({ ...current, loading: true, error: '' }));
  const timer = setTimeout(() => {
    void fetchLibraryPage(client, query).then((response) => {
      if (active) update(response);
    });
  }, 180);
  return () => {
    active = false;
    clearTimeout(timer);
  };
}

async function fetchLibraryPage(client: RecallClient, query: string): Promise<LibraryLoad> {
  try {
    return { result: await client.cards(query), loading: false, error: '' };
  } catch (failure) {
    return { result: { cards: [], total: 0 }, loading: false, error: describeFailure(failure) };
  }
}
