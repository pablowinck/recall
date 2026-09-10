import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@radix-ui/themes/styles.css';
import './globals.css';
import { appearanceBootstrapScript } from '@/lib/appearance';

export const metadata: Metadata = {
  title: 'Recall — a little today, remembered tomorrow',
  description: 'Your space to learn anything with flashcards and spaced repetition.',
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f0ef' },
    { media: '(prefers-color-scheme: dark)', color: '#111110' },
  ],
};

/** Define the accessible application document. Example: <RootLayout>{page}</RootLayout>. */
export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    // The head script sets the appearance class before hydration, so React must not reconcile it.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
