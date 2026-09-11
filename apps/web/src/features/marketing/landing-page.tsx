import { LandingHero } from './landing-hero';
import { LandingNav } from './landing-nav';
import { LandingFooter } from './landing-footer';
import { LandingSteps } from './landing-steps';
import { LandingStudy } from './landing-study';
import { LandingQuestions } from './landing-questions';
import { landingStructuredData } from './landing-structured-data';
import { LandingOpenSource } from './landing-open-source';
import { LandingClose } from './landing-close';
import { readStarCount } from './github-repo';

/** Present Recall to someone who has never seen it. Example: <LandingPage />. */
export async function LandingPage(): Promise<React.JSX.Element> {
  const stars = await readStarCount(fetch);
  return (
    <div className="landing">
      <StructuredData value={landingStructuredData()} />
      <LandingNav stars={stars} />
      <main>
        <LandingHero />
        <LandingSteps />
        <LandingStudy />
        <LandingQuestions />
        <LandingOpenSource stars={stars} />
        <LandingClose />
      </main>
      <LandingFooter />
    </div>
  );
}

// The values are constants written here; escaping "<" still keeps them from ever closing the script tag.
function StructuredData({ value }: { value: Record<string, unknown> }): React.JSX.Element {
  const json = JSON.stringify(value).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
