const SUPPORT_NUMBER = '5551992116696';
const SUPPORT_MESSAGE = 'Hey! I am using your Recall flashcards app and I need some help.';

/** Open a WhatsApp chat with the first message already written. Example: supportChatUrl(). */
export function supportChatUrl(): string {
  return `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`;
}
