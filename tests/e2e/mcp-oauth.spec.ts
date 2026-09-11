import { createHash, randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { connectTestMcp, createTestAccount, type TestAccount } from './fixtures';

const MCP = 'http://localhost:3212';
// Nothing listens here: the browser's redirect back to the assistant is intercepted by the test.
const CALLBACK = 'http://127.0.0.1:43219/callback';

interface AuthServer {
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint: string;
}

/** Follow the MCP server's discovery to Supabase Auth, trying the metadata locations real clients try. */
async function discoverAuthServer(): Promise<AuthServer> {
  const metadata = await fetch(`${MCP}/.well-known/oauth-protected-resource/mcp`);
  const { authorization_servers } = (await metadata.json()) as { authorization_servers: string[] };
  const issuer = (authorization_servers[0] ?? '').replace(/\/$/, '');
  const { origin, pathname } = new URL(issuer);
  // RFC 8414 inserts the well-known segment before the issuer path; local Supabase serves only the appended form.
  const candidates = [
    `${origin}/.well-known/oauth-authorization-server${pathname}`,
    `${issuer}/.well-known/oauth-authorization-server`,
    `${issuer}/.well-known/openid-configuration`,
  ];
  for (const candidate of candidates) {
    const response = await fetch(candidate);
    if (response.ok) return (await response.json()) as AuthServer;
  }
  throw new Error(`No authorization server metadata found for ${issuer}`);
}

/** Register a public PKCE client, the way Claude Code or Cursor does without any manual setup. */
async function registerClient(server: AuthServer): Promise<string> {
  const response = await fetch(server.registration_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_name: 'Recall E2E assistant',
      redirect_uris: [CALLBACK],
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    }),
  });
  expect(response.status).toBeLessThan(300);
  return ((await response.json()) as { client_id: string }).client_id;
}

function pkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
}

function authorizeUrl(
  server: AuthServer,
  clientId: string,
  challenge: string,
  state: string,
): string {
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: CALLBACK,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
    resource: `${MCP}/mcp`,
  });
  return `${server.authorization_endpoint}?${query.toString()}`;
}

/**
 * Watch for the browser's return to the assistant, without a callback server. The promise travels inside an
 * object: an async function that returns a pending promise directly would wait for it before resolving.
 */
async function interceptCallback(page: Page): Promise<{ reached: Promise<URL> }> {
  let reach: (url: URL) => void = () => undefined;
  const reached = new Promise<URL>((resolve) => {
    reach = resolve;
  });
  await page.route(`${CALLBACK}**`, async (route) => {
    reach(new URL(route.request().url()));
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'Recall E2E callback' });
  });
  return { reached };
}

async function exchangeCode(
  server: AuthServer,
  clientId: string,
  code: string,
  verifier: string,
): Promise<string> {
  const response = await fetch(server.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: CALLBACK,
      client_id: clientId,
      code_verifier: verifier,
      resource: `${MCP}/mcp`,
    }),
  });
  expect(response.status).toBe(200);
  return ((await response.json()) as { access_token: string }).access_token;
}

/** Start an authorization and sign in on the consent page, which keeps the request in its address. */
async function reachConsent(page: Page, account: TestAccount, state: string) {
  const server = await discoverAuthServer();
  const clientId = await registerClient(server);
  const pkce = pkcePair();
  const callback = await interceptCallback(page);
  await page.goto(authorizeUrl(server, clientId, pkce.challenge, state));
  await expect(page).toHaveURL(/\/oauth\/consent\?authorization_id=/);
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Allow Recall E2E assistant to use Recall?' }),
  ).toBeVisible();
  return { server, clientId, pkce, callback };
}

test('an assistant connects through OAuth and uses the tools as that account', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const flow = await reachConsent(page, account, 'e2e-allow');
    await page.getByRole('button', { name: 'Allow', exact: true }).click();
    const returned = await flow.callback.reached;
    expect(returned.searchParams.get('state')).toBe('e2e-allow');
    const code = returned.searchParams.get('code') ?? '';
    const token = await exchangeCode(flow.server, flow.clientId, code, flow.pkce.verifier);
    const mcp = await connectTestMcp(token);
    try {
      const decks = await mcp.callTool({ name: 'list_decks', arguments: {} });
      expect(JSON.stringify(decks)).toContain('My first deck');
    } finally {
      await mcp.close();
    }
  } finally {
    await account.cleanup();
  }
});

test('an assistant that is not allowed gets no code', async ({ page }) => {
  const account = await createTestAccount();
  try {
    const flow = await reachConsent(page, account, 'e2e-deny');
    await page.getByRole('button', { name: 'Don’t allow', exact: true }).click();
    const returned = await flow.callback.reached;
    expect(returned.searchParams.get('error')).toBe('access_denied');
    expect(returned.searchParams.get('code')).toBeNull();
  } finally {
    await account.cleanup();
  }
});
