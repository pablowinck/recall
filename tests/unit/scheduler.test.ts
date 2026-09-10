import { describe, expect, it } from 'vitest';
import {
  applyRating,
  initialSchedule,
  previewSchedule,
  formatInterval,
} from '../../packages/domain/src/index';
import { countStreak } from '../../apps/api/src/workspace/workspace-store';

const now = new Date('2026-09-10T15:00:00Z');

describe('FSRS scheduling', () => {
  it('starts new cards without manufactured review history', () => {
    const initial = initialSchedule(now);
    expect(initial.reps).toBe(0);
    expect(initial.state).toBe(0);
    expect(initial.due).toBe(now.toISOString());
  });
  it('schedules successful recall later than a forgotten card', () => {
    const forgotten = applyRating(null, 1, now);
    const easy = applyRating(null, 4, now);
    expect(new Date(easy.due).getTime()).toBeGreaterThan(new Date(forgotten.due).getTime());
    expect(easy.reps).toBe(1);
    expect(forgotten.reps).toBe(1);
  });
  it('round-trips stored state and advances a real second review', () => {
    const first = applyRating(null, 3, now);
    const second = applyRating(JSON.parse(JSON.stringify(first)), 3, new Date(first.due));
    expect(second.reps).toBe(2);
    expect(new Date(second.due).getTime()).toBeGreaterThan(new Date(first.due).getTime());
  });
  it('uses the same scheduling calculation for previews and writes', () => {
    for (const preview of previewSchedule(null, now))
      expect(preview.due_at).toBe(applyRating(null, preview.rating, now).due);
  });
  it('formats a useful minute, hour or day label', () => {
    const day = 1440 * 60000;
    expect(formatInterval(0)).toBe('1 min');
    expect(formatInterval(59 * 60000)).toBe('59 min');
    expect(formatInterval(60 * 60000)).toBe('1 hr');
    expect(formatInterval(day)).toBe('1 day');
    expect(formatInterval(8 * day)).toBe('8 days');
    expect(formatInterval(45 * day)).toBe('1.5 mo');
    expect(formatInterval(120 * day)).toBe('4 mo');
    expect(formatInterval(365 * day)).toBe('1 yr');
    expect(formatInterval(548 * day)).toBe('1.5 yr');
  });
});

describe('study streak with São Paulo calendar boundaries', () => {
  it('allows today or yesterday as the latest day', () => {
    expect(countStreak(['2026-09-10', '2026-09-09'], now)).toBe(2);
    expect(countStreak(['2026-09-09', '2026-09-08'], now)).toBe(2);
  });
  it('does not count a broken streak or empty history', () => {
    expect(countStreak(['2026-09-08'], now)).toBe(0);
    expect(countStreak([], now)).toBe(0);
  });
});
