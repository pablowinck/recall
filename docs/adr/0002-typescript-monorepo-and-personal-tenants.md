---
adr: 2
title: TypeScript monorepo, row-level security, and FSRS
status: Proposed
date: 2026-09-10
tags: [architecture, security, scheduling]
---

## Context

Recall needs private flashcards, spaced reviews, and MCP tools, with independent deployment of three apps on Vercel. Humans and LLMs must be able to navigate the code easily. Learning content can use any language or subject.

## Decision

Use pnpm/Turborepo with apps/web (Next.js and Radix Themes), apps/api (Express 5), and apps/mcp (the stable TypeScript MCP SDK over Express). Share Zod contracts, an HTTP client, and the FSRS domain adapter through packages. MCP calls the API; only the API accesses application data.

Use Supabase Auth and PostgreSQL. Each user receives a personal tenant; shared workspaces are outside the initial scope. All content operations execute in a transaction with the authenticated role and verified user claims, subject to RLS. A client-provided tenant identifier is never trusted. Random MCP tokens are hashed, expire, and can be revoked. Only the token authentication lookup occurs outside the RLS transaction.

Use ts-fsrs behind a domain adapter, with previews and scheduling calculated on the server. Record the review, version, and FSRS state atomically. A request ID makes retries idempotent, while the expected version prevents conflicting ratings against the same state.

Run local Supabase through its official CLI and the three apps through Docker Compose. Local functional tests use the actual schema, authentication, and MCP protocol. Production uses managed Supabase and three Vercel projects. Never publish local credentials.

## Consequences

One language and shared contracts reduce divergence. Radix supplies accessible primitives; product CSS controls appearance. The API requires a Supabase PostgreSQL pooler URL in addition to public Auth configuration. Stateless MCP works in serverless environments without in-memory sessions. Shared organizations would require another ADR and an explicit policy migration.

This record was translated into English at the owner's request. Its architecture and approval status are unchanged.

## References

- https://github.com/open-spaced-repetition/ts-fsrs
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
- https://vercel.com/docs/frameworks/backend/express
