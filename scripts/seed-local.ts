import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { RecallClient } from '../packages/client/src/index';
import type { CardDraft } from '../packages/contracts/src/index';

interface LocalAccount {
  email: string;
  password: string;
  mcp_token?: string;
}
interface StarterCard {
  front: string;
  back: string;
  tags: string[];
  source_key: string;
}

const supabaseUrl = process.env.SUPABASE_URL!;
if (!['localhost', '127.0.0.1'].includes(new URL(supabaseUrl).hostname))
  throw new Error(
    `Invalid seed host ${new URL(supabaseUrl).hostname}; expected localhost or 127.0.0.1`,
  );
mkdirSync('.local', { recursive: true });
const accountPath = '.local/account.json';
const account: LocalAccount = existsSync(accountPath)
  ? (JSON.parse(readFileSync(accountPath, 'utf8')) as LocalAccount)
  : { email: 'estudante@recall.local', password: randomBytes(18).toString('base64url') };
const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
if (!existsSync(accountPath)) {
  const created = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
  });
  if (created.error) throw created.error;
  writeFileSync(accountPath, JSON.stringify(account, null, 2), { mode: 0o600 });
}
const auth = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});
const signed = await auth.auth.signInWithPassword(account);
if (signed.error || !signed.data.session)
  throw signed.error ?? new Error('Local login failed; expected a session');
const api = new RecallClient({
  baseUrl: 'http://localhost:3211',
  token: async () => signed.data.session!.access_token,
});
if (!account.mcp_token) {
  account.mcp_token = (await api.createToken('Codex local')).token;
  writeFileSync(accountPath, JSON.stringify(account, null, 2), { mode: 0o600 });
}
const workspace = await api.workspace();
const starterDeck =
  workspace.decks.find((deck) => deck.name === 'English') ?? (await api.createDeck('English'));
const starter = JSON.parse(readFileSync('examples/english-starter.json', 'utf8')) as StarterCard[];
const cards: CardDraft[] = starter.map((card) => ({ ...card, deck_id: starterDeck.id }));
const mcp = new Client({ name: 'recall-seed', version: '0.1.0' });
await mcp.connect(
  new StreamableHTTPClientTransport(new URL('http://localhost:3212/mcp'), {
    requestInit: { headers: { Authorization: `Bearer ${account.mcp_token}` } },
  }),
);
try {
  const imported = await mcp.callTool({ name: 'import_flashcards', arguments: { cards } });
  if (imported.isError) throw new Error(`MCP import failed: ${JSON.stringify(imported.content)}`);
  const verified = await api.cards('limit=200');
  const starterCount = verified.cards.filter((card) =>
    card.source_key?.startsWith('english-starter-'),
  ).length;
  if (starterCount !== 64) throw new Error(`Imported ${starterCount} starter cards; expected 64`);
  process.stdout.write('64 starter flashcards imported and verified through authenticated MCP.\n');
} finally {
  await mcp.close();
}
