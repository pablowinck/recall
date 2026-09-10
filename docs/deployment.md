# Production deployment

Provision resources in the owner's **personal** accounts. The initial setup requested Microsoft Edge. If that UI is blocked, continue local work and record the external step as pending.

## Supabase

1. Create a managed Supabase project in the personal organization.
2. Apply `supabase/migrations/*.sql` in order. The schema is `recall`, outside the Data API's exposed schemas.
3. Configure the production web URL as Auth Site URL and the exact required redirect URLs. Configure production email delivery and confirmation for public signup.
4. Provision a strong login credential for `recall_api_service` after applying the role migration. Use its TLS-verified transaction pooler URL for the API. Keep administrator credentials separate for schema migrations. See ADR 0003 for the runtime permission boundary.

For a fresh remote database, `DATABASE_URL=... pnpm db:migrate` applies migrations with a ledger. Local migration state is managed by the Supabase CLI instead; use `supabase migration up --local` locally.

## Three Vercel projects from one repository

Enable access to workspace files outside each root directory.

| Project    | Root directory | Required environment                                                                                      |
| ---------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| recall-web | `apps/web`     | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MCP_URL` |
| recall-api | `apps/api`     | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `WEB_ORIGIN`                                         |
| recall-mcp | `apps/mcp`     | `API_URL`                                                                                                 |

Web uses Next.js detection. API and MCP use Vercel's Express framework. Their `server.mjs` entrypoints mount the same compiled `dist/server.js` applications used by Docker, avoiding a second TypeScript compilation with different module interop rules. Use the existing build commands. Set `WEB_ORIGIN` to the exact production web origin and `API_URL` to the deployed API origin.

Use the project's assigned production domain from its Domains settings. Team-qualified deployment aliases can require Vercel authentication, which prevents browsers and MCP clients from reaching the application's own authentication flow. Keep preview deployment protection enabled.

Shared packages export built JavaScript, with TypeScript source exposed only for type resolution. Their Turbo build dependencies must finish before the Express builders trace imports. Exporting `.ts` runtime paths fails when the Vercel builder emits `.js` files. `pnpm test` and `pnpm dev` build shared packages first.

API, MCP, and shared package TypeScript uses NodeNext resolution and explicit `.js` relative imports. This lets TypeScript detect module paths that native Node cannot load. After `vercel build --prod --standalone` in an Express app directory, run `pnpm test:vercel-bundle apps/mcp/.vercel/output/functions/index.func` (or `apps/api/...`) from the repository root. The check starts the emitted function with native Node, then verifies health and anonymous access denial without requiring Vercel's launcher.

The web uses standalone output for Docker only. Vercel's Next.js adapter owns production packaging; enabling standalone there triggers Next.js issue #96646 in the pinned 16.3 version.

`NEXT_PUBLIC_*` values are public build-time configuration. Redeploy the web after changing them. Never set a Supabase service-role or database password in a `NEXT_PUBLIC_*` variable.

## Release validation

Before pushing a release: `pnpm verify` against the local stack. After deployment, verify the actual flow: login → owned card creation → MCP lookup/import → visible web content → review → reload/persistence. Use an isolated QA account for ratings and deletion. Check cross-tenant access again on production-owned QA accounts.

A Vercel Ready state or health endpoint alone is not functional proof. Record repository commit, deployment URLs, migration state and actual test outcome in the iteration log. Keep secrets out of evidence.
