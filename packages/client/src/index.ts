import type {
  AccessToken,
  CardDraft,
  CardPage,
  CardUpdate,
  CreatedToken,
  Deck,
  DeckRemoval,
  Flashcard,
  ReviewInput,
  StudyCard,
  Workspace,
} from '@recall/contracts';

export class RecallApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'RecallApiError';
  }
}

export interface RecallClientOptions {
  baseUrl: string;
  token: () => Promise<string>;
  fetcher?: typeof fetch;
  /** Runs when the API rejects the credentials, for example a session revoked on the server. */
  onUnauthorized?: () => void;
}

/** Share one HTTP client between the web and MCP apps. Example: new RecallClient({baseUrl, token}). */
export class RecallClient {
  constructor(private readonly options: RecallClientOptions) {}

  /** Send an authenticated request without caching personal content. Example: client.request<Workspace>('/workspace'). */
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const token = await this.options.token();
    const response = await (this.options.fetcher ?? fetch)(`${this.options.baseUrl}/v1${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
    if (response.status === 401) this.options.onUnauthorized?.();
    const payload: unknown = await readApiPayload(response);
    if (!response.ok) throw new RecallApiError(response.status, readErrorMessage(payload));
    return payload as T;
  }

  workspace(): Promise<Workspace> {
    return this.request('/workspace');
  }
  cards(query = ''): Promise<CardPage> {
    return this.request(`/cards${query ? `?${query}` : ''}`);
  }
  createCard(draft: CardDraft): Promise<Flashcard> {
    return this.request('/cards', 'POST', draft);
  }
  updateCard(id: string, patch: CardUpdate): Promise<Flashcard> {
    return this.request(`/cards/${id}`, 'PATCH', patch);
  }
  deleteCard(id: string): Promise<{ deleted: boolean }> {
    return this.request(`/cards/${id}`, 'DELETE');
  }
  createDeck(name: string): Promise<Deck> {
    return this.request('/decks', 'POST', { name });
  }
  deleteDeck(id: string, removal: DeckRemoval): Promise<{ deleted: boolean }> {
    const query = new URLSearchParams({ cards: removal.cards });
    if (removal.cards === 'move') query.set('target', removal.target);
    return this.request(`/decks/${id}?${query.toString()}`, 'DELETE');
  }
  study(deck?: string): Promise<StudyCard[]> {
    return this.request(`/study${deck ? `?deck=${deck}` : ''}`);
  }
  review(id: string, input: ReviewInput): Promise<Flashcard> {
    return this.request(`/cards/${id}/reviews`, 'POST', input);
  }
  tokens(): Promise<AccessToken[]> {
    return this.request('/tokens');
  }
  createToken(name: string): Promise<CreatedToken> {
    return this.request('/tokens', 'POST', { name });
  }
  revokeToken(id: string): Promise<{ deleted: boolean }> {
    return this.request(`/tokens/${id}`, 'DELETE');
  }
  importCards(cards: CardDraft[]): Promise<{ cards: Flashcard[]; count: number }> {
    return this.request('/cards/import', 'POST', { cards });
  }
}

async function readApiPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new RecallApiError(502, 'The service returned an invalid response. Please try again.');
  }
}

function readErrorMessage(payload: unknown): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }
  return 'Unable to complete the request. Please try again.';
}
