/**
 * Split a search into the words a card must all contain, folded the way the API folds card text: lower case, without
 * accents, Markdown markers or stray spaces, and with ß as ss, since it has no accent to remove. Example: searchWords(' Capital  **Portugal** ') returns
 * ['capital', 'portugal'].
 */
export function searchWords(search: string): string[] {
  return search
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[*_`]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}
