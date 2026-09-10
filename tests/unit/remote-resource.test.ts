import { expect, it } from 'vitest';
import {
  readLatestResource,
  type ResourceSnapshot,
} from '../../apps/web/src/lib/remote-resource-state';

class FakeDeferredResource {
  private resolveResult: (value: string) => void = () => undefined;
  private rejectResult: (reason: Error) => void = () => undefined;
  private readonly pending = new Promise<string>((resolve, reject) => {
    this.resolveResult = resolve;
    this.rejectResult = reject;
  });
  read = (): Promise<string> => this.pending;
  resolve(value: string): void {
    this.resolveResult(value);
  }
  reject(): void {
    this.rejectResult(new Error('Delayed failure'));
  }
}
class FakeResourceSnapshot {
  value: ResourceSnapshot<string> = { value: null, loading: false, error: '' };
  sequence = { current: 0 };
  update = (change: (previous: ResourceSnapshot<string>) => ResourceSnapshot<string>): void => {
    this.value = change(this.value);
  };
}

it('does not replace a newer response with a delayed older response', async () => {
  const snapshot = new FakeResourceSnapshot();
  const older = new FakeDeferredResource();
  const newer = new FakeDeferredResource();
  const oldRequest = readLatestResource({ ...snapshot, read: older.read });
  const newRequest = readLatestResource({ ...snapshot, read: newer.read });
  newer.resolve('new');
  await newRequest;
  older.resolve('old');
  await oldRequest;
  expect(snapshot.value).toEqual({ value: 'new', loading: false, error: '' });
});

it('ignores failures after the owning view is disposed', async () => {
  const snapshot = new FakeResourceSnapshot();
  const response = new FakeDeferredResource();
  const request = readLatestResource({ ...snapshot, read: response.read });
  snapshot.sequence.current += 1;
  response.reject();
  await request;
  expect(snapshot.value.error).toBe('');
});
