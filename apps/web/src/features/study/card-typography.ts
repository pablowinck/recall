/**
 * Size a question by how much there is to read: display size for a few words, one step down for a
 * sentence, reading size for a paragraph. Example: frontSizeClass('Define “candid”').
 */
export function frontSizeClass(front: string): string | undefined {
  if (front.length > 240) return 'is-paragraph';
  if (front.length > 90) return 'is-long';
  return undefined;
}
