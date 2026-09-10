import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RecallClient } from '@recall/client';
import { recallToolDefinitions as definitions } from './tool-definitions.js';

type ToolTextResult = {
  content: { type: 'text'; text: string }[];
};
interface CardQuery {
  search?: string;
  limit: number;
  offset: number;
}

function toolResult(result: unknown): ToolTextResult {
  const serialized = JSON.stringify(result);
  return {
    content: [{ type: 'text', text: serialized }],
  };
}

/** Expose API operations scoped to the token owner. Example: createRecallMcp(client). */
export function createRecallMcp(client: RecallClient): McpServer {
  const server = new McpServer({ name: 'recall', version: '0.1.0' });
  registerReadTools(server, client);
  registerCreationTools(server, client);
  registerMutationTools(server, client);
  return server;
}

function registerReadTools(server: McpServer, client: RecallClient): void {
  server.registerTool('list_decks', definitions.listDecks, async () =>
    toolResult(await client.workspace()),
  );
  server.registerTool('list_flashcards', definitions.listCards, (query) =>
    listToolCards(client, query),
  );
  server.registerTool('get_due_cards', definitions.dueCards, async ({ deck_id }) =>
    toolResult(await client.study(deck_id)),
  );
}

async function listToolCards(client: RecallClient, query: CardQuery): Promise<ToolTextResult> {
  const parameters = new URLSearchParams({
    search: query.search ?? '',
    limit: String(query.limit),
    offset: String(query.offset),
  });
  const page = await client.cards(parameters.toString());
  return toolResult(page);
}

function registerCreationTools(server: McpServer, client: RecallClient): void {
  server.registerTool('create_deck', definitions.createDeck, async ({ name }) =>
    toolResult(await client.createDeck(name)),
  );
  server.registerTool('create_flashcard', definitions.createCard, async (draft) =>
    toolResult(await client.createCard(draft)),
  );
  server.registerTool('import_flashcards', definitions.importCards, async ({ cards }) =>
    toolResult(await client.importCards(cards)),
  );
}

function registerMutationTools(server: McpServer, client: RecallClient): void {
  server.registerTool('update_flashcard', definitions.updateCard, async ({ card_id, patch }) =>
    toolResult(await client.updateCard(card_id, patch)),
  );
  server.registerTool('delete_flashcard', definitions.deleteCard, async ({ card_id }) =>
    toolResult(await client.deleteCard(card_id)),
  );
  server.registerTool('review_flashcard', definitions.reviewCard, async ({ card_id, ...input }) =>
    toolResult(await client.review(card_id, input)),
  );
}
