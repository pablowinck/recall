import type { Request } from 'express';

export const METADATA_PATH = '/.well-known/oauth-protected-resource';

export interface OAuthDiscovery {
  /** Supabase Auth issuer, for example https://<project>.supabase.co/auth/v1. */
  authIssuer: string;
  /** Public origin of this server; derived from the request when absent. */
  publicUrl?: string;
}

/** The origin clients reach this server at. Example: publicOrigin(request, discovery). */
export function publicOrigin(request: Request, discovery: OAuthDiscovery): string {
  if (discovery.publicUrl) return discovery.publicUrl.replace(/\/+$/, '');
  return `${request.protocol}://${request.get('host') ?? 'localhost'}`;
}

/**
 * RFC 9728 metadata naming Supabase Auth as the authorization server for the /mcp resource.
 * Example: protectedResourceMetadata(request, discovery).
 */
export function protectedResourceMetadata(
  request: Request,
  discovery: OAuthDiscovery,
): Record<string, unknown> {
  return {
    resource: `${publicOrigin(request, discovery)}/mcp`,
    authorization_servers: [discovery.authIssuer],
    bearer_methods_supported: ['header'],
    resource_name: 'Recall',
    resource_documentation: 'https://github.com/pablowinck/recall/blob/main/docs/mcp.md',
  };
}

/** The 401 challenge that tells an MCP client where to start OAuth. Example: authorizationChallenge(request, discovery). */
export function authorizationChallenge(request: Request, discovery: OAuthDiscovery): string {
  return `Bearer resource_metadata="${publicOrigin(request, discovery)}${METADATA_PATH}/mcp"`;
}
