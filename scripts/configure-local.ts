import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const output = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const status = JSON.parse(output) as Record<string, string>;
const publicKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
const secretKey = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
if (!publicKey || !secretKey)
  throw new Error(
    `Unexpected Supabase keys ${Object.keys(status).join(',')}; expected ANON_KEY and SERVICE_ROLE_KEY or publishable/secret equivalents`,
  );
const environment = {
  APP_ENV: 'local',
  DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:56322/postgres',
  SUPABASE_URL: 'http://127.0.0.1:56321',
  SUPABASE_ANON_KEY: publicKey,
  SUPABASE_SERVICE_ROLE_KEY: secretKey,
  WEB_ORIGIN: 'http://localhost:3210,http://127.0.0.1:3210',
  API_URL: 'http://localhost:3211',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:56321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: publicKey,
  NEXT_PUBLIC_API_URL: 'http://localhost:3211',
  NEXT_PUBLIC_MCP_URL: 'http://localhost:3212/mcp',
};
mkdirSync('.local', { recursive: true });
writeFileSync(
  '.env',
  Object.entries(environment)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n',
  { mode: 0o600 },
);
writeFileSync(
  'apps/web/.env.local',
  Object.entries(environment)
    .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n',
  { mode: 0o600 },
);
process.stdout.write('Local environment configured. Secrets remain in ignored files.\n');
