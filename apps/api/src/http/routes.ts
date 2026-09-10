import type { Request, RequestHandler } from 'express';
import { Router } from 'express';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import {
  cardDraftSchema,
  cardPatchSchema,
  deckDraftSchema,
  importCardsSchema,
  reviewInputSchema,
  tokenDraftSchema,
} from '@recall/contracts';
import type { Authenticator } from '../authentication';
import type { TenantDatabase } from '../database';
import { createDeck, readWorkspace } from '../cards/workspace-store';
import { deleteCard, insertCard, listCards, updateCard } from '../cards/card-store';
import { recordReview, studyQueue } from '../reviews/review-store';
import { createToken, listTokens, revokeToken } from '../tokens/token-store';
import type { ApiLogger } from './failures';

export interface ApiDependencies {
  database: TenantDatabase;
  authenticator: Authenticator;
  clock: () => Date;
  origins: string[];
  logger: ApiLogger;
}
type RouteOperation = (connection: PoolClient, request: Request) => Promise<unknown>;
const cardSearchSchema = z.object({
  search: z.string().max(200).default(''),
  deck: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

function tenantRoute(dependencies: ApiDependencies, operation: RouteOperation): RequestHandler {
  return async (request, response) => {
    const userId = await dependencies.authenticator.verify(request);
    const result = await dependencies.database.runFor(userId, (connection) =>
      operation(connection, request),
    );
    response.json(result);
  };
}

/** Declare the HTTP routes in one discoverable module. Example: createRoutes(dependencies). */
export function createRoutes(dependencies: ApiDependencies): Router {
  const router = Router();
  const route = (operation: RouteOperation): RequestHandler => tenantRoute(dependencies, operation);
  attachWorkspaceRoutes(router, route);
  attachCardRoutes(router, route);
  attachImportRoute(router, route);
  attachReviewRoutes(router, route, dependencies.clock);
  attachTokenRoutes(router, route);
  return router;
}

function attachWorkspaceRoutes(
  router: Router,
  route: (operation: RouteOperation) => RequestHandler,
): void {
  router.get(
    '/workspace',
    route((connection) => readWorkspace(connection)),
  );
  router.post(
    '/decks',
    route((connection, req) => createDeck(connection, deckDraftSchema.parse(req.body).name)),
  );
  router.get(
    '/cards',
    route((connection, req) => listCards(connection, cardSearchSchema.parse(req.query))),
  );
}

function attachCardRoutes(
  router: Router,
  route: (operation: RouteOperation) => RequestHandler,
): void {
  router.post(
    '/cards',
    route((connection, req) => insertCard(connection, cardDraftSchema.parse(req.body))),
  );
  router.patch(
    '/cards/:id',
    route((connection, req) =>
      updateCard(connection, z.uuid().parse(req.params.id), cardPatchSchema.parse(req.body)),
    ),
  );
  router.delete(
    '/cards/:id',
    route((connection, req) => deleteCard(connection, z.uuid().parse(req.params.id))),
  );
}

function attachImportRoute(
  router: Router,
  route: (operation: RouteOperation) => RequestHandler,
): void {
  router.post(
    '/cards/import',
    route(async (connection, request) => {
      const { cards } = importCardsSchema.parse(request.body);
      const imported = [];
      for (const card of cards) imported.push(await insertCard(connection, card));
      return { cards: imported, count: imported.length };
    }),
  );
}

function attachReviewRoutes(
  router: Router,
  route: (operation: RouteOperation) => RequestHandler,
  clock: () => Date,
): void {
  router.get(
    '/study',
    route((connection, request) =>
      studyQueue(connection, clock(), z.uuid().optional().parse(request.query.deck)),
    ),
  );
  router.post(
    '/cards/:id/reviews',
    route((connection, request) => {
      const cardId = z.uuid().parse(request.params.id);
      return recordReview(connection, cardId, reviewInputSchema.parse(request.body), clock());
    }),
  );
}

function attachTokenRoutes(
  router: Router,
  route: (operation: RouteOperation) => RequestHandler,
): void {
  router.get(
    '/tokens',
    route((connection) => listTokens(connection)),
  );
  router.post(
    '/tokens',
    route((connection, request) =>
      createToken(connection, tokenDraftSchema.parse(request.body).name),
    ),
  );
  router.delete(
    '/tokens/:id',
    route((connection, request) => revokeToken(connection, z.uuid().parse(request.params.id))),
  );
}
