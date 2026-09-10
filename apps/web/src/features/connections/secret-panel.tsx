import { useState } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Copy } from 'lucide-react';

interface SecretPanelProps {
  token: string;
  clear: () => void;
}
interface ClipboardState {
  copied: boolean;
  error: string;
  copy: () => void;
}

/** Show a newly issued token once and tie feedback to that token. Example: <SecretPanel token={token} clear={clear} />. */
export function SecretPanel(props: SecretPanelProps): React.JSX.Element {
  const clipboard = useSecretClipboard(props.token);
  return (
    <section className="new-secret">
      <h2>Save your token</h2>
      <p>It is shown only once. Anyone with this token can access your cards.</p>
      <TextField.Root aria-label="New personal token" readOnly value={props.token} />
      <SecretActions clear={props.clear} clipboard={clipboard} />
      {clipboard.error && <p role="status">{clipboard.error}</p>}
    </section>
  );
}

function useSecretClipboard(token: string): ClipboardState {
  const [copiedToken, setCopiedToken] = useState('');
  const [error, setError] = useState('');
  return {
    copied: copiedToken === token,
    error,
    copy: () => {
      void copySecret(token, setCopiedToken, setError);
    },
  };
}

async function copySecret(
  token: string,
  copied: (token: string) => void,
  failed: (message: string) => void,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(token);
    copied(token);
    setTimeout(() => copied(''), 2500);
    failed('');
  } catch {
    failed('Select and copy the token manually.');
  }
}

function SecretActions({
  clear,
  clipboard,
}: {
  clear: () => void;
  clipboard: ClipboardState;
}): React.JSX.Element {
  return (
    <div className="dialog-actions">
      <Button variant="soft" onClick={clear}>
        I saved it
      </Button>
      <Button onClick={clipboard.copy}>
        <Copy size={16} />
        {clipboard.copied ? 'Copied' : 'Copy token'}
      </Button>
    </div>
  );
}
