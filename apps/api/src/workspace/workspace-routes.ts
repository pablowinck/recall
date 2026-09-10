import type { Request, Router } from 'express';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { deckDraftSchema, deckRemovalSchema, type Deck } from '@recall/contracts';
import type { TenantRoute } from '../http/tenant-route.js';
import { createDeck, deleteDeck, readWorkspace } from './workspace-store.js';

/** Declare the dashboard and deck endpoints. Example: attachWorkspaceRoutes(router, route). */
export function attachWorkspaceRoutes(router: Router, route: TenantRoute): void {
  router.get('/workspace', route(readWorkspace));
  router.post('/decks', route(addDeck));
  router.delete('/decks/:id', route(removeDeck));
}

function addDeck(connection: PoolClient, request: Request): Promise<Deck> {
  return createDeck(connection, deckDraftSchema.parse(request.body).name);
}

function removeDeck(connection: PoolClient, request: Request): Promise<{ deleted: boolean }> {
  const id = z.uuid().parse(request.params.id);
  return deleteDeck(connection, id, deckRemovalSchema.parse(request.query));
}
