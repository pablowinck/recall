import { AlertDialog, Button } from '@radix-ui/themes';
import { useDialogBack } from '@/lib/use-dialog-back';

interface DiscardDraftDialogProps {
  open: boolean;
  editing: boolean;
  keepEditing: () => void;
  returnFocus: () => HTMLElement | null;
  discard: () => void;
}

/** Ask before throwing away typed card text; "Keep editing" is the default focus. Example: <DiscardDraftDialog {...props} />. */
export function DiscardDraftDialog(props: DiscardDraftDialogProps): React.JSX.Element {
  // Back answers the question the way Escape does: the draft stays.
  useDialogBack(props.open, props.keepEditing);
  return (
    <AlertDialog.Root open={props.open} onOpenChange={(next) => !next && props.keepEditing()}>
      <AlertDialog.Content
        maxWidth="400px"
        onCloseAutoFocus={(event) => restoreEditingFocus(event, props.returnFocus())}
      >
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

// The question opens without a trigger, so Radix would return focus to the page; Keep editing goes back to the field
// that was being typed in. After Discard the field leaves with the editor, which restores focus itself.
function restoreEditingFocus(event: Event, field: HTMLElement | null): void {
  if (!field?.isConnected) return;
  event.preventDefault();
  field.focus();
}
