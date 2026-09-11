# Recall web

Next.js App Router with Radix Themes and plain CSS. `app/page.tsx` is the static landing page (`features/marketing`): it renders without Radix Themes and styles itself from product tokens only. `app/(product)/layout.tsx` loads Radix Themes and the product stylesheets for every route inside the group, so none of it reaches the landing page. `app/(product)/app/[[...view]]/page.tsx` renders `features/workspace/recall-workspace.tsx`, which shows sign-in or the signed-in workspace; every view has its own address under `/app` (`features/workspace/workspace-url.ts`), so Back and Forward move between views instead of leaving the app. Assistants that connect through OAuth ask for access at `app/(product)/oauth/consent/page.tsx` (`features/auth/oauth-consent-screen.tsx`).

## Where things live

| Path                  | Owns                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `app/`                | Document shell, metadata and `globals.css`, the ordered stylesheet entry.                   |
| `styles/`             | Design tokens (`tokens.css`) and element-level base rules (`base.css`).                     |
| `components/`         | Small shared UI (brand, feedback, confirmation, page heading, theme) and its CSS.           |
| `features/<feature>/` | One feature: components (`*.tsx`), state hooks (`use-*.ts`), pure helpers, `<feature>.css`. |
| `lib/`                | Shared hooks and helpers: session, async actions, remote resources, appearance.             |

Features: `auth` (sign in and sign up), `workspace` (shell, navigation, Today), `cards` (library, card editor, decks), `study` (review session), `connections` (personal MCP tokens), `marketing` (the public landing page). Only `workspace` composes other features; features never import each other's internals, and code two features need moves to `lib/` or `components/`.

## Conventions

- Talk to the API only through `@recall/client`; the web never queries application tables.
- Render card text as text. It is untrusted user content in any language.
- Use tokens from `styles/tokens.css` instead of hard-coded colors, and add new stylesheets to `app/globals.css`.
- Keep pure logic in `.ts` files with unit tests in `tests/unit`; keep hooks for state and `.tsx` for presentation.
- E2E tests locate elements by accessible names. Update `tests/e2e` in the same change when you rename a button or heading.
- Browser journeys are grouped by feature: `cards.spec.ts`, `study.spec.ts`, `connections.spec.ts`, `touch-layout.spec.ts`, and `product.spec.ts` for the cross-feature journey. A new spec file runs on desktop, tablet and mobile once it is listed in `browserJourneys` in `playwright.config.ts`.
