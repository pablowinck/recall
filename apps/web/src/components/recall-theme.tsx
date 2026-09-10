import type { ReactNode } from 'react';
import { Theme } from '@radix-ui/themes';

const themeSettings = {
  accentColor: 'indigo',
  grayColor: 'sand',
  radius: 'large',
  scaling: '100%',
} as const;

/**
 * Apply the product theme. Appearance is inherited from the `dark` class on <html>, set before
 * the first paint by the head script, so portals and the app never disagree. Example: <RecallTheme>{app}</RecallTheme>.
 */
export function RecallTheme({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <Theme {...themeSettings} appearance="inherit">
      <div className="recall-root">{children}</div>
    </Theme>
  );
}
