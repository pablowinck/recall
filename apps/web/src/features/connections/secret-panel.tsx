import { useState } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Copy } from 'lucide-react';
import { findConnectionClient } from './connection-clients';
import type { IssuedConnection } from './use-connections';

type CopyTarget = 'setup' | 'token';
interface ClipboardState {
  copied: CopyTarget | '';
  error: string;
  copy: (target: CopyTarget, text: string) => void;
}

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
    <section className="new-secret" aria-labelledby="new-secret-title">
      <h2 id="new-secret-title">Connect {assistant.name}</h2>
      <p>{assistant.where} The token is shown only once; anyone with it can use your cards.</p>
      <pre className="setup-snippet">{setup}</pre>
      <TextField.Root aria-label="New personal token" readOnly value={secret.token} />
      <SecretActions setup={setup} token={secret.token} clear={clear} clipboard={clipboard} />
      <p role="status">{clipboard.error}</p>
    </section>
  );
}

function useClipboard(): ClipboardState {
  const [copied, setCopied] = useState<CopyTarget | ''>('');
  const [error, setError] = useState('');
  const copy = (target: CopyTarget, text: string): void => {
    navigator.clipboard.writeText(text).then(
      () => {
        setError('');
        setCopied(target);
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
  clear: () => void;
  clipboard: ClipboardState;
}): React.JSX.Element {
  const { copied, copy } = props.clipboard;
  return (
    <div className="dialog-actions">
      <Button variant="soft" color="gray" onClick={props.clear}>
        I saved it
      </Button>
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
