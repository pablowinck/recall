import type { Request, RequestHandler } from 'express';
import type { PoolClient } from 'pg';
import type { Authenticator } from '../authentication.js';
import type { TenantDatabase } from '../database.js';

/** A content query for the verified caller. Example: const read: RouteOperation = (connection) => readWorkspace(connection). */
export type RouteOperation = (connection: PoolClient, request: Request) => Promise<unknown>;

/** Turn a RouteOperation into an Express handler. Example: router.get('/workspace', route(readWorkspace)). */
export type TenantRoute = (operation: RouteOperation) => RequestHandler;

/** Verify identity before every content query so no feature route can bypass RLS. Example: createTenantRoute(authenticator, database). */
export function createTenantRoute(
  authenticator: Authenticator,
  database: TenantDatabase,
): TenantRoute {
  return (operation) => async (request, response) => {
    const userId = await authenticator.verify(request);
    const result = await database.runFor(userId, (connection) => operation(connection, request));
    response.json(result);
  };
}
