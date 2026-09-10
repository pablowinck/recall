import { Button } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import { ConfirmAction } from '@/components/confirm-action';
import { shortcutModifierLabel } from '@/lib/keyboard';
import type { CardEditorProps } from './use-card-editor';

const deleteCopy = {
  title: 'Delete this card?',
  description: 'The card and its review history will be deleted. This cannot be undone.',
  confirmLabel: 'Delete permanently',
  cancelLabel: 'Keep card',
};

/** Prevent competing card mutations while saving. Example: <CardEditorActions editor={props} busy={busy} cancel={close} />. */
export function CardEditorActions({
  editor,
  busy,
  cancel,
}: {
  editor: CardEditorProps;
  busy: boolean;
  cancel: () => void;
}): React.JSX.Element {
  return (
    <div className="dialog-actions">
      <DeleteCardButton editor={editor} busy={busy} />
      <SaveShortcutHint />
      <Button type="button" variant="soft" color="gray" onClick={cancel} disabled={busy}>
        Cancel
      </Button>
      <Button type="submit" loading={busy}>
        {editor.card ? 'Save changes' : 'Create card'}
      </Button>
    </div>
  );
}

// The shortcut already works in every text field; showing it lets people author batches without the mouse.
function SaveShortcutHint(): React.JSX.Element {
  return (
    <span className="shortcut-hint" aria-hidden="true">
      <kbd className="keycap">{shortcutModifierLabel(navigator.platform)}</kbd>
      <kbd className="keycap">↵</kbd>
      to save
    </span>
  );
}

function DeleteCardButton({
  editor,
  busy,
}: {
  editor: CardEditorProps;
  busy: boolean;
}): React.JSX.Element | null {
  const card = editor.card;
  if (!card) return null;
  return (
    <ConfirmAction
      {...deleteCopy}
      trigger={createDeleteTrigger(busy)}
      onConfirm={() => deleteEditedCard(editor, card.id)}
    />
  );
}

// Return the actual Radix Button so its trigger props survive cloning (7f2219e regression).
function createDeleteTrigger(busy: boolean): React.JSX.Element {
  const attributes = {
    type: 'button' as const,
    variant: 'ghost' as const,
    color: 'red' as const,
    className: 'delete-button',
    'aria-label': 'Delete card',
    disabled: busy,
  };
  return (
    <Button {...attributes}>
      <Trash2 size={18} />
    </Button>
  );
}

async function deleteEditedCard(editor: CardEditorProps, id: string): Promise<void> {
  await editor.client.deleteCard(id);
  editor.saved();
  editor.close();
}
