import type { Page, Route } from '@playwright/test';

/** Simulate one interrupted save while leaving retries on the real API. Example: await outage.install(page). */
export class FakeCardSaveOutage {
  attempts = 0;
  private releaseFirst: () => void = () => undefined;
  private readonly releaseGate = new Promise<void>((resolve) => {
    this.releaseFirst = resolve;
  });

  async install(page: Page): Promise<void> {
    await page.route('**/v1/cards', (route) => this.intercept(route));
  }

  release(): void {
    this.releaseFirst();
  }

  private async intercept(route: Route): Promise<void> {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    this.attempts += 1;
    if (this.attempts !== 1) {
      await route.continue();
      return;
    }
    await this.releaseGate;
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Temporary outage. Please retry.' }),
    });
  }
}
