import { expect, test } from '@playwright/test';
import { Pool } from 'pg';
import { writeFile } from 'node:fs/promises';
import { PostgresTenantDatabase } from '../../apps/api/src/database';
import { createTestAccount } from './fixtures';

interface QueryPlanNode {
  'Node Type': string;
  'Rows Removed by Filter'?: number;
  Plans?: QueryPlanNode[];
}

interface ExplainResult {
  'QUERY PLAN': Array<{ Plan: QueryPlanNode; 'Execution Time': number }>;
}

async function insertTokenFixture(pool: Pool, tenantId: string, count: number): Promise<void> {
  await pool.query(
    `insert into recall.access_tokens (tenant_id,name,token_hash,prefix,created_at)
     select $1::uuid, 'Query plan fixture', encode(sha256(convert_to(($1::uuid)::text || n::text, 'UTF8')), 'hex'),
       'qa-index', now() - n * interval '1 second'
     from generate_series(1,$2::integer) as n`,
    [tenantId, count],
  );
}

function countDiscardedRows(plan: QueryPlanNode): number {
  const children = plan.Plans ?? [];
  return (
    (plan['Rows Removed by Filter'] ?? 0) +
    children.reduce((total, child) => total + countDiscardedRows(child), 0)
  );
}

async function readIndexedTokenPlan(
  database: PostgresTenantDatabase,
  tenantId: string,
): Promise<ExplainResult['QUERY PLAN'][number]> {
  return database.runFor(tenantId, async (connection) => {
    // Exercise the available access path independently of shared local statistics.
    // Production retains PostgreSQL's default planner settings.
    await connection.query('set local enable_seqscan = off');
    const explained = await connection.query<ExplainResult>(`explain (analyze, buffers, format json)
      select id,name,prefix,created_at,expires_at from recall.access_tokens order by created_at desc`);
    return explained.rows[0]!['QUERY PLAN'][0]!;
  });
}

test('listing connections has an indexed path scoped to its tenant', async ({}, testInfo) => {
  const owner = await createTestAccount();
  const neighbor = await createTestAccount();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    await insertTokenFixture(pool, neighbor.id, 20000);
    await insertTokenFixture(pool, owner.id, 12);
    await pool.query('analyze recall.access_tokens');
    const database = new PostgresTenantDatabase(pool);
    const plan = await readIndexedTokenPlan(database, owner.id);
    const evidencePath = testInfo.outputPath('tenant-token-query-plan.json');
    await writeFile(evidencePath, JSON.stringify(plan, null, 2));
    await testInfo.attach('tenant-token-query-plan', {
      path: evidencePath,
      contentType: 'application/json',
    });
    expect((await owner.api.tokens()).length).toBe(12);
    expect(countDiscardedRows(plan.Plan)).toBeLessThan(100);
  } finally {
    await owner.cleanup();
    await neighbor.cleanup();
    await pool.end();
  }
});
