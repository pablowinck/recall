import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import '@radix-ui/themes/styles.css';
import './globals.css';
import { appearanceBootstrapScript } from '@/lib/appearance';
import { SITE_URL } from '@/lib/site';

// Apple devices keep SF Pro through -apple-system; Inter gives every other platform the same calm geometry.
const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Recall', template: '%s · Recall' },
  description: 'Learn anything with flashcards and spaced repetition.',
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f0ef' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a09' },
  ],
};

/** Define the accessible application document. Example: <RootLayout>{page}</RootLayout>. */
export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    // The head script sets the appearance class before hydration, so React must not reconcile it.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
