import { expect, type Page } from '@playwright/test';
import type { TestAccount } from './fixtures';

/** Sign in through the actual form and wait for the workspace. Example: await signInToRecall(page, account). */
export async function signInToRecall(page: Page, account: TestAccount): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: /A good day/ })).toBeVisible();
}
