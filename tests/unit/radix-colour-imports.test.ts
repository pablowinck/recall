import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const WEB_SOURCE = join(process.cwd(), 'apps/web/src');
const PRODUCT_LAYOUT = join(WEB_SOURCE, 'app/(product)/layout.tsx');
const RADIX_SCALES = [
  'amber',
  'blue',
  'bronze',
  'brown',
  'crimson',
  'cyan',
  'gold',
  'grass',
  'gray',
  'green',
  'indigo',
  'iris',
  'jade',
  'lime',
  'mauve',
  'mint',
  'olive',
  'orange',
  'pink',
  'plum',
  'purple',
  'red',
  'ruby',
  'sage',
  'sand',
  'sky',
  'slate',
  'teal',
  'tomato',
  'violet',
  'yellow',
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

function scalesInUse(): string[] {
  const pattern = new RegExp(
    `(?:color="|accentColor: '|grayColor: '|var\\(--)(${RADIX_SCALES.join('|')})\\b`,
    'g',
  );
  const used = new Set<string>();
  for (const file of sourceFiles(WEB_SOURCE)) {
    for (const match of readFileSync(file, 'utf8').matchAll(pattern)) used.add(match[1]!);
  }
  return [...used].sort();
}

it('imports the Radix colour scale for every colour the web app uses', () => {
  const layout = readFileSync(PRODUCT_LAYOUT, 'utf8');
  const missing = scalesInUse().filter(
    (scale) => !layout.includes(`@radix-ui/themes/tokens/colors/${scale}.css`),
  );
  expect(missing).toEqual([]);
});
