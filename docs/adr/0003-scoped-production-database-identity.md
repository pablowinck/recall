---
adr: 3
title: Scoped production database identity
status: Proposed
date: 2026-09-10
tags: [security, deployment, database]
---

## Context

The production API needs a database connection through Supabase's transaction pooler. Giving the runtime the project administrator credential would grant unrelated schema and role administration capabilities. The existing application verifies Auth sessions or token hashes before applying tenant claims.

## Decision

Use a dedicated `recall_api_service` role with no inherited permissions, no role administration, no database creation, and no RLS bypass. It may switch to `authenticated` inside the existing transaction boundary. Before that switch, it may read only the tenant identifier, hash, and expiration columns of access tokens, under an explicit server-only SELECT policy. It cannot directly read flashcards.

Migrations create the role without login. Deployment provisioning enables password login with a randomly generated credential stored only in the API's encrypted environment. Schema migration credentials remain separate. Connections to the managed pooler verify TLS certificates.

## Consequences

Compromise of the API still threatens application tenants because it verifies identities and sets their claims. The scoped identity limits that trust to application operations and token authentication instead of all project administration. RLS isolation, role permissions, and token revocation need database integration tests. Credential rotation does not require changing the project's administrator password.

## References

- https://supabase.com/docs/guides/database/postgres/roles
- https://supabase.com/docs/guides/database/connecting-to-postgres
