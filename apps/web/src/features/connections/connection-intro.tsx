import { Button, Select } from '@radix-ui/themes';
import { Link2, Plus, ShieldCheck } from 'lucide-react';
import { connectionClients, findConnectionClient } from './connection-clients';
import type { ConnectionsModel } from './use-connections';

/** Explain what a connection can reach and let people pick their assistant first. Example: <ConnectionIntro model={model} />. */
export function ConnectionIntro({ model }: { model: ConnectionsModel }): React.JSX.Element {
  return (
    <section className="connection-intro">
      <span className="connection-icon">
        <Link2 size={26} strokeWidth={1.75} />
      </span>
      <h2>Connect an AI assistant</h2>
      <p>
        Create, organize and find cards from a conversation. Works with assistants that support MCP.
        A connection reaches only your cards.
      </p>
      <AssistantPicker model={model} />
      <Button size="3" onClick={model.create} loading={model.busy} disabled={Boolean(model.secret)}>
        <Plus size={17} />
        Create personal connection
      </Button>
      <p className="privacy-note">
        <ShieldCheck size={15} />
        Valid for 90 days. Revoke it whenever you like.
      </p>
    </section>
  );
}

function AssistantPicker({ model }: { model: ConnectionsModel }): React.JSX.Element {
  return (
    <div className="assistant-picker">
      <span id="assistant-picker-label">Assistant</span>
      <Select.Root
        value={model.clientId}
        onValueChange={(id) => model.chooseClient(findConnectionClient(id).id)}
        disabled={Boolean(model.secret)}
      >
        <Select.Trigger aria-labelledby="assistant-picker-label" />
        <Select.Content>
          {connectionClients.map((client) => (
            <Select.Item key={client.id} value={client.id}>
              {client.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
}
