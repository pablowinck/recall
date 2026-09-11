const QUALITIES = [
  {
    title: 'Made for long sessions',
    body: 'Reading sizes that follow the length of a question, a comfortable measure, and a rating bar that never moves under your thumb.',
  },
  {
    title: 'Keyboard or thumb',
    body: 'Space reveals, 1 to 4 rate. On a phone the session takes the whole screen and the app chrome steps aside.',
  },
  {
    title: 'Light and dark',
    body: 'Both appearances are built to be read for hours, and the app follows the one your system already uses.',
  },
  {
    title: 'Your cards stay yours',
    body: 'Every query runs under row-level security in your own tenant. Connections are personal tokens you can revoke whenever you like.',
  },
];

/** Say what the study experience is like. Example: <LandingStudy />. */
export function LandingStudy(): React.JSX.Element {
  return (
    <section className="landing-section" aria-labelledby="study-title">
      <h2 id="study-title">Built to be used for hours</h2>
      <div className="landing-grid">
        {QUALITIES.map((quality) => (
          <article key={quality.title}>
            <h3>{quality.title}</h3>
            <p>{quality.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
