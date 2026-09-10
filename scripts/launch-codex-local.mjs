import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const account = JSON.parse(
  readFileSync(new URL('../.local/account.json', import.meta.url), 'utf8'),
);
if (!account.mcp_token) throw new Error('Missing local MCP token; run pnpm local:seed first.');
const child = spawn(process.execPath, ['apps/mcp/dist/stdio.js'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    RECALL_API_URL: 'http://localhost:3211',
    RECALL_MCP_TOKEN: account.mcp_token,
  },
});
child.on('exit', (code) => process.exit(code ?? 1));
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
