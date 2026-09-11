import express, { type Express, type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { RecallClient } from '@recall/client';
import { createRecallMcp } from './tools.js';
import { checkApiAccess } from './access-check.js';
import {
  authorizationChallenge,
  METADATA_PATH,
  protectedResourceMetadata,
  type OAuthDiscovery,
} from './protected-resource.js';

/**
 * Create a stateless transport suitable for serverless deployment. OAuth discovery is published only when
 * an issuer is configured, so personal tokens keep working on their own. Example: createMcpApp(apiUrl, { authIssuer }).
 */
export function createMcpApp(apiUrl: string, discovery?: OAuthDiscovery): Express {
  const app = express();
  app.disable('x-powered-by');
  // Vercel terminates TLS at its proxy; the forwarded protocol keeps discovery URLs on https.
  app.set('trust proxy', true);
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_request, response) =>
    response.json({ status: 'ok', service: 'recall-mcp' }),
  );
  if (discovery) attachOAuthDiscovery(app, discovery);
  app.post('/mcp', (request, response) => serveMcp(request, response, apiUrl, discovery));
  app.all('/mcp', (_request, response) =>
    response.status(405).set('Allow', 'POST').json({ error: 'Use Streamable HTTP POST.' }),
  );
  return app;
}

// RFC 9728 places metadata for https://host/mcp at /.well-known/oauth-protected-resource/mcp; some clients ask the root.
function attachOAuthDiscovery(app: Express, discovery: OAuthDiscovery): void {
  const publish = (request: Request, response: Response): void => {
    response.set('Cache-Control', 'no-store').json(protectedResourceMetadata(request, discovery));
  };
  app.get(`${METADATA_PATH}/mcp`, publish);
  app.get(METADATA_PATH, publish);
}

async function serveMcp(
  request: Request,
  response: Response,
  apiUrl: string,
  discovery?: OAuthDiscovery,
): Promise<void> {
  const token = request.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return rejectMcp(request, response, discovery, 401, 'Bearer token required.');
  const client = new RecallClient({ baseUrl: apiUrl, token: async () => token });
  const rejection = await checkApiAccess(client);
  if (rejection)
    return rejectMcp(request, response, discovery, rejection.status, rejection.message);
  await writeMcpResponse(request, response, client);
}

// A 401 must say where to authorize, or OAuth-capable clients cannot start the sign-in flow.
function rejectMcp(
  request: Request,
  response: Response,
  discovery: OAuthDiscovery | undefined,
  status: number,
  message: string,
): void {
  if (status === 401 && discovery)
    response.set('WWW-Authenticate', authorizationChallenge(request, discovery));
  response.status(status).json({ error: message });
}

async function writeMcpResponse(
  request: Request,
  response: Response,
  client: RecallClient,
): Promise<void> {
  const server = createRecallMcp(client);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  response.on('close', () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(request, response, request.body);
}

const authIssuer = process.env.AUTH_ISSUER_URL;
const app = createMcpApp(
  process.env.API_URL ?? 'http://localhost:3211',
  authIssuer ? { authIssuer, publicUrl: process.env.MCP_PUBLIC_URL } : undefined,
);
export default app;
