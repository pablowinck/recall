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

## 2026-09-10 — remove deprecated GitHub Actions runtimes

The successful production CI run reported that checkout, Node setup and pnpm setup still targeted the deprecated Node 20 action runtime. Verified the current upstream releases and their `action.yml` files, then updated checkout to v7.0.1, setup-node to v7.0.0 and pnpm/action-setup to v6.1.0. All three actions use Node 24 and are pinned to their release commit SHAs for reproducible execution.

The workflow keeps the explicit pnpm 10.26.0 installation, Node 24 project runtime, frozen lockfile, pnpm cache and existing full functional verification command. The hosted CI run is the integration check for the new action versions. Production verification uses a disposable QA identity; no personal starter cards receive synthetic reviews.

Upstream references: [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0), [pnpm/action-setup v6.1.0](https://github.com/pnpm/action-setup/releases/tag/v6.1.0).

Local verification passed with 40 unit tests and 28 E2E tests, plus formatting, TypeScript and production builds.

## 2026-09-10 — index tenant connection listings

The production advisor reported three informational foreign-key index findings. A read-only audit confirmed that `access_tokens.tenant_id` lacked an index. The card/deck lookup already uses `cards_deck_idx` with both equality conditions despite the reversed column order; the review/card lookup has existing card-prefix and tenant-prefix paths. Those indexes do not need duplicates merely to clear the advisor.

Migration `20260910152546` adds `access_tokens_tenant_created_idx` on `(tenant_id, created_at desc)`, supporting the RLS tenant predicate, newest-first connection listing and tenant cleanup. Application authorization and production planner settings are unchanged.

A local fixture with 12 owner tokens and 20,000 neighbor tokens reproduced a sequential scan discarding 20,001 rows. One unforced before/after measurement changed from sequential scan plus sort (426 shared buffers) to an index scan (3 shared buffers). These are synthetic local observations, not production latency claims; production tables were empty during the audit. PostgreSQL can still choose sequential scans based on table size and statistics.

The regression exercises the indexed RLS path with sequential scans discouraged only inside its local test transaction, so shared local statistics cannot make the check flaky. It verifies the actual query plan and the owner's API result, without timing thresholds or production planner changes. The fixture identities and their token rows are cleaned up after the test.

Local verification passed: 40 unit tests, 29 E2E tests, formatting, TypeScript and all application builds.

## 2026-09-10 — inline deck creation and editor keyboard flow, validated locally

Discovery: authoring a card in `CardEditor` required selecting from pre-existing decks. If a card belonged to a new deck, the user had to cancel the dialog, discarding unpersisted prompt/answer fields, navigate away to create the deck, and restart card authoring. In addition, multi-line textareas lacked a keyboard submit shortcut.

Changes: added seamless inline deck creation to `CardEditorFields` with auto-selection and zero dialog-stacking or draft loss. The front question field now auto-focuses on open, and `Cmd+Enter` / `Ctrl+Enter` triggers form submission directly from textareas. Rebuilt the web Docker container and added an E2E regression verifying inline deck creation retains draft text and attaches the created card to the new deck.

Validation: 40 unit tests, 32 E2E tests (including the new desktop, tablet, and mobile journeys), TypeScript checks, Prettier formatting, and all production builds passed locally.

## 2026-09-10 — tactile Apple keycaps, study progress momentum, and library deck context, validated locally

Discovery: the study Reveal action displayed an Enter icon alongside a Space helper, creating conflicting affordances; rating keycaps lacked tactile visual depth for rapid review recognition; study progress was a static 2px hairline; and library cards in "All decks" omitted deck names, requiring cards to be opened to determine topic membership.

Changes: unified study reveal with chiclet `<kbd>` hints for Space and Enter; upgraded progress bar height to 4px with smooth width transitions; styled Apple HIG tactile keycaps with subtle physical borders; added deck badges to library cards; and added a single-click "Clear filters" action to empty library states.

Validation: 40 unit tests, 32 E2E tests across all three device sizes, TypeScript checks, and production builds passed locally on rebuilt containers.

## 2026-09-10 — Apple HIG dark mode surface depth, vibrant sidebar blur, and mobile density, validated locally

Discovery: dark mode surfaces (`#0e0e11` and `#18181c`) lacked clear elevation contrast on OLED and standard screens; desktop sidebar lacked Apple's `saturate(180%)` frosted vibrancy; and mobile stats grid stacked vertically on small viewports, pushing deck navigation below the fold.

Changes: tuned dark mode surface hierarchy to Apple HIG palette (`#09090b` canvas, `#18181b` card surface, `#27272a` elevated elements); added `saturate(180%)` and `overflow-y: auto` to desktop sidebar; and optimized the mobile stats grid into a compact, high-density row so study actions and decks remain visible above the fold on small screens.

Validation: 40 unit tests, 32 E2E tests across desktop, tablet, and mobile, TypeScript checks, Prettier formatting, and containerized Next.js builds passed locally.

## 2026-09-10 — UX loop 1: feature-first structure and readable intervals

Started a continuous UX/UI refinement loop. A local journey script signs in a disposable account with multi-language decks and captures 75 screens (desktop, tablet, mobile; light and dark; dialogs, study, errors). UX/UI, senior frontend and Nielsen-heuristics reviewers turned those screens and the code into one prioritized backlog.

API routes now live beside each feature (`<feature>-routes.ts`), with identity verification and the RLS transaction wrapper in `http/tenant-route.ts`. Web styles moved into their feature folders plus shared `styles/` tokens and base rules; each app has a short README mapping where to change behavior. Interval previews now read "1 hr", "8 days", "1.5 mo" and "1 yr".

Validation: 40 unit tests and 32 E2E tests passed on rebuilt web and API containers, with formatting, TypeScript and builds. The journey passed on all three sizes with no horizontal overflow or axe violations.

## 2026-09-10 — UX loop 2: flash-free appearance, reachable tokens and a calmer palette

Discovery: dark-mode users saw a light first paint; product tokens did not reach Radix portals, so the card editor's inline deck box lost its surface and links turned black; the global focus rule removed every visible ring inside dialogs; three different blues were mixed.

A head script now applies the saved choice, or the system appearance when there is none, before the first paint, and Radix inherits it from `<html class="dark">`. Product tokens moved to `:root` with semantic names (ink, surface, separator, fill); accent aliases live on `.radix-themes`; custom controls draw an outline focus ring. The theme uses Radix indigo with warm sand neutrals, rating tints come from Radix alpha scales, and the viewport declares theme colors and safe-area coverage.

Validation: new E2E regressions cover saved/system appearance before hydration and a visible focus ring inside the card editor. axe caught the "Hard" label at 4.43:1 and the dark solid-button hover at 4.28:1; both now pass (amber label, darker indigo hover). 40 unit tests and 38 E2E tests passed with formatting, TypeScript and builds; the three-size journey reported no overflow or axe violations.

## 2026-09-10 — UX loop 3: brand mark, platform type and app icons

The brand was a stock layers icon in a black tile with a lowercase "recall." wordmark, and the mark was reused as UI iconography. Non-Apple platforms fell back to Segoe UI, Roboto or DejaVu, so the interface looked different everywhere, and there was no favicon or home-screen icon.

The new mark is a card whose corner folds to reveal its back, drawn as an inline SVG with flat fills that scale with the "Recall" wordmark. `app/icon.svg` and a generated `apple-icon` reuse the same paths. Apple devices keep SF Pro; other platforms load Inter through `next/font`. Body tracking is lighter, Inter-only glyph alternates are gone, and keycaps use the interface font with tabular digits.

Validation: 40 unit tests and 41 E2E tests passed, including a new check that the SVG favicon and PNG home-screen icon are served. Formatting, TypeScript and builds passed; the three-size journey reported no overflow or axe violations.

## 2026-09-10 — UX loop 4: quieter copy, view titles and settled accessibility checks

Reviewers counted eleven ALL-CAPS eyebrow labels, titles ending in periods, and slogans on every screen competing with real status ("A good day to remember.", "One step forward", a permanent sidebar note).

Views are now titled by name (Today, Library, Connections), and Today shows the date. The invitation reads "26 cards to review" with a "14 reviews · 12 new" split from the existing `fresh` count; deck badges read "14 due", "Up to date" or "No cards yet". Remaining labels use sentence case, duplicate taglines and the sidebar note are gone, the profile shows the email with a tooltip, and verbs are consistent ("Create your first card", "Back to Today").

CI run 34521774379 for the previous release failed only on tablet: axe measured the card editor's primary button mid-fade at 4.41:1. Accessibility checks now wait for finite animations before analyzing. Production served the previous release's tokens and icons, confirmed by fetching its CSS and `icon.svg`.

Validation: 43 unit tests (including the new session summary) and 41 E2E tests with updated accessible names passed, along with formatting, TypeScript and builds; the three-size journey reported no overflow or axe violations.

## 2026-09-10 — UX loop 5: study keyboard that respects focus

Reviewers reproduced that Enter on a focused "Leave session" or sidebar item revealed the answer instead of activating the control, digits failed on layouts where they need Shift, focus fell to `<body>` after every reveal and rating, the question jumped about 65 px when the answer appeared, and the page's only h1 was untrusted card text.

Study shortcuts now come from a pure `readStudyCommand` function: Space and Enter reveal only when no button, link or field has focus; 1–4 read physical digit and numpad codes; repeats and modifier shortcuts are ignored. One listener stays mounted and always reads the latest session. Focus moves to the card and then to its answer when the control that was used disappears, without taking focus from a control the person chose. The card is top-aligned, and a visually hidden "Review session" h1 introduces the card front, now an h2.

Validation: new unit tests cover focused controls, typing targets, physical and numpad digits, repeats and modifiers; a new E2E journey reveals with Space, rates with 3, checks focus after each step, and leaves with Enter on the focused button on all three sizes.

## 2026-09-10 — UX loop 6: card drafts survive dismissal

Reviewers reproduced three ways to lose a typed card: Escape, a click outside the dialog, and Escape inside the inline "New deck name" field, which Radix handled first and closed the whole editor. Focus also dropped to `<body>` after closing, every new card defaulted to the first deck, and a plain Enter in Tags saved and closed the editor by surprise.

The editor now asks before discarding typed text ("Discard this card?" or "Discard changes?", with "Keep editing" focused), and Escape closes the inline deck form before anything else. A pure `hasDraftChanges` decides what is worth confirming: choosing a deck for an empty new card is not. Closing returns focus to the control that opened the editor, new cards reuse the deck of the last card created, and Tags saves only with Cmd/Ctrl+Enter. The editor hook is split into card, inline-deck and dismissal responsibilities.

Validation: unit tests cover new and edited drafts; a new E2E journey keeps the draft on Escape, closes only the inline deck field, confirms Cancel, and checks that focus returns to "New card" on all three sizes.

## 2026-09-10 — UX loop 7: ratings within reach on long cards

Probes placed the rating grid about 170 px below the fold at 1440×900 and about 580 px below it on an iPhone-sized viewport when an answer was long. Each rating meant scrolling, and the next card inherited the scroll position. Phones also stacked the four ratings in a 2×2 grid that pushed "Good" and "Easy" to the bottom edge.

The reveal and rating areas now stick to the bottom of the viewport over a soft canvas fade, including safe-area padding. Phones show all four ratings in one compact row, and each new card starts scrolled to its question.

Validation: a new E2E journey reveals a 40-line answer and checks that "Again" and "Easy" are in the viewport on desktop, tablet and mobile.

## 2026-09-10 — UX loop 8: sessions continue past each batch

Every session stopped at the API's 20-card batch and said "Nicely done" while more cards were due. Cards rated Again (1 min), or new cards rated Good (10 min), silently left the session until the next visit, and "Check for more reviews" flashed a full-page loader before returning the same screen.

When the last card of a batch is rated, the session now loads the next due batch in place ("Checking for more cards…"). Cards that FSRS brings back within the hour are remembered: completion reads, for example, "You reviewed 12 cards in this session. 3 cards come back in about 10 min.", and the session resumes on its own when they are due, giving up a minute after a card fails to return. "Check for more reviews" checks in place and answers "Nothing is due yet." in a live region. Loading states name what is loading.

Validation: unit tests with a named fake gateway cover continuing into the next batch, remembering returning cards, pruning queued or stale entries, ignoring cards beyond the hour, and discarding refills for disposed sessions. 56 unit tests and 50 E2E tests passed; the three-size journey reported no overflow or axe violations.

## 2026-09-10 — UX loop 9: connections for any MCP assistant

The owner asked for Connections to be tool-agnostic and easy for ChatGPT, Codex, Claude and similar assistants. The view was written for Codex: every token was named "Codex", setup help was one Codex TOML snippet, and a second click on "Create personal connection" silently replaced a token that had not been saved.

People now pick their assistant (Claude Code, Codex, Cursor, VS Code, Claude Desktop, Gemini CLI or another MCP client) before creating a connection. The one-time panel shows that assistant's setup already filled in with the endpoint and new token, with "Copy setup", "Copy token" and "I saved it"; tokens are named after the assistant; creation is disabled while a token is on screen; connection dates read "Created Sep 10, 2026 · Expires Dec 9, 2026". `docs/mcp.md` and the README cover every client and the local stdio launcher.

Research note: ChatGPT developer-mode connectors accept only OAuth or no authentication, and claude.ai custom connectors expose OAuth (static headers are an organization-admin beta). Supabase Auth offers an OAuth 2.1 server with dynamic client registration for MCP; adopting it is proposed to the owner and not implemented.

Validation: unit tests check that every setup targets the endpoint, embeds the token except where VS Code prompts for it, and produces valid JSON; the E2E connection journey picks Cursor, finds the bearer token in the setup, verifies the MCP tools with that token, and revokes "Cursor".

## 2026-09-10 — UX loop 10: rating failures recover in place and study shows its context

When a rating failed to save, "Try again" reloaded the whole queue: it showed the full-page loader, hid the revealed answer, dropped the pending attempt and pushed the rating grid down with a banner. Conflicts told people to "refresh the session" behind a button labeled "Try again". The study screen also never named the deck and counted progress only against the loaded batch ("0 of 20" while Today said 26).

A failed rating now keeps the answer on screen and shows a notice inside the rating area: "Retry" resends the same rating with the same request id, and a version conflict offers "Reload card" instead. The context row names the deck, and progress counts against Today's due count for the chosen deck or the whole library ("3 of 26"), growing if returning cards add more.

Validation: unit tests with a named unreliable gateway cover the retained answer, the reused request id and the conflict case; a new E2E journey aborts one review request, sees the notice with the answer still visible, retries, and reaches "Nicely done" with one saved review on desktop, tablet and mobile.

## 2026-09-10 — UX loop 11: touch targets, long deck names and connection load errors

Probes measured 30×30 px header icon buttons and 32 px buttons, selects and dialog actions on phones, with 14 px fields that make iOS zoom on focus. A 75-character deck selected in the Library filter widened an iPhone layout to 630 px because Radix select triggers never shrink. A failed connection list load also claimed "You have not created a connection yet." without a retry, and the sidebar still used a cable icon while the page used a link.

On coarse pointers, Radix size-2 buttons, icon buttons, selects and text fields are 44 px tall, fields use 16 px text, and text buttons get 44 px targets. Library and editor deck selects shrink with ellipsis. The connection list separates load failures, showing the error with "Try again" instead of the empty message, and navigation uses the same link icon as the page.

Validation: new E2E checks confirm 44 px controls on touch devices and no horizontal overflow after filtering by an 80-character deck name; the connection journey still reaches the empty state after revoking.

## 2026-09-10 — UX loop 12: a calm page when the workspace cannot load

A failed workspace load rendered only a red banner at the top of an otherwise empty page, with a lavender "Try again" on pink and the message "Unable to reach the server". Reviewers read it as a broken page rather than a recoverable state.

When the workspace cannot load at all, the view now shows a centered state: a cloud icon, "Couldn’t load Recall", the reason, and a solid "Try again". Inline notices for views that still work (a failed refresh, a rating, a connection list) use a neutral surface with only the icon in red and a gray "Try again". Network failures read "Can’t reach Recall. Check your connection and try again."

The previous release's CI run 34527289889 failed only on tablet: the new touch-target check measured a 44 px control as 43.99999 px. A runtime probe confirmed 44 px buttons (13 px ghost padding, 44 px base height), and the check now rounds the measured height. Production served that release's CSS.

Validation: a new E2E journey aborts the workspace request after sign-in, sees the page-level state and message, retries after the network returns, and lands on Today on desktop, tablet and mobile.

## 2026-09-10 — UX loop 13: visible save shortcut and a guarded one-time token

The card editor already saved with Cmd/Ctrl+Enter from its text fields, but nothing said so, so batch authoring still meant reaching for the mouse. On Connections, "I saved it" permanently hid a token that might never have been copied.

The editor shows "⌘ ↵ to save" (Ctrl on other platforms) next to its actions on pointer devices; touch screens hide it. Keycap styles moved to shared components because study and the editor both use them. Closing the token panel without copying now asks "Close without copying?" with "Keep token"; copying with the buttons or by hand (select and copy) skips the question.

Validation: unit tests cover the platform modifier label; the E2E connection journey confirms closing without copying on desktop, tablet and mobile.

The local mobile journey stalled on the card editor: a probe placed its actions at y=742 in a 664 px viewport, below the fold inside the dialog's scroll area (wave 2 finding N-12, scheduled next). Product E2E tests, including card deletion on mobile, passed.

## 2026-09-10 — UX loop 14: surfaces that float, a study bar on the bottom edge, and a reachable editor

A second review panel (UX/UI, senior frontend, Nielsen) examined the rebuilt product and produced a new backlog. The design review found that the product tokens `--shadow-1` and `--shadow-2`, introduced in loop 2, share names with tokens Radix defines on `.radix-themes`. Radix's inset shadows therefore won inside the app, so cards, rating buttons and the completion mark looked pressed in, with a border stacked on top. The sticky reveal/rating bar used a 72 % canvas gradient that greyed out answer text, and its "How did you do?" prompt sat over the card. On phones, the card editor nested its own scroll area inside Radix's scrolling overlay, so its actions stayed clipped below the fold; Playwright reported the dialog's scroll padding intercepting clicks on "Delete card".

Surfaces now use `--elev-1` and `--elev-2`, which carry their own hairline in both appearances, and the stacked borders are gone (buttons reset their browser border explicitly). Dialog scrims are lighter. The study bar is a blurred toolbar material with a separator. On phones it rests on the bottom edge for short and long cards alike, so the rating buttons never move; tablets keep it under the card, so the eye does not travel from the answer to the bottom of a tall screen. Keyboard hints follow the input device and are also hidden at phone widths, where keycaps would cover the rating labels on phones that report hover. The prompt remains available to screen readers. On phones the card editor is a full-height sheet with one scroll area and its actions pinned to the bottom. The page-level error icon is neutral instead of red.

The UX tour first showed desktop keycaps on phones even though probes found them hidden. Recording the media state on every screenshot showed that a Chromium full-page screenshot turns off touch emulation for the rest of the page, so every capture after the first long page lost `(pointer: coarse)`. The tour now re-enables touch emulation after full-page captures, and `AGENTS.md` records the gotcha together with the custom-property names Radix owns.

Validation: format, typecheck, 64 unit tests and build pass. `tests/e2e/touch-layout.spec.ts` gathers the touch journeys: 44 px controls (moved from `product.spec.ts`, which drops below 500 lines), rating buttons that end at the same bottom-edge position for a short card and a 40-line card with keycaps hidden, and editor actions fully inside a phone viewport with the shortcut hint hidden. All 63 E2E journeys pass on desktop, tablet and mobile, and the UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 15: honest session ends, safe token rotation and a contained editor select

The second review panel reproduced three trust problems with probes on disposable accounts. When the next batch failed to load after the last card, the session still said "Nicely done", and "Check for more reviews" answered "Nothing is due yet." while offline; the automatic resume never retried. Revoking an older connection wiped a newly created token before it was copied, leaving a valid secret no one could see. On a 390 px phone, a long deck name made the card editor 619 px wide and pushed "Create card" off-screen, because Radix's dialog scroll padding grows to a select's unwrapped text.

Refills now report whether cards loaded, none were due, or the request failed. A failed refill at the end of a batch keeps the study screen with "Can’t reach Recall" and "Try again" instead of a completion message. "Check for more reviews" says when it could not check, and returning cards are retried every 30 seconds and again when the tab or network comes back. Completion groups returning cards by time ("1 card comes back in about 1 min, 2 more in about 10 min") and refreshes the estimate while the screen stays open. A check that removes nothing keeps the same list, so the resume timer no longer re-arms on every check. A reload resets the saving state. The one-time token remembers its connection id, so only revoking that connection hides it. The editor's deck select is contained to the dialog width.

For contributors, browser journeys moved out of the 500-line `product.spec.ts` into feature spec files (`cards`, `study`, `connections` and `touch-layout`, with `product` keeping the cross-feature journey). `playwright.config.ts` lists them once for every device project, and the web README says where a new journey goes. `AGENTS.md` notes that Radix dialog titles are `h1` and that a browser probe is only trustworthy once the served chunk contains the change.

Validation: format, typecheck, 70 unit tests and build pass; the new unit tests cover refill outcomes, silent checks, unchanged returning lists, grouped copy and token rotation. All 69 E2E journeys pass on desktop, tablet and mobile, including new ones that abort the study request at the end of a batch and recover with "Try again", revoke an older connection while a new token stays visible, and open the editor with an 80-character deck without pushing "Create card" off-screen. The UX tour on three devices reports no overflow or axe violations; its only console error is the aborted workspace request of the error-state step.

## 2026-09-10 — UX loop 16: a connection panel that fits a phone and a deck that follows the filter

On a 390 px phone the one-time connection panel kept its three actions in one row, so "I saved it" hung outside the card, and the setup command wrapped inside the token, which breaks a copy made by hand. The token itself was shown in a proportional font, where `0` and `O` look alike. In the library, "New card" opened in the deck of the previous card instead of the deck the list was filtered by, so a card written while browsing one deck landed in another.

Dialog action rows now wrap below 480 px, and the connection panel stacks its actions at that width with the primary copy on top, each full width. The setup command scrolls sideways instead of breaking a token across lines, and both the command and the token field use a shared `--font-mono` stack. A new editor starts in the deck the library is filtered by, then the deck of the previous new card, then the first deck; `initial-deck.ts` states that order once, and the workspace carries the filtered deck to the editor.

Validation: format, typecheck, 74 unit tests and build pass, including the deck preference order against a fake deck memory. All 73 E2E journeys pass on desktop, tablet and mobile, among them a phone journey that measures every panel action inside the panel and a library journey that opens the editor from a filtered list. The UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 17: reading sizes for questions and a comfortable measure

The study card treated every question as a headline: display size and tight tracking, whatever its length. A paragraph-long prompt then filled the card at 33 px and pushed the answer off the screen, and the answer itself ran to about 78 characters a line on a 1440 px display, wider than the 60–75 that keeps the eye on track for hours.

Questions now step down by length: a few words keep display size, a sentence drops a step, and a paragraph reads at body size with looser tracking and `text-wrap: pretty`. `card-typography.ts` holds that decision as one pure function, so the rule is stated once. Question and answer both stop at 66 characters a line, the answer scale is fluid between phone and desktop instead of fixed, and prose wraps with `break-word` instead of `anywhere`, which used to split words for no reason.

Validation: format, typecheck, 77 unit tests and build pass, including the three prompt lengths. All 76 E2E journeys pass on desktop, tablet and mobile, among them one that measures a paragraph question rendering smaller than a short one on the same screen. The UX tour reports no overflow or axe violations, and probe captures at 1440 px and 390 px show a short, a sentence-long and a paragraph-long card.

## 2026-09-10 — UX loop 18: revealing brings the answer to the reader, and Today stops going stale

Reviewing on a phone showed that revealing a long card looked like nothing had happened: the question filled the screen and the answer started below the fold, behind the rating bar. Separately, a Today left open in a tab kept an old date and an old due count until someone reloaded, because the workspace was read once per visit.

Revealing now scrolls the answer into view when it starts below two thirds of the screen, keeping the tail of the question above it, and it honours `prefers-reduced-motion`. `reveal-scroll.ts` decides that offset as a pure function. Today refreshes when the tab comes back, when the network returns and once a minute while it stays visible, which also keeps the date in its heading current.

Validation: format, typecheck, 81 unit tests and build pass, including four cases of the scroll decision. All 82 E2E journeys pass on desktop, tablet and mobile, among them one that reveals a twenty-sentence question and finds the answer in the viewport, and one where a card created elsewhere shows up on Today when the tab returns. A probe at 390 px captures the answer on screen right after the reveal.

## 2026-09-10 — UX loop 19: hover that belongs to a mouse, and a rating that shows what you chose

On a phone, tapping a deck row or a library card left it in its hover state until something else was touched, because the hover styles applied to any pointer. Rating a card dimmed all four buttons at once, so nothing said which one had been chosen while the review saved. Three components still animated with `transition: all`, which animates properties nobody asked to move.

Hover styles now live behind `@media (hover: hover)`. Rating keeps the chosen button lit and slightly pressed while the others fade back after 300 ms; the study snapshot carries `savingRating` so the view can tell. Durations and easing come from `--ease-out` and the `--motion-*` tokens, and the three `transition: all` rules name the properties they animate.

Validation: format, typecheck, 81 unit tests and build pass. All 85 E2E journeys pass on desktop, tablet and mobile, including one that delays the review request and finds the chosen rating still lit while the others are disabled. The UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 20: dark surfaces that separate, and a session without chrome

In dark mode the canvas and the card surface sat 1.07:1 apart, so Today read as one flat sheet: stat cards, the deck list and the study card had no edge of their own, and the neutral deck pill used the canvas colour, which disappeared on them. During a session the sidebar stayed on desktop and tablet, competing with the card the reader is meant to be looking at.

Dark tokens now step: canvas `#0a0a09`, surface `#212120`, raised `#2a2a28`, with slightly stronger fills and separators, and neutral pills use `--fill-2`. The `--ink-3` token, unused since the rebrand, is gone. A session hides the app chrome at every size, so the card owns the window and "Leave session" is the way back.

Validation: format, typecheck, 81 unit tests and build pass. All 88 E2E journeys pass on desktop, tablet and mobile, among them one that finds the navigation hidden during a session and back when it ends. The UX tour reports no overflow or axe violations on three devices, and its dark captures show cards standing off the canvas.
