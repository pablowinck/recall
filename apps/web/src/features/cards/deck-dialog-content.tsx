import { Button, Dialog, TextField } from '@radix-ui/themes';
import { FolderPlus } from 'lucide-react';
import { ErrorNotice } from '@/components/feedback';
import type { DeckDialogState } from './use-deck-dialog';

/** Own the trigger/button composition so Radix event props reach the button. Example: <DeckDialogTrigger />. */
export function DeckDialogTrigger(): React.JSX.Element {
  return (
    <Dialog.Trigger>
      <Button size="3" variant="soft" color="gray">
        <FolderPlus size={17} />
        New deck
      </Button>
    </Dialog.Trigger>
  );
}

/** Keep the deck form independent of request orchestration. Example: <DeckDialogContent state={state} />. */
export function DeckDialogContent({ state }: { state: DeckDialogState }): React.JSX.Element {
  return (
    <Dialog.Content maxWidth="420px">
      <Dialog.Title>New deck</Dialog.Title>
      <Dialog.Description mb="4">Keep cards about the same subject together.</Dialog.Description>
      <form onSubmit={state.submit}>
        <DeckNameField busy={state.action.busy} />
        {state.action.error && <ErrorNotice message={state.action.error} />}
        <DeckDialogActions busy={state.action.busy} />
      </form>
    </Dialog.Content>
  );
}

function DeckNameField({ busy }: { busy: boolean }): React.JSX.Element {
  return (
    <label>
      Name
      <TextField.Root
        name="name"
        required
        maxLength={80}
        placeholder="e.g. Travel"
        size="3"
        disabled={busy}
      />
    </label>
  );
}

function DeckDialogActions({ busy }: { busy: boolean }): React.JSX.Element {
  return (
    <div className="dialog-actions">
      <Dialog.Close>
        <Button type="button" variant="soft" color="gray" disabled={busy}>
          Cancel
        </Button>
      </Dialog.Close>
      <Button type="submit" loading={busy}>
        Create deck
      </Button>
    </div>
  );
}
