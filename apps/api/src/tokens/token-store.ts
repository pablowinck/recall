import { createHash, randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { AccessToken, CreatedToken } from '@recall/contracts';
import { RecallError } from '../errors.js';

/** Return connection metadata without hashes or secrets. Example: listTokens(connection). */
export async function listTokens(connection: PoolClient): Promise<AccessToken[]> {
  const result = await connection.query<AccessToken>(`select id,name,prefix,created_at,expires_at
    from recall.access_tokens order by created_at desc`);
  return result.rows;
}

/** Issue a 256-bit secret that is shown once. Example: createToken(connection, 'Codex'). */
export async function createToken(connection: PoolClient, name: string): Promise<CreatedToken> {
  const token = `recall_${randomBytes(32).toString('hex')}`;
  const hash = createHash('sha256').update(token).digest('hex');
  const result = await connection.query<AccessToken>(
    `insert into recall.access_tokens (tenant_id,name,token_hash,prefix)
    values (auth.uid(),$1,$2,$3) returning id,name,prefix,created_at,expires_at`,
    [name, hash, token.slice(0, 14)],
  );
  return { ...result.rows[0]!, token };
}

/** Revoke access immediately. Example: revokeToken(connection, id). */
export async function revokeToken(
  connection: PoolClient,
  id: string,
): Promise<{ deleted: boolean }> {
  const result = await connection.query('delete from recall.access_tokens where id=$1', [id]);
  if (!result.rowCount) throw new RecallError(404, 'Connection not found.');
  return { deleted: true };
}
