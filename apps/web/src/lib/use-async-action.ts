import { useRef, useState, type Dispatch, type SetStateAction, type RefObject } from 'react';
import { describeFailure } from '@/components/feedback';

export interface AsyncAction {
  busy: boolean;
  error: string;
  run: (operation: () => Promise<void>) => Promise<boolean>;
  clear: () => void;
}
interface ActionContext {
  pending: RefObject<boolean>;
  setBusy: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
}

/** Keep form mutations single-flight and recoverable. Example: const action = useAsyncAction(). */
export function useAsyncAction(): AsyncAction {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const context = { pending, setBusy, setError };
  return {
    busy,
    error,
    clear: () => setError(''),
    run: (operation) => executeAction(context, operation),
  };
}

async function executeAction(
  context: ActionContext,
  operation: () => Promise<void>,
): Promise<boolean> {
  if (context.pending.current) return false;
  context.pending.current = true;
  context.setBusy(true);
  context.setError('');
  try {
    await operation();
    return true;
  } catch (failure) {
    context.setError(describeFailure(failure));
    return false;
  } finally {
    context.pending.current = false;
    context.setBusy(false);
  }
}
