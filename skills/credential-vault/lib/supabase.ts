/**
 * Supabase Client Configuration for Credential Vault
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database schema types
export interface VaultMetadata {
  id: string;
  pin_hash: string;
  salt: string;
  encryption_key_salt: string;
  created_at: string;
  updated_at: string;
}

export interface VaultCredential {
  id: string;
  provider: string;
  account: string;
  field_name: string;
  encrypted_value: string;
  iv: string;
  tag: string;
  created_at: string;
  updated_at: string;
}

export interface VaultAuditLog {
  id: string;
  action: string;
  provider?: string;
  account?: string;
  field?: string;
  success: boolean;
  ip_address?: string;
  timestamp: string;
}

// Real-time subscription handler
export function subscribeToVaultChanges(
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: VaultCredential | null;
    old: VaultCredential | null;
  }) => void
) {
  return supabase
    .channel('vault_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vault_credentials'
      },
      callback
    )
    .subscribe();
}
