import { describe, expect, it } from 'vitest';
import { createPoolConfiguration } from '../../apps/api/src/database-configuration';

describe('database connection configuration', () => {
  it('enforces verified TLS for managed hosts even when the URI requests weaker SSL', () => {
    const configuration = createPoolConfiguration(
      'postgres://runtime:example@pooler.example:6543/postgres?sslmode=disable',
      'trusted-ca',
    );
    expect(configuration.ssl).toEqual({ rejectUnauthorized: true, ca: 'trusted-ca' });
    expect(configuration.connectionString).not.toContain('sslmode');
    expect(configuration.max).toBe(5);
  });

  it('uses default certificate authorities when a custom certificate is absent', () => {
    expect(
      createPoolConfiguration('postgresql://runtime:example@pooler.example/postgres').ssl,
    ).toEqual({ rejectUnauthorized: true });
  });

  it('permits the dedicated local Docker database without TLS', () => {
    expect(
      createPoolConfiguration('postgresql://postgres:postgres@host.docker.internal:56322/postgres')
        .ssl,
    ).toBe(false);
  });

  it('rejects invalid protocols without disclosing connection credentials', () => {
    for (const invalid of ['bad-secret', 'https://runtime:secret@example.com']) {
      expect(() => createPoolConfiguration(invalid)).toThrow(
        'expected a postgres:// or postgresql://',
      );
      expect(() => createPoolConfiguration(invalid)).not.toThrow(invalid);
    }
  });
});
