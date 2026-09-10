import type { Request, Router } from 'express';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { reviewInputSchema, type Flashcard, type StudyCard } from '@recall/contracts';
import type { TenantRoute } from '../http/tenant-route.js';
import { recordReview, studyQueue } from './review-store.js';

/** Declare the study queue and review endpoints with an injected clock. Example: attachReviewRoutes(router, route, () => new Date()). */
export function attachReviewRoutes(router: Router, route: TenantRoute, clock: () => Date): void {
  router.get(
    '/study',
    route((connection, request) => readStudyQueue(connection, request, clock())),
  );
  router.post(
    '/cards/:id/reviews',
    route((connection, request) => rateCard(connection, request, clock())),
  );
}

function readStudyQueue(connection: PoolClient, request: Request, now: Date): Promise<StudyCard[]> {
  return studyQueue(connection, now, z.uuid().optional().parse(request.query.deck));
}

function rateCard(connection: PoolClient, request: Request, now: Date): Promise<Flashcard> {
  const cardId = z.uuid().parse(request.params.id);
  return recordReview(connection, cardId, reviewInputSchema.parse(request.body), now);
}
