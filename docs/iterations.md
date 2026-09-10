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

The complete `pnpm local:up` and `pnpm verify` entry points passed. The public repository was created at https://github.com/pablowinck/recall and pushed at a576c27e1384c1dea781bb18b75405edabb50e49. The first GitHub CI run is 34467478928. Production remains pending the requested Edge-based setup.

## 2026-09-10 — English interface and language-neutral defaults, validated locally

The owner requested English for every interface label, API message, comment, ADR and document, without adding i18n. Translated the existing decision records while retaining their IDs, decisions and Proposed status; renamed their files and updated links. Updated HTML language and date formatting, translated empty/error/loading states and MCP instructions, and introduced a neutral My first deck default.

Migration 202609100003 updates existing default workspace/deck labels without rewriting card content or review history. The English starter pack remains learning material, not an application-language restriction. Added an E2E test that round-trips Portuguese, Italian and French cards through MCP and the API.

Validation: `pnpm local:up` and `pnpm verify` passed after rebuilding all containers: 12 unit tests, 8 E2E tests, TypeScript, formatting and production builds. English desktop/tablet/mobile journeys and axe checks passed. The Codex stdio launcher still exposes 9 tools and reads all 64 starter cards. The foundation CI run 34467478928 completed successfully on GitHub.

The English-only update was pushed as 1b5f297da11e35cf7384890359db85b9a8cd8f83. Its GitHub CI run 34468894089 passed.

## 2026-09-10 — review ownership and request-error recovery, validated locally

Discovery reproduced two failures with disposable local accounts: a direct authenticated database insert could link a review to another tenant's card, even though the API already rejected foreign cards; malformed JSON returned 500 instead of a client error. The two regression tests failed before implementation.

Migration 202609100004 adds a composite card/tenant foreign key for reviews. The HTTP error adapter now distinguishes invalid JSON, oversized bodies and unsupported encodings; error logging includes safe identifiers only, through an injected logger. Updated the architecture and API contracts.

Validation: 15 unit tests and 10 E2E tests passed after rebuilding the local containers, along with formatting, TypeScript and production builds. Both reproduced regressions now pass. No test rated the starter account's cards. Next iteration: reduce oversized feature components and strengthen browser error recovery while keeping all product and contributor copy in English.

Next discovery candidates: recovery after API interruptions; inline pause/resume and export; empty search/pagination boundaries; accessibility of card dialogs and connection flow; registration/password recovery; reduce oversized React component bodies to the 4–20-line convention; reduce API/MCP container payload; machine-readable OpenAPI. Confirm necessity before adding features outside flashcard workflow.

The task has a 30-minute heartbeat for continued improvement. Keep cycles bounded and evidence-based. Pause it when the user explicitly asks to stop.
