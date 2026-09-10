import { expect, test } from '@playwright/test';
import { Pool } from 'pg';
import type { Flashcard, CardPage } from '../../packages/contracts/src/index';
import { PostgresTenantDatabase } from '../../apps/api/src/database';
import { createTestAccount, connectTestMcp, readToolJson } from './fixtures';

test('API and Postgres RLS isolate tenants, including hostile identifiers', async () => {
  const owner = await createTestAccount();
  const stranger = await createTestAccount();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const deck = (await owner.api.workspace()).decks[0]!;
    const card = await owner.api.createCard({
      deck_id: deck.id,
      front: 'owner only',
      back: 'private answer',
      tags: ['keep'],
    });
    expect((await stranger.api.cards()).cards).toHaveLength(0);
    await expect(stranger.api.updateCard(card.id, { back: 'intrusion' })).rejects.toMatchObject({
      status: 404,
    });
    await expect(stranger.api.deleteCard(card.id)).rejects.toMatchObject({ status: 404 });
    await expect(stranger.api.deleteDeck(deck.id, { cards: 'delete' })).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      stranger.api.deleteDeck(deck.id, { cards: 'move', target: deck.id }),
    ).rejects.toMatchObject({ status: 404 });
    expect((await owner.api.workspace()).decks.map((item) => item.id)).toContain(deck.id);
    await expect(
      stranger.api.createCard({ deck_id: deck.id, front: 'hostile', back: 'no', tags: [] }),
    ).rejects.toMatchObject({ status: 400 });
    const database = new PostgresTenantDatabase(pool);
    const leaked = await database.runFor(
      stranger.id,
      async (connection) =>
        (await connection.query('select * from recall.cards where id=$1', [card.id])).rows,
    );
    expect(leaked).toHaveLength(0);
    const edited = await owner.api.updateCard(card.id, { front: 'updated question' });
    expect(edited.tags).toEqual(['keep']);
    expect(edited.back).toBe('private answer');
    await owner.api.deleteCard(card.id);
    expect((await owner.api.cards()).total).toBe(0);
  } finally {
    await owner.cleanup();
    await stranger.cleanup();
    await pool.end();
  }
});

test('concurrent reviews commit once and retries preserve the same schedule', async () => {
  const account = await createTestAccount();
  try {
    const deck = (await account.api.workspace()).decks[0]!;
    const card = await account.api.createCard({
      deck_id: deck.id,
      front: 'go → past?',
      back: 'went',
      tags: [],
    });
    const input = { rating: 3, version: card.version, request_id: crypto.randomUUID() };
    const results = await Promise.all([
      account.api.review(card.id, input),
      account.api.review(card.id, input),
    ]);
    expect(results[0]).toEqual(results[1]);
    expect(results[0]!.schedule?.reps).toBe(1);
    expect(results[0]!.version).toBe(1);
    expect((await account.api.workspace()).stats.reviewed_today).toBe(1);
    await expect(
      account.api.review(card.id, { ...input, request_id: crypto.randomUUID() }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(account.api.review(card.id, { ...input, rating: 4 })).rejects.toMatchObject({
      status: 409,
    });
  } finally {
    await account.cleanup();
  }
});

test('MCP import is idempotent, tools work, and revoked tokens stop access', async () => {
  const account = await createTestAccount();
  const other = await createTestAccount();
  const token = await account.api.createToken('E2E temporary');
  const mcp = await connectTestMcp(token.token);
  try {
    const tools = await mcp.listTools();
    expect(tools.tools.map((tool) => tool.name)).toContain('import_flashcards');
    const deck = (await account.api.workspace()).decks[0]!;
    const cards = [
      {
        deck_id: deck.id,
        front: "I'd like tea",
        back: 'I would like tea',
        tags: ['contractions'],
        source_key: 'test-import-1',
      },
    ];
    for (let run = 0; run < 2; run += 1)
      expect(
        (await mcp.callTool({ name: 'import_flashcards', arguments: { cards } })).isError,
      ).not.toBe(true);
    const listed = readToolJson<CardPage>(
      await mcp.callTool({ name: 'list_flashcards', arguments: {} }),
    );
    expect(listed.total).toBe(1);
    const card = listed.cards[0]!;
    const updated = await mcp.callTool({
      name: 'update_flashcard',
      arguments: { card_id: card.id, patch: { back: 'A polite request for tea.' } },
    });
    expect(readToolJson<Flashcard>(updated).back).toBe('A polite request for tea.');
    expect((await other.api.cards()).total).toBe(0);
    await account.api.revokeToken(token.id);
    expect(
      (
        await fetch('http://localhost:3211/v1/workspace', {
          headers: { Authorization: `Bearer ${token.token}` },
        })
      ).status,
    ).toBe(401);
    const denied = await fetch('http://localhost:3212/mcp', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    expect(denied.status).toBe(401);
  } finally {
    await mcp.close();
    await account.cleanup();
    await other.cleanup();
  }
});

test('anonymous requests and invalid inputs fail without modifying content', async () => {
  expect((await fetch('http://localhost:3211/v1/cards')).status).toBe(401);
  const account = await createTestAccount();
  try {
    const invalid = await fetch('http://localhost:3211/v1/cards', {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: '   ' }),
    });
    expect(invalid.status).toBe(400);
    expect((await account.api.workspace()).stats.total).toBe(0);
  } finally {
    await account.cleanup();
  }
});

test('English defaults preserve Portuguese, Italian, and French learning content', async () => {
  const account = await createTestAccount();
  const mcp = await connectTestMcp(account.jwt);
  try {
    const workspace = await account.api.workspace();
    expect(workspace.decks[0]!.name).toBe('My first deck');
    const examples = [
      { front: 'O que significa saudade?', back: 'Uma sensação de falta de alguém ou de algo.' },
      { front: 'Che cosa significa ricordare?', back: 'Conservare qualcosa nella memoria.' },
      { front: 'Que signifie déjà ?', back: 'Une chose qui est arrivée auparavant.' },
    ];
    const cards = examples.map((card, index) => ({
      ...card,
      deck_id: workspace.decks[0]!.id,
      source_key: `multilingual-${index}`,
      tags: ['unicode'],
    }));
    const imported = await mcp.callTool({ name: 'import_flashcards', arguments: { cards } });
    expect(imported.isError).not.toBe(true);
    const stored = (await account.api.cards()).cards;
    for (const example of examples)
      expect(stored).toEqual(expect.arrayContaining([expect.objectContaining(example)]));
  } finally {
    await mcp.close();
    await account.cleanup();
  }
});

test('database constraints reject a review pointing to another tenant card', async () => {
  const owner = await createTestAccount();
  const stranger = await createTestAccount();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    const deck = (await owner.api.workspace()).decks[0]!;
    const card = await owner.api.createCard({
      deck_id: deck.id,
      front: 'owned question',
      back: 'owned answer',
      tags: [],
    });
    const database = new PostgresTenantDatabase(pool);
    await expect(
      database.runFor(stranger.id, async (connection) =>
        connection.query(
          'insert into recall.reviews(id,tenant_id,card_id,rating,previous_version,result) values($1,auth.uid(),$2,3,0,$3)',
          [crypto.randomUUID(), card.id, {}],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  } finally {
    await owner.cleanup();
    await stranger.cleanup();
    await pool.end();
  }
});

test('malformed and oversized JSON return useful client errors', async () => {
  const headers = { 'Content-Type': 'application/json' };
  const malformed = await fetch('http://localhost:3211/v1/cards', {
    method: 'POST',
    headers,
    body: '{invalid json',
  });
  expect(malformed.status).toBe(400);
  expect(await malformed.json()).toEqual({
    error: 'Invalid JSON body. Expected a valid JSON object.',
  });
  const oversized = await fetch('http://localhost:3211/v1/cards', {
    method: 'POST',
    headers,
    body: JSON.stringify({ front: 'x'.repeat(1100000) }),
  });
  expect(oversized.status).toBe(413);
  expect(oversized.headers.get('cache-control')).toBe('no-store');
});
