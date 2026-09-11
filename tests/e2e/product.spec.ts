import { expect, test } from '@playwright/test';
import { createTestAccount, connectTestMcp } from './fixtures';
import {
  expectNoAccessibilityViolations,
  fillSignInForm,
  signInToRecall,
} from './interaction-steps';

test('login → create/edit → MCP → study → persist → sign out', async ({ page }, testInfo) => {
  const account = await createTestAccount();
  try {
    await page.goto('/app');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
    await page.getByLabel('Password', { exact: true }).fill(account.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Every memory starts with a card' }),
    ).toBeVisible();
    await expect(page.getByText('cards in your library', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'New card', exact: true }).click();
    await page.getByRole('textbox', { name: /^Front/ }).fill('What does stumped mean?');
    await page.getByRole('textbox', { name: /^Back/ }).fill('Unable to work out the answer.');
    await page.getByRole('textbox', { name: /^Tags/ }).fill('learning, vocabulary');
    await page.getByRole('button', { name: 'Create card', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Card created' })).toHaveCount(1);
    await expect(page.getByText('cards in your library', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('heading', { name: 'What does stumped mean?', exact: true }).click();
    await page
      .getByRole('textbox', { name: /^Back/ })
      .fill('Unable to work out the answer to a question.');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Card saved' })).toHaveCount(1);
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
    await expect(page.getByRole('progressbar', { name: 'Session progress' })).toHaveAttribute(
      'aria-valuetext',
      '0 of 2 reviewed',
    );
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
    await expectNoAccessibilityViolations(page);
    if (testInfo.project.name === 'desktop')
      await page.getByRole('button', { name: /Good/ }).press('3');
    else await page.getByRole('button', { name: /Good/ }).click();
    await expect(page.getByRole('heading', { name: 'MCP card: knew' })).toBeVisible();
    expect((await account.api.workspace()).stats.reviewed_today).toBe(1);
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(page.getByRole('heading', { name: 'Nicely done', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nicely done', exact: true })).toBeFocused();
    expect((await account.api.workspace()).stats.reviewed_today).toBe(2);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    await page.getByRole('button', { name: 'Back to Today' }).click();
    await page
      .getByRole('button', { name: 'Use dark theme', exact: true })
      .filter({ visible: true })
      .click();
    await expectNoAccessibilityViolations(page);
    await page.screenshot({
      path: `test-results/${testInfo.project.name}-dashboard-dark.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page
      .getByRole('button', { name: 'Sign out', exact: true })
      .filter({ visible: true })
      .click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Sign out', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
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
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Sign out', exact: true })
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

test('appearance follows a saved choice or the system before the app hydrates', async ({
  page,
}) => {
  const isDark = (): Promise<boolean> =>
    page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  expect(await isDark()).toBe(true);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.evaluate(() => localStorage.setItem('recall-appearance', 'dark'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await isDark()).toBe(true);
  // Browsers colour their toolbar from the first matching theme-color tag.
  const toolbarColor = page.locator('meta[name="theme-color"]').first();
  await expect(toolbarColor).toHaveAttribute('content', '#0a0a09');
  await page.evaluate(() => localStorage.removeItem('recall-appearance'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await isDark()).toBe(false);
  await expect(toolbarColor).toHaveAttribute('content', '#f1f0ef');
});

test('serves the brand icons used by browsers and home screens', async ({ request }) => {
  const favicon = await request.get('/icon.svg');
  expect(favicon.ok()).toBe(true);
  expect(favicon.headers()['content-type']).toContain('image/svg+xml');
  const homeScreen = await request.get('/apple-icon');
  expect(homeScreen.ok()).toBe(true);
  expect(homeScreen.headers()['content-type']).toContain('image/png');
});

test('a workspace that cannot load offers a calm retry', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.route('**/v1/workspace**', (route) => route.abort());
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Couldn’t load Recall' })).toBeVisible();
    await expect(
      page.getByText('Can’t reach Recall. Check your connection and try again.'),
    ).toBeVisible();
    await page.unroute('**/v1/workspace**');
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('an open Today catches up when the tab comes back', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await expect(page.getByRole('button', { name: /Start reviewing/ })).toHaveCount(0);
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Added while the tab was in the background',
      back: 'Answer',
      tags: [],
    });
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(page.getByRole('button', { name: /Start reviewing/ })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('signing out asks first and can be called off', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page
      .getByRole('button', { name: 'Sign out', exact: true })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Stay signed in', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('help reaches a person on WhatsApp with the message already written', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    const help = page.getByRole('link', { name: 'Get help on WhatsApp' }).filter({ visible: true });
    await expect(help).toHaveAttribute('rel', /noopener/);
    await expect(help).toHaveAttribute('target', '_blank');
    const href = await help.getAttribute('href');
    expect(href).toContain('https://wa.me/5551992116696');
    expect(decodeURIComponent(href ?? '')).toContain('I need some help.');
  } finally {
    await account.cleanup();
  }
});

test('each view has its own address and Back stays inside the app', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/library$/);
    await expect(page).toHaveTitle('Library · Recall');
    await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Connections', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/connections$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/app\/library$/);
    await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeFocused();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
    await expect(page).toHaveTitle('Today · Recall');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
    await page.goto('/app/library');
    await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('signing in while Recall is unreachable says so and keeps focus on Sign in', async ({
  page,
}) => {
  const account = await createTestAccount();
  try {
    await page.goto('/app');
    await page.route('**/auth/v1/token**', (route) => route.abort());
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
    await page.getByLabel('Password', { exact: true }).fill(account.password);
    const submit = page.getByRole('button', { name: 'Sign in', exact: true });
    await submit.click();
    await expect(
      page.getByText('Can’t reach Recall. Check your connection and try again.'),
    ).toBeVisible();
    await expect(submit).toBeFocused();
    await page.unroute('**/auth/v1/token**');
    await submit.click();
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});
