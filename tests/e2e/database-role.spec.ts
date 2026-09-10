import { expect, test } from '@playwright/test';
import { Pool } from 'pg';

test('runtime database role cannot read content or administer the project', async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const connection = await pool.connect();
  try {
    await connection.query('set role recall_api_service');
    const role = await connection.query(
      'select rolsuper, rolinherit, rolcreatedb, rolcreaterole, rolbypassrls from pg_roles where rolname=current_user',
    );
    expect(Object.values(role.rows[0] as Record<string, boolean>)).toEqual(Array(5).fill(false));
    await expect(connection.query('select front from recall.cards')).rejects.toMatchObject({
      code: '42501',
    });
    await expect(connection.query('select name from recall.access_tokens')).rejects.toMatchObject({
      code: '42501',
    });
    await expect(
      connection.query(
        'select tenant_id, token_hash, expires_at from recall.access_tokens limit 0',
      ),
    ).resolves.toMatchObject({ rowCount: 0 });
    await connection.query('begin');
    await connection.query('set local role authenticated');
    expect((await connection.query('select front from recall.cards')).rows).toEqual([]);
    await connection.query('rollback');
  } finally {
    connection.release();
    await pool.end();
  }
});
