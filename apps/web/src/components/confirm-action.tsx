import { useRef, useState, type ReactElement } from 'react';
import { AlertDialog, Button, Tooltip } from '@radix-ui/themes';
import { useAsyncAction, type AsyncAction } from '@/lib/use-async-action';
import { useDialogBack } from '@/lib/use-dialog-back';
import { ErrorNotice } from './feedback';

interface ConfirmActionProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  trigger: ReactElement;
  tooltip?: string;
  onConfirm: () => Promise<void>;
  /** Where focus goes after a confirmation, when the trigger leaves with what it removed. */
  focusAfterConfirm?: () => void;
}
interface ConfirmationViewProps {
  copy: ConfirmActionProps;
  action: AsyncAction;
  confirm: () => void;
  restoreFocus: (event: Event) => void;
}
interface ConfirmedFocus {
  confirmed: () => void;
  restore: (event: Event) => void;
}

/** Keep destructive confirmations open on failure. Example: <ConfirmAction {...props} />. */
export function ConfirmAction(props: ConfirmActionProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const action = useAsyncAction();
  const focus = useFocusAfterConfirm(props.focusAfterConfirm);
  useDialogBack(open, () => {
    if (!action.busy) setOpen(false);
  });
  const confirm = (): void => {
    void finishConfirmation(action, props.onConfirm, () => {
      focus.confirmed();
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
      <ConfirmTrigger tooltip={props.tooltip}>{props.trigger}</ConfirmTrigger>
      <ConfirmationContent
        copy={props}
        action={action}
        confirm={confirm}
        restoreFocus={focus.restore}
      />
    </AlertDialog.Root>
  );
}

// Radix returns focus to the trigger when the dialog closes, but a confirmed removal can take the trigger with it.
function useFocusAfterConfirm(focusAfterConfirm?: () => void): ConfirmedFocus {
  const confirmed = useRef(false);
  return {
    confirmed: () => {
      confirmed.current = true;
    },
    restore: (event) => {
      if (!confirmed.current || !focusAfterConfirm) return;
      confirmed.current = false;
      event.preventDefault();
      focusAfterConfirm();
    },
  };
}

// Radix passes tooltip props to its content, so the tooltip has to sit outside the trigger.
function ConfirmTrigger({
  tooltip,
  children,
}: {
  tooltip?: string;
  children: ReactElement;
}): React.JSX.Element {
  const trigger = <AlertDialog.Trigger>{children}</AlertDialog.Trigger>;
  return tooltip ? <Tooltip content={tooltip}>{trigger}</Tooltip> : trigger;
}

async function finishConfirmation(
  action: AsyncAction,
  operation: () => Promise<void>,
  close: () => void,
): Promise<void> {
  const succeeded = await action.run(operation);
  if (succeeded) close();
}

function ConfirmationContent(props: ConfirmationViewProps): React.JSX.Element {
  return (
    <AlertDialog.Content maxWidth="420px" onCloseAutoFocus={props.restoreFocus}>
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
