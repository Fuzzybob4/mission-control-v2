-- 004_create_vault_tables.sql
-- Secure credential vault with AES-256-GCM encryption support

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vault metadata (PIN hash, salts)
CREATE TABLE IF NOT EXISTS vault_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  encryption_key_salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encrypted credentials storage
CREATE TABLE IF NOT EXISTS vault_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  account TEXT NOT NULL,
  field_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, account, field_name)
);

-- Audit log for all vault access
CREATE TABLE IF NOT EXISTS vault_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  provider TEXT,
  account TEXT,
  field TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vault_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role policies (vault API uses this)
CREATE POLICY "service_role_vault_credentials" ON vault_credentials FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_vault_metadata" ON vault_metadata FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_vault_audit" ON vault_audit_log FOR ALL TO service_role USING (true);

SELECT '✅ Vault tables ready (secure credential storage)' AS status;
