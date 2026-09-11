import { describe, expect, it } from 'vitest';
import { isCommandEnter, isSaveShortcut } from '../../apps/web/src/features/cards/editor-keys';

const enter = {
  key: 'Enter',
  keyCode: 13,
  metaKey: false,
  ctrlKey: false,
  nativeEvent: { isComposing: false },
};

describe('card editor keys', () => {
  it('treats a plain Enter as a command and Cmd or Ctrl+Enter as saving', () => {
    expect(isCommandEnter(enter)).toBe(true);
    expect(isSaveShortcut(enter)).toBe(false);
    expect(isSaveShortcut({ ...enter, metaKey: true })).toBe(true);
    expect(isSaveShortcut({ ...enter, ctrlKey: true })).toBe(true);
  });

  it('leaves Enter to the input method while it is composing text', () => {
    expect(isCommandEnter({ ...enter, nativeEvent: { isComposing: true } })).toBe(false);
    expect(isCommandEnter({ ...enter, keyCode: 229 })).toBe(false);
    expect(isSaveShortcut({ ...enter, ctrlKey: true, nativeEvent: { isComposing: true } })).toBe(
      false,
    );
  });

  it('ignores every other key', () => {
    expect(isCommandEnter({ ...enter, key: 'a', keyCode: 65 })).toBe(false);
  });
});
