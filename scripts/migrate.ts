import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const connection = await pool.connect();
try {
  await connection.query('create schema if not exists recall_migrations');
  await connection.query(
    'create table if not exists recall_migrations.applied (name text primary key, applied_at timestamptz default now())',
  );
  const migrations = (await readdir('supabase/migrations'))
    .filter((name) => name.endsWith('.sql'))
    .sort();
  for (const name of migrations) {
    if (
      (await connection.query('select 1 from recall_migrations.applied where name=$1', [name]))
        .rowCount
    )
      continue;
    await connection.query('begin');
    await connection.query(await readFile(`supabase/migrations/${name}`, 'utf8'));
    await connection.query('insert into recall_migrations.applied(name) values ($1)', [name]);
    await connection.query('commit');
    process.stdout.write(`Applied ${name}\n`);
  }
} catch (error) {
  await connection.query('rollback');
  throw error;
} finally {
  connection.release();
  await pool.end();
}
