import { describe, expect, it } from 'vitest';
import { revealScrollTop } from '../../apps/web/src/features/study/reveal-scroll';

describe('scrolling to a revealed answer', () => {
  it('stays put when the answer already shows', () => {
    expect(revealScrollTop({ answerTop: 320, viewportHeight: 900, scrollY: 0 })).toBeNull();
  });

  it('brings an answer below the fold near the top of the screen', () => {
    expect(revealScrollTop({ answerTop: 900, viewportHeight: 664, scrollY: 0 })).toBe(734);
  });

  it('accounts for how far the page is already scrolled', () => {
    expect(revealScrollTop({ answerTop: 700, viewportHeight: 664, scrollY: 300 })).toBe(834);
  });

  it('never scrolls above the top of the page', () => {
    expect(revealScrollTop({ answerTop: 500, viewportHeight: 600, scrollY: 0 })).toBe(350);
  });
});
