-- The runtime can assume authenticated only after the API verifies the caller.
-- Login credentials are provisioned separately and never belong in migrations.
create role recall_api_service nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
grant authenticated to recall_api_service;
grant recall_api_service to postgres;
grant usage on schema recall to recall_api_service;
grant select (tenant_id, token_hash, expires_at) on recall.access_tokens to recall_api_service;

-- Token authentication precedes tenant identity; this server-only role can read
-- only the columns required to resolve an unexpired hash, without content access.
create policy service_token_lookup on recall.access_tokens
  for select to recall_api_service using (true);
