create schema if not exists recall;
grant usage on schema recall to authenticated;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table recall.tenants (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Meu espaço',
  created_at timestamptz not null default now()
);

create table recall.decks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references recall.tenants(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (id, tenant_id),
  unique (tenant_id, name)
);

create table recall.cards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references recall.tenants(id) on delete cascade,
  deck_id uuid not null,
  front text not null check (length(front) between 1 and 4000),
  back text not null check (length(back) between 1 and 8000),
  tags text[] not null default '{}',
  source_key text,
  due_at timestamptz not null default now(),
  schedule jsonb,
  version integer not null default 0,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (deck_id, tenant_id) references recall.decks(id, tenant_id),
  unique (tenant_id, source_key)
);
create index cards_due_idx on recall.cards(tenant_id, due_at) where not suspended;
create index cards_deck_idx on recall.cards(tenant_id, deck_id);

create table recall.reviews (
  id uuid primary key,
  tenant_id uuid not null references recall.tenants(id) on delete cascade,
  card_id uuid not null references recall.cards(id) on delete cascade,
  rating smallint not null check (rating between 1 and 4),
  previous_version integer not null,
  result jsonb not null,
  reviewed_at timestamptz not null default now(),
  unique (card_id, previous_version)
);
create index reviews_tenant_time_idx on recall.reviews(tenant_id, reviewed_at);

create table recall.access_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references recall.tenants(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  token_hash text not null unique,
  prefix text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

alter table recall.tenants enable row level security;
alter table recall.decks enable row level security;
alter table recall.cards enable row level security;
alter table recall.reviews enable row level security;
alter table recall.access_tokens enable row level security;

create policy tenant_owner on recall.tenants to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy deck_owner on recall.decks to authenticated
  using (tenant_id = (select auth.uid())) with check (tenant_id = (select auth.uid()));
create policy card_owner on recall.cards to authenticated
  using (tenant_id = (select auth.uid())) with check (tenant_id = (select auth.uid()));
create policy review_owner on recall.reviews to authenticated
  using (tenant_id = (select auth.uid())) with check (tenant_id = (select auth.uid()));
create policy token_owner on recall.access_tokens to authenticated
  using (tenant_id = (select auth.uid())) with check (tenant_id = (select auth.uid()));

-- Conteúdo é acessado exclusivamente pela API, que aplica o papel authenticated
-- dentro de uma transação. Não expor escrita direta pelo Data API evita adulterar FSRS.
revoke all on recall.tenants, recall.decks, recall.cards, recall.reviews, recall.access_tokens from anon;
grant select, insert, update, delete on recall.tenants, recall.decks, recall.cards, recall.reviews, recall.access_tokens to authenticated;

create function private.initialize_personal_tenant() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into recall.tenants (id) values (new.id);
  insert into recall.decks (tenant_id, name) values (new.id, 'Inglês');
  return new;
end;
$$;

create trigger recall_auth_user_created after insert on auth.users
  for each row execute function private.initialize_personal_tenant();
