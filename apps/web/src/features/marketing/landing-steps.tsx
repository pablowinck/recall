const STEPS = [
  {
    title: 'Connect your assistant',
    body: 'One command and one token. Claude Code, Codex, Cursor, VS Code, Claude Desktop and Gemini CLI all speak MCP.',
  },
  {
    title: 'Cards appear as you learn',
    body: 'Ask for a card in the middle of a conversation. It lands in the deck you chose, with the tags you use.',
  },
  {
    title: 'Review at the right moment',
    body: 'Recall schedules each card for the day you are about to forget it, and a session tells you what comes back and when.',
  },
];

/** Explain the loop in three steps. Example: <LandingSteps />. */
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
