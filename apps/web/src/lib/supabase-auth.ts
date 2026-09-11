import { AuthClient } from '@supabase/auth-js';

/** The browser's Supabase Auth client. auth-js exports AuthClient as a value, so the type is named here. */
export type BrowserAuth = InstanceType<typeof AuthClient>;
export type { AuthChangeEvent, Session } from '@supabase/auth-js';

/** The Auth endpoint supabase-js uses for a project URL. Example: authEndpoint('https://abc.supabase.co') === 'https://abc.supabase.co/auth/v1'. */
export function authEndpoint(projectUrl: string): string {
  return new URL('auth/v1', projectUrl.endsWith('/') ? projectUrl : `${projectUrl}/`).href;
}

/** The storage key supabase-js uses, so sessions saved by the full client keep working. Example: authStorageKey('https://abc.supabase.co') === 'sb-abc-auth-token'. */
export function authStorageKey(projectUrl: string): string {
  return `sb-${new URL(projectUrl).hostname.split('.')[0]}-auth-token`;
}

/**
 * Create the browser's Supabase Auth client with the defaults supabase-js applies. The browser only signs people
 * in and answers assistant sign-in requests; everything else goes through Recall's API, so the database, realtime,
 * storage and functions clients stay out of the bundle. Example: createBrowserAuth(url, publishableKey).
 */
export function createBrowserAuth(projectUrl: string, publishableKey: string): BrowserAuth {
  return new AuthClient({
    url: authEndpoint(projectUrl),
    headers: { Authorization: `Bearer ${publishableKey}`, apikey: publishableKey },
    storageKey: authStorageKey(projectUrl),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  });
}

let tabAuth: BrowserAuth | null = null;

/**
 * The one Auth client for this browser tab. A client per mount kept refresh timers, broadcast channels and
 * listeners running after every visit to the app. A server render gets a throwaway client that no request shares.
 * Example: const auth = browserAuth().
 */
export function browserAuth(): BrowserAuth {
  const url = requirePublicSetting(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL',
  );
  const key = requirePublicSetting(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );
  if (typeof window === 'undefined') return createBrowserAuth(url, key);
  tabAuth ??= createBrowserAuth(url, key);
  return tabAuth;
}

// Next inlines a public setting only where it is written as process.env.NAME, so callers pass the value in.
function requirePublicSetting(value: string | undefined, name: string): string {
  if (!value)
    throw new Error(
      `${name} is not set. A fresh worktree needs apps/web/.env.local (see AGENTS.md).`,
    );
  return value;
}
