import { expect, test } from '@playwright/test';
import { connectTestMcp, createTestAccount } from './fixtures';
import { FakeCardSaveOutage } from './fake-card-save-outage';
import {
  expectNoAccessibilityViolations,
  measureContrast,
  settleAnimations,
  signInToRecall,
} from './interaction-steps';

test('card save failure keeps the draft and permits one successful retry', async ({ page }) => {
  const account = await createTestAccount();
  const outage = new FakeCardSaveOutage();
  try {
    await page.goto('/app');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
    await page.getByLabel('Password', { exact: true }).fill(account.password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
    await expectNoAccessibilityViolations(page);
    await page.getByRole('button', { name: 'New card', exact: true }).click();
    await page.getByRole('textbox', { name: /^Front/ }).fill('A draft worth keeping');
    await page
      .getByRole('textbox', { name: /^Back/ })
      .fill('This text must survive a failed save.');
    await expectNoAccessibilityViolations(page);
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
    await expect(page.getByRole('status').filter({ hasText: 'Card deleted' })).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeFocused();
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
    await expect(page.getByRole('alert')).toContainText('You already have a deck with that name.');
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

    await page.getByRole('combobox', { name: 'Deck' }).click();
    await expect(page.getByRole('option', { name: 'My first deck' })).toBeVisible();
    await expect(page.getByRole('option', { name: /Create new deck/ })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'New deck', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Cancel new deck' })).toBeVisible();
    const inlineInput = page.getByRole('textbox', { name: 'New deck name' });
    await inlineInput.fill('日本語');
    // The Enter that confirms an input method's word is text input, so it must not create the deck.
    await inlineInput.dispatchEvent('keydown', { key: 'Enter', keyCode: 229, isComposing: true });
    await expect(inlineInput).toHaveValue('日本語');
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

test('the card editor keeps typed text until discarding is confirmed', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    const opener = page.getByRole('button', { name: 'New card', exact: true }).first();
    await opener.click();
    const front = page.getByRole('textbox', { name: /^Front/ });
    await front.fill('A draft worth keeping');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
    await expect(front).toHaveValue('A draft worth keeping');
    await page.getByRole('dialog').getByRole('button', { name: 'New deck', exact: true }).click();
    const deckName = page.getByPlaceholder('e.g. Spanish Vocabulary');
    await deckName.press('Escape');
    await expect(deckName).toHaveCount(0);
    await expect(front).toHaveValue('A draft worth keeping');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Discard', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect((await account.api.cards()).total).toBe(0);
  } finally {
    await account.cleanup();
  }
});

test('a long deck name never widens the library or the card editor', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const longName =
      'Portuguese irregular verbs, reflexive pronouns and everyday travel expressions'.slice(0, 80);
    const deck = await account.api.createDeck(longName);
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Question in a long deck',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter by deck' }).click();
    await page.getByRole('option', { name: longName, exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Question in a long deck' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    // Radix dialogs grow to a select's nowrap text, which pushed "Create card" off phone screens.
    await page.getByRole('button', { name: 'New card', exact: true }).first().click();
    await page.getByRole('combobox', { name: 'Deck' }).click();
    await page.getByRole('option', { name: longName, exact: true }).click();
    const create = await page
      .getByRole('button', { name: 'Create card', exact: true })
      .boundingBox();
    expect((create?.x ?? 0) + (create?.width ?? 0)).toBeLessThanOrEqual(page.viewportSize()!.width);
  } finally {
    await account.cleanup();
  }
});

test('a new card from a filtered library starts in the filtered deck', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = await account.api.createDeck('Spanish practice');
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Question in Spanish practice',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter by deck' }).click();
    await page.getByRole('option', { name: 'Spanish practice', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Question in Spanish practice' })).toBeVisible();
    await page.getByRole('button', { name: 'New card', exact: true }).first().click();
    await expect(page.getByRole('combobox', { name: 'Deck' })).toContainText('Spanish practice');
  } finally {
    await account.cleanup();
  }
});

test('closing the tab cannot take an unsaved draft silently', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'New card', exact: true }).first().click();
    await page.getByRole('textbox', { name: /^Front/ }).fill('A draft the browser must protect');
    const prompt = page.waitForEvent('dialog');
    await page.close({ runBeforeUnload: true });
    expect((await prompt).type()).toBe('beforeunload');
  } finally {
    await account.cleanup();
  }
});

test('the library keeps its filter while you visit another view', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = await account.api.createDeck('Kitchen Italian');
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Question about pasta',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter by deck' }).click();
    await page.getByRole('option', { name: 'Kitchen Italian', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search cards' }).fill('pasta');
    await expect(page.getByRole('heading', { name: 'Question about pasta' })).toBeVisible();
    await page.getByRole('button', { name: 'Today', exact: true }).click();
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Search cards' })).toHaveValue('pasta');
    await expect(page.getByRole('combobox', { name: 'Filter by deck' })).toContainText(
      'Kitchen Italian',
    );
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Search cards' })).toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Filter by deck' })).toContainText('All decks');
  } finally {
    await account.cleanup();
  }
});

test('a deck with nothing to review opens the library filtered to it', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await account.api.createDeck('Empty shelf');
    await signInToRecall(page, account);
    await page.getByRole('button', { name: /Empty shelf/ }).click();
    await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by deck' })).toContainText(
      'Empty shelf',
    );
  } finally {
    await account.cleanup();
  }
});

test('a library card announces its question, not everything printed on it', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: `A question with plenty to say. ${'It keeps going. '.repeat(12)}`,
      back: `An answer with just as much to say. ${'It also keeps going. '.repeat(12)}`,
      tags: ['first', 'second'],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    const opener = page.locator('.library-card h2 button');
    const name = await opener.getAttribute('aria-label');
    expect(name?.length).toBeLessThanOrEqual(80);
    await opener.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('an empty deck is deleted straight from the library filter', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await account.api.createDeck('Scratch deck');
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter by deck' }).click();
    await page.getByRole('option', { name: 'Scratch deck', exact: true }).click();
    await page.getByRole('button', { name: 'Delete deck Scratch deck', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Filter by deck' })).toContainText('All decks');
    await expect(page.getByRole('combobox', { name: 'Filter by deck' })).toBeFocused();
    await expect(
      page.getByRole('status').filter({ hasText: 'Deck “Scratch deck” deleted' }),
    ).toHaveCount(1);
    const decks = (await account.api.workspace()).decks.map((deck) => deck.name);
    expect(decks).not.toContain('Scratch deck');
  } finally {
    await account.cleanup();
  }
});

test('deleting a deck can move its cards to another deck', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = await account.api.createDeck('Temporary deck');
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Card that must survive',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter by deck' }).click();
    await page.getByRole('option', { name: 'Temporary deck', exact: true }).click();
    await page.getByRole('button', { name: 'Delete deck Temporary deck', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toContainText('1 card lives in this deck');
    await page.getByRole('button', { name: 'Delete deck', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Its cards moved to' })).toHaveCount(1);
    await expect(page.getByRole('combobox', { name: 'Filter by deck' })).toBeFocused();
    const workspace = await account.api.workspace();
    expect(workspace.decks.map((item) => item.name)).not.toContain('Temporary deck');
    const cards = await account.api.cards();
    expect(cards.total).toBe(1);
    expect(cards.cards[0]?.deck_id).toBe(workspace.decks[0]!.id);
  } finally {
    await account.cleanup();
  }
});

test('deleting a deck can take its cards with it', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = await account.api.createDeck('Deck to discard');
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Card that goes with it',
      back: 'Answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByRole('combobox', { name: 'Filter by deck' }).click();
    await page.getByRole('option', { name: 'Deck to discard', exact: true }).click();
    await page.getByRole('button', { name: 'Delete deck Deck to discard', exact: true }).click();
    await page.getByRole('radio', { name: 'Delete the cards with the deck' }).click();
    await page.getByRole('button', { name: 'Delete deck', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    expect((await account.api.cards()).total).toBe(0);
    const decks = (await account.api.workspace()).decks.map((item) => item.name);
    expect(decks).not.toContain('Deck to discard');
  } finally {
    await account.cleanup();
  }
});

test('the card editor names a tag limit before saving', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'New card', exact: true }).first().click();
    await page.getByRole('textbox', { name: /^Front/ }).fill('How many tags fit on a card?');
    await page.getByRole('textbox', { name: /^Back/ }).fill('Twelve.');
    const thirteen = Array.from({ length: 13 }, (_, index) => `tag ${index + 1}`).join(', ');
    await page.getByRole('textbox', { name: /^Tags/ }).fill(thirteen);
    await page.getByRole('button', { name: 'Create card', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Use up to 12 tags.');
    await expect(page.getByRole('textbox', { name: /^Tags/ })).toHaveValue(thirteen);
    expect((await account.api.cards()).total).toBe(0);
  } finally {
    await account.cleanup();
  }
});

test('the library shows cards an assistant added once the person comes back to it', async ({
  page,
}) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    const added = page.getByRole('heading', { name: 'Added by an assistant', exact: true });
    await expect(added).toHaveCount(0);
    const { token } = await account.api.createToken('Library freshness');
    const mcp = await connectTestMcp(token);
    try {
      const deck = (await account.api.workspace()).decks[0]!;
      await mcp.callTool({
        name: 'create_flashcard',
        arguments: {
          deck_id: deck.id,
          front: 'Added by an assistant',
          back: 'While the library was open',
          tags: [],
        },
      });
    } finally {
      await mcp.close();
    }
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(added).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test('a delete confirmation keeps a readable label in light and dark mode', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    await account.api.createCard({
      deck_id: deck.id,
      front: 'Contrast question',
      back: 'Contrast answer',
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.locator('.library-card').click();
    const confirm = page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Delete permanently', exact: true });
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await expect(page.locator('html.dark')).toHaveCount(colorScheme === 'dark' ? 1 : 0);
      await page.getByRole('button', { name: 'Delete card', exact: true }).click();
      await expect(confirm).toBeVisible();
      await settleAnimations(page);
      expect(await measureContrast(confirm)).toBeGreaterThanOrEqual(4.5);
      await page.keyboard.press('Escape');
      await expect(confirm).toBeHidden();
    }
  } finally {
    await account.cleanup();
  }
});

test('a library card says when it is due, counts extra tags and keeps line breaks', async ({
  page,
}) => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    const card = await account.api.createCard({
      deck_id: deck.id,
      front: 'Phases of mitosis',
      back: '1. Prophase\n2. Metaphase',
      tags: ['biology', 'cells', 'mitosis', 'exam', 'chapter-3'],
    });
    await account.api.review(card.id, {
      rating: 3,
      version: card.version,
      request_id: crypto.randomUUID(),
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    const preview = page.locator('.library-card');
    await expect(preview.locator('.card-status')).toHaveText(
      /^Due (later today|tomorrow|in \d days|[A-Z][a-z]{2} \d{1,2}(, \d{4})?)$/,
    );
    await expect(preview.getByText('+2 more', { exact: true })).toBeVisible();
    await expect(preview.locator('p')).toHaveCSS('white-space', 'pre-line');
    await expect(preview.locator('.card-edit-hint')).toHaveCSS('opacity', '0');
  } finally {
    await account.cleanup();
  }
});
