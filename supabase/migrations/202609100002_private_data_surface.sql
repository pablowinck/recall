create schema if not exists recall;
grant usage on schema recall to authenticated;

-- Also upgrade installations started during the initial scaffolding.
do $$ begin
  if to_regclass('public.cards') is not null then
    alter table public.tenants set schema recall;
    alter table public.decks set schema recall;
    alter table public.cards set schema recall;
    alter table public.reviews set schema recall;
    alter table public.access_tokens set schema recall;
  end if;
end $$;

create or replace function private.initialize_personal_tenant() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into recall.tenants (id) values (new.id);
  insert into recall.decks (tenant_id, name) values (new.id, 'My first deck');
  return new;
end;
$$;
