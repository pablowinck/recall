import type { Request, Router } from 'express';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import {
  cardDraftSchema,
  cardPatchSchema,
  importCardsSchema,
  type CardPage,
  type Flashcard,
} from '@recall/contracts';
import type { TenantRoute } from '../http/tenant-route.js';
import { deleteCard, insertCard, listCards, updateCard } from './card-store.js';

const cardSearchSchema = z.object({
  search: z.string().max(200).default(''),
  deck: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

/** Declare card search, authoring and import endpoints. Example: attachCardRoutes(router, route). */
export function attachCardRoutes(router: Router, route: TenantRoute): void {
  router.get('/cards', route(searchCards));
  router.post('/cards', route(createCard));
  router.post('/cards/import', route(importCards));
  router.patch('/cards/:id', route(editCard));
  router.delete('/cards/:id', route(removeCard));
}

function searchCards(connection: PoolClient, request: Request): Promise<CardPage> {
  return listCards(connection, cardSearchSchema.parse(request.query));
}

function createCard(connection: PoolClient, request: Request): Promise<Flashcard> {
  return insertCard(connection, cardDraftSchema.parse(request.body));
}

async function importCards(
  connection: PoolClient,
  request: Request,
): Promise<{ cards: Flashcard[]; count: number }> {
  const { cards } = importCardsSchema.parse(request.body);
  const imported: Flashcard[] = [];
  for (const card of cards) imported.push(await insertCard(connection, card));
  return { cards: imported, count: imported.length };
}

function editCard(connection: PoolClient, request: Request): Promise<Flashcard> {
  const id = z.uuid().parse(request.params.id);
  return updateCard(connection, id, cardPatchSchema.parse(request.body));
}

function removeCard(connection: PoolClient, request: Request): Promise<{ deleted: boolean }> {
  return deleteCard(connection, z.uuid().parse(request.params.id));
}
