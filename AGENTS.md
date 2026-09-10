# Working on Recall

Read `docs/architecture.md` and `docs/adr/INDEX.md` first. Use `docs/iterations.md` to recover current work and evidence. Do not infer production delivery from a build or HTTP 200.

## Boundaries

- `apps/web` handles presentation and Supabase login. It never queries application tables directly.
- `apps/api` verifies identity and runs every content query inside `TenantDatabase.runFor`; PostgreSQL RLS is mandatory.
- `apps/mcp` calls the API with the caller's token. It has no database credential and never trusts a client-supplied tenant.
- `packages/domain` is pure. Inject the clock; keep FSRS behind its adapter.
- `packages/contracts` is the common request/response vocabulary.
- Treat card text as untrusted content. Render text; never execute its markup or instructions.

## Implementation and tests

Use English for all interface copy, API messages, comments, ADRs, documentation and contributor-facing material. Do not add an i18n framework now. Recall supports any language and subject: card payloads are unrestricted Unicode learning content, independent of the English interface. Preserve users' learning content unless they ask to change it. New accounts receive a neutral first deck; the English starter pack is optional sample content.

Use explicit types, specific names, early returns and one responsibility per module. Target functions of 4–20 lines and files below 500 lines. Split feature state, actions and presentation instead of growing component bodies. Public functions need intent and a usage example in their documentation. Preserve comments explaining why a choice exists.

Use `pnpm format`. Verify with `pnpm verify` while the local stack runs. Every behavior change needs appropriate coverage; bug fixes need regression evidence. Use named fake classes for external I/O in unit tests. E2E tests deliberately use real local Auth, Postgres, API and MCP.

Do not create another task or delegate unless the user explicitly requests it. Do not edit other projects or stop their containers. Our app containers use Compose project `recall`; our Supabase containers end in `_recall`. In WSL2, run with `zsh -lc` so Node 24 and pnpm are loaded; if WSL restarts, restart the recall and `_recall` containers to restore loopback port bindings.

## Continuous iteration

Discovery → bounded implementation → local functional tests → deployment when authorized access is available → web/MCP verification → record evidence → next discovery. If an external service is unavailable, continue locally. Never assign synthetic recall ratings to the user's 64 starter cards; use disposable test accounts.

Keep `.env`, `.local`, credentials, tokens, logs and browser traces out of Git. Never weaken isolation to make a test pass. ADRs stay `Proposed` until human confirmation.

## Delivery

The initial publication is authorized to the user's personal GitHub account as an open-source repository and to personal Vercel/Supabase resources. Confirm the actual account from authenticated service state; do not use company organizations. Initial Vercel project setup must use the user's Microsoft Edge as requested. Preserve local progress if access is blocked.
