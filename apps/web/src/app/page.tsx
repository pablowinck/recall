import type { Metadata } from 'next';
import { LandingPage } from '@/features/marketing/landing-page';

const DESCRIPTION =
  'Recall is a flashcard app with spaced repetition that your AI assistant fills through MCP. Claude, Codex and Cursor write the cards; Recall schedules every review.';

export const metadata: Metadata = {
  title: 'Recall — flashcards your AI keeps filling',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Recall',
    title: 'Recall — flashcards your AI keeps filling',
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: 'Recall', description: DESCRIPTION },
};

/** Present Recall to a first-time visitor. Example: GET /. */
export default function HomePage(): React.JSX.Element {
  return <LandingPage />;
}
