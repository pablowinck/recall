import { expect, test } from '@playwright/test';
import { expectNoAccessibilityViolations } from './interaction-steps';

test('the landing page invites a first-time visitor to create an account', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Recall makes them stick');
  const create = page.getByRole('link', { name: 'Create a free account' }).first();
  await expect(create).toHaveAttribute('href', '/app?new=1');
  await expect(page.getByRole('link', { name: 'Sign in', exact: true }).first()).toHaveAttribute(
    'href',
    '/app',
  );
  await expectNoAccessibilityViolations(page);
  await create.click();
  await expect(page.getByRole('heading', { name: 'Start remembering' })).toBeVisible();
});

test('search engines are pointed at the public page and away from the workspace', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  const rules = await robots.text();
  expect(rules).toContain('Disallow: /app');
  expect(rules).toContain('Sitemap:');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('<loc>');
});

test('the landing page points to the source and to contributing', async ({ page }) => {
  await page.goto('/');
  const github = page.getByRole('link', { name: /on GitHub/ }).first();
  await expect(github).toHaveAttribute('href', 'https://github.com/pablowinck/recall');
  await expect(github).toHaveAttribute('rel', /noopener/);
  await expect(page.getByRole('link', { name: /How to contribute/ })).toHaveAttribute(
    'href',
    'https://github.com/pablowinck/recall/blob/main/CONTRIBUTING.md',
  );
});

test('the landing page answers the questions a newcomer asks', async ({ page }) => {
  await page.goto('/');
  const chatgpt = page
    .locator('details')
    .filter({ hasText: 'Does Recall work with ChatGPT or claude.ai?' });
  await chatgpt.locator('summary').click();
  await expect(chatgpt).toContainText('OAuth sign-in');
  await expect(page).toHaveTitle('Recall — free spaced repetition flashcards your AI writes');
  const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structured.some((json) => json.includes('"FAQPage"'))).toBe(true);
});

test('assistants find a Markdown guide and lost visitors find their way', async ({
  page,
  request,
}) => {
  const guide = await request.get('/llms.txt');
  expect(guide.ok()).toBe(true);
  expect(guide.headers()['content-type']).toContain('text/markdown');
  expect(await guide.text()).toContain('## MCP tools');
  const missing = await page.goto('/this-page-does-not-exist');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'What Recall is' })).toHaveAttribute('href', '/');
  const icon = await request.get('/robots.txt');
  expect(await icon.text()).not.toMatch(/Disallow: \/app\s*$/m);
});

test('shared links carry a preview image', async ({ page, request }) => {
  await page.goto('/');
  const preview = page.locator('meta[property="og:image"]');
  await expect(preview).toHaveAttribute('content', /\/opengraph-image/);
  const image = await request.get('/opengraph-image');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
});
