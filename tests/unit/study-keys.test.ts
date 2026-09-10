import { describe, expect, it } from 'vitest';
import { readStudyCommand, type StudyKeyEvent } from '../../apps/web/src/features/study/study-keys';

/** A focusable element stand-in that answers `closest` for the selectors it belongs to. */
class FakeFocusTarget {
  constructor(private readonly tag: string) {}
  closest(selector: string): FakeFocusTarget | null {
    return selector.split(',').some((part) => part.startsWith(this.tag)) ? this : null;
  }
}

function press(key: string, code: string, target: unknown = null): StudyKeyEvent {
  return {
    key,
    code,
    repeat: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    target: target as EventTarget | null,
  };
}

describe('study keyboard shortcuts', () => {
  it('reveals with Space or Enter when no control has focus', () => {
    expect(readStudyCommand(press(' ', 'Space'), false)).toBe('reveal');
    expect(readStudyCommand(press('Enter', 'Enter'), false)).toBe('reveal');
  });

  it('leaves Space and Enter to a focused button or link', () => {
    expect(readStudyCommand(press('Enter', 'Enter', new FakeFocusTarget('button')), false)).toBe(
      null,
    );
    expect(readStudyCommand(press(' ', 'Space', new FakeFocusTarget('a[href]')), false)).toBe(null);
  });

  it('never interprets typing in fields or dialogs', () => {
    expect(readStudyCommand(press(' ', 'Space', new FakeFocusTarget('textarea')), false)).toBe(
      null,
    );
    expect(readStudyCommand(press('3', 'Digit3', new FakeFocusTarget('input')), true)).toBe(null);
  });

  it('rates 1–4 only after reveal, including physical digits and the numpad', () => {
    expect(readStudyCommand(press('3', 'Digit3'), false)).toBe(null);
    expect(readStudyCommand(press('3', 'Digit3', new FakeFocusTarget('button')), true)).toBe(3);
    expect(readStudyCommand(press('&', 'Digit1'), true)).toBe(1);
    expect(readStudyCommand(press('4', 'Numpad4'), true)).toBe(4);
    expect(readStudyCommand(press('5', 'Digit5'), true)).toBe(null);
  });

  it('ignores repeats and modifier shortcuts', () => {
    expect(readStudyCommand({ ...press('2', 'Digit2'), repeat: true }, true)).toBe(null);
    expect(readStudyCommand({ ...press('Enter', 'Enter'), metaKey: true }, false)).toBe(null);
  });
});
