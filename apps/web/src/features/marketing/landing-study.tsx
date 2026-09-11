const QUALITIES = [
  {
    title: 'Made for long sessions',
    body: 'Short questions display large, long ones at reading size, and the rating buttons stay within reach on long cards.',
  },
  {
    title: 'Keyboard or thumb',
    body: 'Space reveals, 1 to 4 rate. On a phone a session fills the screen with the ratings under your thumb.',
  },
  {
    title: 'Light and dark',
    body: 'Both appearances are made to be read for hours. Recall follows your system, or you pick one yourself.',
  },
  {
    title: 'Formatting that renders',
    body: 'Bold, italic, code and lists display cleanly, whether you or your assistant wrote the card.',
  },
];

/** Say what the study experience is like, in plain words. Example: <LandingStudy />. */
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
