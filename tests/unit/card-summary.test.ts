import { describe, expect, it } from 'vitest';
import { summarizeFront } from '../../apps/web/src/features/cards/card-presentation';

describe('the question a card announces', () => {
  it('keeps a short question as it is', () => {
    expect(summarizeFront('Define “candid”')).toBe('Define “candid”');
  });

  it('collapses the line breaks of a written-out prompt', () => {
    expect(summarizeFront('First line\n\nSecond line')).toBe('First line Second line');
  });

  it('stops a long prompt at the limit', () => {
    const summary = summarizeFront('word '.repeat(40));
    expect(summary).toHaveLength(80);
    expect(summary.endsWith('…')).toBe(true);
  });
});
