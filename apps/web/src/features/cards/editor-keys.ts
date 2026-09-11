/** The parts of a keyboard event the card editor reads, so its rules can be tested without React. */
export interface EditorKeyEvent {
  key: string;
  keyCode: number;
  metaKey: boolean;
  ctrlKey: boolean;
  nativeEvent: { isComposing: boolean };
}

/**
 * Enter that finishes an input method composition (Japanese, Chinese, Korean) confirms text, not a command.
 * Safari reports those keydowns with key code 229 instead of isComposing. Example: isCommandEnter(event).
 */
export function isCommandEnter(event: EditorKeyEvent): boolean {
  return event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229;
}

/** Cmd+Enter or Ctrl+Enter outside a composition, which saves the card. Example: isSaveShortcut(event). */
export function isSaveShortcut(event: EditorKeyEvent): boolean {
  return isCommandEnter(event) && (event.metaKey || event.ctrlKey);
}
