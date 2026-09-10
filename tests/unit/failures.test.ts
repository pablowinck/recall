import { describe, expect, it } from 'vitest';
import { classifyApiFailure } from '../../apps/api/src/http/failures';
import { RecallError } from '../../apps/api/src/errors';

class FakeParserFailure extends Error {
  constructor(public readonly type: string) {
    super('Untrusted body fragment must never be reflected');
  }
}
class FakeDatabaseFailure extends Error {
  constructor(public readonly code: string) {
    super('SQL, credentials, and private content must not be returned');
  }
}

describe('safe API failure classification', () => {
  it('preserves known application failures', () => {
    expect(classifyApiFailure(new RecallError(404, 'Card not found.'))).toMatchObject({
      status: 404,
      error: 'Card not found.',
    });
  });
  it('distinguishes invalid input from unexpected server failures', () => {
    expect(classifyApiFailure(new FakeParserFailure('entity.parse.failed')).status).toBe(400);
    expect(classifyApiFailure(new FakeParserFailure('entity.too.large')).status).toBe(413);
    expect(classifyApiFailure(new FakeParserFailure('charset.unsupported')).status).toBe(415);
  });
  it('maps database conflicts without leaking database details', () => {
    expect(classifyApiFailure(new FakeDatabaseFailure('23505')).status).toBe(409);
    expect(classifyApiFailure(new FakeDatabaseFailure('23503')).status).toBe(400);
    expect(classifyApiFailure(new FakeDatabaseFailure('42P01'))).toEqual({
      status: 500,
      error: 'Unable to complete the request. Please try again.',
      code: '42P01',
    });
  });
});
