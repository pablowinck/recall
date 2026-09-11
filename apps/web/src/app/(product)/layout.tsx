import type { ReactNode } from 'react';
import '@radix-ui/themes/styles.css';
import '@/styles/product.css';

/** Load Radix Themes and product styles only where the product renders. Example: app/(product)/app/[[...view]]/page.tsx. */
export default function ProductLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
