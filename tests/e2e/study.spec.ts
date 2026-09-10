import { expect, test, type Page } from '@playwright/test';
import { createTestAccount } from './fixtures';
import { signInToRecall } from './interaction-steps';

test('study keys leave focused controls alone and keep focus on the card', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.importCards(
      ['First keyboard question', 'Second keyboard question'].map((front) => ({
        deck_id: deck.id,
        front,
        back: `Answer to ${front.toLowerCase()}`,
        tags: [],
      })),
    );
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    const card = page.locator('.review-card');
    await expect(card).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('.review-answer')).toBeFocused();
    await page.keyboard.press('3');
    await expect(page.getByText('1 of 2 reviewed')).toBeVisible();
    await expect(card).toBeFocused();
    await page.getByRole('button', { name: /Leave session/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
    expect((await account.api.workspace()).stats.reviewed_today).toBe(1);
  } finally {
    await account.cleanup();
  }
});

test('rating buttons stay within reach on a long card', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    const back = Array.from({ length: 40 }, (_, line) => `Line ${line + 1} of a long answer.`);
    await account.api.createCard({
      deck_id: deck.id,
      front: 'A card with a long answer',
      back: back.join('\n'),
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await expect(page.getByText('Line 40 of a long answer.')).toBeAttached();
    await expect(page.getByRole('button', { name: /Again/ })).toBeInViewport();
    await expect(page.getByRole('button', { name: /Easy/ })).toBeInViewport();
  } finally {
    await account.cleanup();
  }
});

test('a rating that fails to save keeps the answer and retries in place', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Offline question',
      back: 'Offline answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.route('**/v1/cards/*/reviews', (route) => route.abort(), { times: 1 });
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(
      page.getByText('Your rating wasn’t saved. Check your connection and try again.'),
    ).toBeVisible();
    await expect(page.getByText('Offline answer', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Nicely done', exact: true })).toBeVisible();
    expect((await account.api.workspace()).stats.reviewed_today).toBe(1);
  } finally {
    await account.cleanup();
  }
});

test('a failed check at the end of a batch never claims the session is done', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Last card before going offline',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.route('**/v1/study**', (route) => route.abort());
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(
      page.getByText('Can’t reach Recall. Check your connection and try again.'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nicely done' })).toHaveCount(0);
    await page.unroute('**/v1/study**');
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Nicely done', exact: true })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('a paragraph-long question is set smaller than a short one', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    const paragraph = `Explain, in your own words, ${'why spaced repetition works so well. '.repeat(8)}`;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Define “candid”',
      back: 'Frank.',
      tags: [],
    });
    await account.api.createCard({
      deck_id: deck.id,
      front: paragraph,
      back: 'It fights forgetting.',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    const first = await measureQuestion(page);
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.getByRole('button', { name: /Good/ }).click();
    const second = await measureQuestion(page, first.text);
    const [short, long] = first.text.startsWith('Define') ? [first, second] : [second, first];
    expect(long.text.length).toBeGreaterThan(240);
    expect(long.size).toBeLessThan(short.size);
  } finally {
    await account.cleanup();
  }
});

/** Read the current question and its rendered size, once it differs from the previous card. Example: await measureQuestion(page). */
async function measureQuestion(
  page: Page,
  previous?: string,
): Promise<{ text: string; size: number }> {
  const heading = page.locator('.review-card h2');
  await expect(heading).toBeVisible();
  // Rating posts before the queue advances, so the old question is still on screen for a moment.
  if (previous) await expect(heading).not.toHaveText(previous);
  return heading.evaluate((node) => ({
    text: node.textContent ?? '',
    size: Number.parseFloat(getComputedStyle(node).fontSize),
  }));
}

test('revealing a long question brings the answer into view', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: `Read this carefully. ${'Every sentence adds another line to the question. '.repeat(20)}`,
      back: 'The answer waits below a very long question.',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await expect(page.getByText('The answer waits below a very long question.')).toBeInViewport();
  } finally {
    await account.cleanup();
  }
});

test('the chosen rating stays lit while it saves', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Slow to save',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.route('**/v1/cards/*/reviews', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(page.locator('.rating-button.is-chosen')).toContainText('Good');
    await expect(page.getByRole('button', { name: /Again/ })).toBeDisabled();
    await expect(page.getByRole('heading', { name: 'Nicely done', exact: true })).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('a session hides the app chrome until it is over', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Focus question',
      back: 'Focus answer',
      tags: [],
    });
    await signInToRecall(page, account);
    const navigation = page.locator('nav[aria-label="Main navigation"]');
    await expect(navigation).toBeVisible();
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(navigation).toBeHidden();
    await page.getByRole('button', { name: /Leave session/ }).click();
    await expect(navigation).toBeVisible();
  } finally {
    await account.cleanup();
  }
});
