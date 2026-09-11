export type InlineNode = { kind: 'text' | 'bold' | 'italic' | 'code'; text: string };
export interface ListItem {
  content: InlineNode[];
  children: CardBlock[];
}
export type CardBlock =
  | { kind: 'paragraph'; content: InlineNode[] }
  | { kind: 'list'; ordered: boolean; start: number; items: ListItem[] };

interface ListLine {
  ordered: boolean;
  number: number;
  nested: boolean;
  content: string;
}

// Card text is untrusted content: it is parsed into these nodes and rendered as elements, never as markup.
// The word-boundary guards keep snake_case names and arithmetic like 2*3*4 out of italics.
const INLINE_PATTERN =
  /(`[^`\n]+`|\*\*[^*\n]+\*\*|(?<!\w)\*[^*\n]+\*(?!\w)|(?<!\w)_[^_\n]+_(?!\w))/g;
const LIST_PATTERN = /^(\s*)(?:([-*])|(\d+)[.)])\s+(.*)$/;
// Two spaces or a tab put a list line under the item before it, the way assistants write sub-steps.
const NESTED_INDENT = 2;

/** Read the emphasis in one line of card text. Example: parseInline('a **bold** word'). */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  for (const piece of text.split(INLINE_PATTERN)) {
    if (piece) nodes.push(readInlinePiece(piece));
  }
  return nodes.length ? nodes : [{ kind: 'text', text: '' }];
}

/** Read card text as paragraphs and lists, keeping list numbers and one level of nesting. Example: parseCardMarkup('1. one\n   - detail'). */
export function parseCardMarkup(text: string): CardBlock[] {
  const blocks: CardBlock[] = [];
  let paragraph: string[] = [];
  const closeParagraph = (): void => {
    if (paragraph.length)
      blocks.push({ kind: 'paragraph', content: parseInline(paragraph.join('\n')) });
    paragraph = [];
  };
  for (const line of text.split('\n')) {
    const item = readListLine(line);
    if (!item) {
      if (line.trim()) paragraph.push(line);
      else closeParagraph();
      continue;
    }
    closeParagraph();
    appendListLine(blocks, item);
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

function readListLine(line: string): ListLine | null {
  const match = LIST_PATTERN.exec(line);
  if (!match) return null;
  const [, indent = '', bullet, number, content = ''] = match;
  return {
    ordered: !bullet,
    number: number ? Number(number) : 1,
    nested: indent.replace(/\t/g, '  ').length >= NESTED_INDENT,
    content,
  };
}

// An indented line belongs to the last item of the list above it, so the outer numbering carries on after it.
function appendListLine(blocks: CardBlock[], line: ListLine): void {
  const last = blocks[blocks.length - 1];
  const parent = last?.kind === 'list' ? last.items[last.items.length - 1] : undefined;
  if (line.nested && parent) appendListItem(parent.children, line);
  else appendListItem(blocks, line);
}

function appendListItem(blocks: CardBlock[], line: ListLine): void {
  const last = blocks[blocks.length - 1];
  const item: ListItem = { content: parseInline(line.content), children: [] };
  if (last?.kind === 'list' && last.ordered === line.ordered) {
    last.items.push(item);
    return;
  }
  blocks.push({ kind: 'list', ordered: line.ordered, start: line.number, items: [item] });
}
