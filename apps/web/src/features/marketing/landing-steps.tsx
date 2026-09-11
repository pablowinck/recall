// Only Claude Code is a single command; the other assistants take a short config, so the copy says so.
const STEPS = [
  {
    title: 'Connect your assistant',
    body: 'Pick it in Connections and Recall fills your personal token into its setup: one command for Claude Code, a short config for the others.',
  },
  {
    title: 'Ask for cards',
    body: 'Mid-conversation, ask for one card or a whole set. They land in the deck you name, with your tags.',
  },
  {
    title: 'Review at the right moment',
    body: 'Study in Recall. FSRS schedules each card, and every rating shows when you’ll see it next.',
  },
];

/** Explain the loop in three honest steps. Example: <LandingSteps />. */
export function LandingSteps(): React.JSX.Element {
  return (
    <section className="landing-section" id="how-it-works" aria-labelledby="how-it-works-title">
      <h2 id="how-it-works-title">How it works</h2>
      <ol className="landing-steps">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <span className="landing-step-number">{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
