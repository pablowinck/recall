import type { Flashcard, RecallRating, ReviewInput, StudyCard } from '@recall/contracts';

/** A card rated in this session that comes back soon, e.g. one minute after "Again". */
export interface ReturningCard {
  id: string;
  dueAt: string;
}
/** A rating the server did not save; a version conflict needs a reload instead of a retry. */
export interface RatingFailure {
  rating: RecallRating;
  conflict: boolean;
}
export interface StudySnapshot {
  queue: StudyCard[];
  completed: number;
  revealed: boolean;
  loading: boolean;
  saving: boolean;
  refilling: boolean;
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
    refilling: false,
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
