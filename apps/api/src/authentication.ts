import { createHash } from 'node:crypto';
import type { Request } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TenantDatabase } from './database';
import { RecallError } from './errors';

export interface Authenticator {
  verify(request: Request): Promise<string>;
}

export class SupabaseAuthenticator implements Authenticator {
  constructor(
    private readonly auth: SupabaseClient,
    private readonly database: TenantDatabase,
  ) {}

  /** Verify a JWT or personal token before accessing content. Example: auth.verify(request). */
  async verify(request: Request): Promise<string> {
    const token = request.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) throw new RecallError(401, 'You are not signed in. Sign in to continue.');
    if (token.startsWith('recall_')) return this.verifyPersonalToken(token);
    const { data: identity, error } = await this.auth.auth.getUser(token);
    if (error || !identity.user)
      throw new RecallError(401, 'Your session has expired. Please sign in again.');
    return identity.user.id;
  }

  private async verifyPersonalToken(token: string): Promise<string> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const userId = await this.database.resolveToken(tokenHash);
    if (!userId) throw new RecallError(401, 'This token is invalid, expired, or revoked.');
    return userId;
  }
}
