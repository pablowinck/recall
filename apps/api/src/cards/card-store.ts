import type { PoolClient } from 'pg';
import type { CardDraft, CardPage, CardUpdate, Flashcard } from '@recall/contracts';
import { RecallError } from '../errors.js';
import { searchWords } from './search-words.js';

export interface CardSearch {
  search: string;
  deck?: string;
  limit: number;
  offset: number;
}

// Search ignores case, accents and Markdown markers, reads tags as well as both sides, and needs every word somewhere
// on the card, so "capital portugal" finds "What is the capital of Portugal?". PostgreSQL's built-in normalize()
// splits accents off their letters, so no extension or migration is needed. Each card is folded once per query, and
// not at all for an empty search; the words arrive folded the same way from searchWords().
const FOLDED_CARD = `cross join lateral (select case when cardinality($1::text[]) = 0 then '' else lower(regexp_replace(normalize(regexp_replace(c.front || ' ' || c.back || ' ' || array_to_string(c.tags, ' '), '[*_\`]', '', 'g'), NFD), '[\\u0300-\\u036f]', '', 'g')) end as text) as folded`;
const CARD_FILTER = `(select coalesce(bool_and(folded.text like '%' || word || '%'), true) from unnest($1::text[]) as word) and ($2::uuid is null or c.deck_id = $2)`;

/** List paginated content under row-level security. Example: listCards(connection, query). */
export async function listCards(connection: PoolClient, query: CardSearch): Promise<CardPage> {
  const values = [searchWords(query.search), query.deck ?? null];
  const count = await connection.query<{ total: number }>(
    `select count(*)::int as total from recall.cards c ${FOLDED_CARD} where ${CARD_FILTER}`,
    values,
  );
  const result = await connection.query<{ card: Flashcard }>(
    `select to_jsonb(c) as card from recall.cards c ${FOLDED_CARD} where ${CARD_FILTER} order by created_at desc, id limit $3 offset $4`,
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
