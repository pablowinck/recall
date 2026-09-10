# Production deployment

Provision resources in the owner's **personal** accounts. The initial setup requested Microsoft Edge. If that UI is blocked, continue local work and record the external step as pending.

## Supabase

1. Create a managed Supabase project in the personal organization.
2. Apply `supabase/migrations/*.sql` in order. The schema is `recall`, outside the Data API's exposed schemas.
3. Configure the production web URL as Auth Site URL and the exact required redirect URLs. Configure production email delivery and confirmation for public signup.
4. Obtain the project URL, publishable key, and TLS-enabled Postgres pooler URL. The API is the only app that receives the database URL.

For a fresh remote database, `DATABASE_URL=... pnpm db:migrate` applies migrations with a ledger. Local migration state is managed by the Supabase CLI instead; use `supabase migration up --local` locally.

## Three Vercel projects from one repository

Enable access to workspace files outside each root directory.

| Project    | Root directory | Required environment                                                                                      |
| ---------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| recall-web | `apps/web`     | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MCP_URL` |
| recall-api | `apps/api`     | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `WEB_ORIGIN`                                         |
| recall-mcp | `apps/mcp`     | `API_URL`                                                                                                 |

Web uses Next.js detection. API and MCP use Vercel's Express framework with the default app export in `src/server.ts`. Use the existing build commands. Set `WEB_ORIGIN` to the exact production web origin and `API_URL` to the deployed API origin.

`NEXT_PUBLIC_*` values are public build-time configuration. Redeploy the web after changing them. Never set a Supabase service-role or database password in a `NEXT_PUBLIC_*` variable.

## Release validation

Before pushing a release: `pnpm verify` against the local stack. After deployment, verify the actual flow: login → owned card creation → MCP lookup/import → visible web content → review → reload/persistence. Use an isolated QA account for ratings and deletion. Check cross-tenant access again on production-owned QA accounts.

A Vercel Ready state or health endpoint alone is not functional proof. Record repository commit, deployment URLs, migration state and actual test outcome in the iteration log. Keep secrets out of evidence.
