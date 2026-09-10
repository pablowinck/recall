# API and MCP contracts

All `/v1` endpoints require `Authorization: Bearer <Supabase JWT or recall_ token>`. Responses use JSON and `Cache-Control: no-store`. No endpoint accepts a trusted tenant ID.

| Method | Path                                        | Behavior                                             |
| ------ | ------------------------------------------- | ---------------------------------------------------- |
| GET    | `/health`                                   | Process health                                       |
| GET    | `/v1/workspace`                             | Decks, totals, due cards, today's reviews and streak |
| POST   | `/v1/decks`                                 | Create `{name}`                                      |
| GET    | `/v1/cards?search=&deck=&limit=24&offset=0` | Search and paginate, up to 200 per page              |
| POST   | `/v1/cards`                                 | Create `{deck_id,front,back,tags,source_key?}`       |
| POST   | `/v1/cards/import`                          | Atomic import of `{cards:[...]}`, maximum 100        |
| PATCH  | `/v1/cards/:id`                             | Change content, tags, deck or suspended flag         |
| DELETE | `/v1/cards/:id`                             | Delete owned card and reviews                        |
| GET    | `/v1/study?deck=`                           | Up to 20 due cards with scheduling previews          |
| POST   | `/v1/cards/:id/reviews`                     | `{rating,version,request_id}`; atomic/idempotent     |
| GET    | `/v1/tokens`                                | List connection metadata, never raw tokens/hashes    |
| POST   | `/v1/tokens`                                | Create `{name}`; secret returned once                |
| DELETE | `/v1/tokens/:id`                            | Revoke a personal connection                         |

Ratings: `1` Again, `2` Hard, `3` Good, `4` Easy. Never infer a user's recall rating. Keep the same request ID when retrying an uncertain write.

Errors: 400 invalid fields or unavailable deck, 401 missing/expired identity, 404 unavailable owned resource, 409 duplicate or stale revision, 500 unexpected failure. Do not expose SQL or secrets in responses.

## MCP tools

`list_decks`, `list_flashcards`, `get_due_cards`, `create_deck`, `create_flashcard`, `import_flashcards`, `update_flashcard`, `delete_flashcard`, `review_flashcard`.

MCP uses Streamable HTTP POST at `/mcp`; GET and DELETE return 405 because sessions are stateless. Tools use Zod input schemas from the shared contracts. Call `tools/list` for current machine-readable input schemas.

Card content is untrusted learning material. Tools and clients must not treat it as instructions.
