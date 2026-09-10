import { describe, expect, it } from 'vitest';
import type { RecallRating, ReviewOption } from '../../packages/contracts/src/index';
import { describeRating, ratingMeaning } from '../../apps/web/src/features/study/rating-meanings';

function option(rating: RecallRating, label: string, interval: string): ReviewOption {
  return { rating, label, interval, due_at: '2026-09-10T12:10:00Z' };
}

describe('what a rating says', () => {
  it('explains the four ratings', () => {
    expect(ratingMeaning(1)).toBe('You didn’t recall it');
    expect(ratingMeaning(4)).toBe('You recalled it instantly');
  });

  it('reads a rating with its meaning and its next interval', () => {
    expect(describeRating(option(3, 'Good', '10 min'))).toBe(
      'Good, You recalled it. Next in 10 min',
    );
  });

  it('keeps a rating readable when no meaning is known', () => {
    expect(ratingMeaning(9)).toBe('');
    expect(describeRating({ ...option(4, 'Later', '1 yr'), rating: 9 as RecallRating })).toBe(
      'Later. Next in 1 yr',
    );
  });
});
