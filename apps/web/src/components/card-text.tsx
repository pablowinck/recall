import { parseCardMarkup, parseInline, type CardBlock, type InlineNode } from '@/lib/card-markup';

/** Render card text inline, with its emphasis. Example: <CardInline text={card.front} />. */
export function CardInline({ text }: { text: string }): React.JSX.Element {
  return <>{parseInline(text).map(renderInline)}</>;
}

/** Render card text as paragraphs and lists. Example: <CardBody text={card.back} />. */
export function CardBody({ text }: { text: string }): React.JSX.Element {
  return <div className="card-body">{parseCardMarkup(text).map(renderBlock)}</div>;
}

function renderBlock(block: CardBlock, index: number): React.JSX.Element {
  if (block.kind === 'paragraph') return <p key={index}>{block.content.map(renderInline)}</p>;
  const items = block.items.map((item, position) => (
    <li key={position}>
      {item.content.map(renderInline)}
      {item.children.map(renderBlock)}
    </li>
  ));
  // A list that starts at 4 in the text starts at 4 here, so learners memorize the steps as they were written.
  return block.ordered ? (
    <ol key={index} start={block.start}>
      {items}
    </ol>
  ) : (
    <ul key={index}>{items}</ul>
  );
}

function renderInline(node: InlineNode, index: number): React.JSX.Element {
  if (node.kind === 'bold') return <strong key={index}>{node.text}</strong>;
  if (node.kind === 'italic') return <em key={index}>{node.text}</em>;
  if (node.kind === 'code')
    return (
      <code key={index} className="card-code">
        {node.text}
      </code>
    );
  return <span key={index}>{node.text}</span>;
}
