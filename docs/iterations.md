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

## 2026-09-10 — UX loop 21: a draft the editor never loses, and a deck error that says what happened

Cards written through MCP or an import can carry CRLF line endings, but a textarea always reports LF, so opening such a card and pressing Cancel asked to discard changes nobody had made, and saving rewrote the stored text. Tag spacing behaved the same way. A right-click anywhere outside the editor counted as a dismissal, and a reload or a closed tab took an unsaved draft with it. A duplicate deck name answered "This record already exists.", which reads like a database rather than a name someone already used.

The draft comparison now normalizes line endings and tag spacing, so only real edits count. Dismissal ignores non-primary clicks, and the browser confirms a reload or a closed tab while the editor holds unsaved text. A duplicate name answers "You already have a deck with that name." through `deck-errors.ts`, for the deck dialog and the inline creator alike, and the inline field stops at the 80 characters the contract allows.

Validation: format, typecheck, 85 unit tests and build pass, including CRLF and tag-spacing comparisons and the duplicate-name mapping. All 91 E2E journeys pass on desktop, tablet and mobile, among them one that closes a tab holding a typed draft and finds the browser asking first. The UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 22: a library that remembers where you were

The library kept its search, deck filter and page inside the view, so a trip to Today and back cleared everything and dropped the reader on page one of every card. Filters could only be cleared from the empty state, after a search had already failed. A deck row with nothing due opened the whole library instead of that deck's cards.

The query now lives in the workspace state, next to the current view, so leaving and returning keeps the search text, the deck and the page. A "Clear filters" button sits with the filters whenever one is active, and clearing is a single update instead of two that could race. A deck row with nothing due opens the library already filtered to that deck.

Validation: format, typecheck, 85 unit tests and build pass. All 97 E2E journeys pass on desktop, tablet and mobile, among them one that filters, leaves for Today, returns to the same filter and clears it, and one that opens an empty deck straight into a filtered library. The UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 23: a library card that names itself

Every library card was a single button wrapping a heading, a paragraph, tags and a hint. A button holds phrasing content, so that markup was invalid, and a screen reader announced the whole card as one name — status, deck, question, answer and tags, several hundred characters — with no heading to navigate by.

A card is now an `<article>` whose question is a heading, and that heading holds one button which covers the card through a stretched pseudo-element. Its accessible name is the question alone, collapsed to a single line and capped at 80 characters by `summarizeFront`. The press and the focus ring belong to the whole card, and the "Edit card" hint is decorative.

Validation: format, typecheck, 88 unit tests and build pass, including three cases of the question summary. All 100 E2E journeys pass on desktop, tablet and mobile, among them one that opens a card with a long question and a long answer and finds its name within 80 characters. The UX tour reports no overflow or axe violations, and its captures show the library unchanged.

## 2026-09-10 — UX loop 24: signing out asks first, and errors speak plainly

On a phone the sign-out button sits beside the theme toggle, and a mis-tap ended the session with nothing to undo it. Sign-up and sign-in showed whatever the auth service said — "Invalid login credentials", "Password should be at least 6 characters", "For security purposes…" — and the one rule that matters, ten characters, lived only in a placeholder that disappeared as soon as someone typed.

Sign out now asks, with "Stay signed in" as the way out; the shared confirm component learned to carry a tooltip, because Radix passes tooltip props to its content rather than to the trigger. Auth failures pass through `describeAuthFailure`, which turns the service's wording into words a person can act on, and the password rule sits under the label as a hint that stays while typing.

Validation: format, typecheck, 92 unit tests and build pass, including four failure mappings. All 103 E2E journeys pass on desktop, tablet and mobile, among them one that starts a sign-out and calls it off. The UX tour reports no overflow or axe violations, and its sign-up captures show the rule under the label.

## 2026-09-10 — UX loop 25: ratings that say what they mean

The four ratings showed a word and an interval — "Good, 10 min" — but never what the word claims about the recall, and nothing told assistive technology that the keys 1 to 4 press them.

Each rating now carries `aria-keyshortcuts` and an accessible name that spells out the claim and the next interval ("Good, You recalled it. Next in 10 min"), with the same meaning in a tooltip for pointer users. "Reveal answer" declares Space and Enter the same way. `rating-meanings.ts` keeps the four claims in one place.

Validation: format, typecheck, 95 unit tests and build pass. All 106 E2E journeys pass on desktop, tablet and mobile, including one that reads the shortcut and the meaning off the Good rating. The UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 26: card text with its own emphasis

Cards written by an assistant arrive in Markdown, and Recall printed the markers: "O que significa **offset**?" kept its asterisks, lists kept their dashes, code kept its backticks. The owner asked for the formatting to render.

Card text is now parsed into a small tree of paragraphs, lists and inline emphasis — bold, italic and code — and rendered as elements. Nothing from a card is ever treated as markup: there is no HTML path, no links and no images, so an untrusted card still cannot reach the page as anything but text. The library preview and a card's accessible name drop the markers too, and the editor's Back hint names the four things that work while storing exactly what was typed.

Validation: format, typecheck, 102 unit tests and build pass, including unmatched markers left literal and markers inside code left alone. All 109 E2E journeys pass on desktop, tablet and mobile, among them one that studies a card with bold, a list and code and finds no markers on screen. Unit tests now resolve the web `@/` alias, so a shared module can move without its imports being rewritten.

## 2026-09-10 — UX loop 27: deleting a deck, with its cards accounted for

Recall could create decks but never remove one, so a deck made by mistake stayed in Today, in the filter and in the editor forever. The owner asked for deletion and chose what should happen to the cards.

`DELETE /v1/decks/:id` now states what happens to them — `?cards=delete`, or `?cards=move&target=<deck>` — and runs inside the caller's transaction under RLS, so a deck that is not yours is simply not found. A tenant always keeps one deck, so the last one refuses to go. In the library, the deck being filtered carries a delete control: an empty deck goes at once, and a deck holding cards asks first, offering to move them to another deck or delete them along with it.

Validation: format, typecheck, 104 unit tests and build pass. All 118 E2E journeys pass on desktop, tablet and mobile: an empty deck deleted from the filter, a deck whose cards move elsewhere, a deck whose cards go with it, and a stranger's attempt on someone else's deck answered 404 while that deck stays. The UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 28: help one tap away

Nothing in the app pointed to a person. The owner asked for a question mark beside the theme and sign-out controls that opens WhatsApp with the first message already written.

A help control now sits in the sidebar footer and in the phone header, on every screen: an anchor styled as an icon button that opens `wa.me` in a new tab with `noopener`, carrying a message that says the reader is using Recall and needs help. `support-link.ts` builds that URL in one place.

Validation: format, typecheck, 106 unit tests and build pass. All 121 E2E journeys pass on desktop, tablet and mobile, including one that reads the link target, its `rel` and the written message. The UX tour reports no overflow or axe violations on three devices.

## 2026-09-10 — UX loop 29: a public landing page, and a workspace with its own addresses

The owner asked for a landing page at `/`, with the signed-in area moved to its own path and the browser's Back button kept inside the app. Until now the whole product was one address: every view — Today, Library, Connections, a study session — lived at `/`, so Back left Recall entirely, a reload always returned to Today, and there was nothing public to show someone who had never signed in.

The workspace now lives under `/app`, and each view has an address: `/app`, `/app/library`, `/app/connections` and `/app/study`. Moving between views pushes a history entry and Back and Forward restore the view without leaving the app, a reload opens the view in the address, and `workspace-url.ts` maps views to paths in one place. `/app?new=1` opens straight on account creation.

`/` is a first landing page, rendered statically without Radix Themes so it ships almost no JavaScript. Following the owner's choices it is free to use, its call to action creates an account, and its hero leads with the assistant: "Your AI writes the cards. Recall makes them stick." It explains the three-step loop, the qualities of long study sessions and how cards stay private, and it carries `SoftwareApplication` structured data, canonical and Open Graph metadata, `robots.txt` that keeps `/app` out of search and a sitemap. Product tokens gained `--font-sans`, `--brand`, `--brand-soft` and `--brand-text`, so pages outside Radix share the same type and colour; the dark `theme-color` now matches the dark canvas.

Validation: format, typecheck, 109 unit tests and build pass, including view-to-path mapping. All 130 E2E journeys pass on desktop, tablet and mobile, among them the landing page's call to action opening account creation with no accessibility violations, `robots.txt` and the sitemap, and a journey that moves through three views, goes Back twice, reloads, and opens `/app/library` directly. The UX tour reports no overflow or axe violations, and captures of the landing page at 1440 px and 390 px in both appearances were reviewed.

## 2026-09-10 — UX loop 30: every view names itself

Per-view addresses gave Back something to do, but every entry in the browser's history menu still read "Recall", and moving from a scrolled Today to Library kept the old scroll position, so the new view opened halfway down the page.

Each view now sets the document title — "Today · Recall", "Library · Recall", "Connections · Recall", "Review session · Recall" — right after its history entry is pushed, so the title names the new entry instead of renaming the one being left. Moving to another view starts it at the top. `workspace-url.ts` keeps the titles beside the paths.

Validation: format, typecheck, the unit suite and build pass, including the view titles. The journey that moves through three views, goes Back, reloads and opens `/app/library` directly now also reads the title of each view; all 144 browser and API journeys pass on desktop, tablet and mobile, and the UX tour reports no overflow or axe violations.

## 2026-09-10 — UX loop 31: assistants learn which formatting cards render

The app renders bold, italic, code and lists in card text, but the MCP tool that creates cards still described them as "plain-text", so an assistant writing cards had every reason to leave the emphasis out.

`create_flashcard` and `import_flashcards` now name the formatting Recall renders — `**bold**`, `*italic*`, `` `code` `` and "- " lists — and say that other Markdown shows as typed.

Validation: format, typecheck, the unit suite and build pass, and the MCP journeys pass unchanged.

## 2026-09-10 — UX loop 32: a landing page that tells the truth and names itself

Three reviewers examined the first landing page: a conversion copywriter, a product designer measuring performance and accessibility, and an SEO and GEO specialist who ran the Is Agentic readiness scan (71/100, with the brand mistaken for Vercel). The copy overpromised: "Claude" read as claude.ai, which cannot connect; "one command" was only true for Claude Code; "Your cards stay yours" implied an export and account deletion that do not exist. A visitor could not learn what MCP is, whether ChatGPT works or what Recall costs. The title repeated the brand through the layout template, the bare `/app` robots rule also blocked `/apple-icon`, and there was no `llms.txt`, no preview image and no 404 page. "Recall" is shared by other products, including another flashcard app with an MCP server. The owner also asked for the GitHub star count and a way to contribute.

The hero now says what Recall is before what it does, the three steps say exactly what connecting takes for each assistant, and the qualities drop jargon. Eleven questions, each naming Recall, answer what a newcomer asks, and the same list produces the `FAQPage` data. The navigation links to GitHub with the star count (an invitation to star while there is none, refreshed hourly), a "Built in the open" section links the repository and `CONTRIBUTING.md`, and the footer names the MIT licence. `/llms.txt` is served as Markdown, one schema.org graph describes the site, the application, its publisher and the questions, Open Graph and Twitter images render from the brand mark, a real 404 page points somewhere useful, and robots rules keep `/app` and `/oauth/` out without blocking the icon. The sign-up screen now promises only what row-level security guarantees. The repository gained a homepage, a description and topics.

Validation: format, typecheck, the unit suite (including star-count fallbacks when GitHub is limited or unreachable) and build pass. All 144 browser and API journeys pass on desktop, tablet and mobile, among them the questions and their structured data, the GitHub and contributing links, `llms.txt` as Markdown, a 404 status, the robots rules and the preview image. The UX tour reports no overflow or axe violations.

## 2026-09-10 — UX loop 33: groundwork for signing assistants in with OAuth

The owner chose a zero-friction start: one line copied from the landing page, and the assistant connects to Recall, interviews the person and proposes a first deck. Pasting a personal token into an assistant's configuration is the step that stands in the way, and it also keeps out ChatGPT and claude.ai, which only connect through OAuth. ADR 0004 (Proposed) records the design: Supabase Auth as the authorization server, the MCP server as a protected resource, and the consent screen in the web app.

The MCP server publishes RFC 9728 protected resource metadata and answers an unauthenticated request with a `WWW-Authenticate` challenge that points to it, but only when an issuer is configured; production has none yet, so it keeps accepting personal tokens exactly as before. The web app has `/oauth/consent`: it signs a person in or up without losing the authorization request, names the client asking — capped and rendered as text, because dynamic registration lets anyone choose that name — says which site the browser returns to, and approves or denies through Supabase Auth. Confirming a new account's email now returns to the page that started the sign-up.

Validation: format, typecheck, the unit suite and build pass, with unit tests for the consent summary and in-process MCP tests for the challenge, the metadata and the token-only mode; all 144 browser and API journeys pass. Not yet verified end to end: the local Supabase CLI refused the OAuth server settings in `supabase/config.toml`, so the journey that registers a client, consents and calls the tools with the issued token waits for that fix and for the production setting in the Supabase dashboard.

## 2026-09-10 — UX loop 34: an assistant signs in through OAuth, end to end

Loop 33 laid the groundwork but could not prove the flow, because local Supabase refused the OAuth server settings. The configuration already held a disabled `[auth.oauth_server]` table from an earlier `supabase init`, and adding a second one made the whole file invalid. The first end-to-end runs then exposed three details a real client would also meet: the local proxy serves authorization server metadata only at `/auth/v1/.well-known/oauth-authorization-server`, not at the RFC 8414 inserted path; local Supabase names its issuer `http://127.0.0.1:56321/auth/v1`, while the MCP server advertised `localhost`; and the test's own callback interceptor returned a pending promise from an async function, so it waited for the callback before the browser ever opened.

Local Supabase now enables the OAuth server in the existing table, with dynamic client registration and `/oauth/consent` as the authorization page, and the MCP server advertises the issuer Supabase reports. A new journey does what an OAuth-capable assistant does: it reads the MCP server's protected resource metadata, finds the authorization server metadata where clients look for it, registers itself dynamically, starts a PKCE authorization, signs a person in on the consent page, allows access, exchanges the code and lists that person's decks through the MCP tools with the issued token. A second journey declines and gets `access_denied` without a code.

Validation: all 146 browser, API and MCP journeys pass locally with the OAuth server enabled, including both OAuth journeys. Production still needs the OAuth server switched on in the Supabase dashboard and the issuer configured for the MCP project before assistants can sign in there.

## 2026-09-10 — UX loop 35: a landing page that ships almost no CSS

The design review measured 89 KB of CSS on the landing page, 81 KB of it Radix Themes with 6% in use, because the root layout imported Radix and every product stylesheet. On slow 4G with a throttled CPU, first paint and the largest contentful paint waited 1.5 s on styles the page never used. The navigation, hero and footer all sat inside `<main>`, so the page had no banner or contentinfo landmark. Inter preloaded two subsets and swapped in after first paint, moving content by 62 px on a phone, the in-page link prefetched the page itself, and the dark browser bar still used the old canvas colour.

Radix Themes and the product stylesheets now load only in `app/(product)/layout.tsx`, which holds `/app` and `/oauth` without changing either address, and the rules that must follow Radix moved to `styles/radix-theme.css`. The landing page downloads 3.9 KB of gzipped CSS instead of about 89 KB, while the app still loads its 91 KB. The page is now a banner for the navigation, main content for the hero and sections, and a contentinfo footer, with the step numbers hidden from assistive technology. Inter loads the latin subset — which covers Portuguese, Spanish and Italian — with `display: optional`, so type never swaps after first paint. The in-page link is a plain anchor, and the dark theme colour matches the dark canvas.

Validation: format, typecheck, 117 unit tests and build pass. All 146 browser, API and MCP journeys pass on desktop, tablet and mobile, including the landing page's accessibility check, and the UX tour reports no overflow or axe violations. `AGENTS.md` records where Radix loads and that a moved route leaves a stale generated validator in `apps/web/.next`.

## 2026-09-10 — UX loop 36: a hero that shows the product

The design review found a landing page made only of text above the fold, with the copy ending two thirds of the way across a 1440 px window, although the sign-in screen already had the right visual: an example card. On a tablet the three steps broke into two cards and a lone third; on a phone the headline's line break left "stick." alone. Section spacing followed the window's height instead of its width, footer links and "Sign in" were 21–42 px tall on a phone, the focus ring fell to 3:1 in dark mode, and links that open a new tab did not say so.

The example card is now a shared component, beside the hero copy from 960 px and under it on smaller screens, with a fixed width so nothing shifts; its front is a paragraph rather than a heading, so both pages that show it keep a clean outline. The steps stay in one column until all three fit side by side, and the headline's two sentences are separate lines that balance on their own. Type and section spacing scale with the viewport width. Footer links and "Sign in" are 44 px tall, the footer stacks on phones and the actions stack full width below 480 px. The focus ring uses the brand text colour, above 5:1 in both appearances, and the GitHub and WhatsApp links announce that they open in a new tab.

Validation: format, typecheck, 117 unit tests and build pass. All 146 browser, API and MCP journeys pass on desktop, tablet and mobile, including the landing and sign-in accessibility checks, and the UX tour reports no overflow or axe violations. Captures at 1440 px and 390 px in both appearances were reviewed.

## 2026-09-10 — UX loop 37: the home page answers agents in Markdown

An agent-readiness scan from is-agentic.com marked Markdown negotiation as an essential failure. A request for the home page with `Accept: text/markdown` got the HTML page, and nothing told caches that the answer depends on `Accept`. An agent had to know about `/llms.txt` to get something readable.

`next.config.ts` now rewrites those requests to the `llms.txt` guide before any page renders. An agent gets `text/markdown` at `/`, and browsers still get the HTML. The Markdown response carries `Vary: Accept`. Next.js writes its own `Vary` on HTML pages and drops one set in `next.config.ts`, so the HTML response does not name `Accept`. The journey checks for the exact `Accept` token, because a substring match also passed on `Accept-Encoding`.

Validation: format, typecheck, 117 unit tests and build pass. All 149 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that asks for the home page in Markdown and in HTML.

## 2026-09-10 — UX loop 38: agents find their way back and find the MCP server

The agent-readiness scan gave two more checks only partial credit. A missing page returned a real 404, but only as an HTML page, so an agent that asked for Markdown got no short way back. The site also never said where its MCP server is, so an agent had to read `llms.txt` or the docs to find the endpoint.

When a request asks for Markdown, unknown paths now answer with a Markdown 404 that links the home page, `llms.txt`, sign-in, the sitemap and the source code. Browsers still get the HTML page. `/.well-known/mcp` and `/.well-known/mcp/server-card.json` publish a server card in the shape of the MCP registry's `server.json`. The card gives the endpoint, the bearer header it needs and where to create a token. `llms.txt` links the card, and the change map lists where agent discovery lives.

Validation: format, typecheck, 119 unit tests and build pass, including two new tests for the card's registry limits and media type. All 155 browser, API and MCP journeys pass on desktop, tablet and mobile, including new journeys for the Markdown 404 and the server card.

## 2026-09-10 — UX loop 39: landing copy that sets expectations before sign-up

A second copy review found that the hero named only coding assistants, so people who use ChatGPT or claude.ai learned only after signing up that they could not connect. The eyebrow leaned on "MCP" before the page explained it. Step 2 did not show what a request for cards sounds like or say what happens to a wrong card. The ChatGPT answer ended without a next step, and the page had no answer for Anki or for other languages. The privacy answer, "No other account.", did not say who can reach the cards.

The hero note now lists the assistants that connect, says ChatGPT and claude.ai do not yet, and reminds visitors that they can always write cards themselves. The eyebrow reads "Spaced repetition flashcards". Step 2 quotes a real request and says any card can be edited or deleted. The ChatGPT answer points to the assistants that work today. Two new questions compare Recall with Anki and cover languages. The privacy answer says only the person and the assistants they connect can reach the cards, and the footer names the maintainer as the person on WhatsApp.

Validation: format, typecheck, 119 unit tests and build pass. The 27 landing journeys pass on desktop, tablet and mobile, including the accessibility check, and captures at 1440 px and 390 px in both appearances show no horizontal overflow.

## 2026-09-10 — UX loop 40: outcomes are announced and focus stays in place

The usability review found that creating, saving or deleting a card or a deck gave a screen reader nothing to say. The dialog closed or the control disappeared, and the result showed up somewhere else on the page. Deleting a card or a deck also removed the control that had focus, so focus fell to the page body. Finishing a study batch did the same when the last card and its rating buttons unmounted.

The workspace now has one polite status region. It says "Card created", "Card saved" and "Card deleted", names a deck that was created or deleted, and says whether a deleted deck's cards moved or went with it. Each message lands a moment after it is sent, because a dialog that just closed still hides the page from assistive technology, and emptying the region first lets a repeated message speak again. After a card is deleted, focus moves to the view's title. After a deck is deleted, focus returns to the deck filter, which now shows all decks. When a batch ends, the "Nicely done" heading takes focus, so a screen reader reads the result. These titles show no focus ring, because they are not controls.

Validation: format, typecheck, 119 unit tests and build pass. All 155 browser, API and MCP journeys pass on desktop, tablet and mobile, with new checks for each announcement and for where focus lands after deleting a card or a deck and at the end of a batch. The card journeys pass again after the focus style for titles was added.

## 2026-09-10 — UX loop 41: a new connection token survives a visit to another view

The token Recall shows once after a connection is created lived inside the Connections view. Opening another view and coming back destroyed the only copy, so the person had to revoke that connection and create another.

The new token now stays in the signed-in workspace, in memory only, until the person closes it or revokes that connection. Signing out or switching accounts still drops it, because the workspace is keyed by account. So that the panel reads the same after a return, it remembers whether the token or the setup was copied, including a copy made by hand, and the assistant picker names the assistant the token was created for. The setup reads the MCP address from the same constant as the server card.

Validation: format, typecheck, 121 unit tests and build pass, including two new tests for remembering a copy. All 161 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that leaves Connections for the library and comes back to the same token.

## 2026-09-10 — UX loop 42: landing page details from the design review

The second design review measured the landing page in production. The closing "Already have an account? Sign in" line sat 257 px left of centre at 1440 px, because its margin cancelled the automatic margins that centre the paragraph. Screen readers heard "plus" at the end of every question. The brand link was 30 px tall and the closing Sign in link 19 px, and the brand link prefetched the page it was already on. In forced-colours mode, pills and cards lost their shadows and with them their edges.

The closing line is centred again, and a journey measures it. The question rows keep their plus sign on screen but give it empty alternative text, and browsers without that syntax keep the plain sign. The brand link and the closing Sign in link are now 44 px tall without moving anything around them, and the brand link is a plain anchor. Pills and cards draw a transparent outline that forced-colours mode paints as their edge.

Validation: format, typecheck, 121 unit tests and build pass. All 161 browser, API and MCP journeys pass on desktop, tablet and mobile, including the landing page's accessibility check and the new centring check.

## 2026-09-10 — UX loop 43: the example card reads as a card

The design review found that screen readers met the example card on the landing page and the sign-in screen as loose paragraphs. Nothing said it was an example, or which text was the front and which the back.

The card is now a figure captioned "Example card", and its two sides carry visually hidden "Front:" and "Back:" labels, so it is announced as an example with both sides named. The figure's default margins are reset, so the card keeps its size and place on both pages.

Validation: format, typecheck, 122 unit tests and build pass. All 166 browser, API and MCP journeys pass on desktop, tablet and mobile, including the landing and sign-in accessibility checks and a new journey that finds the card as a figure with both sides named.

## 2026-09-10 — UX loop 44: the headline outranks the example card at every width

On a phone, the example card's front was set at 42 px while the headline was 37 px, so the sample text read as the page's title. At 960 px the card took so much room that the headline's sentences wrapped and the lead ran six lines.

The headline and the card's front now share one scale: the front is three quarters of the headline's size at every width, and the card's padding shrinks with the window. From 960 px the card's column is 26% of the window, between 280 and 380 px, which the design review measured as one line per headline sentence.

Validation: format, typecheck, 122 unit tests and build pass. All 166 browser, API and MCP journeys pass on desktop, tablet and mobile, including the landing page's accessibility check, and captures at 1440 px and 390 px in both appearances show the headline above the card with no horizontal overflow.

## 2026-09-10 — UX loop 46: agents find the Markdown twin, the price and a dated sitemap

A forced rescan on is-agentic.com confirmed that Markdown negotiation, the Markdown 404, the agent instructions, the structured data and the metadata now pass. It also listed cheap discovery gaps: no page advertised its Markdown twin in a link tag or a `Link` header, `/index.md` did not return Markdown, there was no machine-readable price, and the sitemap entry had no date.

The home page now declares `/llms.txt` as its Markdown alternate, both in the head and in an RFC 8288 `Link` header. `/index.md` serves the same guide. `/pricing.md` says that Recall is free with every feature and can be self-hosted under the MIT license, and `llms.txt` links to it. The sitemap entry carries the date of the deploy that built it. A request-level journey checks all of this once, instead of once per device.

Validation: format, typecheck, 122 unit tests and build pass. All 166 browser, API and MCP journeys pass, including the two new agent discovery journeys.

## 2026-09-10 — UX loop 45: a first visit to Today starts with the first card, not three zeros

A new account's Today showed the invitation to write a first card, followed by "0 reviews today", "0 cards in your library" and "0 day streak". The zeros said nothing and pushed the decks further down on a phone.

Today now leaves the statistics out until there is something to count: a card in the library, a review today or a streak. The decks keep the gap below the invitation that the statistics would have left.

Validation: format, typecheck, 122 unit tests and build pass, including a new test for when a workspace counts as a first run. All 169 browser, API and MCP journeys pass, and the main journey now checks that a new account sees no statistics until its first card exists. Captures of a new account's Today at desktop and phone sizes were reviewed.

## 2026-09-10 — UX loop 47: screen readers hear each change once and can tell connections apart

The frontend review listed three announcement problems. Revealing an answer moved focus to it and also filled a live region, so a screen reader read the answer twice. Copying a token or the setup only changed the button's own label to "Copied", which is not reliably read aloud. Two connections made for the same assistant had revoke buttons with the same name, "Revoke connection Cursor".

The answer no longer has a live region, so moving focus to it reads it once. A copy now says "Setup copied" or "Token copied" through the workspace's status region. Each revoke button's name ends with its token prefix, which the row already shows.

Validation: format, typecheck, 122 unit tests and build pass. All 169 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that copies the setup and hears it announced.

## 2026-09-10 — UX loop 48: a shorter lead under the headline

The design review measured the hero's lead paragraph, the page's largest contentful element, at seven lines on a phone. It repeated the assistants that the note under the buttons now lists, and its second sentence carried three clauses.

The lead is now two short sentences: "A free, open-source flashcard app for people who study for hours. Your AI assistant turns what you learn into cards, and Recall brings each one back before you're likely to forget it." The assistants are still named in the note below the buttons, in the questions and in the page's metadata.

Validation: format, typecheck, 122 unit tests and build pass. All 169 browser, API and MCP journeys pass on desktop, tablet and mobile, including the landing page's accessibility check, and a capture at 390 px shows the shorter lead.

## 2026-09-10 — UX loop 49: the study progress bar glides and says what it counts

The frontend review found that the progress bar under the study header never animated. Radix fills it with a transform, but Recall's stylesheet replaced that transition with one on width, which never changes, so the bar jumped at every rating. Screen readers heard only a percentage, while the header beside the bar says "3 of 26 reviewed".

The bar now eases its transform and stops animating when the system asks for reduced motion. Its value text matches the header, so a screen reader hears "Session progress, 3 of 26 reviewed".

Validation: format, typecheck, 125 unit tests and build pass. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile, and the main journey now checks the progress bar's value text.

## 2026-09-10 — UX loop 50: questions read as one list and line up with the steps

The design review found the questions section built from thirteen separate cards in a 780 px column that lined up with nothing on a wide screen, leaving a 304 px empty gutter, with focus rings spilling past each row. In the open-source section, the dark "Star on GitHub" button outweighed the page's primary button: about 14:1 against the background in light and 17:1 in dark, compared with 4.6:1 and 3.8:1 for the blue button.

The questions now sit on one surface with hairlines between them, questions that wrap on a phone keep room above and below, and the focus ring stays inside each row. From 1024 px, the questions and the open-source section put their heading in the first column and their content under the second and third steps. The "Star on GitHub" button uses a soft fill with the page's ink, so the blue button stays the strongest call to action.

Validation: format, typecheck, 125 unit tests and build pass. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile, including the landing page's accessibility check and a new check that the questions line up with the second step on wide screens. Captures at 1440 px and 390 px in both appearances were reviewed, and the landing journeys passed again after the rows gained that vertical padding.

## 2026-09-10 — UX loop 51: the inline deck field has a name, and Enter respects input methods

The frontend review found that the field for a new deck's name, inside the card editor, had no accessible name. Its "New deck name" text was a plain span, so screen readers announced an unlabeled text field. Enter also acted as a command while an input method was still composing text, so someone typing a Japanese or Chinese deck name who pressed Enter to confirm a word created the deck from half-composed text, and the Tags field treated that Enter like any other.

The text is now the field's label. The editor's Enter rules live in one small module: while an input method is composing, Enter belongs to it; otherwise Enter creates the inline deck, and Cmd or Ctrl+Enter saves the card. Safari's composing keystrokes are recognised by their key code, 229.

Validation: format, typecheck, 125 unit tests and build pass, including three new tests for the Enter rules. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile, including checks that the inline field is named and that a composing Enter creates no deck.

## 2026-09-11 — UX loop 52: larger controls reach 44 px on touch screens too

The frontend review found that Recall's touch sizing covered only Radix's size 2 controls. The size 3 buttons, such as "Create your first card", "Start reviewing" and "Back to Today", and the library's search field stayed 40 px tall on phones and tablets, below the 44 px that Apple recommends for fingers.

On coarse pointers, size 3 buttons, selects and text fields now get the same 44 px height as size 2. Sizes on desktop are unchanged.

Validation: format, typecheck, 125 unit tests and build pass. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile, and the touch sizing journey now also measures the first-card button.

## 2026-09-11 — UX loop 53: one word for assistants, and no stray label above a card

The usability review's terminology pass found two leftovers. The dialog for revoking a connection said "The agent will lose access", while every other screen says assistant. When a study card's deck name was not known yet, the label above the card read "Recall before revealing", a phrase used nowhere else.

The revoke dialog now says "The assistant using this token will lose access." The label above a card shows its deck name, and nothing while that name is unknown.

Validation: format, typecheck, 125 unit tests and build pass. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile.

## 2026-09-11 — UX loop 54: no styles for a Connections box that no longer exists

The frontend review listed dead code among the things that slow contributors down. A scan of every stylesheet for class names that no component uses found one real leftover: `.endpoint-box`, with rules for its label and code, from an earlier Connections design that showed the MCP address in a box. The same scan also flagged the four rating colours, but the rating buttons build those class names at runtime, so they stay.

The `.endpoint-box` rules are removed. Nothing on screen changes.

Validation: format, typecheck, 125 unit tests and build pass. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile, including the Connections journeys.

## 2026-09-11 — UX loop 55: one way to add a deck from the card editor

The usability review found two controls for the same job in the card editor: a "New deck" button above the deck list, and a "+ Create new deck..." item at the bottom of the list itself. With the new deck form open, the editor also had two buttons named "Cancel", one for the form and one for the whole editor, which a screen reader could not tell apart.

The deck list now only chooses a deck, and the "New deck" button is the one way to add one. The form's cancel button is named "Cancel new deck" for assistive technology, while it still reads "Cancel" on screen.

Validation: format, typecheck, 125 unit tests and build pass. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile, including checks that the deck list offers no create item and that the form's cancel button has its own name.

## 2026-09-11 — UX loop 56: the browser toolbar follows the appearance you chose

The frontend review found that a saved appearance changed the page but not the browser's toolbar. Recall colours the toolbar with two theme-color tags, one for a light system and one for a dark system, so someone who chose dark on a phone set to light got a dark page under a light toolbar.

When a choice is saved, the script that applies it before the first paint now also adds a theme-color tag for that choice ahead of the system tags. Browsers use the first matching tag, and React 19 skips extra tags in the head when it hydrates, so the page and the toolbar match from the first frame on every page, including the landing page. Following the system still uses the two original tags.

Validation: format, typecheck, 125 unit tests and build pass. All 170 browser, API and MCP journeys pass on desktop, tablet and mobile, including checks of the toolbar colour with a saved dark choice on a light system and after the choice is cleared.

## 2026-09-11 — UX loop 57: switching views moves focus to the new view's title

The usability review noted that choosing a view in the navigation, or going Back to one, changed the page without telling a screen reader. Focus stayed on the navigation button or went nowhere, so the new view's content started unannounced. Loop 30 had already given each view its own tab title and a scroll to the top.

After the first view, every switch now moves focus to the new view's title, whether it came from the navigation or from Back and Forward. A screen reader reads where the person landed, and the next Tab starts inside that view. The first view after sign-in leaves focus where the page starts, and a study session keeps its own focus on the card.

Validation: format, typecheck, 127 unit tests and build pass. All 173 browser, API and MCP journeys pass on desktop, tablet and mobile, including checks that the Library title takes focus after a click in the navigation and after Back.

## 2026-09-11 — UX loop 58: the card editor says which tag limit a card breaks

The usability review found that a card with too many tags, or with a tag that was too long, came back from the server as "Check the fields you entered.", without naming the field or the limit. The field's hint mentions twelve tags but not their length.

The editor now checks the tags before saving and says "Use up to 12 tags." or "Keep each tag to 40 characters or fewer.", keeping everything the person typed. The limits live next to the editor rather than coming from the shared schema, which would ship the validation library to the browser, and a unit test fails if the two ever disagree.

Validation: format, typecheck, 127 unit tests and build pass, including tests for both messages and for the limits against the shared schema. All 173 browser, API and MCP journeys pass on desktop, tablet and mobile, including a journey that tries thirteen tags and gets the message without creating a card.

## 2026-09-11 — UX loop 59: two long functions split where a contributor would look

The frontend review counted functions well past the project's twenty-line guideline, which makes them harder for people and coding agents to change safely. The two largest in the editing and study paths were the inline deck form in the card editor, which held its state, its Enter rule and all of its markup in 53 lines, and the study session hook, which built its whole action object inline in 29.

The inline deck form is now a small hook for the name, its submit and its Enter rule, a header with the label and the cancel button, and the form that composes them. The study session hook hands its actions to a separate function that binds them to the current snapshot, and the request id helper lost a temporary variable. Nothing changes on screen or in behaviour.

Validation: format, typecheck, 127 unit tests and build pass. All 173 browser, API and MCP journeys pass on desktop, tablet and mobile, including the inline deck, input method and rating retry journeys that exercise both pieces.

## 2026-09-11 — UX loop 60: the next study card fades in

The design review noted that moving to the next card swapped the question text in place, inside the same card, so a new card looked like the old one changing its words. Over a long session, that makes it easy to miss that the card changed.

Each card is now its own element, and it fades in over 160 ms. The fade uses opacity only, with no movement, so hours of reviews do not slide around, and the system's reduced-motion setting turns it off. Focus still lands on the new card, and rating keys work during the fade.

Validation: format, typecheck, 127 unit tests and build pass. All 173 browser, API and MCP journeys pass on desktop, tablet and mobile, including the keyboard study journey, which now checks that the next card runs the fade and keeps focus.

## 2026-09-11 — UX loop 61: the app loads only the part of Supabase it uses

The frontend review found that the web app shipped the whole Supabase client, with code for the database, realtime, storage and functions, although the browser only signs people in, keeps their session and answers assistant sign-in requests. Everything else goes through Recall's API. The script chunk that carried the client weighed 87.9 KB compressed.

The app now creates the Supabase Auth client directly, with the same Auth address, key and session storage name that the full client used, so people who are already signed in stay signed in after the update. Only `lib/supabase-auth.ts` imports the Auth library; the rest of the app takes the client type from there, because the library exports its client as a value. A unit test builds the full client and fails if the address or the storage name ever differ. The chunk that carries the client is now 50.1 KB compressed instead of 87.9 KB, 37.8 KB less before the app can sign anyone in.

Validation: format, typecheck, 129 unit tests and build pass. All 173 browser, API and MCP journeys pass on desktop, tablet and mobile, including sign-up, sign-in, sign-out, switching accounts and the OAuth consent journeys.

## 2026-09-11 — UX loop 62: the sign-in screen says one thing at a time

The design review found two taglines competing on the sign-in and sign-up screen: the line under the heading, such as "Create an account and save what you want to learn.", and a second, poetic caption under the example card, "A small discovery today. Something you remember tomorrow." The main button also carried an arrow, which Apple's sign-in buttons do not use and which added one more shape beside the text.

The caption under the example card is gone, so the card speaks for itself and the heading's line is the only tagline. The "Sign in" and "Create account" buttons are text only, with the same names for assistive technology.

Validation: format, typecheck, 129 unit tests and build pass. All 173 browser, API and MCP journeys pass on desktop, tablet and mobile, including the sign-in and sign-up accessibility checks, and captures of the sign-up screen at 1440 px and 390 px in both appearances were reviewed.

## 2026-09-11 — UX loop 63: llms.txt links the documents themselves

After loop 46 shipped, a forced rescan passed every new discovery check but still reported that three of the five links it probed in `llms.txt` did not resolve: the MCP setup guide, the API contracts and the security model, all linked as GitHub pages. The same links answered 200 here to browsers, bots and HEAD requests, so the scanner most likely met GitHub's HTML pages under rate limits or expected Markdown.

Those three links now point at the raw Markdown files on GitHub, which an agent can read directly without GitHub's page around them. The source code link still opens the repository.

Validation: format, typecheck, 129 unit tests and build pass. All 173 browser, API and MCP journeys pass on desktop, tablet and mobile, and the guide journey now checks that the MCP setup link is the raw Markdown file.

## 2026-09-11 — UX loop 64: the server card lists the MCP tools

The forced rescan warned that the MCP server card on the site had no `tools` list. Listing tools on the live server needs a token, so an agent deciding whether Recall fits a task could find the endpoint but not what it can do there.

The tool names, descriptions and behaviour hints now live in one catalog in the shared contracts package. The MCP server registers its tools from it, and the server card at `/.well-known/mcp` lists the same entries, so the two cannot drift apart. The change map names the catalog.

Validation: format, typecheck, 130 unit tests and build pass, including a test that the card lists all nine tools and flags the one that deletes. All 174 browser, API and MCP journeys pass on desktop, tablet and mobile, including a journey that compares the card's tools with the tools the running MCP server lists for a signed-in account.

## 2026-09-11 — UX loop 65: the deck removal dialog in smaller pieces

After loop 59, a scan for long functions found the deck removal dialog at 58 lines, the longest left in the app. It kept the choice between moving and deleting the cards, the target deck, the confirmation and all of the dialog's markup in one component.

The choice now lives in a small hook, the move-or-delete options and the dialog's buttons are their own components, and the dialog composes them. The markup, the default of moving the cards and the behaviour are unchanged.

Validation: format, typecheck, 130 unit tests and build pass. All 174 browser, API and MCP journeys pass on desktop, tablet and mobile, including the journeys that delete an empty deck, move a deck's cards and delete a deck with its cards.

## 2026-09-11 — UX loop 66: the docs say how agents find Recall

Loops 37 to 64 gave agents several ways to discover Recall: the Markdown guide at `/llms.txt` and at `/` for Markdown requests, `/index.md`, `/pricing.md`, a Markdown 404 and a server card with the tool list. No document said so, and the web README still described its session code without the Supabase Auth client from loop 61, so a contributor had to read the code to learn where agents look.

`docs/mcp.md` now lists the discovery addresses, what each returns and where their text lives, including the shared tool catalog. The web README names the agent-facing routes, mentions the Auth client in `lib/`, and adds the rule that Supabase Auth is imported only through `lib/supabase-auth.ts`.

Validation: the documentation passes the format check; no code changed.

## 2026-09-11 — UX loop 67: a double tap on Reveal answer no longer rates the card

The wave 3 frontend review found that the rating buttons appear where "Reveal answer" was, so the second half of a double click or double tap landed on a rating. A desktop double-click and two phone taps 90 ms apart each saved a review nobody chose, and the card's schedule moved without the learner judging it.

A rating now ignores the second click of a double click or double tap, which browsers count as click 2. Single clicks, taps, the keyboard and the number keys rate at once. A first attempt made pointer clicks wait 400 ms after the ratings appeared, but it also swallowed deliberate quick ratings, and five study journeys failed on all three layouts.

Validation: format, typecheck, 133 unit tests and build pass. All 183 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that double-clicks Reveal answer and confirms no review was saved.

## 2026-09-11 — UX loop 68: numbered steps keep their numbers

The wave 3 usability review found that a numbered list restarted at 1 after a nested bullet, so an assistant's "4. Conclude" showed as "1. Conclude" and learners would memorize the wrong step. The nesting was flattened, and a list that began at 4 in the text also began at 1 on screen.

Card text now keeps the number a numbered list starts from, and a list line indented by two spaces or a tab sits under the item before it, so the outer numbering carries on after a sub-step. Card text is still parsed into elements and never rendered as HTML.

Validation: format, typecheck, 133 unit tests and build pass, including new tests for start numbers and nested steps. All 183 browser, API and MCP journeys pass on desktop, tablet and mobile.

## 2026-09-11 — UX loop 69: the library catches up with cards an assistant adds

The usability review imported cards through MCP while the library was open. Five seconds later, and after returning to the tab, it still said "0 cards", and the new deck was missing from the filter until the person switched views.

The library now refreshes when the tab comes back or the network returns, as Today does, and reloads the decks for its filter at the same time. It does not refresh on a timer, so a list someone is reading never shifts under them.

Validation: format, typecheck, 133 unit tests and build pass. All 183 browser, API and MCP journeys pass on desktop, tablet and mobile, including a journey in which an assistant creates a card while the library is open and the card appears once the page is visible again.

## 2026-09-11 — UX loop 70: one Supabase Auth client per tab

The frontend review found that every visit to the app created a new Supabase Auth client and never stopped it. After three trips between the landing page and the app, the landing page still ran three token refresh timers, three broadcast channels and three visibility listeners, and the console warned about multiple Auth clients each time. A missing public Supabase setting also failed deep inside the client.

The browser now creates one Auth client for the tab and reuses it, while a server render still gets a throwaway client that no request shares. A missing `NEXT_PUBLIC_SUPABASE_URL` or key fails with a message that names the setting.

Validation: format, typecheck, 133 unit tests and build pass, including a test for the missing-setting message. All 183 browser, API and MCP journeys pass on desktop, tablet and mobile, including the OAuth consent journeys and a journey that goes from the landing page to sign-in and back three times without an Auth client warning.

## 2026-09-11 — UX loop 71: answers read in full ink

The wave 3 design review measured the study answer and found two colours in one card. Paragraphs used the muted interface grey, 5.93:1 against the card in light mode, while list items used the card's ink at 16.02:1. The answer was capped at 66ch, which the review measured at up to 83 characters a line, because a ch is only as wide as a digit.

Card paragraphs now take the card's ink, like list items, and the answer is capped at 28em, about 66 characters, the measure its comment already promised.

Validation: format, typecheck, 133 unit tests and build pass. All 183 browser, API and MCP journeys pass on desktop, tablet and mobile, and the keyboard study journey now checks that an answer paragraph has the question's colour.

## 2026-09-11 — UX loop 72: the tab bar blurs in every browser

The design review found that the phone and tablet tab bar, and the desktop sidebar, showed no blur in Chrome, Edge and Firefox. The stylesheet wrote `backdrop-filter` before `-webkit-backdrop-filter`, and the CSS build keeps only the last declaration of that pair, so only Safari's prefixed blur survived. The study bar wrote them the other way round and kept both.

Both rules now write the prefixed declaration first, with the same blur and saturation, and `AGENTS.md` records the ordering.

Validation: format, typecheck, 133 unit tests and build pass, and the built stylesheet keeps both declarations for the sidebar and the tab bar. All 183 browser, API and MCP journeys pass on desktop, tablet and mobile.

## 2026-09-11 — UX loop 73: Radix surfaces, focus rings and touch menus follow Recall

The design review measured three places where Radix defaults broke Recall's design. In dark mode, dialogs, alerts and menus used #191918, darker than the #212120 cards they open above. Focus rings on selected navigation rows and soft buttons used Radix's step 8 colour, 2.12:1 in light mode, while the landing page's rings reach 5.27:1. Select menu rows were 32 px tall on touch screens, under the 44 px targets used everywhere else.

In dark mode, dialogs and menus now take the raised surface. Focus rings, including the soft variant's, use the accent text colour, as the landing page does. On coarse pointers, select menu rows are 44 px tall.

Validation: format, typecheck, 133 unit tests and build pass. All 183 browser, API and MCP journeys pass on desktop, tablet and mobile, including the touch sizing journey, which now measures a deck filter row. A probe measured the dark New card dialog at rgb(42, 42, 40) above a card at rgb(33, 33, 32), and the keyboard focus ring on the Today row at rgb(58, 91, 199).

## 2026-09-11 — UX loop 74: the study screen stays in place between batches

Recall loads due cards 20 at a time. The wave 3 frontend review found that rating the last card of a batch swapped the header, progress bar and card for a "Checking for more cards…" loader, then brought the whole screen back with its entrance animation. A long session blinked out every 20 cards.

The rated card now stays on screen, its rating lit, until the next batch arrives, and the next card follows like any other. If the next batch can't load, the study screen shows the connection error with Try again, as before. Checks from the completion screen were already quiet, so the separate loader state is gone.

Validation: format, typecheck, 137 unit tests and build pass, including a new test that holds the next batch and confirms the rated card stays on screen until it arrives. All 186 browser, API and MCP journeys pass on desktop, tablet and mobile.

## 2026-09-11 — UX loop 75: a session ended elsewhere returns to sign-in

The wave 3 frontend review revoked a signed-in session on the server, as signing out everywhere or changing a password does. The tab still held the old session, so every request failed. Ratings said "Check your connection" with a Retry that could never work, Today said "Your session has expired" with Try again, and the only way out was finding Sign out.

When the API rejects the tab's session, Recall now signs the tab out, and the sign-in screen says "Your session ended. Sign in again to pick up where you left off." The shared API client reports rejected credentials through an optional callback, so the MCP server is unchanged.

Validation: format, typecheck, 137 unit tests and build pass. All 186 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that revokes the session during study, rates the card, reads the explanation and signs in again.

## 2026-09-11 — UX loop 76: leaving during a slow save no longer causes a false conflict

The wave 3 frontend review left a study session while a rating was still saving over a slow connection, then started again. The new session loaded before the save landed and showed the same card. Rating it returned a conflict that said "This card was edited elsewhere", though nobody had edited it. A card already reviewed in another tab showed the same message.

A new session now waits up to 4 seconds for ratings still on their way before it loads cards, so it shows what is really due. The conflict message no longer guesses at the cause: "This card changed since it loaded. Reload it to review the latest version." A rating that fails before it is even sent now shows the failure, instead of leaving the rating buttons disabled.

Validation: format, typecheck, 137 unit tests and build pass, including new tests for a save that outlives its session and a rating that fails before it is sent. All 186 browser, API and MCP journeys pass on desktop, tablet and mobile.

## 2026-09-11 — UX loop 77: destructive buttons read at AA

The wave 3 design review measured the solid red buttons that confirm a deletion or discard a draft. White on Radix red-9 reads at 3.91:1, below the 4.5:1 AA minimum for text that size, on the buttons people press at the most consequential moment.

Destructive buttons now use red step 11 in light mode (5.21:1) and step 8 in dark mode (5.37:1), and their hover shade stays above 4.7:1.

Validation: format, typecheck, 137 unit tests and build pass. All 194 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that opens a delete confirmation in light and dark mode and measures its button label at 4.5:1 or more.

## 2026-09-11 — UX loop 78: the study bar lines up with the card

The wave 3 design review measured the bar that holds Reveal answer and the ratings. On desktop it was 860 px wide under an 820 px card, and on an iPad Mini 768 px under a 728 px card, so its top rule stuck out 20 px past each side of the card. The bar kept negative margins meant for phones, where it runs from edge to edge like a toolbar.

Beyond phone widths the bar now has exactly the card's width, with its buttons where they were. Phones keep the edge-to-edge bar.

Validation: format, typecheck, 137 unit tests and build pass. All 194 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that compares the bar with the card before and after revealing the answer on desktop and tablet.

## 2026-09-11 — UX loop 79: Arabic, Hebrew and Persian cards read right to left

The wave 3 Nielsen review found that card text had no direction of its own. A card written in Arabic, Hebrew or Persian was set in a left-to-right paragraph, so it started at the left edge, and punctuation at the end of a sentence moved to the wrong side.

Card text now takes its direction from its own letters: the question, each paragraph and list of the answer, the library previews and the editor's Front and Back fields. An Arabic sentence with a Latin translation reads each paragraph in its own direction, and library previews stretch to the card's width, so right-to-left text starts at the right edge.

Validation: format, typecheck, 137 unit tests and build pass. All 194 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that studies an Arabic card and checks the direction of the question and of each answer paragraph.

## 2026-09-11 — UX loop 80: library cards say when they come back

The wave 3 Nielsen review read the library as someone planning what to study. A reviewed card said only "Scheduled", with no date. Tags past the third disappeared without a count. The answer preview dropped line breaks, so a numbered answer ran together ("1. Prophase 2. Prometaphase…"), and "Edit card →" repeated on every card although the whole card opens the editor.

A scheduled card now says "Due later today", "Due tomorrow", "Due in 3 days" or "Due Oct 2", counted in calendar days. Extra tags show as "+2 more", the answer preview keeps its line breaks, and the edit hint appears when a card is hovered or focused.

Validation: format, typecheck, 138 unit tests and build pass, including a new test of the due labels across a day, a week and a year. All 200 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that reviews a card with five tags and checks its library card.

## 2026-09-11 — UX loop 81: the library keeps keyboard and screen reader users oriented

The wave 3 Nielsen review used the library with a keyboard and a screen reader. The result count changed silently as a search narrowed. Clear filters disappeared once pressed and dropped focus to the top of the page, and Next did the same on the last page, because a disabled button can't keep focus.

The result count is now a polite status, so a search says how many cards it found. Clear filters, in the toolbar or in the empty state, gives focus back to the search field. When Next or Previous reaches the end of the pages, the other button takes focus.

Validation: format, typecheck, 138 unit tests and build pass. All 200 browser, API and MCP journeys pass on desktop, tablet and mobile, and the paging and filter journeys now check where focus lands and that the count is a status.

## 2026-09-11 — UX loop 82: Connections keeps focus after a token closes or a connection is revoked

The wave 3 Nielsen review found two dead ends for keyboard and screen reader users on Connections. "I saved it" removed the token panel along with the focused button, and revoking a connection removed its row, so focus fell to the top of the page each time. The revoke itself was never announced.

Closing the token panel now moves focus to the page title. Revoking moves focus to "Your connections" and announces "Connection Cursor revoked". The shared confirmation dialog takes an optional place to send focus after a confirmation, for triggers that leave with what they removed.

Validation: format, typecheck, 138 unit tests and build pass. All 200 browser, API and MCP journeys pass on desktop, tablet and mobile, and the connection journeys now check focus after closing the token panel both ways and after a revoke, and the revoke announcement.

## 2026-09-11 — UX loop 83: card search ignores accents and finds tags

The wave 3 Nielsen review found that search matched accents exactly and never read tags. People typing on a phone often skip accents, so "saudacao" found no card about "saudação", and searching a tag's name found none of its cards.

Search now ignores accents as well as case, and it matches tags as well as both sides of a card. The API folds accents with PostgreSQL's built-in normalize(), so it needs no database extension or migration. The MCP search tool calls the same endpoint, so assistants search the same way.

Validation: format, typecheck, 138 unit tests and build pass. All 200 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that finds a card without typing its accents and another by an accented tag typed in capitals.

## 2026-09-11 — UX loop 84: sign-in says when Recall can't be reached

The wave 3 reviews signed in with the network cut. The form said "We couldn’t complete that. Please try again.", which reads like a wrong password or a broken service, and focus fell to the top of the page, because the Sign in button disables while it works.

A sign-in or sign-up that never reaches the service now says "Can’t reach Recall. Check your connection and try again.", the same words as the rest of the app, whether the browser reports it the Chrome, Firefox or Safari way. After any failure, focus returns to the button, so trying again is one key away.

Validation: format, typecheck, 142 unit tests and build pass, including the three browsers' network failure wording. All 212 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that signs in with the auth service unreachable, checks the message and the focus, then signs in once it is back.

## 2026-09-11 — UX loop 85: a deck review survives a reload, and signing in starts on Today

The wave 3 Nielsen review reloaded the page while reviewing one deck. Every review used the address /app/study, so the reload started a review of all decks, with other decks' cards and a different total. Signing in at that address was worse: someone whose session had ended landed straight in a review.

A deck review's address now carries its deck, /app/study?deck=…, through reloads and Back and Forward, and only a deck id is read from it. When the app opens on the sign-in screen, signing in starts on Today, while reloading a signed-in review still resumes it.

Validation: format, typecheck, 142 unit tests and build pass, including the review address and the deck id check. All 212 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that reloads a deck review, checks it kept its deck, then signs in again at that address and lands on Today.

## 2026-09-11 — UX loop 86: a long card says how far over the limit it is

The wave 3 Nielsen review pasted a long text into the editor. The Front and Back fields cut text at 4,000 and 8,000 characters without a word, so the end of a pasted passage vanished and the card saved without it.

The fields no longer cut text. Past 90% of a side's limit a count appears under it, such as "7,412 / 8,000", in red once over. Saving an over-long card keeps the editor open and says, for example, "The back is 412 characters over its 8,000-character limit. Shorten it to save."

Validation: format, typecheck, 142 unit tests and build pass, including the new messages and a check that the editor's limits match the shared card schema. All 212 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that types past the front's limit, reads the count and the message, and confirms nothing was saved.

## 2026-09-11 — UX loop 87: the study screen keeps its edges in forced colours

The wave 3 frontend review turned on forced colours, as Windows high contrast themes do. The browser drops shadows and backgrounds there, and those were the only edges of the review card, the four rating buttons and the bar beneath them, so the ratings read as floating words and the progress bar disappeared.

In forced colours the card, the ratings and the study bar now get borders the system paints in the theme's colours, and the progress bar fills with the theme's highlight colour. Nothing changes in the normal themes.

Validation: format, typecheck, 142 unit tests and build pass. All 212 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that studies in forced colours and checks the borders and the progress bar.

## 2026-09-11 — UX loop 88: a new connection token comes into view

The wave 2 frontend backlog left F-06 half open: focus dropped after issuing a token. Creating a connection on a phone showed the token panel below the intro, past the bottom of the screen, and nothing moved to it or announced it, although the token is shown only once.

Focus now moves to the panel's title when a token appears, which scrolls it into view and reads "Connect Cursor" to screen readers. Coming back to Connections with a token still waiting focuses the page title, as every view change does.

Validation: format, typecheck, 144 unit tests and build pass. All 221 browser, API and MCP journeys pass on desktop, tablet and mobile, and the connection journey now checks that the new token's title is focused and in view.

## 2026-09-11 — UX loop 89: at 400% zoom the study bar stops covering the answer

The wave 3 frontend review zoomed the study screen to 400%, as people with low vision do. A 1080p screen at that zoom is 480 by 270 CSS pixels, and the bar holding Reveal answer and the ratings stayed pinned to the bottom, covering most of the answer.

Viewports 480 px tall or shorter now let the bar scroll with the card, below the answer. Taller screens keep the pinned bar.

Validation: format, typecheck, 144 unit tests and build pass. All 221 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that studies at 480 by 270 and checks that neither bar is pinned.

## 2026-09-11 — UX loop 90: every screen names its tab from the first load

The wave 3 frontend review signed out from the library, and the sign-in screen kept the tab title "Library · Recall". Setting the title from the sign-in screen exposed a wider cause: Next commits the route's metadata title, "Recall", about 3 ms after a screen first renders, replacing a title set once in an effect. A probe found fresh loads of /app, /app/library and /app/connections all titled "Recall" until the person changed views.

A shared useDocumentTitle hook sets the tab title and sets it again if the metadata replaces it. The sign-in screen names the tab "Sign in · Recall" or "Create account · Recall", and each workspace view names it from the first load. AGENTS.md records the gotcha.

Validation: format, typecheck, 144 unit tests and build pass. All 221 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey for both sign-in titles; the view address journey now checks the titles after a reload and after opening /app/library directly. A first attempt set the title once and failed the new journey on all three layouts.

## 2026-09-11 — UX loop 91: closing the inline deck form keeps focus in the editor

The wave 2 frontend backlog still had part of F-06 open: cancelling the card editor's inline "New deck" form, with its button or Escape, removed the focused field and focus with it. Adding a deck closed the form the same way, and nothing said which deck was now chosen.

Cancelling now returns focus to "New deck", and adding a deck moves focus to the deck list, which reads the new deck as the choice.

Validation: format, typecheck, 144 unit tests and build pass. All 221 browser, API and MCP journeys pass on desktop, tablet and mobile, and the inline deck journey now checks focus after Cancel and after Add.

## 2026-09-11 — UX loop 92: a failed load after the last card puts focus on Try again

The wave 3 frontend review rated the last card of a batch with the connection down. The error and its Try again button appeared, but the rated card and its buttons had left the screen, so focus fell to the page and a keyboard user had to hunt for the button.

When a failure leaves no card on the study screen, Try again now takes focus. An error shown beside a card leaves focus where it is.

Validation: format, typecheck, 144 unit tests and build pass. All 221 browser, API and MCP journeys pass on desktop, tablet and mobile, and the failed batch journey now checks that Try again is focused.

## 2026-09-11 — UX loop 93: the editor no longer overwrites a card that changed while it was open

The wave 3 Nielsen review opened a card in the web editor while an assistant edited the same card through MCP. Saving the editor replaced the assistant's edit without a word, because card updates carried no version.

The web editor now sends the version it opened, and the API refuses a stale one with a 409. The editor then explains: "This card changed after you opened it, perhaps through your assistant. Save again to replace that change with yours, or close without saving to keep it." Saving again replaces it on purpose. MCP tools keep their version-free updates, and the study screen and the editor share one status check.

Validation: format, typecheck, 144 unit tests and build pass, including the update schema and the shared status check. All 221 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that edits a card an assistant changed meanwhile, reads the explanation, checks the assistant's edit survived, then saves again.

## 2026-09-11 — UX loop 94: browser Back closes the card editor instead of leaving the draft behind

The wave 3 Nielsen review pressed the browser's Back button with the card editor open, as phone users do to dismiss a sheet. A probe confirmed it: with a card typed in the editor, Back changed the view beneath the open dialog from the library to Today, and a second Back left Recall with the draft lost.

Opening the editor now adds a history entry at the same address, so Back asks the editor to close. A draft still gets the "Discard this card?" question, and Keep editing leaves Back ready to ask again. Closing the editor any other way removes the entry, so the history is as it was.

Validation: format, typecheck, 146 unit tests and build pass. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that presses Back on an empty editor, then on a draft: it keeps editing once, then discards and stays on the library.

## 2026-09-11 — UX loop 95: a card deleted meanwhile says so instead of blaming the connection

The wave 4 Nielsen review deleted the card on screen through MCP, as an assistant might while someone studies. Rating it got a 404, but Recall said "Your rating wasn’t saved. Check your connection and try again." Retry and the number keys failed every time, and only Leave session got out. Saving an edit to a card deleted meanwhile said only "Card not found."

A rating on a deleted card now says "This card was deleted, perhaps by your assistant." with a Next card button that reloads the review, beside the existing reload for a card that changed. The editor says "This card was deleted after you opened it, perhaps by your assistant. Copy your text before closing." and keeps the typed text. The wave 4 frontend review also found that a keyboard Retry dropped focus to the page: the whole notice, Retry included, vanished the moment a retry started. The notice now stays while its retry runs, with Retry reading "Retrying…", and leaves once the rating is saved.

Validation: format, typecheck, 146 unit tests and build pass, including a rating failure test for a 404. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, including new journeys that delete a card during a review and while it is open in the editor; the failed rating journey now retries from the keyboard and checks that focus stays on the button.

## 2026-09-11 — UX loop 96: search finds every word, whatever the spacing or formatting

The wave 4 Nielsen review searched the library the way people type. Search only matched the exact run of characters: "capital portugal" found nothing although a card asked "What is the capital of Portugal?", "significa saudade" missed "O que significa **saudade**?" because the stored bold markers sat between the words, and "portugal " with the space a phone keyboard adds found nothing. The MCP search tool behaved the same way. The wave 4 frontend review measured the cost of loop 83's accent folding: with 2,000 cards, an empty search took 60 ms and a real one 150 to 170 ms, because both the count and the page query folded every card.

Search now splits the query into words and finds cards that hold every word, in any order, anywhere on either side or in the tags, ignoring extra spaces and the `*`, `_` and backtick markers along with case and accents. Each card is folded once per query and not at all for an empty search, and the words are folded before they reach the database. With 2,000 cards, an empty search now takes 60 ms and a two-word search 109 ms, the median of nine runs against the local API. The MCP search tool calls the same endpoint, so assistants search the same way.

Validation: format, typecheck, 146 unit tests and build pass, including a test of how a search folds into words. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that searches two words, a phrase broken by bold markers and a trailing space.

## 2026-09-11 — UX loop 97: a deck created in the library opens ready for its first card

The wave 4 Nielsen review created a deck from the library. The filter stayed on "All decks", so the new deck was nowhere in sight, and the next New card defaulted to "My first deck", where the card was saved.

Creating a deck now selects it in the filter and announces "Deck “Chemistry” created and selected". An empty deck no longer reads like a failed search: it says "This deck has no cards yet" with a Create a card button that opens the editor on that deck.

Validation: format, typecheck, 146 unit tests and build pass. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that creates a deck, checks the filter, the announcement and the empty deck, and opens the editor on the new deck.

## 2026-09-11 — UX loop 98: a card moved out of the filtered deck says where it went

The wave 4 Nielsen review moved a card from a library filtered to Chemistry into "My first deck". Recall announced "Card saved", and the card's tile left the filtered list with focus still on it, so focus fell to the page and nothing said where the card had gone.

Saving a card into another deck now announces "Card saved and moved to “My first deck”". A library tile that leaves while focused, because its card moved or was deleted, hands focus to the page title.

Validation: format, typecheck, 146 unit tests and build pass. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that moves a card out of a filtered deck and checks the announcement and focus.

## 2026-09-11 — UX loop 99: signing out of a sign-up tab shows the sign-in form

The wave 4 Nielsen review opened Recall from the landing page's "Create a free account", signed in, then signed out. The tab showed the sign-up form, "Start remembering", titled "Create account · Recall", because the sign-up mode came from the ?new=1 address the tab first loaded; for the same reason a session that ended in that tab never showed "Your session ended". Signing up with an email that already had an account said "Sign in instead." with no way to do it, and focus went back to Create account.

Once a tab has signed in, every later sign-in screen starts on the sign-in form. An email that already has an account now shows a Sign in instead button, which takes focus after the error, switches to the sign-in form and puts the cursor in the password field with the email kept.

Validation: format, typecheck, 146 unit tests and build pass. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, including new journeys that sign out of a sign-up tab and sign up with an email that already has an account.

## 2026-09-11 — UX loop 100: red buttons keep a visible focus ring

The wave 4 Nielsen review tabbed to the Delete deck and Delete card buttons. Their keyboard rings measured 2.1:1 and 2.39:1 against the surface behind them, under the 3:1 WCAG asks of a focus indicator. Loop 73 had moved rings to the accent text colour on the theme root, but Radix sets its focus scale again on every element with its own accent colour, which is exactly what a red button is.

The focus scale now follows the accent text colour on every element that sets an accent colour. The contrast helper used by the journeys can measure a ring against the surface behind a control.

Validation: format, typecheck, 146 unit tests and build pass. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, and the delete confirmation journey now tabs to Delete permanently in light and dark mode and measures its ring at 3:1 or more.

## 2026-09-11 — UX loop 101: a phone held sideways keeps Reveal answer within reach

The wave 4 Nielsen review studied on a phone held sideways, 750 by 342 pixels. Loop 89 had unpinned the study bar on every viewport 480 pixels tall or shorter, for 400% zoom, so on that phone Reveal answer sat at 463 to 511 pixels, below the fold, and nothing said that tapping the card also reveals it.

Short viewports now unpin the bar only with a mouse or trackpad, where they come from zooming in. Touch screens keep the pinned bar, so Reveal answer and the ratings stay under the thumb.

Validation: format, typecheck, 146 unit tests and build pass. All 245 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that studies at 750 by 342 on the touch layouts; the 400% zoom journey now runs on desktop only.

## 2026-09-11 — UX loop 102: long questions read like passages

The wave 4 design review measured the questions assistants often write, a paragraph long. They were set semibold, the weight meant for short prompts, and ran 72 characters a line on desktop and 11 lines on an iPhone. The completion screen's summary was one centred line of 95 characters.

Paragraph questions now use a regular 500 weight and stop at 32em, about 66 characters a line. The completion summary stops at 30em and balances its lines.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that checks a paragraph question's weight and measure and the completion summary's measure.

## 2026-09-11 — UX loop 103: the study bar shows its material only over the card

The wave 4 design review looked at the bar that holds Reveal answer and the ratings. On a desktop review of a short card, the bar rested 10 to 13 px below the card with nothing to scroll, yet it drew a hairline and a 20 px blur over empty canvas under every card. When a long card did run beneath it in dark mode, its 80% canvas fill painted near-black across the card's surface.

The bar is now plain at rest. While the card runs beneath it, the study view is marked and the bar takes the card's surface at 72%, the blur and the hairline, like a toolbar over scrolling content.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile; the keyboard journey checks that a short card's bar draws no hairline, and the long card journey checks that the pinned bar shows its material.

## 2026-09-11 — UX loop 104: right-to-left answers reach their reading edge

The wave 4 design review studied an Arabic card after loop 79. The question ended at the card's right edge, at x 1082, but the answer paragraph stopped at 896 and a list item at 856. The answer's 28em measure sat on its whole block, anchored to the left, and card lists indented with a physical left padding.

The measure now sits on each answer paragraph and list, and a right-to-left one moves to its own reading edge. Card lists indent on the side they are read from. A first version used `:dir(rtl)`, which the CSS build rewrites as right-to-left `:lang()` selectors that never match card text marked only with `dir="auto"`; an end margin, which follows each block's own direction, now places answers and questions alike, and AGENTS.md records the rewrite.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, and the right-to-left journey now checks that the Arabic answer paragraph ends where the question ends.

## 2026-09-11 — UX loop 105: library tags sit on the card, and the toolbar uses one control size

The wave 4 design review looked at the library in both appearances. In dark mode, tags and deck badges were filled with the canvas colour, near-black on the card's #212120, so they looked like holes punched in it. On desktop, the toolbar set a 40 px search field beside a 32 px deck filter and a 32 px New deck button.

Tags and deck badges now use the secondary fill, lighter than the card in dark mode, with their text at 5.77:1 in dark and 5.20:1 in light. The deck filter and New deck button use the search field's size, so the toolbar reads as one row.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new desktop journey that checks the three toolbar controls share one height.

## 2026-09-11 — UX loop 106: forced colours keep the app's edges, not only the study screen's

The wave 4 frontend review turned on forced colours, as Windows high contrast themes do, across the app. Loop 87 had fixed the study screen, but elsewhere the browser dropped the shadows that were the only edges: the card editor dialog floated without an edge or backdrop, fields, selects and buttons lost their outlines, library cards and Today's deck list had no border, and the current view in the navigation differed only by font weight.

In forced colours, cards, panels, dialogs and menus now get outlines the system paints, fields, selects and buttons get borders, and the current navigation item gets a border in the system highlight colour. Nothing changes in the normal themes.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that opens the library and the card editor in forced colours and checks their edges and the current view.

## 2026-09-11 — UX loop 107: the tab bar never covers the focused control when zoomed in

The wave 4 frontend review zoomed the app to 200% and 400%. The layout switched to the phone tab bar, fixed at the bottom and 72 px tall, which covered 18 to 28% of the viewport. Tabbing left deck rows, the deck filter, New deck and Create personal connection at least half beneath it, against WCAG's rule that focus is never hidden.

Keyboard focus now scrolls controls clear of the fixed tab bar. Viewports 480 px tall or shorter with a mouse or trackpad, the zoomed ones, put the tab bar back in the page flow, while a phone held sideways keeps it fixed within reach.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new desktop journey that checks the scroll padding at 200% and the tab bar's place at 400%.

## 2026-09-11 — UX loop 108: a session that ends while the tab is away explains itself

The wave 4 frontend review revoked a session while its tab sat in the background long enough for the access token to expire. On return, auth-js's own token refresh found the revocation before any API call could, signed the tab out, and the plain "Welcome back" screen appeared with no reason; loop 75 only handled an API 401. The same review counted 271 components re-rendering during study, and 437 on Today, each time the tab came back, because auth-js repeats SIGNED_IN with a new session object.

A sign-out the person didn't ask for now shows "Your session ended. Sign in again to pick up where you left off.", whether an API call or a token refresh found it, while Sign out and the consent screen's account switch mark their sign-outs as requested. A repeated SIGNED_IN with the same user and token keeps the current state, so returning to the tab re-renders nothing. AGENTS.md records the auth-js behaviour.

Validation: format, typecheck, 152 unit tests and build pass, including tests of how each Auth event changes the session state. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that revokes the session, lets the access token expire and returns to the tab.

## 2026-09-11 — UX loop 109: a failed Today refresh stays off the review screen

The wave 4 frontend review let Today's background refresh fail, then started reviewing. "Can’t reach Recall. Check your connection and try again." stayed above the whole review session, although reviewing worked, because the workspace's refresh error showed on every view.

The refresh error now shows only on Today and the library, whose decks and stats it concerns. A review and Connections stay clear of it.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that fails Today's refresh, checks the message, starts a review and checks that it is gone.

## 2026-09-11 — UX loop 110: Keep editing returns to the field being typed in

The wave 4 frontend review pressed Escape in the card editor with a draft typed, then chose Keep editing, with the button and with Escape. Both sent focus to the page, so the next keystroke went nowhere and the person had to click back into the field.

Keep editing now returns focus to the field that had it when the discard question opened. After Discard, the editor closes and restores focus as before. The editor also ignores an Escape the discard question has already handled, so closing the question with Escape can no longer ask it again from the editor behind it.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that keeps editing with the button and with Escape and checks the Front field has focus each time.

## 2026-09-11 — UX loop 111: saves on their way no longer cause conflicts, and stale addresses settle

The wave 4 frontend review repeated loop 76's test with a save slower than its 4-second wait: after leaving during a 6-second save and starting again, the same card came back and rating it returned a 409. It also opened the review address of a deck deleted since, which said nothing was due while four cards were. The Nielsen review found that /app/settings showed Today under the unknown address.

A new review now leaves out cards whose saves are still on their way, at once, instead of waiting for them. A review address naming a deck that no longer exists reviews every due card, and an unknown workspace address is replaced by the view it opened.

Validation: format, typecheck, 152 unit tests and build pass, and the save test now checks that a card still saving is left out without a wait. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that opens /app/settings and a deleted deck's review address.

## 2026-09-11 — UX loop 112: the library's count names the page, and a new page starts at its top

The wave 4 Nielsen review pressed Next on page 1 of 3. The scroll stayed at 2,348 px, with page 2's first card 2,119 px above the screen, and nothing was announced. The frontend review found that the result count, loop 81's polite status, went silent after a search with no results, because a loader replaced it and it came back already holding its text.

The count now stays mounted through loading and errors, and names the page when there is more than one, as in "25 cards · Page 2 of 2", so a search or a page change is announced. Moving to another page scrolls the results back to their top, while focus stays on the pagination.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, and the paging journey now checks the count's page and that it is in view after Next.

## 2026-09-11 — UX loop 113: editor fields have short names, hints on the label's row, and tags ignore case repeats

The wave 4 frontend review listened to the card editor: each hint sat inside its label, so the Back field was named "Back The answer · **bold**, _italic_, `code`, - lists", Markdown markers included. The design review measured the same fields as three rows, label, hint and control, with the editor's description at 14 px against 16 px in every other dialog. The Nielsen review saved "Portuguese" and "portuguese" as two tags on one card, and the Tags field capitalised its first letter on phones and ignored right-to-left text.

Each field is now named by its label alone and described by its hint, which shares the label's row. The editor's description uses the size of the other dialogs. The Tags field reads its direction from its text and doesn't capitalise, and tags that differ only in case are kept once, in the first spelling.

Validation: format, typecheck, 152 unit tests and build pass, including a tag test for case repeats. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that checks the Back field's name and description and the Tags field's attributes.

## 2026-09-11 — UX loop 114: rating hints appear on hover, never on a tap

The wave 4 frontend review profiled ratings on a throttled phone. Radix tooltips open on the focus a tap gives, so each tap on a rating flashed its hint, and the four tooltips made up about two thirds of the 104 component renders per rating, with 47 to 53 ms frames.

The rating hints now render only for a primary pointer that can hover, a mouse or trackpad. Each rating button's name already says what the rating claims, so touch screens and screen readers lose nothing.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that hovers a rating on desktop and focuses one on the touch layouts without a hint appearing.

## 2026-09-11 — UX loop 115: card text details in the library and in reviews

The wave 4 design review found three small rough edges in card text. Library previews showed raw "- " list markers from the answer. A code span that wrapped onto a second line lost its rounded ends and padding at the break. A library with a single page still showed disabled Previous and Next buttons.

Previews now show list markers as bullets, leaving numbered steps and emphasis alone. Wrapped code keeps its rounded ends on every line. Pagination appears only when there is another page to go to.

Validation: format, typecheck, 152 unit tests and build pass, including a preview test for bullets, numbers and emphasis. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, and the paging journey now checks that a single remaining page shows its count without pagination.

## 2026-09-11 — UX loop 116: quieter tools, grouped connections, centred iPad tabs and an even Hard label

The wave 4 design review collected four finishing details. The sidebar's theme, help and sign-out icons used the accent colour of the selected view, so tools competed with navigation. Connections listed as bare hairlines on the canvas, while Today's decks sit on a grouped surface. On an iPad Mini the three tabs spread 242 px apart across the bar. In dark mode, Hard was the brightest rating label, amber at 10.5:1 against about 8:1 for the others, which nudged the eye toward it.

Sidebar tools now use the secondary ink. Connections sit on the same grouped surface as the decks, with an edge in forced colours. Tablet tabs gather in the middle with even gaps, and dark mode sets Hard in orange at 7.99:1.

Validation: format, typecheck, 152 unit tests and build pass. All 271 browser, API and MCP journeys pass on desktop, tablet and mobile, and the connection journey now checks that the rows sit in the grouped list.

## 2026-09-11 — Delivery: UX loops 67 to 101 in production

The Vercel deployment limit reset, and the 42 validated commits for loops 67 to 101 went out in one push to `main`, at e4917cb. Vercel reported all three production deployments ready: MCP at 07:26:12 UTC (recall-mc3hmat5l), web at 07:26:28 (recall-rj5wq4enh) and API at 07:26:47 (recall-92uhh8ycu). GitHub CI run 34574337859 passed.

Production checks: the web app, API and MCP health endpoints answered 200, and the ten chunks production serves for /app contain strings introduced by loops 80, 90, 94, 95, 97, 98 and 99.

## 2026-09-11 — UX loop 117: one connection message and a guard for the API address

The wave 4 frontend review listed code a contributor or coding agent would trip over. "Can’t reach Recall. Check your connection and try again." was written out twice, in the app's failure copy and in the sign-in errors, so the two could drift apart. `describeFailure` was imported both directly and through a re-export from the feedback components. The API address used `process.env.NEXT_PUBLIC_API_URL!`, which fails deep inside the first request in a fresh worktree, while the Supabase settings already explain what is missing.

The connection message now lives once, beside `describeFailure`, and sign-in uses it. `describeFailure` has one import path. The guard that explains a missing public setting moved to its own module and covers the API address too.

Validation: format, typecheck, 153 unit tests and build pass, including a test that sign-in and the app say the same thing when a request never arrives. All 280 browser, API and MCP journeys pass on desktop, tablet and mobile.

## 2026-09-11 — UX loop 118: the review context and deck rows say what they are

The wave 4 Nielsen review listened to Recall with a screen reader. Above a card, the deck name and the tags were read as one run of words, "My first deck anatomy · bones". On Today, a deck row was read as its name, card count and status, without saying whether pressing it would start a review or open the library.

The review context now labels its parts for screen readers, "Deck:" and "Tags:". Each deck row ends with what it does, "start a review" when cards are due and "open in the library" otherwise. Nothing changes on screen.

Validation: format, typecheck, 153 unit tests and build pass. All 280 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that checks a deck row's action and the review context's labels.

## 2026-09-11 — UX loop 119: deleting a deck has a full-size, named target

The wave 4 Nielsen review filtered the library to an empty deck. Its delete control was a 29 by 29 px trash icon, 6 px from the deck filter, with no name on hover, and for an empty deck one press deletes at once.

The delete control is now a full-size 40 px icon button, with its own margin away from the filter, and hovering names it: "Delete this empty deck", or "Delete deck" when the deck has cards and a confirmation follows. Touch screens get a 44 px target. Radix sizes ghost icon buttons by their padding, so the square is set in CSS, and the control now passes on the props a tooltip hands it, which it used to drop, so the name appears.

Validation: format, typecheck, 153 unit tests and build pass. All 280 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that measures the delete target and, with a mouse, reads its name.

## 2026-09-11 — UX loop 120: a slow next batch counts the rating and says it is loading

Since loop 74, the last card of a batch stays on screen, its rating lit, until the next batch arrives. The wave 4 frontend review loaded that batch over a slow network, 6 seconds, and the screen looked frozen: the header still said "19 of 22", one rating stayed lit, nothing was announced, and keys were ignored.

The rating now counts as soon as it is saved, so the header moves on at once. While the next batch loads, the rating section says "Loading more cards…", announced to screen readers and shown only if the load takes longer than 0.8 seconds.

Validation: format, typecheck, 153 unit tests and build pass, and the held batch test now checks the count and the loading state. All 280 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that delays the next batch and checks the count and the message.

## 2026-09-11 — UX loop 121: the app loads only the Radix colours it uses

The wave 4 frontend review measured the product routes' first load. The layout imported Radix's full stylesheet, with all 31 colour scales in both appearances, as render-blocking CSS on every app route; about 5% of it was used, and a throttled phone took 2.8 s to paint signed-out /app.

The product layout now imports Radix's base tokens, the seven colour scales Recall uses (indigo, sand, gray, red, amber, green and orange), its components and its utilities. In the local production build, the stylesheet that carries the Radix components fell from 82.1 KB to 29.1 KB gzipped. A unit test scans the web app for Radix colours in props and CSS variables and fails if one lacks its scale, and AGENTS.md says where a new colour goes.

Validation: format, typecheck, 154 unit tests and build pass, including the colour import guard. All 283 browser, API and MCP journeys pass on desktop, tablet and mobile, including the contrast journeys for red buttons and a new journey that checks the four rating labels keep four distinct colours.

## 2026-09-11 — UX loop 122: the library keeps its search, deck and page in its address

The wave 4 Nielsen review searched and filtered the library, moved to another page, then reloaded: the search, the deck filter and the page were gone, and the library started over at every card.

The library's address now holds its search, deck and page, as in `/app/library?q=capital&deck=…&page=2`, so a reload opens the same results. A new filter replaces the history entry instead of adding one, so Back still leaves the library, and the address follows a search once typing pauses, because Safari refuses more than 100 history changes in 30 seconds. An address naming a deck that no longer exists shows every deck, and the search field stops at the 200 characters the API accepts.

Validation: format, typecheck, 156 unit tests and build pass, including tests that write library addresses and read back only what they can use. All 286 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that reloads a searched, filtered second page, returns to it with Back, and opens an address for a deck that does not exist.

## 2026-09-11 — UX loop 123: a reload keeps a review's count and the cards coming back

The wave 4 Nielsen review reloaded the page in the middle of a long review. The review went on with the right cards, but its count started over, from "20 of 46 reviewed" to "0 of 26". A reload on the completion screen also forgot the cards rated Again, so the screen no longer said when they come back, or brought them back on its own.

A review now keeps its count and its returning cards in the tab's session storage, so a reload continues it: the header still says "20 of 46", and the completion screen still says "1 card comes back in about 1 min" and resumes when it does. The saved progress names the person and the deck, so it never reaches another account's review or another deck's. Leaving the review, starting a new one or closing the tab forgets it.

Validation: format, typecheck, 166 unit tests and build pass, including tests that restore progress only for the same person and deck, ignore stored progress that is malformed or refused, and add the reviews before a reload to the cards still due. All 289 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that reloads mid-review and on the completion screen, and checks that leaving starts the next review from zero.

## 2026-09-11 — UX loop 124: text follows one type ramp and four weights

The wave 4 design review counted 26 font sizes and 6 weights across Recall. Secondary text used near-duplicates, 11.5, 12.8 and 13.6 px, beside the 12, 13 and 14 px used elsewhere. The wordmark and Today's due count were set at weight 650, the example card's question at 550, and deck names and connection names fell back to the browser's bold, 700.

Body and secondary text now take their sizes from a five-step ramp in the design tokens, after Apple's text styles at a 16 px body: caption 12, footnote 13, subheadline 14, callout 15 and body 16 px. Keycaps, tags, deck badges and the smallest statistics labels move from 11.5 to 12 px, privacy notes from 12.8 to 13 px, and overrides that only repeated a size are gone. Text uses four weights, regular, medium, semibold and bold, and the wordmark, the due count, the example card's question, deck names and connection names are semibold. A unit test fails on a size below a title that is off the ramp or on a fifth weight, and AGENTS.md names the ramp.

Validation: format, typecheck, 166 unit tests and build pass, including the type ramp checks. All 289 browser, API and MCP journeys pass on desktop, tablet and mobile, including the contrast, layout and forced colours journeys.

## 2026-09-11 — UX loop 125: corners follow the radius tokens

The wave 4 design review found 12 corner radii. The example card on the landing page and the sign-in screen was rounded at 28 px while the review card it previews used 22 px. Small icons, badges and phone-sized cards used 9, 13, 14, 17, 20 and 30 px beside the 8, 12, 18 and 22 px tokens, and the deck icon was a 48 by 52 px rectangle.

Every corner now comes from the radius tokens, with a new 6 px step for keycaps and inline code. The example card matches the review card at 22 px, icons and phone-sized cards step to the nearest token, the due badge is a capsule, and the deck icon is a 48 px square. A unit test fails on a corner radius that is not a token, a circle or zero.

Validation: format, typecheck, 166 unit tests and build pass, including the radius check. All 289 browser, API and MCP journeys pass on desktop, tablet and mobile, including the layout and forced colours journeys.

## 2026-09-11 — Loop 126: a local stack that fails to start says why

After loops 117 to 121 were pushed, the CI run for ef776a5 failed in `pnpm local:up` after 32 seconds with no output but `ELIFECYCLE Command failed with exit code 1`. The start script sends Supabase's output to `.supabase-start.log`, which nothing shows, so neither CI nor a contributor could tell what went wrong. A rerun of the same commit started the stack normally.

When Supabase fails to start, `scripts/local-up.sh` now prints the last 80 lines of its log, and a start that succeeds stays as quiet as before.

Validation: a copy of the script with stand-in `pnpm` and `docker` commands prints the end of the log and stops when Supabase's start fails, and prints nothing and runs every later step when it succeeds. Format, typecheck, 166 unit tests and build pass, and all 289 browser, API and MCP journeys pass on desktop, tablet and mobile.

## 2026-09-11 — UX loop 127: an open library or Today catches up when its window has focus again

The wave 5 Nielsen review kept the library open while an assistant, in a window beside the browser, added 12 cards through MCP. After 75 seconds the library still said "3 cards" and the deck filter did not list the new deck. Focusing the browser window changed nothing; only switching to another tab and back showed the cards, and Today took a minute. Someone watching for their cards saw nothing arrive and might ask the assistant again.

Today and the library now also refresh when their window has focus again, and when the browser restores the page from its back-forward cache, as they already did when their tab came back. One return fires several of these events, and focus also comes back from the browser's own menus, so a return refreshes once and returns refresh at most every 10 seconds; hiding a tab never uses up the refresh its return is owed. The library still keeps no timer, so nothing moves while someone reads.

Validation: format, typecheck, 166 unit tests and build pass. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that adds a card while the library is open and gives its window focus again.

## 2026-09-11 — UX loop 128: Back from a review shows current counts, and the next review counts from them

The wave 5 Nielsen and frontend reviews rated cards, then used the browser's Back button to return to Today. Today kept the counts from before the review for a minute: it said "45 cards to review" with 44 due, and starting again showed "0 of 48". Forward into a deck's review counted "0, 1, 2 of 5" and then said 3 cards were reviewed. Only Leave session and the Today tab reloaded the counts; Back and Forward changed the view without them.

Arriving at Today, the library or a review now reloads the workspace, whether through the tabs, Leave session, Back or Forward, so counts and the deck list are current. A review shows "Loading your cards…" until that reload arrives, so its total counts the cards due now. The first view after a page load uses the workspace it is already loading, and Connections, which shows nothing from it, reloads nothing.

Validation: format, typecheck, 166 unit tests and build pass. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that rates a card, goes Back to Today, checks the count there, and starts the next review from that count.

## 2026-09-11 — UX loop 129: choosing a deck no longer makes the library toolbar jump

The wave 5 design review chose a deck in the library and watched the toolbar row grow from 40 to 56 px, which pushed the search field down 8 px and the results 16 px; on an iPad the row grew from 44 to 60 px. Loop 119 gave the deck's delete control a 40 px square, but Radix pads ghost icon buttons around content-box dimensions, so the square rendered 16 px larger than it was set.

The delete control now keeps its padding inside its square, 40 px or 44 px on touch, so choosing a deck leaves the row's height as it was.

Validation: format, typecheck, 166 unit tests and build pass. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile. The toolbar journey now chooses a deck, checks that the delete control matches the other controls' height and that the row keeps its height, and the delete target journey checks that the target is a square no larger than 44 px.

## 2026-09-11 — UX loop 130: the account avatar stays round and the header tools stay secondary

The wave 5 design review found the sidebar's account avatar squeezed into an ellipse, 23 by 35 px, whenever the email was longer than about 21 characters: the address took the row's width and the circle shrank. On phones and tablets, the theme, help and sign-out tools in the header were still accent blue and competed with the selected tab, although loop 116 had made the same tools in the desktop sidebar secondary.

The avatar keeps its 35 px circle beside any email, and the header tools use the secondary ink on phones and tablets too.

Validation: format, typecheck, 166 unit tests and build pass. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that measures the avatar and compares the visible tools' colour with secondary text.

## 2026-09-11 — UX loop 131: a library tile ends at its tags, with the edit hint beside them

The wave 5 design review measured desktop library tiles with 58 px of empty space below the tags and 27 px above the status. The "Edit card" hint is invisible until hover or keyboard focus, but it still took a 34 px line at the bottom of every tile, so the tiles looked bottom-heavy.

The hint now appears in the tile's bottom corner beside the tags, on hover or keyboard focus as before, and takes no line of its own. The tags wrap before that corner, so the two never overlap, and a tile ends at its tags with only its padding below.

Validation: format, typecheck, 166 unit tests and build pass. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that measures the space below a tile's tags and checks that the hint appears beside them.

## 2026-09-11 — UX loop 132: browser Back closes the dialog in front

Loop 94 let browser Back close the card editor. The wave 5 Nielsen review pressed Back with other dialogs open: with New deck open, Back left the library and lost the typed name, and with "Sign out?" open, Back changed the view underneath the question.

Every dialog now works the same way: New deck, deleting a deck, the confirmations for signing out, deleting a card and revoking a connection, and the question before discarding a draft. An open dialog adds a history entry at the same address, and Back closes only the dialog in front; the discard question takes Back the way it takes Escape, and the draft stays. Dialogs that close by themselves, or together, such as a confirmation and the editor behind it, remove their entries, so the next Back goes where it would have gone.

Validation: format, typecheck, 166 unit tests and build pass. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile, including the editor's Back journey and a new journey that presses Back with New deck and "Sign out?" open, then checks that one more Back returns to Today.

## 2026-09-11 — UX loop 133: editing a card starts in its question

The wave 5 Nielsen review opened a card for editing with the keyboard and a screen reader. Focus landed on the editor's "New deck" button, so Enter or Space started a new deck instead of editing, and a screen reader announced a button before anything about the card. A new card already started in its question; an existing one had no starting point, and Radix focused the first control.

Opening a card for editing now puts the cursor at the end of its question when there is a mouse or keyboard. On a touch screen the editor itself takes focus instead, so the on-screen keyboard does not cover the card before the person chooses a field.

Validation: format, typecheck, 166 unit tests and build pass. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that opens a card for editing and checks where focus and the cursor land.

## 2026-09-11 — UX loop 134: library search takes every character as written, and ß as ss

The wave 5 reviews searched the library with characters the search's folding did not expect. The Nielsen review found that "strasse" did not find "Straße", since ß has no accent to remove. The frontend review found that the database read % and \ in a search as LIKE pattern characters: "%" returned every card, "50%" also matched "500 people", and a card containing C:\Users could not be found.

Card text and search words now both fold ß to ss, and each word must appear in the folded card exactly as written, which the database checks with strpos() instead of a LIKE pattern.

Validation: format, typecheck, 166 unit tests and build pass, including search word tests for ß, % and backslashes. All 308 browser, API and MCP journeys pass on desktop, tablet and mobile, including a new journey that searches for "strasse", "50%" and "c:\users" and finds exactly one card each time.
