import { Router } from 'express';
import type { Authenticator } from '../authentication.js';
import type { TenantDatabase } from '../database.js';
import { attachCardRoutes } from '../cards/card-routes.js';
import { attachReviewRoutes } from '../reviews/review-routes.js';
import { attachTokenRoutes } from '../tokens/token-routes.js';
import { attachWorkspaceRoutes } from '../workspace/workspace-routes.js';
import type { ApiLogger } from './failures.js';
import { createTenantRoute } from './tenant-route.js';

export interface ApiDependencies {
  database: TenantDatabase;
  authenticator: Authenticator;
  clock: () => Date;
  origins: string[];
  logger: ApiLogger;
}

/** Compose the /v1 router; each feature folder declares its own routes. Example: createRoutes(dependencies). */
export function createRoutes(dependencies: ApiDependencies): Router {
  const router = Router();
  const route = createTenantRoute(dependencies.authenticator, dependencies.database);
  attachWorkspaceRoutes(router, route);
  attachCardRoutes(router, route);
  attachReviewRoutes(router, route, dependencies.clock);
  attachTokenRoutes(router, route);
  return router;
}
