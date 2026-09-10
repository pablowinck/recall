import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@radix-ui/themes/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recall — a little today, remembered tomorrow',
  description: 'Your space to learn anything with flashcards and spaced repetition.',
};

/** Define the accessible application document. Example: <RootLayout>{page}</RootLayout>. */
export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
