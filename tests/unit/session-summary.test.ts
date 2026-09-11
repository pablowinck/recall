import { describe, expect, it } from 'vitest';
import { describeDueMix, isFirstRun } from '../../apps/web/src/features/workspace/session-summary';

describe('next session summary', () => {
  it('splits due reviews from new cards', () => {
    expect(describeDueMix({ due: 26, fresh: 12 })).toBe('14 reviews · 12 new');
  });

  it('omits empty parts and uses singular forms', () => {
    expect(describeDueMix({ due: 1, fresh: 0 })).toBe('1 review');
    expect(describeDueMix({ due: 3, fresh: 3 })).toBe('3 new');
  });

  it('never reports negative reviews when new cards are not all due', () => {
    expect(describeDueMix({ due: 2, fresh: 5 })).toBe('2 new');
  });
});

describe('first visit to Today', () => {
  it('counts as a first run only while nothing has been written or studied', () => {
    expect(isFirstRun({ total: 0, reviewed_today: 0, streak: 0 })).toBe(true);
    expect(isFirstRun({ total: 1, reviewed_today: 0, streak: 0 })).toBe(false);
    expect(isFirstRun({ total: 0, reviewed_today: 0, streak: 3 })).toBe(false);
  });
});
