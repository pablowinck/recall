import type { PoolClient } from 'pg';
import type { Flashcard, ReviewInput, RecallRating, StudyCard } from '@recall/contracts';
import { applyRating, previewSchedule } from '@recall/domain';
import { RecallError } from '../errors.js';

/** Load only due cards, excluding paused cards. Example: studyQueue(connection, now). */
export async function studyQueue(
  connection: PoolClient,
  now: Date,
  deck?: string,
): Promise<StudyCard[]> {
  const result = await connection.query<{ card: Flashcard }>(
    `select to_jsonb(c) as card from recall.cards c
    where not suspended and due_at <= $1 and ($2::uuid is null or deck_id=$2)
    order by due_at,id limit 20`,
    [now.toISOString(), deck ?? null],
  );
  return result.rows.map(({ card }) => ({ card, options: previewSchedule(card.schedule, now) }));
}

/** Commit the rating and schedule atomically. Example: recordReview(connection, id, input, now). */
export async function recordReview(
  connection: PoolClient,
  cardId: string,
  input: ReviewInput,
  now: Date,
): Promise<Flashcard> {
  const locked = await connection.query<{ card: Flashcard }>(
    'select to_jsonb(c) as card from recall.cards c where id=$1 for update',
    [cardId],
  );
  const current = locked.rows[0]?.card;
  if (!current) throw new RecallError(404, 'Card not found.');
  const prior = await connection.query<{ result: Flashcard; card_id: string; rating: number }>(
    'select result,card_id,rating from recall.reviews where id=$1',
    [input.request_id],
  );
  if (prior.rows[0]) return readPriorReview(prior.rows[0], cardId, input.rating);
  if (current.version !== input.version)
    throw new RecallError(409, 'This card has changed. Refresh the session before reviewing it.');
  if (current.suspended) throw new RecallError(409, 'This card is paused.');
  return saveScheduledReview(connection, current, input, now);
}

function readPriorReview(
  prior: { result: Flashcard; card_id: string; rating: number },
  cardId: string,
  rating: number,
): Flashcard {
  if (prior.card_id !== cardId || prior.rating !== rating) {
    throw new RecallError(409, 'This review identifier was already used for a different rating.');
  }
  return prior.result;
}

async function saveScheduledReview(
  connection: PoolClient,
  card: Flashcard,
  input: ReviewInput,
  now: Date,
): Promise<Flashcard> {
  const schedule = applyRating(card.schedule, input.rating as RecallRating, now);
  const updated = await connection.query<{ card: Flashcard }>(
    `update recall.cards c set schedule=$2,
    due_at=$3,version=version+1,updated_at=$4 where id=$1 returning to_jsonb(c) as card`,
    [card.id, schedule, schedule.due, now.toISOString()],
  );
  const result = updated.rows[0]!.card;
  await connection.query(
    `insert into recall.reviews (id,tenant_id,card_id,rating,previous_version,result,reviewed_at)
    values ($1,auth.uid(),$2,$3,$4,$5,$6)`,
    [input.request_id, card.id, input.rating, input.version, result, now.toISOString()],
  );
  return result;
}
