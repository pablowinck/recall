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

Keep every app simple, documented and feature-first so people and LLM agents can contribute quickly: a feature folder owns its components, state and styles; shared code stays small and obvious; update the change map in `docs/architecture.md` when structure moves.

Radix Themes renders dialogs, selects and tooltips in portals outside `.recall-root`, and dialog titles as `h1`. Define product tokens on `:root`/`:root.dark` (`apps/web/src/styles/tokens.css`) and accent aliases on `.radix-themes` (`apps/web/src/styles/radix-theme.css`). Text below a title takes its size from the `--text-*` ramp in `tokens.css`, and corners from the `--r-*` radii; a unit test checks sizes, weights and radii. Radix CSS and product styles load only in `app/(product)/layout.tsx`, so the landing page ships neither. That layout imports Radix per colour scale, so a new Radix colour, as a `color` prop or a `--<scale>-*` variable, needs its `tokens/colors/<scale>.css` import there. Appearance is the `dark` class on `<html>`, set before paint by the head script in `app/layout.tsx`. Radix also owns `--shadow-*`, `--space-*`, `--radius-*` and `--color-*` on `.radix-themes`, where they override same-named product tokens; use other names such as `--elev-*` and `--r-*`. Write `-webkit-backdrop-filter` before `backdrop-filter`: the CSS build keeps only the last of the pair, so the other order drops the blur in Chrome and Firefox. It also rewrites `:dir(rtl)` as right-to-left `:lang()` selectors, which miss card text marked only with `dir="auto"`; follow an element's direction with logical properties such as `margin-inline-end`. A Radix dialog keeps the rest of the page `aria-hidden` until it unmounts, so a live-region message sent as it closes goes unheard; `StatusAnnouncer` waits a moment before speaking.

Use explicit types, specific names, early returns and one responsibility per module. Target functions of 4–20 lines and files below 500 lines. Split feature state, actions and presentation instead of growing component bodies. Public functions need intent and a usage example in their documentation. Preserve comments explaining why a choice exists.

Use `pnpm format`. Verify with `pnpm verify` while the local stack runs. Every behavior change needs appropriate coverage; bug fixes need regression evidence. Use named fake classes for external I/O in unit tests. E2E tests deliberately use real local Auth, Postgres, API and MCP. In Chromium, a `fullPage` screenshot turns off touch emulation for the rest of that page, so `(pointer: coarse)` styles stop applying; assert touch styles first or re-enable it with CDP `Emulation.setTouchEmulationEnabled`.

Do not create another task or delegate unless the user explicitly requests it. Do not edit other projects or stop their containers. Our app containers use Compose project `recall`; our Supabase containers end in `_recall`. In WSL2, run with `zsh -lc` so Node 24 and pnpm are loaded; if WSL restarts, restart the recall and `_recall` containers to restore loopback port bindings. After modifying `apps/web`, `apps/api` or `apps/mcp`, rebuild the target container with `docker compose up --build -d <service>` so E2E tests exercise the latest code; before trusting a browser probe, confirm the served chunk contains the change.

A fresh git worktree has no `.env`, `apps/web/.env.local`, `.local/account.json` or `node_modules`: copy the first three from the main checkout and run `pnpm install --frozen-lockfile`. Turbo's cache is shared, so a replayed web build can hide a missing `.env.local`. `compose.yaml` pins the project name, so a rebuild from any worktree replaces the shared `recall` containers. Moving or deleting a Next route leaves `apps/web/.next/types` importing the old path, so remove `apps/web/.next` before `pnpm check`. On app pages Next.js replaces a `Vary` header set through `next.config.ts` `headers()`; set `Vary` on the route handler's own response instead. Next also commits the route's metadata title just after the first render, replacing a `document.title` set once in an effect; name the tab with `useDocumentTitle` (`apps/web/src/lib/use-document-title.ts`). auth-js repeats `SIGNED_IN` with a new session object whenever the tab regains focus, so compare the user and token before storing it (`nextSessionSnapshot`).

## Continuous iteration

Discovery → bounded implementation → local functional tests → deployment when authorized access is available → web/MCP verification → record evidence → next discovery. If an external service is unavailable, continue locally. Never assign synthetic recall ratings to the user's 64 starter cards; use disposable test accounts.

Keep `.env`, `.local`, credentials, tokens, logs and browser traces out of Git. Never weaken isolation to make a test pass. ADRs stay `Proposed` until human confirmation.

## Delivery

A push to `main` triggers CI and production deployments of all three Vercel projects. Before claiming delivery, confirm `gh api "repos/pablowinck/recall/deployments?sha=<sha>"` statuses are `success`, CI passed, and the public web serves the change. Each push deploys all three projects, and the personal Vercel account allows a limited number of deployments a day; when a commit status reads "Deployment rate limited", production keeps the last good build, so batch several validated commits into one push.

The initial publication is authorized to the user's personal GitHub account as an open-source repository and to personal Vercel/Supabase resources. Confirm the actual account from authenticated service state; do not use company organizations. Initial Vercel project setup must use the user's Microsoft Edge as requested. Preserve local progress if access is blocked.
