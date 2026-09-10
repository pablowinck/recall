import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { RecallRating, StudyCard } from '@recall/contracts';
import { describeFailure } from '@/components/feedback';

export interface StudySessionState {
  queue: StudyCard[];
  completed: number;
  revealed: boolean;
  loading: boolean;
  saving: boolean;
  error: string;
  reveal: () => void;
  rate: (rating: RecallRating) => Promise<void>;
  reload: () => Promise<void>;
}

/** Preserva a tentativa em retries e impede clique duplo. Exemplo: useStudySession(client). */
export function useStudySession(client: RecallClient, deck?: string): StudySessionState {
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [completed, setCompleted] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const attempt = useRef<{ cardId: string; rating: RecallRating; requestId: string } | null>(null);
  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setQueue(await client.study(deck));
      setRevealed(false);
      setError('');
      attempt.current = null;
    } catch (failure) {
      setError(describeFailure(failure));
    } finally {
      setLoading(false);
    }
  }, [client, deck]);
  useEffect(() => {
    void reload();
  }, [reload]);
  const rate = async (rating: RecallRating): Promise<void> => {
    const current = queue[0];
    if (!current || !revealed || pending.current) return;
    pending.current = true;
    setSaving(true);
    setError('');
    if (attempt.current?.cardId !== current.card.id || attempt.current.rating !== rating)
      attempt.current = { cardId: current.card.id, rating, requestId: crypto.randomUUID() };
    try {
      await client.review(current.card.id, {
        rating,
        version: current.card.version,
        request_id: attempt.current.requestId,
      });
      setQueue((cards) => cards.slice(1));
      setCompleted((count) => count + 1);
      setRevealed(false);
      attempt.current = null;
    } catch (failure) {
      setError(describeFailure(failure));
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  return {
    queue,
    completed,
    revealed,
    loading,
    saving,
    error,
    reveal: () => setRevealed(true),
    rate,
    reload,
  };
}
