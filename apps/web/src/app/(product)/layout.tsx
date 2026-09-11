import type { ReactNode } from 'react';
// Recall ships only the Radix colour scales it uses; the full stylesheet carried all 31 and blocked rendering on every
// app route. A new Radix colour, as a color prop or a --<scale>-* variable, needs its file here (a unit test checks).
import '@radix-ui/themes/tokens/base.css';
import '@radix-ui/themes/tokens/colors/indigo.css';
import '@radix-ui/themes/tokens/colors/sand.css';
import '@radix-ui/themes/tokens/colors/gray.css';
import '@radix-ui/themes/tokens/colors/red.css';
import '@radix-ui/themes/tokens/colors/amber.css';
import '@radix-ui/themes/tokens/colors/green.css';
import '@radix-ui/themes/tokens/colors/orange.css';
import '@radix-ui/themes/components.css';
import '@radix-ui/themes/utilities.css';
import '@/styles/product.css';

/** Load Radix Themes and product styles only where the product renders. Example: app/(product)/app/[[...view]]/page.tsx. */
export default function ProductLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
