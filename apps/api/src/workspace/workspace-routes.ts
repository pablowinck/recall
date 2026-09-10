import type { Request, Router } from 'express';
import type { PoolClient } from 'pg';
import { deckDraftSchema, type Deck } from '@recall/contracts';
import type { TenantRoute } from '../http/tenant-route.js';
import { createDeck, readWorkspace } from './workspace-store.js';

/** Declare the dashboard and deck endpoints. Example: attachWorkspaceRoutes(router, route). */
export function attachWorkspaceRoutes(router: Router, route: TenantRoute): void {
  router.get('/workspace', route(readWorkspace));
  router.post('/decks', route(addDeck));
}

function addDeck(connection: PoolClient, request: Request): Promise<Deck> {
  return createDeck(connection, deckDraftSchema.parse(request.body).name);
}
