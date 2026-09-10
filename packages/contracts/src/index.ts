import { z } from 'zod';

const tagsSchema = z.array(z.string().trim().min(1).max(40)).max(12);

export const cardDraftSchema = z.object({
  deck_id: z.uuid(),
  front: z.string().trim().min(1).max(4000),
  back: z.string().trim().min(1).max(8000),
  tags: tagsSchema.default([]),
  source_key: z.string().min(1).max(160).optional(),
});
export const cardPatchSchema = cardDraftSchema
  .omit({ source_key: true, tags: true })
  .partial()
  .extend({ tags: tagsSchema.optional(), suspended: z.boolean().optional() });
export const reviewInputSchema = z.object({
  rating: z.number().int().min(1).max(4),
  version: z.number().int().min(0),
  request_id: z.uuid(),
});
export const deckDraftSchema = z.object({ name: z.string().trim().min(1).max(80) });
export const importCardsSchema = z.object({ cards: z.array(cardDraftSchema).min(1).max(100) });
export const tokenDraftSchema = z.object({ name: z.string().trim().min(1).max(80) });

export type CardDraft = z.infer<typeof cardDraftSchema>;
export type CardPatch = z.infer<typeof cardPatchSchema>;
export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type RecallRating = 1 | 2 | 3 | 4;

export interface StoredSchedule {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  learning_steps: number;
  last_review?: string;
}
export interface Flashcard {
  id: string;
  tenant_id: string;
  deck_id: string;
  front: string;
  back: string;
  tags: string[];
  source_key: string | null;
  due_at: string;
  schedule: StoredSchedule | null;
  version: number;
  suspended: boolean;
  created_at: string;
  updated_at: string;
}
export interface Deck {
  id: string;
  name: string;
  card_count: number;
  due_count: number;
}
export interface WorkspaceStats {
  total: number;
  due: number;
  fresh: number;
  reviewed_today: number;
  streak: number;
}
export interface Workspace {
  decks: Deck[];
  stats: WorkspaceStats;
}
export interface ReviewOption {
  rating: RecallRating;
  label: string;
  interval: string;
  due_at: string;
}
export interface StudyCard {
  card: Flashcard;
  options: ReviewOption[];
}
export interface AccessToken {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  expires_at: string;
}
export interface CreatedToken extends AccessToken {
  token: string;
}
export interface CardPage {
  cards: Flashcard[];
  total: number;
}
