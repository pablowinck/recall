import type {
  AccessToken,
  CardDraft,
  CardPage,
  CardPatch,
  CreatedToken,
  Deck,
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
}

/** Cliente único usado por web e MCP. Exemplo: new RecallClient({baseUrl, token}). */
export class RecallClient {
  constructor(private readonly options: RecallClientOptions) {}

  /** Executa chamada autenticada sem cache. Exemplo: client.request<Workspace>('/workspace'). */
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const token = await this.options.token();
    const response = await (this.options.fetcher ?? fetch)(`${this.options.baseUrl}/v1${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
    const payload: unknown = await response.json();
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
  updateCard(id: string, patch: CardPatch): Promise<Flashcard> {
    return this.request(`/cards/${id}`, 'PATCH', patch);
  }
  deleteCard(id: string): Promise<{ deleted: boolean }> {
    return this.request(`/cards/${id}`, 'DELETE');
  }
  createDeck(name: string): Promise<Deck> {
    return this.request('/decks', 'POST', { name });
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

function readErrorMessage(payload: unknown): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }
  return 'Não foi possível concluir a solicitação.';
}
