import { Sparkles } from 'lucide-react';

/** Show what a Recall card looks like, without adding a heading to the page outline. Example: <ExampleCard />. */
export function ExampleCard(): React.JSX.Element {
  return (
    <div className="sample-card">
      <span className="eyebrow">
        <Sparkles size={15} aria-hidden="true" /> Example card
      </span>
      <p className="sample-card-front">
        I’d like
        <br />
        some tea.
      </p>
      <div className="sample-divider" />
      <p>
        <strong>I’d = I would</strong>
        <br />A polite way to ask for tea.
      </p>
    </div>
  );
}
