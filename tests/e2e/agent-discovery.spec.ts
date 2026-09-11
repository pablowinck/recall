import { expect, test } from '@playwright/test';

test('agents find the Markdown twin of the home page from its headers, its head and /index.md', async ({
  request,
}) => {
  const home = await request.get('/', { headers: { Accept: 'text/html' } });
  expect(home.headers()['link']).toContain('</llms.txt>; rel="alternate"; type="text/markdown"');
  const alternates = (await home.text()).match(/<link[^>]*rel="alternate"[^>]*>/g) ?? [];
  expect(
    alternates.some((tag) => tag.includes('type="text/markdown"') && tag.includes('/llms.txt')),
  ).toBe(true);
  const twin = await request.get('/index.md');
  expect(twin.headers()['content-type']).toContain('text/markdown');
  expect(await twin.text()).toContain('# Recall');
});

test('agents comparing tools read the price and see when the site last changed', async ({
  request,
}) => {
  const pricing = await request.get('/pricing.md');
  expect(pricing.headers()['content-type']).toContain('text/markdown');
  expect(await pricing.text()).toContain('Recall is free to use');
  const sitemap = await request.get('/sitemap.xml');
  expect(await sitemap.text()).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}/);
});
