import { TextField } from '@radix-ui/themes';
import type { ComponentProps } from 'react';

/** Keep credential labels stable for keyboard and assistive tools. Example: <AuthFields signup={false} busy={false} />. */
export function AuthFields({
  signup,
  busy,
}: {
  signup: boolean;
  busy: boolean;
}): React.JSX.Element {
  return (
    <div className="form-fields">
      <EmailField busy={busy} />
      <PasswordField signup={signup} busy={busy} />
    </div>
  );
}

function EmailField({ busy }: { busy: boolean }): React.JSX.Element {
  const attributes: ComponentProps<typeof TextField.Root> = {
    name: 'email',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'you@example.com',
  };
  return (
    <label>
      Email
      <TextField.Root {...attributes} required size="3" disabled={busy} />
    </label>
  );
}

function PasswordField({ signup, busy }: { signup: boolean; busy: boolean }): React.JSX.Element {
  const attributes: ComponentProps<typeof TextField.Root> = {
    name: 'password',
    type: 'password',
    autoComplete: signup ? 'new-password' : 'current-password',
    placeholder: signup ? 'Create a password' : 'Your password',
    minLength: signup ? 10 : undefined,
  };
  return (
    <label>
      Password {signup && <span className="field-hint">At least 10 characters</span>}
      <TextField.Root {...attributes} required size="3" disabled={busy} />
    </label>
  );
}
