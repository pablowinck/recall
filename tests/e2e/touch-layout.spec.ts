import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createTestAccount } from './fixtures';
import { settleAnimations, signInToRecall } from './interaction-steps';

// Phone widths get the bottom-edge study bar and the full-height editor sheet (study.css, cards.css).
const PHONE_MAX_WIDTH = 600;

function isPhoneProject(testInfo: TestInfo): boolean {
  return (testInfo.project.use.viewport?.width ?? Number.POSITIVE_INFINITY) <= PHONE_MAX_WIDTH;
}

test('touch screens get controls at least 44px tall', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'Touch sizing applies to coarse pointers only');
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    const controls = [
      page.getByRole('button', { name: 'Use dark theme', exact: true }).filter({ visible: true }),
      page.getByRole('button', { name: 'New card', exact: true }).first(),
    ];
    for (const control of controls) {
      const box = await control.boundingBox();
      // Subpixel layout can report 43.99999 for a 44px control.
      expect(Math.round(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await account.cleanup();
  }
});

// Loop 14: short cards left the rating bar 2rem above the edge while long cards pinned it, so the thumb target moved.
test('phones keep the rating buttons on the bottom edge for short and long cards', async ({
  page,
}, testInfo) => {
  test.skip(!isPhoneProject(testInfo), 'The bottom-edge study bar applies to phone widths');
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    const longBack = Array.from({ length: 40 }, (_, line) => `Line ${line + 1} of a long answer.`);
    await account.api.createCard({
      deck_id: deck.id,
      front: 'A short card',
      back: 'Brief.',
      tags: [],
    });
    await account.api.createCard({
      deck_id: deck.id,
      front: 'A long card',
      back: longBack.join('\n'),
      tags: [],
    });
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Start reviewing' }).click();
    const first = await revealAndMeasureRatings(page);
    await expect(page.locator('.rating-button .keycap')).toHaveCount(4);
    await expect(page.locator('.rating-button .keycap').first()).toBeHidden();
    await page.getByRole('button', { name: /Good/ }).click();
    const second = await revealAndMeasureRatings(page);
    expect(Math.abs(first - second)).toBeLessThanOrEqual(1);
    expect(first).toBeGreaterThanOrEqual(page.viewportSize()!.height - 24);
  } finally {
    await account.cleanup();
  }
});

// Loop 14: the phone editor scrolled inside Radix's scrolling overlay and left its actions below the fold.
test('phones show the card editor actions without scrolling', async ({ page }, testInfo) => {
  test.skip(!isPhoneProject(testInfo), 'The editor sheet applies to phone widths');
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'New card', exact: true }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Create card', exact: true })).toBeInViewport({
      ratio: 1,
    });
    await expect(dialog.locator('.shortcut-hint')).toHaveCount(1);
    await expect(dialog.locator('.shortcut-hint')).toBeHidden();
  } finally {
    await account.cleanup();
  }
});

/** Reveal the current card and return where the Good rating ends, in viewport pixels. Example: await revealAndMeasureRatings(page). */
async function revealAndMeasureRatings(page: Page): Promise<number> {
  await page.getByRole('button', { name: /Reveal answer/ }).click();
  const good = page.getByRole('button', { name: /Good/ });
  await expect(good).toBeInViewport({ ratio: 1 });
  await settleAnimations(page);
  const box = await good.boundingBox();
  return Math.round((box?.y ?? 0) + (box?.height ?? 0));
}
