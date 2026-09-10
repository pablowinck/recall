import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createTestAccount, connectTestMcp } from './fixtures';

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
