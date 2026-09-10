import { describe, expect, it } from 'vitest';
import { shortcutModifierLabel } from '../../apps/web/src/lib/keyboard';

describe('shortcut modifier label', () => {
  it('uses the command symbol on Apple platforms', () => {
    expect(shortcutModifierLabel('MacIntel')).toBe('⌘');
    expect(shortcutModifierLabel('iPad')).toBe('⌘');
  });

  it('uses Ctrl everywhere else', () => {
    expect(shortcutModifierLabel('Win32')).toBe('Ctrl');
    expect(shortcutModifierLabel('Linux x86_64')).toBe('Ctrl');
    expect(shortcutModifierLabel('')).toBe('Ctrl');
  });
});
