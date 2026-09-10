import { useState, type ReactElement } from 'react';
import { AlertDialog, Button } from '@radix-ui/themes';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { ErrorNotice } from './feedback';

interface ConfirmActionProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  trigger: ReactElement;
  onConfirm: () => Promise<void>;
}
interface ConfirmationViewProps {
  copy: ConfirmActionProps;
  action: AsyncAction;
  confirm: () => void;
}

/** Keep destructive confirmations open on failure. Example: <ConfirmAction {...props} />. */
export function ConfirmAction(props: ConfirmActionProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const action = useAsyncAction();
  const confirm = (): void => {
    void action.run(async () => {
      await props.onConfirm();
      setOpen(false);
    });
  };
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!action.busy) setOpen(next);
      }}
    >
      <AlertDialog.Trigger>{props.trigger}</AlertDialog.Trigger>
      <ConfirmationContent copy={props} action={action} confirm={confirm} />
    </AlertDialog.Root>
  );
}

function ConfirmationContent(props: ConfirmationViewProps): React.JSX.Element {
  return (
    <AlertDialog.Content maxWidth="420px">
      <AlertDialog.Title>{props.copy.title}</AlertDialog.Title>
      <AlertDialog.Description>{props.copy.description}</AlertDialog.Description>
      {props.action.error && <ErrorNotice message={props.action.error} />}
      <ConfirmationButtons {...props} />
    </AlertDialog.Content>
  );
}

function ConfirmationButtons({ copy, action, confirm }: ConfirmationViewProps): React.JSX.Element {
  return (
    <div className="dialog-actions">
      <AlertDialog.Cancel>
        <Button variant="soft" color="gray" disabled={action.busy}>
          {copy.cancelLabel}
        </Button>
      </AlertDialog.Cancel>
      <Button color="red" onClick={confirm} loading={action.busy}>
        {copy.confirmLabel}
      </Button>
    </div>
  );
}
