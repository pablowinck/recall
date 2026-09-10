import { describe, expect, it } from 'vitest';
import { parseCardMarkup, parseInline, plainCardText } from '../../apps/web/src/lib/card-markup';

describe('emphasis in a line of card text', () => {
  it('reads bold, italic and code', () => {
    expect(parseInline('a **bold** and *soft* `word`')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'bold', text: 'bold' },
      { kind: 'text', text: ' and ' },
      { kind: 'italic', text: 'soft' },
      { kind: 'text', text: ' ' },
      { kind: 'code', text: 'word' },
    ]);
  });

  it('leaves an unmatched marker as text', () => {
    expect(parseInline('2 * 3 = 6')).toEqual([{ kind: 'text', text: '2 * 3 = 6' }]);
  });

  it('keeps markers inside code literal', () => {
    expect(parseInline('`**not bold**`')).toEqual([{ kind: 'code', text: '**not bold**' }]);
  });

  it('strips markers for a plain summary', () => {
    expect(plainCardText('**Compensar**, *contrabalançar*')).toBe('Compensar, contrabalançar');
  });
});

describe('paragraphs and lists in card text', () => {
  it('keeps line breaks inside one paragraph and splits on a blank line', () => {
    expect(parseCardMarkup('First\nSecond\n\nThird')).toEqual([
      { kind: 'paragraph', content: [{ kind: 'text', text: 'First\nSecond' }] },
      { kind: 'paragraph', content: [{ kind: 'text', text: 'Third' }] },
    ]);
  });

  it('groups consecutive bullets into one list', () => {
    const blocks = parseCardMarkup('- one\n- **two**');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ kind: 'list', ordered: false });
  });

  it('keeps a numbered list separate from a bulleted one', () => {
    const blocks = parseCardMarkup('1. first\n2. second\n- loose');
    expect(blocks.map((block) => block.kind === 'list' && block.ordered)).toEqual([true, false]);
  });
});
