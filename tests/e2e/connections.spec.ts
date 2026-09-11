import { expect, test } from '@playwright/test';
import { createTestAccount, connectTestMcp } from './fixtures';
import { signInToRecall } from './interaction-steps';

test('creates and revokes a personal MCP connection through the web', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Connections', exact: true }).click();
    await page.getByRole('combobox', { name: 'Assistant' }).click();
    await page.getByRole('option', { name: 'Cursor', exact: true }).click();
    await page.getByRole('button', { name: 'Create personal connection', exact: true }).click();
    const tokenField = page.getByRole('textbox', { name: 'New personal token' });
    await expect(tokenField).toHaveValue(/^recall_/);
    const token = await tokenField.inputValue();
    await expect(page.locator('.setup-snippet')).toContainText(
      `"Authorization": "Bearer ${token}"`,
    );
    const mcp = await connectTestMcp(token);
    try {
      expect((await mcp.listTools()).tools).toHaveLength(9);
    } finally {
      await mcp.close();
    }
    await page.getByRole('button', { name: 'I saved it', exact: true }).click();
    await page.getByRole('button', { name: 'Close without copying', exact: true }).click();
    await expect(tokenField).toHaveCount(0);
    await page.getByRole('button', { name: /^Revoke connection Cursor, / }).click();
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

test('revoking an older connection keeps a new token on screen', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await account.api.createToken('Cursor');
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Connections', exact: true }).click();
    await page.getByRole('button', { name: 'Create personal connection', exact: true }).click();
    const tokenField = page.getByRole('textbox', { name: 'New personal token' });
    await expect(tokenField).toHaveValue(/^recall_/);
    await page.getByRole('button', { name: /^Revoke connection Cursor, / }).click();
    await page.getByRole('button', { name: 'Revoke connection', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Revoke connection Cursor, / })).toHaveCount(0);
    await expect(tokenField).toHaveValue(/^recall_/);
  } finally {
    await account.cleanup();
  }
});

test('a new token waits on Connections while you visit another view', async ({ page }) => {
  const account = await createTestAccount();
  try {
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Connections', exact: true }).click();
    await page.getByRole('combobox', { name: 'Assistant' }).click();
    await page.getByRole('option', { name: 'Cursor', exact: true }).click();
    await page.getByRole('button', { name: 'Create personal connection', exact: true }).click();
    const tokenField = page.getByRole('textbox', { name: 'New personal token' });
    await expect(tokenField).toHaveValue(/^recall_/);
    const token = await tokenField.inputValue();
    await page.locator('.new-secret').dispatchEvent('copy');
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Connections', exact: true }).click();
    await expect(tokenField).toHaveValue(token);
    await expect(page.getByRole('combobox', { name: 'Assistant' })).toContainText('Cursor');
    await page.getByRole('button', { name: 'I saved it', exact: true }).click();
    await expect(tokenField).toHaveCount(0);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
  } finally {
    await account.cleanup();
  }
});

test('copying the setup is announced, because the button only changes its own label', async ({
  page,
}) => {
  const account = await createTestAccount();
  try {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await signInToRecall(page, account);
    await page.getByRole('button', { name: 'Connections', exact: true }).click();
    await page.getByRole('button', { name: 'Create personal connection', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'New personal token' })).toHaveValue(/^recall_/);
    await page.getByRole('button', { name: 'Copy setup', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Setup copied' })).toHaveCount(1);
  } finally {
    await account.cleanup();
  }
});
