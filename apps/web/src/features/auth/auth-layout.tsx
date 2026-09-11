import type { ReactNode } from 'react';
import { RecallBrand } from '@/components/brand';
import { ExampleCard } from '@/components/example-card';

/** Keep authentication usable before showing the learning example. Example: <AuthLayout>{form}</AuthLayout>. */
export function AuthLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <main className="auth-shell">
      <div className="auth-left">
        <RecallBrand />
        {children}
      </div>
      <AuthPreview />
    </main>
  );
}

function AuthPreview(): React.JSX.Element {
  return (
    <div className="auth-preview">
      <ExampleCard />
    </div>
  );
}
