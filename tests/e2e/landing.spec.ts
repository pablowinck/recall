import { expect, test } from '@playwright/test';
import { expectNoAccessibilityViolations } from './interaction-steps';

test('the landing page invites a first-time visitor to create an account', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Recall makes them stick');
  const create = page.getByRole('link', { name: 'Create your account' }).first();
  await expect(create).toHaveAttribute('href', '/app?new=1');
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveAttribute(
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
