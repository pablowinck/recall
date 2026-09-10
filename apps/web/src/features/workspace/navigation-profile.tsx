import { IconButton, Tooltip } from '@radix-ui/themes';
import { ConfirmAction } from '@/components/confirm-action';
import { CircleHelp, LogOut, Moon, Sun } from 'lucide-react';
import type { AppearanceActions, NavigationProps } from './navigation-types';
import { supportChatUrl } from './support-link';

/** Keep personal controls consistent across screen sizes. Example: <NavigationProfile {...navigation} />. */
export function NavigationProfile(props: NavigationProps): React.JSX.Element {
  return (
    <div className="sidebar-bottom">
      <ProfileIdentity email={props.email} />
      <div className="profile-actions">
        <ThemeControl {...props} />
        <HelpControl />
        <SignOutControl signOut={props.signOut} />
      </div>
    </div>
  );
}

function ProfileIdentity({ email }: { email: string }): React.JSX.Element {
  return (
    <div className="profile">
      <span className="avatar">{email[0]?.toUpperCase()}</span>
      <span className="profile-name" title={email}>
        {email}
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

const signOutCopy = {
  title: 'Sign out?',
  description: 'Your cards and their schedule stay in your account. You can sign back in any time.',
  confirmLabel: 'Sign out',
  cancelLabel: 'Stay signed in',
};

/** Reach a person on WhatsApp with the first message written. Example: <HelpControl />. */
export function HelpControl(): React.JSX.Element {
  return (
    <Tooltip content="Get help on WhatsApp">
      <IconButton asChild variant="ghost" aria-label="Get help on WhatsApp">
        <a href={supportChatUrl()} target="_blank" rel="noopener noreferrer">
          <CircleHelp size={18} />
        </a>
      </IconButton>
    </Tooltip>
  );
}

/** Expose the same explicit sign-out action on every device. Example: <SignOutControl signOut={signOut} />. */
export function SignOutControl({ signOut }: Pick<AppearanceActions, 'signOut'>): React.JSX.Element {
  return (
    <ConfirmAction
      {...signOutCopy}
      tooltip="Sign out"
      trigger={
        <IconButton variant="ghost" aria-label="Sign out">
          <LogOut size={18} />
        </IconButton>
      }
      onConfirm={async () => signOut()}
    />
  );
}
