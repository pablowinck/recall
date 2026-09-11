import { describe, expect, it } from 'vitest';
import { supportChatUrl } from '../../apps/web/src/lib/support-link';

describe('the help link', () => {
  it('opens a WhatsApp chat with the support number', () => {
    expect(supportChatUrl()).toContain('https://wa.me/5551992116696?text=');
  });

  it('writes the first message for the reader', () => {
    expect(decodeURIComponent(supportChatUrl())).toContain(
      'I am using your Recall flashcards app and I need some help.',
    );
  });
});
