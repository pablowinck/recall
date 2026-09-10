import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@radix-ui/themes/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recall — um pouco hoje, lembrado amanhã',
  description: 'Seu espaço para aprender com flashcards e repetição espaçada.',
};

/** Define o documento acessível do produto. Exemplo: <RootLayout>{page}</RootLayout>. */
export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
