import type { PoolClient } from 'pg';
import type { Deck, DeckRemoval, Workspace, WorkspaceStats } from '@recall/contracts';
import { RecallError } from '../errors.js';

/** Return decks and actual study statistics. Example: readWorkspace(connection). */
export async function readWorkspace(connection: PoolClient): Promise<Workspace> {
  const decks = await connection.query<Deck>(`select d.id, d.name, count(c.id)::int as card_count,
    count(c.id) filter(where c.due_at <= now() and not c.suspended)::int as due_count
    from recall.decks d left join recall.cards c on c.deck_id=d.id group by d.id order by d.created_at`);
  const stats = await readStats(connection);
  return { decks: decks.rows, stats };
}

async function readStats(connection: PoolClient): Promise<WorkspaceStats> {
  const result = await connection.query<WorkspaceStats>(`select count(*)::int as total,
    count(*) filter(where due_at <= now() and not suspended)::int as due,
    count(*) filter(where schedule is null and not suspended)::int as fresh,
    (select count(*)::int from recall.reviews where reviewed_at >= date_trunc('day',now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as reviewed_today,
    0::int as streak from recall.cards`);
  const stats = result.rows[0]!;
  const days = await connection.query<{ day: string }>(
    `select distinct (reviewed_at at time zone 'America/Sao_Paulo')::date::text as day from recall.reviews order by day desc limit 366`,
  );
  return {
    ...stats,
    streak: countStreak(
      days.rows.map((row) => row.day),
      new Date(),
    ),
  };
}

/** Count consecutive study days ending today or yesterday. Example: countStreak(['2026-09-10'], now). */
export function countStreak(days: string[], now: Date): number {
  const localDay = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  let cursor = new Date(`${localDay}T12:00:00Z`);
  if (days[0] !== localDay) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  for (const day of days) {
    if (day !== cursor.toISOString().slice(0, 10)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Create a deck in the authenticated tenant. Example: createDeck(connection, 'Travel'). */
export async function createDeck(connection: PoolClient, name: string): Promise<Deck> {
  const result = await connection.query<Deck>(
    `insert into recall.decks (tenant_id,name) values (auth.uid(),$1)
    returning id,name,0::int as card_count,0::int as due_count`,
    [name],
  );
  return result.rows[0]!;
}

/**
 * Delete a deck after its cards are moved or deleted, inside the caller's transaction.
 * Example: deleteDeck(connection, id, { cards: 'delete' }).
 */
export async function deleteDeck(
  connection: PoolClient,
  id: string,
  removal: DeckRemoval,
): Promise<{ deleted: boolean }> {
  const owned = await connection.query('select 1 from recall.decks where id = $1', [id]);
  if (!owned.rowCount) throw new RecallError(404, 'Deck not found.');
  await refuseLastDeck(connection);
  if (removal.cards === 'move') await moveDeckCards(connection, id, removal.target);
  else await connection.query('delete from recall.cards where deck_id = $1', [id]);
  const result = await connection.query('delete from recall.decks where id = $1', [id]);
  if (!result.rowCount) throw new RecallError(404, 'Deck not found.');
  return { deleted: true };
}

// Every tenant keeps somewhere to put a card; without it the editor would open with no deck to choose.
async function refuseLastDeck(connection: PoolClient): Promise<void> {
  const decks = await connection.query<{ count: number }>(
    'select count(*)::int as count from recall.decks',
  );
  if ((decks.rows[0]?.count ?? 0) > 1) return;
  throw new RecallError(422, 'This is your only deck. Create another one first.');
}

async function moveDeckCards(connection: PoolClient, id: string, target: string): Promise<void> {
  if (id === target) throw new RecallError(422, 'Choose a different deck for the cards.');
  const destination = await connection.query('select 1 from recall.decks where id = $1', [target]);
  if (!destination.rowCount) throw new RecallError(404, 'Deck not found.');
  await connection.query(
    'update recall.cards set deck_id = $2, updated_at = now() where deck_id = $1',
    [id, target],
  );
}
