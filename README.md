# Recall

A quiet place to remember. Open-source flashcards with spaced repetition, a responsive study interface, and an authenticated MCP server for your agents.

Learn any language or subject. The interface and contributor documentation are in English, with no i18n layer. Flashcards can contain Portuguese, Italian, French, or any other Unicode text.

Recall ships with 64 original English-learning cards covering vocabulary, past tense, future constructions, and contractions such as **I'd**. The starter import uses MCP and stable source keys, so running it twice does not duplicate cards or overwrite review history.

## What works

- Personal accounts with Supabase Auth and one private tenant per user.
- Create, edit, search, paginate, and delete flashcards; organize them into decks.
- FSRS scheduling with Again / Hard / Good / Easy previews and persistent review history.
- Atomic, idempotent reviews with optimistic concurrency control.
- Desktop, tablet and mobile interfaces; light/dark appearance and keyboard study controls.
- Scoped personal MCP tokens, stored as hashes, expiring after 90 days and revocable immediately.
- Real local end-to-end tests across web, API, MCP, Supabase Auth and PostgreSQL RLS.

## Run locally

Requirements: Node.js 24, pnpm 10.26, Docker with Compose. On Windows, use Ubuntu WSL with Docker integration.

```bash
pnpm install --frozen-lockfile
pnpm local:up
```

The setup starts the official Supabase local stack, applies migrations, builds the three application containers, creates a local account and imports the 64 cards through MCP.

| Service             | URL                          |
| ------------------- | ---------------------------- |
| Web                 | http://localhost:3210        |
| API                 | http://localhost:3211/health |
| MCP Streamable HTTP | http://localhost:3212/mcp    |
| Supabase Auth       | http://127.0.0.1:56321       |
| Local email inbox   | http://127.0.0.1:56324       |

The generated local login is in `.local/account.json`. This file, all tokens and environment files are ignored by Git. These credentials are **only for local development**. Never copy local Supabase keys into production.

Stop application containers and Supabase while preserving data:

```bash
pnpm local:down
```

For hot reload after local setup, stop just the app containers and run:

```bash
docker compose down
set -a
source .env
set +a
pnpm dev
```

## Verify

With the local stack running:

```bash
pnpm exec playwright install --with-deps chromium
pnpm verify
```

`verify` checks formatting, TypeScript, unit tests, builds and functional end-to-end tests. E2E tests create isolated disposable local accounts and clean them up. They never assign ratings to the starter account's cards.

## Navigate the repository

```text
apps/web/          Next.js, Radix Themes, CSS, feature-oriented UI
apps/api/          Express, verified identity, scoped Postgres transactions
apps/mcp/          MCP tools, Streamable HTTP and stdio transports
packages/contracts/  Zod inputs and shared TypeScript contracts
packages/domain/     FSRS adapter and interval formatting
packages/client/     Authenticated HTTP client shared by web and MCP
supabase/migrations/ Versioned schema and RLS policies
tests/unit/          Domain, contracts and client tests with named fakes
tests/e2e/           Functional flows and cross-tenant regression tests
docs/adr/            Architecture decisions and their status
```

Start with [the architecture map](docs/architecture.md), [API/MCP contracts](docs/api.md), and [the iteration log](docs/iterations.md). Contribution instructions are in [CONTRIBUTING.md](CONTRIBUTING.md). Agents should read [AGENTS.md](AGENTS.md) before changing code.

## Connect your agent

Create a personal connection in the web app's **Connections** view. Use the shown MCP URL with its Bearer token. For Codex and the local development setup, see [docs/mcp.md](docs/mcp.md).

## Deploy

Deploy `apps/web`, `apps/api` and `apps/mcp` as three Vercel projects backed by a managed Supabase project. See [the deployment guide](docs/deployment.md) for exact environment ownership and verification.

The code contains deployment configuration; a successful local test does not mean a production deployment exists. Consult [the iteration log](docs/iterations.md) for verified delivery state.

## License

MIT. See [LICENSE](LICENSE). FSRS is provided by [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs); UI primitives by [Radix Themes](https://www.radix-ui.com/themes); authentication/database by [Supabase](https://supabase.com).
