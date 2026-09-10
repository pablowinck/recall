import { Pool, type PoolClient } from 'pg';

export interface TenantDatabase {
  runFor<T>(userId: string, operation: (connection: PoolClient) => Promise<T>): Promise<T>;
  resolveToken(tokenHash: string): Promise<string | null>;
}

export class PostgresTenantDatabase implements TenantDatabase {
  constructor(private readonly pool: Pool) {}

  /** Aplica identidade e RLS em transação isolada. Exemplo: db.runFor(uid, readCards). */
  async runFor<T>(userId: string, operation: (connection: PoolClient) => Promise<T>): Promise<T> {
    const connection = await this.pool.connect();
    try {
      await connection.query('begin');
      await connection.query('set local role authenticated');
      await connection.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: userId, role: 'authenticated' }),
      ]);
      const result = await operation(connection);
      await connection.query('commit');
      return result;
    } catch (error) {
      await connection.query('rollback');
      throw error;
    } finally {
      connection.release();
    }
  }

  /** Resolve somente tokens válidos sem expor seu hash. Exemplo: db.resolveToken(sha256). */
  async resolveToken(tokenHash: string): Promise<string | null> {
    const result = await this.pool.query<{ tenant_id: string }>(
      'select tenant_id from recall.access_tokens where token_hash = $1 and expires_at > now()',
      [tokenHash],
    );
    return result.rows[0]?.tenant_id ?? null;
  }
}
