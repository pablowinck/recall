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
export interface StudySnapshot {
  queue: StudyCard[];
  completed: number;
  revealed: boolean;
  loading: boolean;
  saving: boolean;
  savingRating: RecallRating | null;
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

/** Start without fabricated cards or review counts. Example: initialStudySnapshot(). */
export function initialStudySnapshot(): StudySnapshot {
  return {
    queue: [],
    completed: 0,
    revealed: false,
    loading: true,
    saving: false,
    savingRating: null,
    error: '',
    returning: [],
    ratingFailure: null,
  };
}

/** Reveal only a loaded card. Example: revealStudyAnswer(update). */
export function revealStudyAnswer(update: StudyUpdate): void {
  update((current) =>
    current.loading || !current.queue.length ? current : { ...current, revealed: true },
  );
}
