import type { Flashcard, RecallRating, ReviewInput, StudyCard } from '@recall/contracts';

/** A card rated in this session that comes back soon, e.g. one minute after "Again". */
export interface ReturningCard {
  id: string;
  dueAt: string;
}
/** Why a rating was not saved: an unsaved rating can be retried; a changed or deleted card needs a reload. */
export type RatingFailureReason = 'unsaved' | 'changed' | 'deleted';
/** A rating the server did not save, and why. */
export interface RatingFailure {
  rating: RecallRating;
  reason: RatingFailureReason;
}
/** What a review has done so far, kept so a reload of the page can continue it. */
export interface SessionProgress {
  completed: number;
  returning: ReturningCard[];
}
export interface StudySnapshot {
  queue: StudyCard[];
  completed: number;
  /** Reviews counted before the page was reloaded, which the cards still due no longer include. */
  completedBeforeReload: number;
  revealed: boolean;
  loading: boolean;
  saving: boolean;
  savingRating: RecallRating | null;
  /** The last card of a batch is saved and counted, and the next batch is still loading. */
  awaitingBatch: boolean;
  error: string;
  returning: ReturningCard[];
  ratingFailure: RatingFailure | null;
}
export interface StudyAttempt {
  cardId: string;
  rating: RecallRating;
  requestId: string;
}
export interface StudyRuntime {
  pending: boolean;
  attempt: StudyAttempt | null;
  generation: number;
}
export interface StudyGateway {
  study(deck?: string): Promise<StudyCard[]>;
  review(id: string, input: ReviewInput): Promise<Flashcard>;
}
export type StudyUpdate = (change: (previous: StudySnapshot) => StudySnapshot) => void;
export interface StudyActionContext {
  gateway: StudyGateway;
  snapshot: StudySnapshot;
  runtime: StudyRuntime;
  update: StudyUpdate;
  newRequestId: () => string;
  now: () => Date;
  deck?: string;
}

/**
 * Start without fabricated cards or counts; a reloaded review continues its own count and returning cards.
 * Example: initialStudySnapshot(readSessionProgress(storage, scope)).
 */
export function initialStudySnapshot(progress: SessionProgress | null = null): StudySnapshot {
  return {
    queue: [],
    completed: progress?.completed ?? 0,
    completedBeforeReload: progress?.completed ?? 0,
    revealed: false,
    loading: true,
    saving: false,
    savingRating: null,
    awaitingBatch: false,
    error: '',
    returning: progress?.returning ?? [],
    ratingFailure: null,
  };
}

/** Reveal only a loaded card. Example: revealStudyAnswer(update). */
export function revealStudyAnswer(update: StudyUpdate): void {
  update((current) =>
    current.loading || !current.queue.length ? current : { ...current, revealed: true },
  );
}

/**
 * How many cards the review covers: the cards due when it started, plus reviews counted before a reload, or more once
 * cards come back. Example: reviewTotal(snapshot, 26).
 */
export function reviewTotal(snapshot: StudySnapshot, expectedTotal: number): number {
  // A last card waiting for the next batch was already counted, so it no longer adds to the total.
  const onScreen = snapshot.awaitingBatch ? 0 : snapshot.queue.length;
  return Math.max(snapshot.completedBeforeReload + expectedTotal, snapshot.completed + onScreen);
}
