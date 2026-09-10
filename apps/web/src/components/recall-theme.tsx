import type { ReactNode } from 'react';
import { Theme } from '@radix-ui/themes';

const themeSettings = {
  accentColor: 'blue',
  grayColor: 'slate',
  radius: 'large',
  scaling: '100%',
} as const;

/** Apply the product theme without coupling it to account state. Example: <RecallTheme appearance="light">{app}</RecallTheme>. */
export function RecallTheme({
  appearance,
  children,
}: {
  appearance: 'light' | 'dark';
  children: ReactNode;
}): React.JSX.Element {
  return (
    <Theme {...themeSettings} appearance={appearance}>
      <div className={`recall-root ${appearance}`}>{children}</div>
    </Theme>
  );
}
