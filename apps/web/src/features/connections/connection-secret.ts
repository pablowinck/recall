import type { ConnectionClientId } from './connection-clients';

/** A token shown once, with the connection it belongs to and the assistant it was created for. */
export interface IssuedConnection {
  id: string;
  token: string;
  clientId: ConnectionClientId;
}

/**
 * Keep a new, unsaved token on screen when an older connection is revoked; only revoking that same
 * connection hides it. Example: secretAfterRevoke(secret, olderId) === secret.
 */
export function secretAfterRevoke(
  secret: IssuedConnection | null,
  revokedId: string,
): IssuedConnection | null {
  return secret?.id === revokedId ? null : secret;
}
