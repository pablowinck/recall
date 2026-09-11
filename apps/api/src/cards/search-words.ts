/**
 * Split a search into the words a card must all contain, folded the way the API folds card text: lower case, without
 * accents, Markdown markers or stray spaces. Example: searchWords(' Capital  **Portugal** ') returns
 * ['capital', 'portugal'].
 */
export function searchWords(search: string): string[] {
  return search
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}
