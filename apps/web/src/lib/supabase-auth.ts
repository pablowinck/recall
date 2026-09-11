import { AuthClient } from '@supabase/auth-js';

/** The browser's Supabase Auth client. auth-js exports AuthClient as a value, so the type is named here. */
export type BrowserAuth = InstanceType<typeof AuthClient>;
export type { Session } from '@supabase/auth-js';

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
