import { LandingHero } from './landing-hero';
import { LandingSteps } from './landing-steps';
import { LandingStudy } from './landing-study';
import { LandingClose } from './landing-close';

// Structured data states the same facts the page does, for search engines and agents that read JSON-LD.
const APPLICATION_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Recall',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description:
    'Flashcards with spaced repetition that AI assistants fill through MCP: Claude, Codex, Cursor and others create the cards, Recall schedules the reviews.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

/** Present Recall to someone who has never seen it. Example: <LandingPage />. */
export function LandingPage(): React.JSX.Element {
  return (
    <main className="landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APPLICATION_DATA) }}
      />
      <LandingHero />
      <LandingSteps />
      <LandingStudy />
      <LandingClose />
    </main>
  );
}
