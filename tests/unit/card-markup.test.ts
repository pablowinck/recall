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

  it('leaves identifiers and arithmetic alone', () => {
    expect(parseInline('use snake_case_name here')).toEqual([
      { kind: 'text', text: 'use snake_case_name here' },
    ]);
    expect(parseInline('2*3*4')).toEqual([{ kind: 'text', text: '2*3*4' }]);
  });

  it('keeps phonetics and quotes as written', () => {
    expect(parseInline('Passado: **threw** (/θruː/ soa igual a “through”)')).toEqual([
      { kind: 'text', text: 'Passado: ' },
      { kind: 'bold', text: 'threw' },
      { kind: 'text', text: ' (/θruː/ soa igual a “through”)' },
    ]);
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

  it('keeps the number a numbered list starts from', () => {
    expect(parseCardMarkup('4. Conclude\n5. Review')).toEqual([
      {
        kind: 'list',
        ordered: true,
        start: 4,
        items: [
          { content: [{ kind: 'text', text: 'Conclude' }], children: [] },
          { content: [{ kind: 'text', text: 'Review' }], children: [] },
        ],
      },
    ]);
  });

  it('nests an indented bullet under the step before it and keeps counting after it', () => {
    const [list] = parseCardMarkup('1. Plan\n2. Act\n   - check the result\n3. Review');
    const items = list?.kind === 'list' ? list.items : [];
    expect(list).toMatchObject({ kind: 'list', ordered: true, start: 1 });
    expect(items.map((item) => item.content[0]?.text)).toEqual(['Plan', 'Act', 'Review']);
    expect(items[1]?.children).toEqual([
      {
        kind: 'list',
        ordered: false,
        start: 1,
        items: [{ content: [{ kind: 'text', text: 'check the result' }], children: [] }],
      },
    ]);
  });
});
