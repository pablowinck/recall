import type { RecallRating } from '@recall/contracts';

export type StudyCommand = 'reveal' | RecallRating;

/** The keyboard event fields study shortcuts need; lets tests use plain objects. */
export interface StudyKeyEvent {
  key: string;
  code: string;
  repeat: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  target: EventTarget | null;
}

const TYPING_TARGETS =
  'input,textarea,select,[contenteditable="true"],[role="dialog"],[role="alertdialog"]';
// Space and Enter already activate these natively; hijacking them made "Leave session" reveal the answer.
const ACTIVATABLE_TARGETS =
  'button,a[href],summary,[role="button"],[role="link"],[role="combobox"]';

/**
 * Map a keypress to a study command without breaking typing or focused controls.
 * Example: readStudyCommand({ key: '3', code: 'Digit3', ... }, true) === 3.
 */
export function readStudyCommand(event: StudyKeyEvent, revealed: boolean): StudyCommand | null {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return null;
  if (matchesTarget(event.target, TYPING_TARGETS)) return null;
  if (revealed) return readRatingKey(event);
  const reveal = event.code === 'Space' || event.key === 'Enter';
  return reveal && !matchesTarget(event.target, ACTIVATABLE_TARGETS) ? 'reveal' : null;
}

// Physical digit codes keep 1–4 working on layouts such as AZERTY, where digits need Shift.
function readRatingKey(event: StudyKeyEvent): RecallRating | null {
  const physical = /^(?:Digit|Numpad)([1-4])$/.exec(event.code)?.[1];
  const typed = /^[1-4]$/.test(event.key) ? event.key : undefined;
  const digit = physical ?? typed;
  return digit ? (Number(digit) as RecallRating) : null;
}

function matchesTarget(target: EventTarget | null, selector: string): boolean {
  if (!target || !('closest' in target) || typeof target.closest !== 'function') return false;
  return Boolean((target as Element).closest(selector));
}
