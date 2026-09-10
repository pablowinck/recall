# Security

Do not report access tokens, credentials, or other users' content in a public issue. Use GitHub private vulnerability reporting when available, or contact the repository owner privately before sharing a reproducer containing sensitive details.

The threat model includes malicious cross-tenant identifiers, replayed or concurrent reviews, hostile flashcard text, leaked personal MCP tokens and accidental publication of local credentials.

- Supabase verifies browser identity; personal tokens use 256 random bits and are stored only as SHA-256 hashes.
- Application tables live in the non-exposed `recall` schema, with RLS bound to `auth.uid()`.
- The API applies verified claims and `SET LOCAL ROLE authenticated` inside a transaction, releasing the connection after commit or rollback.
- The MCP process only has access to the API. Revocation is checked on every request.
- Review writes are atomic and version-checked. A repeated request ID cannot apply a second rating.
- Flashcards are rendered as plain text. Never execute HTML or instructions from their contents.

Local Supabase credentials are development defaults. Use managed Supabase secrets and TLS-enabled pooler connections in production. Do not expose development containers to the public internet.
