-- Credential Vault schema
create extension if not exists "uuid-ossp";

create table if not exists public.vault_metadata (
  id uuid primary key default uuid_generate_v4(),
  pin_hash text not null,
  salt text not null,
  encryption_key_salt text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.vault_credentials (
  id uuid primary key default uuid_generate_v4(),
  provider text not null,
  account text not null,
  field_name text not null,
  encrypted_value text not null,
  iv text not null,
  tag text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider, account, field_name)
);

create table if not exists public.vault_audit_log (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  provider text,
  account text,
  field text,
  success boolean not null default false,
  ip_address text,
  timestamp timestamptz default now()
);

alter table public.vault_credentials enable row level security;
alter table public.vault_metadata enable row level security;
alter table public.vault_audit_log enable row level security;

create policy if not exists "service-role-full-access" on public.vault_credentials
  for all to service_role using (true);

create policy if not exists "service-role-full-access" on public.vault_metadata
  for all to service_role using (true);

create policy if not exists "service-role-full-access" on public.vault_audit_log
  for all to service_role using (true);
