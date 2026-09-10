import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { RecallBrand } from '@/components/brand';

/** Keep authentication usable before showing the learning example. Example: <AuthLayout>{form}</AuthLayout>. */
export function AuthLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <main className="auth-shell">
      <div className="auth-left">
        <RecallBrand />
        {children}
        <footer>A little today. Remembered tomorrow.</footer>
      </div>
      <AuthPreview />
    </main>
  );
}

function AuthPreview(): React.JSX.Element {
  return (
    <div className="auth-preview">
      <ExampleCard />
      <p className="preview-caption">
        A small discovery today.
        <br />
        Something you remember tomorrow.
      </p>
    </div>
  );
}

function ExampleCard(): React.JSX.Element {
  return (
    <div className="sample-card">
      <span className="eyebrow">
        <Sparkles size={15} /> AN EXAMPLE CARD
      </span>
      <h2>
        I’d like
        <br />
        some tea.
      </h2>
      <div className="sample-divider" />
      <p>
        <strong>I’d = I would</strong>
        <br />A polite way to ask for tea.
      </p>
    </div>
  );
}
