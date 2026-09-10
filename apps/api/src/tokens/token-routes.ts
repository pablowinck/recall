import type { Request, Router } from 'express';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { tokenDraftSchema, type CreatedToken } from '@recall/contracts';
import type { TenantRoute } from '../http/tenant-route.js';
import { createToken, listTokens, revokeToken } from './token-store.js';

/** Declare personal MCP connection endpoints. Example: attachTokenRoutes(router, route). */
export function attachTokenRoutes(router: Router, route: TenantRoute): void {
  router.get('/tokens', route(listTokens));
  router.post('/tokens', route(issueToken));
  router.delete('/tokens/:id', route(removeToken));
}

function issueToken(connection: PoolClient, request: Request): Promise<CreatedToken> {
  return createToken(connection, tokenDraftSchema.parse(request.body).name);
}

function removeToken(connection: PoolClient, request: Request): Promise<{ deleted: boolean }> {
  return revokeToken(connection, z.uuid().parse(request.params.id));
}
