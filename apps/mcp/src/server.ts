import express, { type Express, type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { RecallClient } from '@recall/client';
import { createRecallMcp } from './tools.js';

/** Create a stateless transport suitable for serverless deployment. Example: createMcpApp(apiUrl). */
export function createMcpApp(apiUrl: string): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_request, response) =>
    response.json({ status: 'ok', service: 'recall-mcp' }),
  );
  app.post('/mcp', (request, response) => serveMcp(request, response, apiUrl));
  app.all('/mcp', (_request, response) =>
    response.status(405).set('Allow', 'POST').json({ error: 'Use Streamable HTTP POST.' }),
  );
  return app;
}

async function serveMcp(request: Request, response: Response, apiUrl: string): Promise<void> {
  const token = request.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) {
    response.status(401).json({ error: 'Bearer token required.' });
    return;
  }
  const client = new RecallClient({ baseUrl: apiUrl, token: async () => token });
  if (!(await verifyApiAccess(client))) {
    response.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }
  await writeMcpResponse(request, response, client);
}

async function verifyApiAccess(client: RecallClient): Promise<boolean> {
  try {
    await client.workspace();
    return true;
  } catch {
    return false;
  }
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

const app = createMcpApp(process.env.API_URL ?? 'http://localhost:3211');
export default app;
