import { IconButton, Tooltip } from '@radix-ui/themes';
import { LogOut, Moon, Sun } from 'lucide-react';
import type { AppearanceActions, NavigationProps } from './navigation-types';

/** Keep personal controls consistent across screen sizes. Example: <NavigationProfile {...navigation} />. */
export function NavigationProfile(props: NavigationProps): React.JSX.Element {
  return (
    <div className="sidebar-bottom">
      <StudyNote />
      <ProfileIdentity email={props.email} />
      <div className="profile-actions">
        <ThemeControl {...props} />
        <SignOutControl signOut={props.signOut} />
      </div>
    </div>
  );
}

function StudyNote(): React.JSX.Element {
  return (
    <div className="study-note">
      <span>AT YOUR OWN PACE</span>
      <p>
        Consistency matters
        <br />
        more than speed.
      </p>
    </div>
  );
}

function ProfileIdentity({ email }: { email: string }): React.JSX.Element {
  return (
    <div className="profile">
      <span className="avatar">{email[0]?.toUpperCase()}</span>
      <span className="profile-name">
        My workspace<small>{email}</small>
      </span>
    </div>
  );
}

/** Switch appearance without changing learning state. Example: <ThemeControl dark={dark} toggleTheme={toggle} />. */
export function ThemeControl({
  dark,
  toggleTheme,
}: Pick<AppearanceActions, 'dark' | 'toggleTheme'>): React.JSX.Element {
  const label = dark ? 'Use light theme' : 'Use dark theme';
  return (
    <Tooltip content={label}>
      <IconButton variant="ghost" aria-label={label} onClick={toggleTheme}>
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>
    </Tooltip>
  );
}

/** Expose the same explicit sign-out action on every device. Example: <SignOutControl signOut={signOut} />. */
export function SignOutControl({ signOut }: Pick<AppearanceActions, 'signOut'>): React.JSX.Element {
  return (
    <Tooltip content="Sign out">
      <IconButton variant="ghost" aria-label="Sign out" onClick={signOut}>
        <LogOut size={18} />
      </IconButton>
    </Tooltip>
  );
}
