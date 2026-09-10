import type { PoolClient } from 'pg';
import type { CardDraft, CardPage, CardPatch, Flashcard } from '@recall/contracts';
import { RecallError } from '../errors';

export interface CardSearch {
  search: string;
  deck?: string;
  limit: number;
  offset: number;
}

/** List paginated content under row-level security. Example: listCards(connection, query). */
export async function listCards(connection: PoolClient, query: CardSearch): Promise<CardPage> {
  const filter =
    "($1 = '' or front ilike '%' || $1 || '%' or back ilike '%' || $1 || '%') and ($2::uuid is null or deck_id = $2)";
  const values = [query.search, query.deck ?? null];
  const count = await connection.query<{ total: number }>(
    `select count(*)::int as total from recall.cards where ${filter}`,
    values,
  );
  const result = await connection.query<{ card: Flashcard }>(
    `select to_jsonb(c) as card from recall.cards c where ${filter} order by created_at desc, id limit $3 offset $4`,
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

/** Edit only the allowed card fields. Example: updateCard(connection, id, {front:'Hello'}). */
export async function updateCard(
  connection: PoolClient,
  id: string,
  patch: CardPatch,
): Promise<Flashcard> {
  const result = await connection.query<{ card: Flashcard }>(
    `update recall.cards c set front=coalesce($2,front), back=coalesce($3,back), tags=coalesce($4,tags),
     deck_id=coalesce($5,deck_id), suspended=coalesce($6,suspended), updated_at=now(), version=version+1
     where id=$1 returning to_jsonb(c) as card`,
    [id, patch.front, patch.back, patch.tags, patch.deck_id, patch.suspended],
  );
  if (!result.rows[0]) throw new RecallError(404, 'Card not found.');
  return result.rows[0].card;
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
