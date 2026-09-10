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

The ownership/error fix was pushed as 7deee55b4f45810063a9b165ed46a98c29527483; CI run 34469513827 passed.

## 2026-09-10 — recoverable card forms, validated locally

Split the authentication form and card editor into focused state, field, action and presentation modules. Added one shared single-flight mutation hook and a reusable confirmation component. Card fields and conflicting actions are disabled while saving; failed requests preserve the draft and expose an English retry message.

A named fake transport simulates one temporary save outage, then sends the retry to the real API. This is fault injection in an isolated test account, not a claim about production availability. All three viewport tests proved retained content, disabled pending controls, and exactly one persisted card after retry. Expanded axe coverage to the light dashboard and editor. Fixed the Radix alpha accent text token used by secondary buttons.

Validation: 16 unit tests and 13 E2E tests passed, including the new recovery journey in desktop, tablet and mobile, plus TypeScript/formatting/build checks. Next discovery: local starter initialization currently repeats imports and the standalone MCP check assumes exactly 64 total cards; both should respect later user edits and deletions.

The form recovery update was pushed as 7f2219e. Current work below has not yet been published.

## 2026-09-10 — preserve local library changes on restart, validated locally

Reproduced the initializer restoring a deleted starter card: an isolated account had 64 imported cards, one was deleted through the API, and restarting the seed returned 64 instead of 63. Added a private account-file override so the regression never touches the user's account.

The initializer now records a one-time starter import and preserves later edits and deletions. The existing user account was marked initialized based on its already-verified successful import, without changing its cards. The standalone MCP check now validates the returned page instead of enforcing an immutable 64-card library. The focused restart regression passed, and the real user's read-only MCP check still reports 9 tools and 64 cards.

Validation: the full local setup and verification command passed with 16 unit tests and 14 E2E tests. The preceding form-recovery CI run 34471330443 also passed. Next iteration: simplify library, navigation and MCP registration modules while preserving the tested behavior and the English-only interface policy.

The restart fix was pushed as 35c5087.

## 2026-09-10 — library recovery and MCP organization, validated locally

Separated library query encoding, result loading, filter state, controls and card presentation. A last-page deletion now clamps the selected page and reloads a valid page. Added tests for pagination boundaries, Unicode query encoding and card status precedence.

The UI deletion test reproduced a confirmation trigger regression introduced by 7f2219e: an intermediate component dropped the Radix trigger props. The trigger now receives the actual Radix Button element. The full deletion-and-page-recovery journey passed on desktop, tablet and mobile.

Moved MCP tool descriptions and schemas into a dedicated definitions module and split transport authentication from response handling. Tool names and authorization are unchanged; the stdio handshake still finds 9 tools and reads the user's 64 cards.

Validation: 19 unit tests, 17 E2E tests, TypeScript, formatting and builds passed after rebuilding the local containers. Next iteration: reduce remaining oversized navigation/dashboard components and verify their behavior.

The library/MCP update was pushed as fd6e27d.

## 2026-09-10 — identity-scoped workspace composition, validated locally

Separated the authenticated shell, navigation/profile controls, workspace commands, selected-view composition, dashboard invitation/stats/deck rows, and Supabase session adapter. The keyed authentication gate remains responsible for discarding state when the signed-in identity changes. Shared theme and page-heading components keep the visible design consistent.

Expanded the study journey to finish the full test session and verify both reviews were persisted. Added a same-tab account-switch regression: after signing out of one filtered library and signing into another account without a page reload, neither the previous search nor its cards are reused.

Validation: 19 unit tests and 20 E2E tests passed on rebuilt containers, along with TypeScript, formatting and production builds. The new completion and account-switch behavior passed in desktop, tablet and mobile. Remaining size-check targets include the connections view, new-deck dialog, study-state hook and a few small presentation helpers.

The workspace composition update was pushed as 240d55c.

## 2026-09-10 — small state modules and connection lifecycle, validated locally

Separated connection creation, token metadata, one-time secret display, deck form orchestration and study-state transitions. Added a shared latest-request resource adapter that ignores old responses and updates after unmount. The study controller retains retry IDs, blocks concurrent ratings and ignores results for disposed sessions. Empty/error study queues no longer expose a reveal action without a card.

Added named fake resources to verify request ordering and disposal, plus study-controller tests for failed retries, concurrent clicks and empty cards. Browser tests now create a connection, verify its MCP tools, revoke it through the UI, and confirm access is denied; another test corrects a duplicate deck name without losing the form value.

Validation: 25 unit tests and 26 E2E tests passed after rebuilding all containers. All three device sizes passed, and the stdio MCP check still reports 9 tools and 64 user cards. The production named-function body inspection reports no function over 20 lines. Next iteration: make structural checks durable and organize sample data into focused files.

Next discovery candidates: recovery after API interruptions; inline pause/resume and export; empty search/pagination boundaries; accessibility of card dialogs and connection flow; registration/password recovery; reduce oversized React component bodies to the 4–20-line convention; reduce API/MCP container payload; machine-readable OpenAPI. Confirm necessity before adding features outside flashcard workflow.

The task has a 30-minute heartbeat for continued improvement. Keep cycles bounded and evidence-based. Pause it when the user explicitly asks to stop.

## 2026-09-10 — production deployment and verified service integration

The owner linked the repository to three personal Vercel projects and provisioned the personal Supabase project. Release `9fb172bdf4f6de35466098b41762014e641c9e68` reached Ready in all three projects. Public production domains are https://recall-web-gilt.vercel.app, https://recall-api-tau.vercel.app and https://recall-mcp-five.vercel.app/mcp. Team-qualified deployment aliases remain protected and are not used for application traffic.

Fixed the Express entrypoint and packaging failures by deploying the compiled application through a small `server.mjs` entrypoint. Shared packages now export JavaScript; NodeNext checks explicit relative module extensions. Docker and Vercel use the same compiled Express application. Standalone Next.js output is limited to Docker to avoid upstream issue #96646. Added a native Node check that starts the actual emitted Vercel function and verifies health and anonymous denial.

All five repository migrations are applied with matching history. The API uses a dedicated NOINHERIT, NOBYPASSRLS database login through the transaction pooler with verified TLS and the official CA. Direct content reads and administrator role switches are denied. All application tables retain RLS, and the Data API rejects the private recall schema. The security advisor reported no findings. The runtime receives only its scoped database credential; MCP has only the API URL.

Validation: 29 unit tests, 27 E2E tests, formatting, TypeScript and builds passed locally. Native Vercel function checks passed for API and MCP, and the Vercel web build passed. GitHub CI run 34483022175 passed. Production checks used two disposable users created through the supported Auth admin API. Verified browser login and card creation, authenticated MCP discovery of all 9 tools, MCP reading the browser-created card, idempotent Unicode import, hostile cross-tenant access rejection, concurrent review idempotency, stale-version rejection and immediate token revocation. A mobile browser review completed successfully. Mobile (390 px), tablet (768 px) and desktop (1440 px) views had no horizontal overflow. No 500 responses appeared in the inspected runtime logs for these checks.

The user switched browser work from Edge to the internal Codex browser. The production Auth Site URL and exact root redirects were saved and verified after reloading the dashboard. Email confirmation remains enabled. Custom SMTP is currently disabled, so public signup delivery outside the Supabase organization remains pending provider configuration. Owner identity is also pending before transferring the 64 personal starter cards; production QA does not use the owner's study history.

The next small iteration corrects the singular completion message observed in production. Its existing web/MCP journey passed locally on desktop, tablet and mobile. Further discovery: distinguish an unavailable upstream API from an invalid MCP token, improve email-delivery error copy, and add the missing foreign-key indexes reported as informational by the database advisor when warranted.

## 2026-09-10 — distinguish authentication failures from service outages

The singular completion fix was deployed as `264a40ee44896cde1adee3d39133bcf2ffa17c2f`; its production browser check showed "You reviewed 1 card in this session." GitHub CI run 34484802955 passed. Browser edits were visible through MCP, MCP updates were readable through the API, and an owned API deletion removed its test card.

A later MCP check returned an invalid-token response, although the same unexpired JWT was immediately accepted by Supabase and the API; a retry succeeded. This does not establish the cause of that transient response. Code inspection showed that every upstream preflight failure was mapped to 401, hiding availability failures. A local HTTP fixture reproduces this defect with a gateway error page.

The API now maps retryable Auth failures, throttling and server errors to 503 while preserving 401 for invalid credentials. The shared client turns malformed upstream response bodies into a typed 502 error instead of leaking a JSON parser error. MCP distinguishes invalid tokens from unavailable upstream services. Named fake providers and an actual local HTTP gateway fixture cover these paths. No authentication requirement or tenant policy was relaxed.

Validation: 40 unit tests, 28 E2E tests, formatting, TypeScript and all builds passed with rebuilt Docker containers. The new gateway-outage regression passed alongside the existing authenticated web/MCP journeys on all three device sizes.
