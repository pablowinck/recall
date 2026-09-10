import type { PoolClient } from 'pg';
import type { Deck, Workspace, WorkspaceStats } from '@recall/contracts';

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
