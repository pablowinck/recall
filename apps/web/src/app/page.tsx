import type { Metadata } from 'next';
import { LandingPage } from '@/features/marketing/landing-page';

const TITLE = 'Recall — free spaced repetition flashcards your AI writes';
const DESCRIPTION =
  'Recall is a free flashcard app with spaced repetition. Claude Code, Codex, Cursor and other MCP assistants create the cards; Recall schedules every review.';

export const metadata: Metadata = {
  // Absolute, because the layout's "%s · Recall" template would repeat the brand in this title.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  // The Markdown twin is the llms.txt guide, which agents also get here by asking for text/markdown.
  alternates: { canonical: '/', types: { 'text/markdown': '/llms.txt' } },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Recall',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

// Regenerated hourly, so the GitHub star count stays fresh while the page is served statically.
export const revalidate = 3600;

/** Present Recall to a first-time visitor. Example: GET /. */
export default function HomePage(): React.JSX.Element {
  return <LandingPage />;
}
