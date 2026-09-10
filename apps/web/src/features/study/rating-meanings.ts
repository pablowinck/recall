import type { ReviewOption } from '@recall/contracts';

const MEANINGS: Record<number, string> = {
  1: 'You didn’t recall it',
  2: 'You recalled it with effort',
  3: 'You recalled it',
  4: 'You recalled it instantly',
};

/** Say what a rating claims about the recall. Example: ratingMeaning(3). */
export function ratingMeaning(rating: number): string {
  return MEANINGS[rating] ?? '';
}

/** Name a rating in full for assistive tech. Example: describeRating(option). */
export function describeRating(option: ReviewOption): string {
  const meaning = ratingMeaning(option.rating);
  const opening = meaning ? `${option.label}, ${meaning}` : option.label;
  return `${opening}. Next in ${option.interval}`;
}
