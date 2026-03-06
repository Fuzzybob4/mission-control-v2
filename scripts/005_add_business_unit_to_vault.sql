-- 005_add_business_unit_to_vault.sql
-- Add business_unit column to vault_credentials so each credential
-- can be linked to a specific business in Mission Control.

alter table public.vault_credentials
  add column if not exists business_unit text not null default 'general';

comment on column public.vault_credentials.business_unit is
  'Links this credential to a business unit (e.g. lone-star, redfox, heroes, from-inception, general)';

create index if not exists idx_vault_credentials_business_unit
  on public.vault_credentials(business_unit);
