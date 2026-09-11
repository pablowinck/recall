import { Sparkles } from 'lucide-react';

/** Show what a Recall card looks like as a captioned figure, without adding a heading to the page outline. Example: <ExampleCard />. */
export function ExampleCard(): React.JSX.Element {
  return (
    <figure className="sample-card">
      <figcaption className="eyebrow">
        <Sparkles size={15} aria-hidden="true" /> Example card
      </figcaption>
      <p className="sample-card-front">
        <span className="visually-hidden">Front: </span>
        I’d like
        <br />
        some tea.
      </p>
      <div className="sample-divider" />
      <p>
        <span className="visually-hidden">Back: </span>
        <strong>I’d = I would</strong>
        <br />A polite way to ask for tea.
      </p>
    </figure>
  );
}
