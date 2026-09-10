import type { ReactNode } from 'react';
import { RecallBrand } from '@/components/brand';
import { WorkspaceNavigation } from './navigation';
import { ThemeControl, SignOutControl } from './navigation-profile';
import type { NavigationProps } from './navigation-types';

interface WorkspaceShellProps {
  navigation: NavigationProps;
  studying: boolean;
  children: ReactNode;
}

/** Keep the working surface and mobile focus layout predictable. Example: <WorkspaceShell {...props}>{view}</WorkspaceShell>. */
export function WorkspaceShell({
  navigation,
  studying,
  children,
}: WorkspaceShellProps): React.JSX.Element {
  return (
    <div className={`app-shell ${studying ? 'is-studying' : ''}`}>
      <WorkspaceNavigation {...navigation} />
      <MobileHeader navigation={navigation} />
      <main id="main-content" className="page-content">
        {children}
      </main>
    </div>
  );
}

function MobileHeader({ navigation }: { navigation: NavigationProps }): React.JSX.Element {
  return (
    <div className="mobile-top">
      <RecallBrand />
      <div>
        <ThemeControl {...navigation} />
        <SignOutControl signOut={navigation.signOut} />
      </div>
    </div>
  );
}
