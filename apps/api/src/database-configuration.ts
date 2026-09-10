import type { PoolConfig } from 'pg';

const localDatabaseHosts = new Set(['localhost', '127.0.0.1', 'host.docker.internal']);

/** Verify managed database TLS while allowing the local Docker network. Example: createPoolConfiguration(url, trustedCa). */
export function createPoolConfiguration(databaseUrl: string, certificate?: string): PoolConfig {
  const connectionUrl = parseDatabaseUrl(databaseUrl);
  const usesTls = Boolean(certificate) || !localDatabaseHosts.has(connectionUrl.hostname);
  for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat'])
    connectionUrl.searchParams.delete(key);
  return {
    connectionString: connectionUrl.toString(),
    ssl: usesTls
      ? { rejectUnauthorized: true, ...(certificate ? { ca: certificate } : {}) }
      : false,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  };
}

function parseDatabaseUrl(databaseUrl: string): URL {
  try {
    const connectionUrl = new URL(databaseUrl);
    if (['postgres:', 'postgresql:'].includes(connectionUrl.protocol)) return connectionUrl;
  } catch {
    // Connection strings contain credentials, so validation must not echo the value.
  }
  throw new Error('Invalid DATABASE_URL; expected a postgres:// or postgresql:// connection URI.');
}
