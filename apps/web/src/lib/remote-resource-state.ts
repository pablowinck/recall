import { describeFailure } from './error-message';

export interface ResourceSnapshot<T> {
  value: T | null;
  loading: boolean;
  error: string;
}
export interface ResourceContext<T> {
  read: () => Promise<T>;
  sequence: { current: number };
  update: (change: (previous: ResourceSnapshot<T>) => ResourceSnapshot<T>) => void;
}

/** Commit only the latest live request. Example: await readLatestResource(context). */
export async function readLatestResource<T>(context: ResourceContext<T>): Promise<void> {
  const sequence = ++context.sequence.current;
  context.update((current) => ({ ...current, loading: true, error: '' }));
  try {
    const value = await context.read();
    if (sequence === context.sequence.current)
      context.update(() => ({ value, loading: false, error: '' }));
  } catch (failure) {
    if (sequence === context.sequence.current)
      context.update((current) => ({
        ...current,
        loading: false,
        error: describeFailure(failure),
      }));
  }
}
