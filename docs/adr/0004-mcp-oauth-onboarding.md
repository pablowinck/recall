# 0004 — Assistants connect through OAuth, alongside personal tokens

Status: Proposed

## Context

Connecting an assistant today means signing in, creating a personal token in Connections and pasting it into the assistant's configuration. That is the main source of onboarding friction, it puts a long-lived secret into configuration files and sometimes into chats, and it excludes clients that only speak OAuth, such as ChatGPT connectors and claude.ai. The owner wants a zero-friction start: a person copies one line from the landing page into their assistant, which connects to Recall, interviews them and proposes a first deck.

The MCP authorization specification (2025-06-18) makes an HTTP MCP server an OAuth 2.1 protected resource. It publishes RFC 9728 protected resource metadata, answers 401 with a `WWW-Authenticate` header pointing at that metadata, and relies on an authorization server with RFC 8414 metadata and, ideally, RFC 7591 dynamic client registration. Supabase Auth provides such a server — PKCE, dynamic registration, JWT access tokens with a `client_id` claim, and the ES256 signing this project already uses — and leaves the consent screen to the application.

## Decision

- Supabase Auth is the authorization server. `supabase/config.toml` enables `[auth.oauth_server]` with `authorization_url_path = "/oauth/consent"` and dynamic client registration; production enables the same settings in the Supabase dashboard.
- `apps/mcp` serves `GET /.well-known/oauth-protected-resource`, naming its canonical URL as `resource` and the Supabase Auth issuer in `authorization_servers`. Every 401 carries `WWW-Authenticate: Bearer resource_metadata="…"`.
- `apps/web` adds `/oauth/consent`. It signs the person in or up without losing the `authorization_id`, names the client asking for access, and approves or denies through `supabase.auth.oauth`.
- `apps/api` keeps verifying Supabase JWTs with `getUser`, which covers OAuth access tokens, and keeps personal tokens for clients that cannot run OAuth. Row-level security stays the enforcement point for every token.
- `apps/mcp` keeps forwarding the caller's token to the Recall API instead of holding a credential of its own. The MCP server and the API are one first-party resource behind one authorization server, and a service identity would break the boundary that the MCP never holds a database credential or trusts a client-supplied tenant.
- The landing page offers one line that points the assistant to `/start.md`, an onboarding guide versioned in this repository and served with each deploy: connect, interview the person about what they want to learn, propose about fifteen cards, and create them only after the person agrees.

## Consequences

- Connecting becomes one command or one click for OAuth-capable clients, without copying a secret, and ChatGPT and claude.ai become possible.
- Forwarding the client's token departs from the specification's rule against token passthrough. It is accepted because both services are first-party and the API re-validates every token. Tokens currently carry `aud: authenticated`; binding them to the MCP resource with a custom access token hook is a follow-up.
- Production depends on enabling the OAuth server in the Supabase dashboard, which only the owner can do.
- Personal tokens remain for clients without OAuth, and Connections keeps both paths until usage shows tokens can be retired.
- The consent page is a new security-sensitive surface. It needs E2E coverage for a signed-out visitor, approval and denial, and it must never render client-supplied text as markup.
