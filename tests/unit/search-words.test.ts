import { expect, it } from 'vitest';
import { searchWords } from '../../apps/api/src/cards/search-words';

it('folds a search into words without case, accents, Markdown markers or stray spaces', () => {
  expect(searchWords('  Capital  Portugal ')).toEqual(['capital', 'portugal']);
  expect(searchWords('**Saudação**?')).toEqual(['saudacao?']);
  expect(searchWords('snake_case')).toEqual(['snakecase']);
  expect(searchWords('Straße STRASSE')).toEqual(['strasse', 'strasse']);
  expect(searchWords('50% C:\\Users')).toEqual(['50%', 'c:\\users']);
  expect(searchWords('   ')).toEqual([]);
});
