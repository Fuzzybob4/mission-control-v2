-- Credential Vault Database Setup
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vault metadata table (stores PIN hash and salts)
CREATE TABLE vault_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  encryption_key_salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault credentials table (encrypted data)
CREATE TABLE vault_credentials (
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

-- Vault audit log table
CREATE TABLE vault_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  provider TEXT,
  account TEXT,
  field TEXT,
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vault_credentials_provider ON vault_credentials(provider);
CREATE INDEX idx_vault_credentials_account ON vault_credentials(account);
CREATE INDEX idx_vault_credentials_lookup ON vault_credentials(provider, account, field_name);
CREATE INDEX idx_vault_audit_timestamp ON vault_audit_log(timestamp DESC);

-- Row Level Security (RLS) policies
ALTER TABLE vault_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read vault metadata
CREATE POLICY "Allow authenticated read metadata" 
  ON vault_metadata 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to manage credentials
CREATE POLICY "Allow authenticated manage credentials" 
  ON vault_credentials 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Allow authenticated users to read audit log
CREATE POLICY "Allow authenticated read audit" 
  ON vault_audit_log 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to insert audit entries
CREATE POLICY "Allow authenticated insert audit" 
  ON vault_audit_log 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Real-time publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE vault_credentials;
ALTER PUBLICATION supabase_realtime ADD TABLE vault_audit_log;

-- Initial metadata setup (run after app generates hash)
-- INSERT INTO vault_metadata (pin_hash, salt, encryption_key_salt)
-- VALUES ('bcrypt_hash_here', 'salt_here', 'encryption_salt_here');
