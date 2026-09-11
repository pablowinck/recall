import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { authEndpoint, authStorageKey } from '../../apps/web/src/lib/supabase-auth';

describe('the browser Supabase Auth client', () => {
  it('uses the storage key and Auth URL of the full supabase-js client, so sessions survive the switch', () => {
    for (const projectUrl of [
      'https://ozplzokjwjnyxwyimoef.supabase.co',
      'http://127.0.0.1:56321',
    ]) {
      const full = createClient(projectUrl, 'sb_publishable_test', {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      });
      const internals = full.auth as unknown as { storageKey: string; url: string };
      expect(authStorageKey(projectUrl)).toBe(internals.storageKey);
      expect(authEndpoint(projectUrl)).toBe(internals.url);
    }
  });

  it('keeps the production storage key readable', () => {
    expect(authStorageKey('https://ozplzokjwjnyxwyimoef.supabase.co')).toBe(
      'sb-ozplzokjwjnyxwyimoef-auth-token',
    );
  });
});
