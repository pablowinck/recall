# Iteration log

## 2026-09-10 — foundation and local functional proof

Implemented three TypeScript apps, shared contracts/client/domain, Supabase Auth and Postgres RLS, FSRS scheduling, transactional reviews, hashed MCP tokens, and responsive web flows.

Validated: 12 unit tests and 7 real E2E tests. E2E covered cross-tenant reads/writes, forged deck identifiers, two concurrent identical reviews, stale review versions, MCP import deduplication, token revocation, anonymous/invalid requests, and full product journeys on desktop/tablet/mobile. All passed.

The three Docker Compose app containers and the dedicated Supabase local stack are running. The 64 starter cards were imported through authenticated Streamable HTTP MCP and reread successfully. No synthetic review was assigned to the starter account.

External state: GitHub authenticated as `pablowinck`, repository name `recall` available at the initial read. Repository publication and Vercel/Supabase production setup remain pending. Edge's browser connection became available, but navigation was blocked by another extension UI. Continue local work without waiting on that UI.

## 2026-09-10 — iteration 2, validated locally

Discovery: screenshot timing caught the response fade; mobile study used unnecessary bottom navigation space; sidebar email wrapped; keyboard ratings were ignored when a button retained focus. A unit test also exposed Zod defaults clearing tags on partial updates; fixed with a separate optional patch schema.

Changes: immediate answer display, mobile focus layout, truncated single-line email, keyboard processing guards, and smaller study modules. Added axe accessibility checks for light study and dark dashboard, plus a keyboard regression in the desktop E2E flow. Fixed the light link color and the Radix solid-button color after real contrast failures; removed view fade that temporarily reduced contrast.

Validation: all 7 E2E tests passed, including axe WCAG A/AA checks on light study and dark dashboard across all three sizes. All 12 unit tests and application/script/test type checks passed. API/MCP containers now use portable production dependency bundles instead of copying the entire build workspace. The local Codex stdio launcher was registered as `recall-local`; an independent handshake found 9 tools and read all 64 starter cards. Tool availability inside an already-running Codex session may require a client reload.

Current preparation: split HTTP route registration into smaller functions; full clean-entry verification and GitHub publication are next. Production remains pending the requested Edge-based setup.

Next discovery candidates: recovery after API interruptions; inline pause/resume and export; empty search/pagination boundaries; accessibility of card dialogs and connection flow; registration/password recovery; reduce oversized React component bodies to the 4–20-line convention; reduce API/MCP container payload; machine-readable OpenAPI. Confirm necessity before adding features outside flashcard workflow.

The task has a 30-minute heartbeat for continued improvement. Keep cycles bounded and evidence-based. Pause it when the user explicitly asks to stop.
