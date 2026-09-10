-- The original schema (a576c27) linked reviews by card ID alone.
-- Enforce the tenant relationship in PostgreSQL as well as in the API.
alter table recall.cards add constraint cards_identity_tenant_key unique (id, tenant_id);
alter table recall.reviews drop constraint reviews_card_id_fkey;
alter table recall.reviews add constraint reviews_card_tenant_fkey
  foreign key (card_id, tenant_id) references recall.cards(id, tenant_id) on delete cascade;
