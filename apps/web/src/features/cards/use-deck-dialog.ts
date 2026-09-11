import { useState, type FormEvent } from 'react';
import type { RecallClient } from '@recall/client';
import { useAnnounce } from '@/components/status-announcer';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { explainDeckFailure } from './deck-errors';

export interface DeckDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
  action: AsyncAction;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

/** Preserve a deck name on failure and close only after a successful save. Example: useDeckDialog(client, done). */
export function useDeckDialog(client: RecallClient, done: () => void): DeckDialogState {
  const [open, setOpen] = useState(false);
  const action = useAsyncAction();
  const announce = useAnnounce();
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    const name = readDeckName(event);
    void action
      .run(() => client.createDeck(name).catch(explainDeckFailure))
      .then((saved) => {
        if (!saved) return;
        done();
        setOpen(false);
        announce(`Deck “${name}” created`);
      });
  };
  return { open, setOpen, action, submit };
}

function readDeckName(event: FormEvent<HTMLFormElement>): string {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  return String(fields.get('name') ?? '').trim();
}
