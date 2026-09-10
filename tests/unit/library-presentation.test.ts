import { expect, it } from 'vitest';
import {
  encodeLibraryQuery,
  lastLibraryPage,
} from '../../apps/web/src/features/cards/library-query';
import { describeCardStatus } from '../../apps/web/src/features/cards/card-presentation';
import { initialSchedule } from '../../packages/domain/src/index';

it('clamps the final page when its last card is deleted', () => {
  expect(lastLibraryPage(25)).toBe(1);
  expect(lastLibraryPage(24)).toBe(0);
  expect(lastLibraryPage(0)).toBe(0);
});

it('encodes multilingual searches as values, not query fragments', () => {
  const encoded = encodeLibraryQuery({ search: 'déjà & saudade', deck: '', page: 1 });
  const query = new URLSearchParams(encoded);
  expect(query.get('search')).toBe('déjà & saudade');
  expect(query.get('offset')).toBe('24');
  expect(query.has('deck')).toBe(false);
});

it('keeps paused status ahead of due/new status and distinguishes scheduled cards', () => {
  const now = new Date('2026-09-10T15:00:00Z');
  const card = { due_at: '2026-09-11T15:00:00Z', schedule: initialSchedule(now), suspended: false };
  expect(describeCardStatus(card, now).label).toBe('Scheduled');
  expect(describeCardStatus({ ...card, suspended: true }, now).label).toBe('Paused');
  expect(describeCardStatus({ ...card, schedule: null }, now).label).toBe('New');
  expect(describeCardStatus(card, new Date('2026-09-12T15:00:00Z')).label).toBe('Due for review');
});
