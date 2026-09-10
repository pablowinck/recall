export type InlineNode = { kind: 'text' | 'bold' | 'italic' | 'code'; text: string };
export type CardBlock =
  | { kind: 'paragraph'; content: InlineNode[] }
  | { kind: 'list'; ordered: boolean; items: InlineNode[][] };

// Card text is untrusted content: it is parsed into these nodes and rendered as elements, never as markup.
// The word-boundary guards keep snake_case names and arithmetic like 2*3*4 out of italics.
const INLINE_PATTERN =
  /(`[^`\n]+`|\*\*[^*\n]+\*\*|(?<!\w)\*[^*\n]+\*(?!\w)|(?<!\w)_[^_\n]+_(?!\w))/g;
const BULLET_PATTERN = /^\s*[-*]\s+(.*)$/;
const ORDERED_PATTERN = /^\s*\d+[.)]\s+(.*)$/;

/** Read the emphasis in one line of card text. Example: parseInline('a **bold** word'). */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  for (const piece of text.split(INLINE_PATTERN)) {
    if (piece) nodes.push(readInlinePiece(piece));
  }
  return nodes.length ? nodes : [{ kind: 'text', text: '' }];
}

/** Read card text as paragraphs and lists. Example: parseCardMarkup('- one\n- two'). */
export function parseCardMarkup(text: string): CardBlock[] {
  const blocks: CardBlock[] = [];
  let paragraph: string[] = [];
  const closeParagraph = (): void => {
    if (paragraph.length)
      blocks.push({ kind: 'paragraph', content: parseInline(paragraph.join('\n')) });
    paragraph = [];
  };
  for (const line of text.split('\n')) {
    const item = readListItem(line);
    if (!item) {
      if (line.trim()) paragraph.push(line);
      else closeParagraph();
      continue;
    }
    closeParagraph();
    appendListItem(blocks, item);
  }
  closeParagraph();
  return blocks;
}

/** Drop emphasis markers so a name or summary reads cleanly. Example: plainCardText('**bold**'). */
export function plainCardText(text: string): string {
  return parseInline(text)
    .map((node) => node.text)
    .join('');
}

function readInlinePiece(piece: string): InlineNode {
  if (piece.startsWith('`')) return { kind: 'code', text: piece.slice(1, -1) };
  if (piece.startsWith('**')) return { kind: 'bold', text: piece.slice(2, -2) };
  if (piece.startsWith('*') || piece.startsWith('_'))
    return { kind: 'italic', text: piece.slice(1, -1) };
  return { kind: 'text', text: piece };
}

function readListItem(line: string): { ordered: boolean; content: string } | null {
  const bullet = BULLET_PATTERN.exec(line);
  if (bullet) return { ordered: false, content: bullet[1] ?? '' };
  const ordered = ORDERED_PATTERN.exec(line);
  return ordered ? { ordered: true, content: ordered[1] ?? '' } : null;
}

function appendListItem(blocks: CardBlock[], item: { ordered: boolean; content: string }): void {
  const last = blocks[blocks.length - 1];
  if (last?.kind === 'list' && last.ordered === item.ordered) {
    last.items.push(parseInline(item.content));
    return;
  }
  blocks.push({ kind: 'list', ordered: item.ordered, items: [parseInline(item.content)] });
}
