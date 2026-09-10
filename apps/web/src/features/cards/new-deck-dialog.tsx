import { useState, type FormEvent } from 'react';
import { Button, Dialog, TextField } from '@radix-ui/themes';
import { FolderPlus } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import { describeFailure, ErrorNotice } from '@/components/feedback';

/** Cria organização adicional sem sair da biblioteca. Exemplo: <NewDeckDialog client={client} done={refresh} />. */
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
          Novo baralho
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="420px">
        <Dialog.Title>Novo baralho</Dialog.Title>
        <Dialog.Description mb="4">Reúna cartões de um mesmo assunto.</Dialog.Description>
        <form onSubmit={submit}>
          <label>
            Nome
            <TextField.Root
              name="name"
              required
              maxLength={80}
              placeholder="Ex.: Viagens"
              size="3"
            />
          </label>
          {error && <ErrorNotice message={error} />}
          <div className="dialog-actions">
            <Dialog.Close>
              <Button type="button" variant="soft" color="gray">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button type="submit" loading={busy}>
              Criar baralho
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
