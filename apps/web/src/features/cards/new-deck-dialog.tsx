import { useState, type FormEvent } from 'react';
import { Button, Dialog, TextField } from '@radix-ui/themes';
import { FolderPlus } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import { describeFailure, ErrorNotice } from '@/components/feedback';

/** Create a deck without leaving the library. Example: <NewDeckDialog client={client} done={refresh} />. */
export function NewDeckDialog({
  client,
  done,
}: {
  client: RecallClient;
  done: () => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    const name = String(new FormData(event.currentTarget).get('name'));
    try {
      await client.createDeck(name);
      done();
      setOpen(false);
      setError('');
    } catch (failure) {
      setError(describeFailure(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="soft" color="gray">
          <FolderPlus size={17} />
          New deck
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="420px">
        <Dialog.Title>New deck</Dialog.Title>
        <Dialog.Description mb="4">Keep cards about the same subject together.</Dialog.Description>
        <form onSubmit={submit}>
          <label>
            Name
            <TextField.Root
              name="name"
              required
              maxLength={80}
              placeholder="e.g. Travel"
              size="3"
            />
          </label>
          {error && <ErrorNotice message={error} />}
          <div className="dialog-actions">
            <Dialog.Close>
              <Button type="button" variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" loading={busy}>
              Create deck
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
