import { describe, expect, it } from 'vitest';
import { frontSizeClass } from '../../apps/web/src/features/study/card-typography';

describe('question size by length', () => {
  it('keeps display size for a short prompt', () => {
    expect(frontSizeClass('Define “candid”')).toBeUndefined();
  });

  it('steps down for a sentence', () => {
    expect(frontSizeClass('Q'.repeat(120))).toBe('is-long');
  });

  it('uses reading size for a paragraph', () => {
    expect(frontSizeClass('Q'.repeat(300))).toBe('is-paragraph');
  });
});
