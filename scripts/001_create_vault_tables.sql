-- 001_create_vault_tables.sql
-- Initial vault schema setup
-- Run in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vault metadata (PIN hash + encryption salts)
CREATE TABLE IF NOT EXISTS vault_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  encryption_key_salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vault credentials (encrypted key/value pairs)
CREATE TABLE IF NOT EXISTS vault_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  account TEXT NOT NULL,
  field_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, account, field_name)
);

-- Audit log
CREATE TABLE IF NOT EXISTS vault_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  provider TEXT,
  account TEXT,
  field TEXT,
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vault_credentials_provider ON vault_credentials(provider);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_account ON vault_credentials(account);
CREATE INDEX IF NOT EXISTS idx_vault_credentials_lookup ON vault_credentials(provider, account, field_name);
CREATE INDEX IF NOT EXISTS idx_vault_audit_timestamp ON vault_audit_log(timestamp DESC);

-- Row Level Security
ALTER TABLE vault_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypasses these; anon/authenticated users are restricted)
CREATE POLICY IF NOT EXISTS "service_role_metadata"
  ON vault_metadata FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "service_role_credentials"
  ON vault_credentials FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "service_role_audit"
  ON vault_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);
