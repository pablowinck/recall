import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { TestAccount } from './fixtures';

/** Sign in through the actual form and wait for the workspace. Example: await signInToRecall(page, account). */
export async function signInToRecall(page: Page, account: TestAccount): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await fillSignInForm(page, account);
}

/** Change accounts through the form without forcing a page reload. Example: await fillSignInForm(page, account). */
export async function fillSignInForm(page: Page, account: TestAccount): Promise<void> {
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
}

/** Check WCAG A/AA once entrance animations settle, so axe never measures mid-fade colors. Example: await expectNoAccessibilityViolations(page). */
export async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  await settleAnimations(page);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
}

// Dialog fades on slower CI runners made a solid button measure 4.41:1 mid-animation (run 34521774379).
// Only finite animations are awaited: spinners run forever.
/** Wait for finite animations to finish before measuring. Example: await settleAnimations(page). */
export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}
