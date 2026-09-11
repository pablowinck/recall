import type { PoolClient } from 'pg';
import type { CardDraft, CardPage, CardUpdate, Flashcard } from '@recall/contracts';
import { RecallError } from '../errors.js';

export interface CardSearch {
  search: string;
  deck?: string;
  limit: number;
  offset: number;
}

// Search ignores case and accents and also reads tags, so "saudacao" finds "saudação" and a tag finds its cards.
// PostgreSQL's built-in normalize() splits accents off their letters, so no extension or migration is needed.
const SEARCHABLE_TEXT = "front || ' ' || back || ' ' || array_to_string(tags, ' ')";
const foldForSearch = (sql: string): string =>
  `lower(regexp_replace(normalize(${sql}, NFD), '[\\u0300-\\u036f]', '', 'g'))`;
const CARD_FILTER = `($1 = '' or ${foldForSearch(SEARCHABLE_TEXT)} like '%' || ${foldForSearch('$1')} || '%') and ($2::uuid is null or deck_id = $2)`;

/** List paginated content under row-level security. Example: listCards(connection, query). */
export async function listCards(connection: PoolClient, query: CardSearch): Promise<CardPage> {
  const values = [query.search, query.deck ?? null];
  const count = await connection.query<{ total: number }>(
    `select count(*)::int as total from recall.cards where ${CARD_FILTER}`,
    values,
  );
  const result = await connection.query<{ card: Flashcard }>(
    `select to_jsonb(c) as card from recall.cards c where ${CARD_FILTER} order by created_at desc, id limit $3 offset $4`,
    [...values, query.limit, query.offset],
  );
  return { cards: result.rows.map((row) => row.card), total: count.rows[0]!.total };
}

/** Create a card with source-key deduplication. Example: insertCard(connection, draft). */
export async function insertCard(connection: PoolClient, draft: CardDraft): Promise<Flashcard> {
  const result = await connection.query<{ card: Flashcard }>(
    `insert into recall.cards as c (tenant_id, deck_id, front, back, tags, source_key)
     values (auth.uid(), $1, $2, $3, $4, $5) on conflict (tenant_id, source_key)
     do update set source_key = excluded.source_key returning to_jsonb(c) as card`,
    [draft.deck_id, draft.front, draft.back, draft.tags, draft.source_key ?? null],
  );
  return result.rows[0]!.card;
}

/** Edit only the allowed card fields, refusing a stale version instead of overwriting. Example: updateCard(connection, id, {front:'Hello', version: 3}). */
export async function updateCard(
  connection: PoolClient,
  id: string,
  patch: CardUpdate,
): Promise<Flashcard> {
  const result = await connection.query<{ card: Flashcard }>(
    `update recall.cards c set front=coalesce($2,front), back=coalesce($3,back), tags=coalesce($4,tags),
     deck_id=coalesce($5,deck_id), suspended=coalesce($6,suspended), updated_at=now(), version=version+1
     where id=$1 and ($7::int is null or version=$7) returning to_jsonb(c) as card`,
    [
      id,
      patch.front,
      patch.back,
      patch.tags,
      patch.deck_id,
      patch.suspended,
      patch.version ?? null,
    ],
  );
  if (result.rows[0]) return result.rows[0].card;
  const exists = await connection.query('select 1 from recall.cards where id=$1', [id]);
  if (!exists.rowCount) throw new RecallError(404, 'Card not found.');
  throw new RecallError(409, 'This card changed after you opened it.');
}

/** Delete a card belonging to the authenticated tenant. Example: deleteCard(connection, id). */
export async function deleteCard(
  connection: PoolClient,
  id: string,
): Promise<{ deleted: boolean }> {
  const result = await connection.query('delete from recall.cards where id = $1', [id]);
  if (!result.rowCount) throw new RecallError(404, 'Card not found.');
  return { deleted: true };
}
