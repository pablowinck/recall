import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { RecallClient } from '../../packages/client/src/index';

export interface TestAccount {
  id: string;
  email: string;
  password: string;
  jwt: string;
  api: RecallClient;
  cleanup: () => Promise<void>;
}

/** Cria somente identidades descartáveis no Supabase local. Exemplo: await createTestAccount(). */
export async function createTestAccount(): Promise<TestAccount> {
  const url = process.env.SUPABASE_URL!;
  if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname))
    throw new Error(`Unsafe test host ${url}; expected local Supabase`);
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const email = `test-${randomBytes(8).toString('hex')}@recall.test`;
  const password = randomBytes(18).toString('base64url');
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw created.error ?? new Error('Expected a test user');
  const signed = await createClient(url, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  }).auth.signInWithPassword({ email, password });
  if (!signed.data.session) throw signed.error ?? new Error('Expected a test session');
  const jwt = signed.data.session.access_token;
  return {
    id: created.data.user.id,
    email,
    password,
    jwt,
    api: new RecallClient({ baseUrl: 'http://localhost:3211', token: async () => jwt }),
    cleanup: async () => {
      const deleted = await admin.auth.admin.deleteUser(created.data.user.id);
      if (deleted.error) throw deleted.error;
    },
  };
}

/** Conecta ao transporte HTTP real. Exemplo: await connectTestMcp(token). */
export async function connectTestMcp(token: string): Promise<Client> {
  const client = new Client({ name: 'recall-e2e', version: '0.1.0' });
  const transport = new StreamableHTTPClientTransport(new URL('http://localhost:3212/mcp'), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  await client.connect(transport);
  return client;
}

/** Lê JSON estruturado na resposta de uma ferramenta. Exemplo: readToolJson(result). */
export function readToolJson<T>(result: unknown): T {
  if (typeof result !== 'object' || result === null || !('content' in result)) {
    throw new Error('Expected an MCP result object with content');
  }
  if (!Array.isArray(result.content)) throw new Error('Expected MCP content to be an array');
  const serialized = result.content.find(isTextContent)?.text;
  if (!serialized) throw new Error('Expected MCP text content containing JSON');
  return JSON.parse(serialized) as T;
}

function isTextContent(block: unknown): block is { type: 'text'; text: string } {
  if (typeof block !== 'object' || block === null) return false;
  return (
    'type' in block && block.type === 'text' && 'text' in block && typeof block.text === 'string'
  );
}
