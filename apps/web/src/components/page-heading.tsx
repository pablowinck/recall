import type { ReactNode } from 'react';
import { Button } from '@radix-ui/themes';
import { Plus } from 'lucide-react';

interface PageHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

/** Keep working views aligned without repeating header markup. Example: <PageHeading {...copy} />. */
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: PageHeadingProps): React.JSX.Element {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}

/** Use the same card-creation affordance across views. Example: <NewCardButton onClick={create} />. */
export function NewCardButton({
  onClick,
  variant = 'solid',
}: {
  onClick: () => void;
  variant?: 'soft' | 'solid';
}): React.JSX.Element {
  return (
    <Button variant={variant} onClick={onClick}>
      <Plus size={17} />
      New card
    </Button>
  );
}
