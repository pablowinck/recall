'use client';
import { useEffect, useState } from 'react';

/** Persiste somente a preferência visual. Exemplo: const [appearance,toggle] = useAppearance(). */
export function useAppearance(): ['light' | 'dark', () => void] {
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    if (localStorage.getItem('recall-appearance') === 'dark') setAppearance('dark');
  }, []);
  const toggle = (): void => {
    const next = appearance === 'light' ? 'dark' : 'light';
    localStorage.setItem('recall-appearance', next);
    setAppearance(next);
  };
  return [appearance, toggle];
}
