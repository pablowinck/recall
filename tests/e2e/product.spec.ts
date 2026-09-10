import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createTestAccount, connectTestMcp } from './fixtures';
import { FakeCardSaveOutage } from './fake-card-save-outage';
import { signInToRecall, fillSignInForm } from './interaction-steps';

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
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(page.getByRole('heading', { name: 'Nicely done.', exact: true })).toBeVisible();
    expect((await account.api.workspace()).stats.reviewed_today).toBe(2);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    await page.getByRole('button', { name: 'Back to today' }).click();
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

test('switching accounts in the same tab does not reuse the previous library', async ({ page }) => {
  const first = await createTestAccount();
  const second = await createTestAccount();
  try {
    const firstDeck = (await first.api.workspace()).decks[0]!;
    const secondDeck = (await second.api.workspace()).decks[0]!;
    await first.api.createCard({
      deck_id: firstDeck.id,
      front: 'First account private card',
      back: 'Private answer',
      tags: [],
    });
    await second.api.createCard({
      deck_id: secondDeck.id,
      front: 'Second account private card',
      back: 'Another private answer',
      tags: [],
    });
    await signInToRecall(page, first);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search cards' }).fill('First account');
    await expect(page.getByRole('heading', { name: 'First account private card' })).toBeVisible();
    await page
      .getByRole('button', { name: 'Sign out', exact: true })
      .filter({ visible: true })
      .click();
    await fillSignInForm(page, second);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Search cards' })).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Second account private card' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'First account private card' })).toHaveCount(0);
  } finally {
    await first.cleanup();
    await second.cleanup();
  }
});

test('creates and revokes a personal MCP connection through the web', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Connections', exact: true }).click();
    await page.getByRole('button', { name: 'Create personal connection', exact: true }).click();
    const tokenField = page.getByRole('textbox', { name: 'New personal token' });
    await expect(tokenField).toHaveValue(/^recall_/);
    const token = await tokenField.inputValue();
    const mcp = await connectTestMcp(token);
    try {
      expect((await mcp.listTools()).tools).toHaveLength(9);
    } finally {
      await mcp.close();
    }
    await page.getByRole('button', { name: 'I saved it', exact: true }).click();
    await expect(tokenField).toHaveCount(0);
    await page.getByRole('button', { name: 'Revoke connection Codex', exact: true }).click();
    await page.getByRole('button', { name: 'Revoke connection', exact: true }).click();
    await expect(
      page.getByText('You have not created a connection yet.', { exact: true }),
    ).toBeVisible();
    expect(
      (
        await fetch('http://localhost:3211/v1/workspace', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).status,
    ).toBe(401);
  } finally {
    await account.cleanup();
  }
});

test('a duplicate deck name remains editable after the server rejects it', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('button', { name: 'New deck', exact: true }).click();
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('My first deck');
    await page.getByRole('button', { name: 'Create deck', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('This record already exists.');
    await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
      'My first deck',
    );
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Italian practice');
    await page.getByRole('button', { name: 'Create deck', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await account.api.workspace()).decks.map((deck) => deck.name)).toContain(
      'Italian practice',
    );
  } finally {
    await account.cleanup();
  }
});

test('creates a new deck inline from the card editor without discarding entered card text', async ({
  page,
}) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'New card', exact: true }).first().click();
    await page
      .getByPlaceholder('What would you like to remember?')
      .fill('Qual è la capitale d’Italia?');
    await page.getByPlaceholder('Write the answer, with an example if it helps.').fill('Roma.');

    await page.getByRole('button', { name: 'New deck', exact: true }).click();
    const inlineInput = page.getByPlaceholder('e.g. Spanish Vocabulary');
    await inlineInput.fill('Italian Language');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(inlineInput).toHaveCount(0);

    // Verify card content was preserved and new deck is selected
    await expect(page.getByPlaceholder('What would you like to remember?')).toHaveValue(
      'Qual è la capitale d’Italia?',
    );
    await expect(
      page.getByPlaceholder('Write the answer, with an example if it helps.'),
    ).toHaveValue('Roma.');

    await page.getByRole('button', { name: 'Create card', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    const cards = (await account.api.cards()).cards;
    const italianCard = cards.find((c) => c.front === 'Qual è la capitale d’Italia?');
    expect(italianCard).toBeDefined();

    const decks = (await account.api.workspace()).decks;
    const italianDeck = decks.find((d) => d.name === 'Italian Language');
    expect(italianDeck).toBeDefined();
    expect(italianCard?.deck_id).toBe(italianDeck?.id);
  } finally {
    await account.cleanup();
  }
});

test('appearance follows a saved choice or the system before the app hydrates', async ({
  page,
}) => {
  const isDark = (): Promise<boolean> =>
    page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await isDark()).toBe(true);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.evaluate(() => localStorage.setItem('recall-appearance', 'dark'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await isDark()).toBe(true);
  await page.evaluate(() => localStorage.removeItem('recall-appearance'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await isDark()).toBe(false);
});

test('keyboard focus stays visible inside the card editor dialog', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'New card', exact: true }).first().click();
    await expect(page.getByRole('textbox', { name: /^Front/ })).toBeFocused();
    for (let step = 0; step < 3; step += 1) await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
    const outline = await page.evaluate(
      () => getComputedStyle(document.activeElement as Element).outlineStyle,
    );
    expect(outline).not.toBe('none');
  } finally {
    await account.cleanup();
  }
});
