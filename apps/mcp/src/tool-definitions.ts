import { z } from 'zod';
import {
  cardDraftSchema,
  cardPatchSchema,
  importCardsSchema,
  mcpToolCatalog as catalog,
  reviewInputSchema,
  type McpToolSummary,
} from '@recall/contracts';

// Names and descriptions live in the shared catalog, which the site's server card publishes as well.
function toolText({ description, annotations }: McpToolSummary): Omit<McpToolSummary, 'name'> {
  return annotations ? { description, annotations } : { description };
}

export const recallToolDefinitions = {
  listDecks: toolText(catalog.listDecks),
  listCards: {
    ...toolText(catalog.listCards),
    inputSchema: {
      search: z.string().max(200).optional(),
      limit: z.number().int().min(1).max(200).default(100),
      offset: z.number().int().min(0).default(0),
    },
  },
  dueCards: { ...toolText(catalog.dueCards), inputSchema: { deck_id: z.uuid().optional() } },
  createDeck: {
    ...toolText(catalog.createDeck),
    inputSchema: { name: z.string().trim().min(1).max(80) },
  },
  createCard: { ...toolText(catalog.createCard), inputSchema: cardDraftSchema.shape },
  importCards: { ...toolText(catalog.importCards), inputSchema: importCardsSchema.shape },
  updateCard: {
    ...toolText(catalog.updateCard),
    inputSchema: { card_id: z.uuid(), patch: cardPatchSchema },
  },
  deleteCard: { ...toolText(catalog.deleteCard), inputSchema: { card_id: z.uuid() } },
  reviewCard: {
    ...toolText(catalog.reviewCard),
    inputSchema: { card_id: z.uuid(), ...reviewInputSchema.shape },
  },
} as const;
