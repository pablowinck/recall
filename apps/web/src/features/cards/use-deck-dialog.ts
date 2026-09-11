import { useState, type FormEvent } from 'react';
import type { RecallClient } from '@recall/client';
import type { Deck } from '@recall/contracts';
import { useAnnounce } from '@/components/status-announcer';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { explainDeckFailure } from './deck-errors';

export interface DeckDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
  action: AsyncAction;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

/** Preserve a deck name on failure and close only after a successful save. Example: useDeckDialog(client, selectDeck). */
export function useDeckDialog(client: RecallClient, done: (deck: Deck) => void): DeckDialogState {
  const [open, setOpen] = useState(false);
  const action = useAsyncAction();
  const announce = useAnnounce();
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    const name = readDeckName(event);
    let created: Deck | null = null;
    void action
      .run(async () => {
        created = await client.createDeck(name).catch(explainDeckFailure);
      })
      .then(() => {
        if (!created) return;
        done(created);
        setOpen(false);
        announce(`Deck “${name}” created and selected`);
      });
  };
  return { open, setOpen, action, submit };
}

function readDeckName(event: FormEvent<HTMLFormElement>): string {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  return String(fields.get('name') ?? '').trim();
}
