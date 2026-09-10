import { Pool } from 'pg';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import pino from 'pino';
import { PostgresTenantDatabase } from './database.js';
import { createPoolConfiguration } from './database-configuration.js';
import { SupabaseAuthenticator } from './authentication.js';
import { createApi } from './http/create-api.js';

const environment = z
  .object({
    DATABASE_URL: z.string().min(1),
    DATABASE_SSL_CA: z.string().min(1).optional(),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    WEB_ORIGIN: z.string().default('http://localhost:3210,http://127.0.0.1:3210'),
  })
  .parse(process.env);
const pool = new Pool(
  createPoolConfiguration(environment.DATABASE_URL, environment.DATABASE_SSL_CA),
);
const database = new PostgresTenantDatabase(pool);
const auth = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const app = createApi(
  {
    database,
    authenticator: new SupabaseAuthenticator(auth, database),
    clock: () => new Date(),
    origins: environment.WEB_ORIGIN.split(','),
    logger: pino(),
  },
  express(),
);

export default app;
