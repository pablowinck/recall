import { AlertDialog, Button } from '@radix-ui/themes';

interface DiscardDraftDialogProps {
  open: boolean;
  editing: boolean;
  keepEditing: () => void;
  discard: () => void;
}

/** Ask before throwing away typed card text; "Keep editing" is the default focus. Example: <DiscardDraftDialog {...props} />. */
export function DiscardDraftDialog(props: DiscardDraftDialogProps): React.JSX.Element {
  return (
    <AlertDialog.Root open={props.open} onOpenChange={(next) => !next && props.keepEditing()}>
      <AlertDialog.Content maxWidth="400px">
        <AlertDialog.Title>
          {props.editing ? 'Discard changes?' : 'Discard this card?'}
        </AlertDialog.Title>
        <AlertDialog.Description>
          {props.editing ? 'Your edits to this card will be lost.' : 'What you typed will be lost.'}
        </AlertDialog.Description>
        <DiscardDraftActions discard={props.discard} />
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

function DiscardDraftActions({ discard }: { discard: () => void }): React.JSX.Element {
  return (
    <div className="dialog-actions">
      <AlertDialog.Cancel>
        <Button variant="soft" color="gray">
          Keep editing
        </Button>
      </AlertDialog.Cancel>
      <AlertDialog.Action>
        <Button color="red" onClick={discard}>
          Discard
        </Button>
      </AlertDialog.Action>
    </div>
  );
}
