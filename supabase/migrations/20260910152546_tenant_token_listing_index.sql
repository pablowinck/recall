-- Tenant filtering comes from RLS; preserve the newest-first connection listing.
-- The leading tenant key also supports cascading cleanup of an owned workspace.
create index access_tokens_tenant_created_idx
  on recall.access_tokens (tenant_id, created_at desc);
