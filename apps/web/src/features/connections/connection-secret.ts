import type { ConnectionClientId } from './connection-clients';

/** A token shown once, with its connection, the assistant it was created for and whether it was copied. */
export interface IssuedConnection {
  id: string;
  token: string;
  clientId: ConnectionClientId;
  copied: boolean;
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

/** Remember that the token was copied, so closing it later asks nothing. Example: markSecretCopied(secret)?.copied === true. */
export function markSecretCopied(secret: IssuedConnection | null): IssuedConnection | null {
  if (!secret || secret.copied) return secret;
  return { ...secret, copied: true };
}
