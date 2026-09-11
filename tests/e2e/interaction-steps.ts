import { expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { TestAccount } from './fixtures';

/** Sign in through the actual form and wait for the workspace. Example: await signInToRecall(page, account). */
export async function signInToRecall(page: Page, account: TestAccount): Promise<void> {
  await page.goto('/app');
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

/**
 * Measure a control's text against its background, or its focus ring against the surface behind it, in sRGB as
 * WCAG does. Example: await measureContrast(button, 'ring').
 */
export async function measureContrast(
  target: Locator,
  part: 'label' | 'ring' = 'label',
): Promise<number> {
  return target.evaluate((node, measured) => {
    // A canvas turns any CSS colour, display-p3 included, into the sRGB bytes the WCAG formula expects.
    const pixel = document.createElement('canvas').getContext('2d')!;
    const bytes = (colour: string): number[] => {
      pixel.clearRect(0, 0, 1, 1);
      pixel.fillStyle = colour;
      pixel.fillRect(0, 0, 1, 1);
      return Array.from(pixel.getImageData(0, 0, 1, 1).data);
    };
    const luminance = (colour: string): number => {
      const [r, g, b] = bytes(colour).map((byte) => {
        const channel = byte / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    // A ring is drawn outside the control, over the nearest ancestor that paints a background.
    let surface: Element | null = measured === 'ring' ? node.parentElement : node;
    while (surface && bytes(getComputedStyle(surface).backgroundColor)[3] === 0)
      surface = surface.parentElement;
    const background = surface ? getComputedStyle(surface).backgroundColor : 'white';
    const style = getComputedStyle(node);
    const foreground = measured === 'ring' ? style.outlineColor : style.color;
    const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (lighter! + 0.05) / (darker! + 0.05);
  }, part);
}
