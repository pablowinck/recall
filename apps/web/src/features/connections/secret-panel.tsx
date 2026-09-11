import { useState } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Copy } from 'lucide-react';
import { ConfirmAction } from '@/components/confirm-action';
import { focusPageHeading } from '@/components/page-heading';
import { useAnnounce } from '@/components/status-announcer';
import { MCP_URL } from '@/lib/site';
import { findConnectionClient } from './connection-clients';
import type { IssuedConnection } from './use-connections';

type CopyTarget = 'setup' | 'token';
interface ClipboardState {
  copied: CopyTarget | '';
  error: string;
  copy: (target: CopyTarget, text: string) => void;
}

const closeUncopiedCopy = {
  title: 'Close without copying?',
  description:
    'You won’t be able to see this token again. You can create another connection later.',
  confirmLabel: 'Close without copying',
  cancelLabel: 'Keep token',
};

/** Show a new token once, with setup already filled in for the chosen assistant. Example: <SecretPanel secret={secret} clear={clear} markCopied={markCopied} />. */
export function SecretPanel({
  secret,
  clear,
  markCopied,
}: {
  secret: IssuedConnection;
  clear: () => void;
  markCopied: () => void;
}): React.JSX.Element {
  const assistant = findConnectionClient(secret.clientId);
  const setup = assistant.setup(MCP_URL, secret.token);
  const clipboard = useClipboard(markCopied);
  return (
    // Manual copies (select + Cmd/Ctrl+C) count too, so people who copy by hand are not asked again.
    <section className="new-secret" aria-labelledby="new-secret-title" onCopy={markCopied}>
      <h2 id="new-secret-title">Connect {assistant.name}</h2>
      <p>{assistant.where} The token is shown only once; anyone with it can use your cards.</p>
      <pre className="setup-snippet">{setup}</pre>
      <TextField.Root
        className="token-field"
        aria-label="New personal token"
        readOnly
        value={secret.token}
      />
      <SecretActions
        setup={setup}
        token={secret.token}
        copiedOnce={secret.copied}
        clear={clear}
        clipboard={clipboard}
      />
      <p role="status">{clipboard.error}</p>
    </section>
  );
}

function useClipboard(markCopied: () => void): ClipboardState {
  const [copied, setCopied] = useState<CopyTarget | ''>('');
  const [error, setError] = useState('');
  const announce = useAnnounce();
  const copy = (target: CopyTarget, text: string): void => {
    navigator.clipboard.writeText(text).then(
      () => {
        setError('');
        markCopied();
        setCopied(target);
        // A button that changes its own label is not reliably read aloud, so the copy is announced.
        announce(target === 'setup' ? 'Setup copied' : 'Token copied');
        setTimeout(() => setCopied(''), 2500);
      },
      () => setError('Select and copy the text manually.'),
    );
  };
  return { copied, error, copy };
}

function SecretActions(props: {
  setup: string;
  token: string;
  copiedOnce: boolean;
  clear: () => void;
  clipboard: ClipboardState;
}): React.JSX.Element {
  const { copied, copy } = props.clipboard;
  return (
    <div className="dialog-actions">
      <SavedButton copied={props.copiedOnce} clear={props.clear} />
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

// Closing the panel destroys the only view of the secret, so confirm unless it was copied. The panel leaves with
// the focused button, so focus moves to the page title.
function SavedButton({ copied, clear }: { copied: boolean; clear: () => void }): React.JSX.Element {
  const close = (): void => {
    clear();
    focusPageHeading();
  };
  const button = (
    <Button variant="soft" color="gray" onClick={copied ? close : undefined}>
      I saved it
    </Button>
  );
  if (copied) return button;
  return (
    <ConfirmAction
      {...closeUncopiedCopy}
      trigger={button}
      onConfirm={async () => clear()}
      focusAfterConfirm={focusPageHeading}
    />
  );
}
