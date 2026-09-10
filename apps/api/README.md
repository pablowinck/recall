# Recall API

Express app that verifies the caller and runs every content query inside a PostgreSQL row-level-security transaction. It is the only app with database access.

## Where things live

| Path                            | Owns                                                                      |
| ------------------------------- | ------------------------------------------------------------------------- |
| `src/<feature>/`                | One feature: `<feature>-routes.ts` (HTTP) and `<feature>-store.ts` (SQL). |
| `src/http/routes.ts`            | Composes feature routes under `/v1`.                                      |
| `src/http/tenant-route.ts`      | Identity check + `TenantDatabase.runFor` wrapper used by every route.     |
| `src/http/create-api.ts`        | Middleware, health check, 404 and error responses.                        |
| `src/database.ts`               | Tenant transaction boundary (`authenticated` role + user claims).         |
| `src/authentication.ts`         | Supabase JWT and personal MCP token verification.                         |
| `src/server.ts`, `src/local.ts` | Vercel and local entry points.                                            |

Features: `workspace` (dashboard stats, decks), `cards` (search, create, edit, delete, import), `reviews` (study queue, FSRS rating), `tokens` (personal MCP connections).

## Add or change an endpoint

1. Validate input with a schema from `packages/contracts`.
2. Declare the route in the feature's `<feature>-routes.ts` using `route(operation)`; never query outside it.
3. Keep SQL in `<feature>-store.ts` with bound parameters; RLS must stay the enforcement layer.
4. Expose it to web and MCP through `packages/client`, then cover it with a unit or E2E test.
