import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createTestAccount, connectTestMcp } from './fixtures';
import { FakeCardSaveOutage } from './fake-card-save-outage';
import { signInToRecall } from './interaction-steps';

test('login → create/edit → MCP → study → persist → sign out', async ({ page }, testInfo) => {
  const account = await createTestAccount();
  try {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
    await page.getByLabel('Password', { exact: true }).fill(account.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('heading', { name: /A good day/ })).toBeVisible();
    await page.getByRole('button', { name: 'New card', exact: true }).click();
    await page.getByRole('textbox', { name: /^Front/ }).fill('What does stumped mean?');
    await page.getByRole('textbox', { name: /^Back/ }).fill('Unable to work out the answer.');
    await page.getByRole('textbox', { name: /^Tags/ }).fill('learning, vocabulary');
    await page.getByRole('button', { name: 'Create card', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('heading', { name: 'What does stumped mean?', exact: true }).click();
    await page
      .getByRole('textbox', { name: /^Back/ })
      .fill('Unable to work out the answer to a question.');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const token = await account.api.createToken('Browser test');
    const mcp = await connectTestMcp(token.token);
    try {
      const deck = (await account.api.workspace()).decks[0]!;
      await mcp.callTool({
        name: 'create_flashcard',
        arguments: {
          deck_id: deck.id,
          front: 'MCP card: knew',
          back: 'Past of know',
          tags: ['past'],
        },
      });
    } finally {
      await mcp.close();
    }
    await page.reload();
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'MCP card: knew' })).toBeVisible();
    await page.getByRole('button', { name: 'Today', exact: true }).click();
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(page.getByRole('heading', { name: 'What does stumped mean?' })).toBeVisible();
    await expect(
      page.getByText('Unable to work out the answer to a question.', { exact: true }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await expect(
      page.getByText('Unable to work out the answer to a question.', { exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-study.png`,
      fullPage: true,
      animations: 'disabled',
    });
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    if (testInfo.project.name === 'desktop')
      await page.getByRole('button', { name: /Good/ }).press('3');
    else await page.getByRole('button', { name: /Good/ }).click();
    await expect(page.getByRole('heading', { name: 'MCP card: knew' })).toBeVisible();
    expect((await account.api.workspace()).stats.reviewed_today).toBe(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    await page.getByRole('button', { name: 'Leave session' }).click();
    await page
      .getByRole('button', { name: 'Use dark theme', exact: true })
      .filter({ visible: true })
      .click();
    const darkAccessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(darkAccessibility.violations).toEqual([]);
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-dashboard-dark.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page
      .getByRole('button', { name: 'Sign out', exact: true })
      .filter({ visible: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('card save failure keeps the draft and permits one successful retry', async ({ page }) => {
  const account = await createTestAccount();
  const outage = new FakeCardSaveOutage();
  try {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
    await page.getByLabel('Password', { exact: true }).fill(account.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('heading', { name: /A good day/ })).toBeVisible();
    const dashboardAccessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(dashboardAccessibility.violations).toEqual([]);
    await page.getByRole('button', { name: 'New card', exact: true }).click();
    await page.getByRole('textbox', { name: /^Front/ }).fill('A draft worth keeping');
    await page
      .getByRole('textbox', { name: /^Back/ })
      .fill('This text must survive a failed save.');
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await outage.install(page);
    await page.getByRole('button', { name: 'Create card', exact: true }).click();
    await expect(page.getByRole('textbox', { name: /^Front/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
    outage.release();
    await expect(page.getByRole('alert')).toContainText('Temporary outage. Please retry.');
    await expect(page.getByRole('textbox', { name: /^Front/ })).toHaveValue(
      'A draft worth keeping',
    );
    await expect(page.getByRole('textbox', { name: /^Back/ })).toHaveValue(
      'This text must survive a failed save.',
    );
    await page.getByRole('button', { name: 'Create card', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await account.api.cards()).total).toBe(1);
    expect(outage.attempts).toBe(2);
  } finally {
    outage.release();
    await account.cleanup();
  }
});

test('deleting the last card on a page returns to a valid page', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.importCards(
      Array.from({ length: 25 }, (_, index) => ({
        deck_id: deck.id,
        front: `Paging question ${index + 1}`,
        back: 'Paging answer',
        tags: [],
      })),
    );
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.locator('.library-card')).toHaveCount(1);
    await page.locator('.library-card').click();
    await page.getByRole('button', { name: 'Delete card', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 2000 });
    await page.getByRole('button', { name: 'Delete permanently', exact: true }).click();
    await expect(page.getByText('Page 1 of 1', { exact: true })).toBeVisible();
    await expect(page.locator('.library-card')).toHaveCount(24);
  } finally {
    await account.cleanup();
  }
});
