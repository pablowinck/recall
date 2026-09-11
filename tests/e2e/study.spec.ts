import { expect, test, type Locator, type Page } from '@playwright/test';
import { createTestAccount, revokeSession } from './fixtures';
import { fillSignInForm, signInToRecall } from './interaction-steps';

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
    // A short card leaves nothing beneath the bar, so it draws no hairline.
    await expect(page.locator('.reveal-action')).toHaveCSS('box-shadow', 'none');
    await page.keyboard.press('Space');
    await expect(page.locator('.review-answer')).toBeFocused();
    const ink = await card.locator('h2').evaluate((node) => getComputedStyle(node).color);
    await expect(page.locator('.review-answer .card-body p').first()).toHaveCSS('color', ink);
    await page.keyboard.press('3');
    await expect(page.getByText('1 of 2 reviewed')).toBeVisible();
    await expect(card).toHaveCSS('animation-name', 'card-in');
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
    // The long answer runs beneath the pinned bar, so the bar shows its material and hairline.
    await expect(page.locator('.study-view')).toHaveAttribute('data-bar-over-card', '');
    await expect(page.locator('.rating-section')).not.toHaveCSS('box-shadow', 'none');
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
    await page.route('**/v1/cards/*/reviews', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
    await page.getByRole('button', { name: 'Retry', exact: true }).focus();
    await page.keyboard.press('Enter');
    // Retrying keeps focus on the button, which reports busy instead of disabling itself.
    await expect(page.getByRole('button', { name: 'Retrying…', exact: true })).toBeFocused();
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
    await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeFocused();
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

test('a rating says what it claims and which key presses it', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'A card to rate',
      back: 'An answer to rate',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    const good = page.getByRole('button', { name: /Good/ });
    await expect(good).toHaveAttribute('aria-keyshortcuts', '3');
    await expect(good).toHaveAccessibleName(/You recalled it\./);
  } finally {
    await account.cleanup();
  }
});

test('card text shows its emphasis instead of the markers', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'O que significa **offset**?',
      back: '**Compensar**, contrabalançar.\n\n- Usado em `negócios`\n- E em finanças',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(page.locator('.review-card h2 strong')).toHaveText('offset');
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await expect(page.locator('.review-answer strong')).toHaveText('Compensar');
    await expect(page.locator('.review-answer li')).toHaveCount(2);
    await expect(page.locator('.review-answer code')).toHaveText('negócios');
    await expect(page.locator('.review-card')).not.toContainText('**');
  } finally {
    await account.cleanup();
  }
});

test('a double tap on Reveal answer never records a rating', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.importCards([
      { deck_id: deck.id, front: 'Double tap question', back: 'Double tap answer', tags: [] },
    ]);
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).dblclick();
    await expect(page.locator('.review-answer')).toBeVisible();
    // Absence can't be awaited: give a stray save time to land, then confirm nothing was saved.
    await page.waitForTimeout(800);
    expect((await account.api.workspace()).stats.reviewed_today).toBe(0);
    await expect(page.getByText('0 of 1 reviewed')).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('a session revoked elsewhere returns to sign-in and says why', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Revoked session question',
      back: 'Revoked session answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    const browserToken = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((name) => name.endsWith('-auth-token'));
      const stored = JSON.parse((key && localStorage.getItem(key)) || '{}') as {
        access_token?: string;
      };
      return stored.access_token ?? '';
    });
    await revokeSession(browserToken);
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(
      page.getByText('Your session ended. Sign in again to pick up where you left off.'),
    ).toBeVisible();
    await fillSignInForm(page, account);
    expect((await account.api.workspace()).stats.reviewed_today).toBe(0);
  } finally {
    await account.cleanup();
  }
});

test('the reveal and rating bar lines up with the card beyond phone widths', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 600, 'Phones bleed the bar to the screen edges.');
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Aligned question',
      back: 'Aligned answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    const card = page.locator('.review-card');
    await expectSameWidth(card, page.locator('.reveal-action'));
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await expectSameWidth(card, page.locator('.rating-section'));
  } finally {
    await account.cleanup();
  }
});

/** Compare two rendered widths to the pixel. Example: await expectSameWidth(card, bar). */
async function expectSameWidth(expected: Locator, actual: Locator): Promise<void> {
  const [target, measured] = await Promise.all([expected.boundingBox(), actual.boundingBox()]);
  expect(Math.round(measured?.width ?? 0)).toBe(Math.round(target?.width ?? -1));
}

test('right-to-left card text reads right to left beside a translation', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'ما معنى كلمة ذاكرة؟',
      back: 'Memory.\n\nالذاكرة هي القدرة على التذكر.',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    const question = page.locator('.review-card h2');
    await expect(question).toBeVisible();
    expect(await readDirection(question)).toBe('rtl');
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    const paragraphs = page.locator('.review-answer .card-body p');
    await expect(paragraphs).toHaveCount(2);
    expect(await readDirection(paragraphs.nth(0))).toBe('ltr');
    expect(await readDirection(paragraphs.nth(1))).toBe('rtl');
    const questionEnd = await question.evaluate((node) => node.getBoundingClientRect().right);
    const answerEnd = await paragraphs
      .nth(1)
      .evaluate((node) => node.getBoundingClientRect().right);
    expect(Math.abs(questionEnd - answerEnd)).toBeLessThanOrEqual(2);
  } finally {
    await account.cleanup();
  }
});

/** Read the direction the browser resolved for an element, dir="auto" included. Example: await readDirection(heading). */
async function readDirection(target: Locator): Promise<'rtl' | 'ltr'> {
  return target.evaluate((node) => (node.matches(':dir(rtl)') ? 'rtl' : 'ltr'));
}

test('a deck review survives a reload, and signing in again starts on Today', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = await account.api.createDeck('Reload deck');
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Reload deck question',
      back: 'Reload deck answer',
      tags: [],
    });
    const other = (await account.api.workspace()).decks.find((item) => item.id !== deck.id)!;
    await account.api.createCard({
      deck_id: other.id,
      front: 'Other deck question',
      back: 'Other deck answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: /^Reload deck/ }).click();
    await expect(page).toHaveURL(new RegExp(`/app/study\\?deck=${deck.id}$`));
    await page.reload();
    await expect(page.getByText('Reload deck question', { exact: true })).toBeVisible();
    await expect(page.getByText('0 of 1 reviewed')).toBeVisible();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await fillSignInForm(page, account);
  } finally {
    await account.cleanup();
  }
});

test('the study screen keeps its edges in forced colours', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'High contrast question',
      back: 'High contrast answer',
      tags: [],
    });
    await page.emulateMedia({ forcedColors: 'active' });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(page.locator('.review-card')).toHaveCSS('border-top-style', 'solid');
    await expect(page.locator('.reveal-action')).toHaveCSS('border-top-style', 'solid');
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await expect(page.locator('.rating-button').first()).toHaveCSS('border-top-style', 'solid');
    await expect(page.locator('.rt-ProgressIndicator')).toHaveCSS('forced-color-adjust', 'none');
  } finally {
    await account.cleanup();
  }
});

test('at 400% zoom the study bar scrolls with the answer instead of covering it', async ({
  page,
}, testInfo) => {
  test.skip(
    Boolean(testInfo.project.use.hasTouch),
    'Touch screens keep the bar pinned within reach.',
  );
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Zoomed question',
      back: 'Zoomed answer, first line.\nZoomed answer, second line.',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.setViewportSize({ width: 480, height: 270 });
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(page.locator('.reveal-action')).toHaveCSS('position', 'static');
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await expect(page.locator('.rating-section')).toHaveCSS('position', 'static');
  } finally {
    await account.cleanup();
  }
});

test('a card deleted during a review says so and lets the review move on', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    const { cards } = await account.api.importCards([
      { deck_id: deck.id, front: 'Card an assistant deletes', back: 'Gone', tags: [] },
      { deck_id: deck.id, front: 'Card that stays', back: 'Still here', tags: [] },
    ]);
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    const question = page.locator('.review-card h2');
    const shown = await question.innerText();
    const remaining = cards.find((card) => card.front !== shown)!;
    await account.api.deleteCard(cards.find((card) => card.front === shown)!.id);
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(page.getByText('This card was deleted, perhaps by your assistant.')).toBeVisible();
    await page.getByRole('button', { name: 'Next card', exact: true }).click();
    await expect(question).toHaveText(remaining.front);
  } finally {
    await account.cleanup();
  }
});

test('a phone held sideways keeps Reveal answer within reach', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Only touch screens keep the bar pinned when short.');
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Sideways question',
      back: 'Sideways answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.setViewportSize({ width: 750, height: 342 });
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(page.getByRole('button', { name: /Reveal answer/ })).toBeInViewport();
  } finally {
    await account.cleanup();
  }
});

test('a paragraph-long question reads at regular weight within about 66 characters a line', async ({
  page,
}) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: `Explain, in your own words, ${'why spaced repetition works so well. '.repeat(8)}`,
      back: 'It fights forgetting.',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    const question = page.locator('.review-card h2.is-paragraph');
    await expect(question).toHaveCSS('font-weight', '500');
    expect(await measureInEm(question)).toBeLessThanOrEqual(32.5);
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.getByRole('button', { name: /Good/ }).click();
    const summary = page.locator('.session-complete > p').first();
    await expect(summary).toBeVisible();
    expect(await measureInEm(summary)).toBeLessThanOrEqual(30.5);
  } finally {
    await account.cleanup();
  }
});

/** Read an element's width in ems of its own font size. Example: await measureInEm(question). */
async function measureInEm(target: Locator): Promise<number> {
  return target.evaluate(
    (node) =>
      node.getBoundingClientRect().width / Number.parseFloat(getComputedStyle(node).fontSize),
  );
}

test('a session revoked while the tab was away explains itself when the tab returns', async ({
  page,
}) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    const browserToken = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((name) => name.endsWith('-auth-token'));
      const stored = JSON.parse((key && localStorage.getItem(key)) || '{}') as {
        access_token?: string;
      };
      return stored.access_token ?? '';
    });
    await revokeSession(browserToken);
    // Away long enough for the access token to expire: returning makes auth-js refresh it and find the revocation.
    await page.evaluate(() => {
      const key = Object.keys(localStorage).find((name) => name.endsWith('-auth-token'))!;
      const stored = JSON.parse(localStorage.getItem(key)!) as Record<string, unknown>;
      localStorage.setItem(
        key,
        JSON.stringify({ ...stored, expires_at: Math.floor(Date.now() / 1000) - 60 }),
      );
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(
      page.getByText('Your session ended. Sign in again to pick up where you left off.'),
    ).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('a failed refresh of Today stays off the review screen', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Question while Today is offline',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.route('**/v1/workspace**', (route) => route.abort());
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    const outage = page.getByText('Can’t reach Recall. Check your connection and try again.');
    await expect(outage).toBeVisible();
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(page.getByRole('button', { name: /Reveal answer/ })).toBeVisible();
    await expect(outage).toHaveCount(0);
  } finally {
    await account.cleanup();
  }
});

test('rating hints open on hover with a mouse and never on a tap', async ({ page }, testInfo) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Hint question',
      back: 'Hint answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    const good = page.getByRole('button', { name: /Good/ });
    if (testInfo.project.use.hasTouch) {
      await good.focus();
      await page.waitForTimeout(800);
      await expect(page.getByRole('tooltip')).toHaveCount(0);
    } else {
      await good.hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
    }
  } finally {
    await account.cleanup();
  }
});

test('the review context and deck rows tell screen readers what they are', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Labelled question',
      back: 'Labelled answer',
      tags: ['anatomy', 'bones'],
    });
    await signInToRecall(page, account);
    await expect(page.getByRole('button', { name: /start a review$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    await expect(page.locator('.study-context')).toHaveText(/Deck: .+Tags: anatomy · bones/);
  } finally {
    await account.cleanup();
  }
});
