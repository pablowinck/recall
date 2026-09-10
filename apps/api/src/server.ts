import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { PostgresTenantDatabase } from './database';
import { SupabaseAuthenticator } from './authentication';
import { createApi } from './http/create-api';

const environment = z
  .object({
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    WEB_ORIGIN: z.string().default('http://localhost:3210,http://127.0.0.1:3210'),
  })
  .parse(process.env);
const pool = new Pool({
  connectionString: environment.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});
const database = new PostgresTenantDatabase(pool);
const auth = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const app = createApi({
  database,
  authenticator: new SupabaseAuthenticator(auth, database),
  clock: () => new Date(),
  origins: environment.WEB_ORIGIN.split(','),
});

export default app;
