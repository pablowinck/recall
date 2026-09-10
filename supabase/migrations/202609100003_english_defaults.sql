-- Keep interface defaults neutral while preserving existing study content.
alter table recall.tenants alter column name set default 'My workspace';
update recall.tenants set name = 'My workspace' where name = 'Meu espaço';
update recall.decks d set name = 'English'
where d.name = 'Inglês' and not exists (
  select 1 from recall.decks other where other.tenant_id=d.tenant_id and other.name='English'
);

create or replace function private.initialize_personal_tenant() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into recall.tenants (id) values (new.id);
  insert into recall.decks (tenant_id, name) values (new.id, 'My first deck');
  return new;
end;
$$;
