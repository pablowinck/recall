/** Name the platform's primary shortcut modifier for visible hints. Example: shortcutModifierLabel('MacIntel') === '⌘'. */
export function shortcutModifierLabel(platform: string): '⌘' | 'Ctrl' {
  return /mac|iphone|ipad|ipod/i.test(platform) ? '⌘' : 'Ctrl';
}
