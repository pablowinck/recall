import { execFile } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { createTestAccount, type TestAccount } from './fixtures';

test('restarting local setup preserves a user-deleted starter card', async () => {
  const account = await createTestAccount();
  const accountPath = await writeSeedFixture(account);
  try {
    await seedFixtureAccount(accountPath);
    const before = await account.api.cards();
    expect(before.total).toBe(64);
    const removed = before.cards[0]!;
    await account.api.deleteCard(removed.id);
    await seedFixtureAccount(accountPath);
    const after = await account.api.cards();
    expect(after.total).toBe(63);
    expect(after.cards.map((card) => card.source_key)).not.toContain(removed.source_key);
  } finally {
    await account.cleanup();
    await rm(accountPath, { force: true });
  }
});

async function writeSeedFixture(account: TestAccount): Promise<string> {
  const filename = `.local/seed-test-${account.id}.json`;
  const credentials = JSON.stringify({ email: account.email, password: account.password });
  await writeFile(filename, credentials, { mode: 0o600 });
  return filename;
}

async function seedFixtureAccount(accountPath: string): Promise<void> {
  await promisify(execFile)('pnpm', ['local:seed'], {
    cwd: process.cwd(),
    env: { ...process.env, RECALL_LOCAL_ACCOUNT_PATH: accountPath },
    timeout: 30000,
  });
}
