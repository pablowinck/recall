import { useState } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Copy } from 'lucide-react';
import { ConfirmAction } from '@/components/confirm-action';
import { findConnectionClient } from './connection-clients';
import type { IssuedConnection } from './use-connections';

type CopyTarget = 'setup' | 'token';
interface ClipboardState {
  copied: CopyTarget | '';
  copiedOnce: boolean;
  error: string;
  copy: (target: CopyTarget, text: string) => void;
  markCopied: () => void;
}

const closeUncopiedCopy = {
  title: 'Close without copying?',
  description:
    'You won’t be able to see this token again. You can create another connection later.',
  confirmLabel: 'Close without copying',
  cancelLabel: 'Keep token',
};

/** Show a new token once, with setup already filled in for the chosen assistant. Example: <SecretPanel secret={secret} clear={clear} />. */
export function SecretPanel({
  secret,
  clear,
}: {
  secret: IssuedConnection;
  clear: () => void;
}): React.JSX.Element {
  const assistant = findConnectionClient(secret.clientId);
  const setup = assistant.setup(process.env.NEXT_PUBLIC_MCP_URL ?? '', secret.token);
  const clipboard = useClipboard();
  return (
    // Manual copies (select + Cmd/Ctrl+C) count too, so people who copy by hand are not asked again.
    <section
      className="new-secret"
      aria-labelledby="new-secret-title"
      onCopy={clipboard.markCopied}
    >
      <h2 id="new-secret-title">Connect {assistant.name}</h2>
      <p>{assistant.where} The token is shown only once; anyone with it can use your cards.</p>
      <pre className="setup-snippet">{setup}</pre>
      <TextField.Root
        className="token-field"
        aria-label="New personal token"
        readOnly
        value={secret.token}
      />
      <SecretActions setup={setup} token={secret.token} clear={clear} clipboard={clipboard} />
      <p role="status">{clipboard.error}</p>
    </section>
  );
}

function useClipboard(): ClipboardState {
  const [copied, setCopied] = useState<CopyTarget | ''>('');
  const [copiedOnce, setCopiedOnce] = useState(false);
  const [error, setError] = useState('');
  const copy = (target: CopyTarget, text: string): void => {
    navigator.clipboard.writeText(text).then(
      () => {
        setError('');
        setCopiedOnce(true);
        setCopied(target);
        setTimeout(() => setCopied(''), 2500);
      },
      () => setError('Select and copy the text manually.'),
    );
  };
  return { copied, copiedOnce, error, copy, markCopied: () => setCopiedOnce(true) };
}

function SecretActions(props: {
  setup: string;
  token: string;
  clear: () => void;
  clipboard: ClipboardState;
}): React.JSX.Element {
  const { copied, copy } = props.clipboard;
  return (
    <div className="dialog-actions">
      <SavedButton copied={props.clipboard.copiedOnce} clear={props.clear} />
      <Button variant="soft" onClick={() => copy('token', props.token)}>
        {copied === 'token' ? 'Copied' : 'Copy token'}
      </Button>
      <Button onClick={() => copy('setup', props.setup)}>
        <Copy size={16} />
        {copied === 'setup' ? 'Copied' : 'Copy setup'}
      </Button>
    </div>
  );
}

// Closing the panel destroys the only view of the secret, so confirm unless it was copied.
function SavedButton({ copied, clear }: { copied: boolean; clear: () => void }): React.JSX.Element {
  const button = (
    <Button variant="soft" color="gray" onClick={copied ? clear : undefined}>
      I saved it
    </Button>
  );
  if (copied) return button;
  return <ConfirmAction {...closeUncopiedCopy} trigger={button} onConfirm={async () => clear()} />;
}
