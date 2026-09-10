import { Dialog } from '@radix-ui/themes';
import type { RecallClient } from '@recall/client';
import { useDeckDialog, type DeckDialogState } from './use-deck-dialog';
import { DeckDialogTrigger, DeckDialogContent } from './deck-dialog-content';

/** Create a deck without leaving the library. Example: <NewDeckDialog client={client} done={refresh} />. */
export function NewDeckDialog({
  client,
  done,
}: {
  client: RecallClient;
  done: () => void;
}): React.JSX.Element {
  const state = useDeckDialog(client, done);
  return (
    <Dialog.Root open={state.open} onOpenChange={(open) => changeDeckDialog(state, open)}>
      <DeckDialogTrigger />
      <DeckDialogContent state={state} />
    </Dialog.Root>
  );
}

function changeDeckDialog(state: DeckDialogState, open: boolean): void {
  if (state.action.busy) return;
  state.setOpen(open);
  state.action.clear();
}
