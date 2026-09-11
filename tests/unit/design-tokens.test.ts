import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';

const WEB_SOURCE = join(process.cwd(), 'apps/web/src');

function styleSheets(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return styleSheets(path);
    return name.endsWith('.css') ? [path] : [];
  });
}

/** Every value the web app's style sheets give a property, as "file: value". */
function declarations(property: string): string[] {
  const pattern = new RegExp(`(?<![\\w-])${property}:\\s*([^;]+);`, 'g');
  return styleSheets(WEB_SOURCE).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(pattern)].map(
      (match) => `${relative(WEB_SOURCE, file)}: ${match[1]!.trim()}`,
    ),
  );
}

it('sizes text below a title from the type ramp in tokens.css', () => {
  // Titles and inline code set their own sizes; body and secondary text use --text-caption to --text-body.
  const offRamp = declarations('font-size').filter((entry) =>
    /: (0?\.\d+|1)rem$|: 1[0-5]px$/.test(entry),
  );
  expect(offRamp).toEqual([]);
});

it('sets text in four weights', () => {
  const offRamp = declarations('font-weight').filter(
    (entry) => !/: (400|500|600|700)$/.test(entry),
  );
  expect(offRamp).toEqual([]);
});
