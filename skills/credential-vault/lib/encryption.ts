/**
 * Credential Vault - Encryption & Core Functions
 * 
 * Features:
 * - AES-256-GCM encryption
 * - PBKDF2 key derivation from PIN (2846)
 * - Bcrypt PIN hashing
 * - 24-hour session management
 * - Supabase real-time sync
 * - Audit logging
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { webcrypto } from 'crypto';

const cryptoApi = (globalThis.crypto ?? webcrypto) as Crypto;

// Configuration
const PIN = '2846';
const SESSION_TTL_HOURS = 24;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 5;
const PBKDF2_ITERATIONS = 100000;

// Types
export interface CredentialData {
  [field: string]: string;
}

export interface UnlockResult {
  success: boolean;
  locked?: boolean;
  remainingMinutes?: number;
  sessionExpiry?: Date;
  message?: string;
}

export interface AuditEntry {
  id?: string;
  action: string;
  provider?: string;
  account?: string;
  field?: string;
  success: boolean;
  ip_address?: string;
  timestamp?: string;
}

export interface EncryptedCredential {
  encrypted_value: string;
  iv: string;
  tag: string;
}

interface VaultSession {
  unlockedAt: Date;
  expiresAt: Date;
  encryptionKey: CryptoKey;
}

// State
let session: VaultSession | null = null;
let failedAttempts = 0;
let lockoutUntil: Date | null = null;
let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 */
export function initializeSupabase(url: string, key: string): void {
  supabase = createClient(url, key);
}

/**
 * Hash PIN using bcrypt
 */
export async function hashPin(pin: string = PIN): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(pin, salt);
}

/**
 * Verify PIN against hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Derive encryption key from PIN using PBKDF2
 */
export async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  
  // Import PIN as raw key material
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    pinData,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive AES-256 key
  return cryptoApi.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate random salt
 */
export function generateSalt(): Uint8Array {
  return cryptoApi.getRandomValues(new Uint8Array(16));
}

/**
 * Generate random IV
 */
export function generateIV(): Uint8Array {
  return cryptoApi.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt a credential value
 */
export async function encryptCredential(
  value: string,
  key: CryptoKey
): Promise<EncryptedCredential> {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  
  const encrypted = await cryptoApi.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Extract auth tag (last 16 bytes) and ciphertext
  const encryptedArray = new Uint8Array(encrypted);
  const tag = encryptedArray.slice(-16);
  const ciphertext = encryptedArray.slice(0, -16);
  
  return {
    encrypted_value: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    tag: arrayBufferToBase64(tag)
  };
}

/**
 * Decrypt a credential value
 */
export async function decryptCredential(
  encrypted: EncryptedCredential,
  key: CryptoKey
): Promise<string> {
  const ciphertext = base64ToArrayBuffer(encrypted.encrypted_value);
  const iv = base64ToArrayBuffer(encrypted.iv);
  const tag = base64ToArrayBuffer(encrypted.tag);
  
  // Combine ciphertext + tag
  const combined = new Uint8Array(ciphertext.byteLength + tag.byteLength);
  combined.set(new Uint8Array(ciphertext), 0);
  combined.set(new Uint8Array(tag), ciphertext.byteLength);
  
  const decrypted = await cryptoApi.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    combined
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Unlock the vault with PIN
 */
export async function unlock(pin: string): Promise<UnlockResult> {
  // Check lockout
  if (lockoutUntil && new Date() < lockoutUntil) {
    const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
    return {
      success: false,
      locked: true,
      remainingMinutes: remaining,
      message: `Vault locked. Try again in ${remaining} minutes.`
    };
  }
  
  // Verify PIN
  const isValid = pin === PIN;
  
  if (!isValid) {
    failedAttempts++;
    
    // Log failed attempt
    await logAudit({
      action: 'unlock_attempt',
      success: false
    });
    
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
      failedAttempts = 0;
      return {
        success: false,
        locked: true,
        remainingMinutes: LOCKOUT_MINUTES,
        message: `Too many failed attempts. Vault locked for ${LOCKOUT_MINUTES} minutes.`
      };
    }
    
    return {
      success: false,
      message: `Invalid PIN. ${MAX_ATTEMPTS - failedAttempts} attempts remaining.`
    };
  }
  
  // Reset failed attempts
  failedAttempts = 0;
  lockoutUntil = null;
  
  // Derive encryption key
  const salt = await getOrCreateSalt();
  const encryptionKey = await deriveKey(pin, salt);
  
  // Create session
  const now = new Date();
  session = {
    unlockedAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000),
    encryptionKey
  };
  
  // Log successful unlock
  await logAudit({
    action: 'unlock',
    success: true
  });
  
  // Sync from Supabase
  await syncFromSupabase();
  
  return {
    success: true,
    sessionExpiry: session.expiresAt,
    message: 'Vault unlocked for 24 hours.'
  };
}

/**
 * Check if vault is unlocked
 */
export function isUnlocked(): boolean {
  return session !== null && !isSessionExpired();
}

/**
 * Check if session has expired
 */
export function isSessionExpired(): boolean {
  if (!session) return true;
  return new Date() > session.expiresAt;
}

/**
 * Get session expiry
 */
export function getSessionExpiry(): Date | null {
  return session?.expiresAt || null;
}

/**
 * Lock the vault
 */
export function lock(): void {
  session = null;
  logAudit({
    action: 'lock',
    success: true
  });
}

/**
 * Get or create encryption salt
 */
async function getOrCreateSalt(): Promise<Uint8Array> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('vault_metadata')
    .select('encryption_key_salt')
    .single();
  
  if (data?.encryption_key_salt) {
    return base64ToArrayBuffer(data.encryption_key_salt) as Uint8Array;
  }
  
  // Create new salt
  const salt = generateSalt();
  const saltB64 = arrayBufferToBase64(salt);
  
  // Store in Supabase
  const { error: insertError } = await supabase
    .from('vault_metadata')
    .upsert({
      pin_hash: await hashPin(),
      salt: generateSaltBase64(),
      encryption_key_salt: saltB64
    });
  
  if (insertError) throw insertError;
  
  return salt;
}

/**
 * Retrieve a credential
 */
export async function get(provider: string, account: string, field: string): Promise<string> {
  if (!isUnlocked()) {
    throw new Error('Vault is locked. Please unlock first.');
  }
  
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('vault_credentials')
    .select('*')
    .eq('provider', provider)
    .eq('account', account)
    .eq('field_name', field)
    .single();
  
  if (error || !data) {
    throw new Error(`Credential not found: ${provider}/${account}/${field}`);
  }
  
  // Decrypt
  const decrypted = await decryptCredential(
    {
      encrypted_value: data.encrypted_value,
      iv: data.iv,
      tag: data.tag
    },
    session!.encryptionKey
  );
  
  // Log access
  await logAudit({
    action: 'get',
    provider,
    account,
    field,
    success: true
  });
  
  return decrypted;
}

/**
 * Add or update a credential
 */
export async function add(
  provider: string,
  account: string,
  data: CredentialData
): Promise<void> {
  if (!isUnlocked()) {
    throw new Error('Vault is locked. Please unlock first.');
  }
  
  if (!supabase) throw new Error('Supabase not initialized');
  
  for (const [field, value] of Object.entries(data)) {
    const encrypted = await encryptCredential(value, session!.encryptionKey);
    
    const { error } = await supabase
      .from('vault_credentials')
      .upsert({
        provider,
        account,
        field_name: field,
        encrypted_value: encrypted.encrypted_value,
        iv: encrypted.iv,
        tag: encrypted.tag,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'provider,account,field_name'
      });
    
    if (error) throw error;
  }
  
  // Log
  await logAudit({
    action: 'add',
    provider,
    account,
    success: true
  });
}

/**
 * Edit a specific credential field
 */
export async function edit(
  provider: string,
  account: string,
  field: string,
  value: string
): Promise<void> {
  if (!isUnlocked()) {
    throw new Error('Vault is locked. Please unlock first.');
  }
  
  await add(provider, account, { [field]: value });
  
  await logAudit({
    action: 'edit',
    provider,
    account,
    field,
    success: true
  });
}

/**
 * Delete credential(s)
 */
export async function deleteCredential(
  provider: string,
  account?: string,
  field?: string
): Promise<void> {
  if (!isUnlocked()) {
    throw new Error('Vault is locked. Please unlock first.');
  }
  
  if (!supabase) throw new Error('Supabase not initialized');
  
  let query = supabase.from('vault_credentials').delete();
  
  query = query.eq('provider', provider);
  
  if (account) {
    query = query.eq('account', account);
  }
  
  if (field) {
    query = query.eq('field_name', field);
  }
  
  const { error } = await query;
  
  if (error) throw error;
  
  await logAudit({
    action: 'delete',
    provider,
    account,
    field,
    success: true
  });
}

/**
 * List all providers
 */
export async function listProviders(): Promise<string[]> {
  if (!isUnlocked()) {
    throw new Error('Vault is locked. Please unlock first.');
  }
  
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('vault_credentials')
    .select('provider')
    .order('provider');
  
  if (error) throw error;
  
  const providers = [...new Set(data?.map(d => d.provider) || [])];
  return providers;
}

/**
 * List accounts for a provider
 */
export async function listAccounts(provider: string): Promise<string[]> {
  if (!isUnlocked()) {
    throw new Error('Vault is locked. Please unlock first.');
  }
  
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('vault_credentials')
    .select('account')
    .eq('provider', provider)
    .order('account');
  
  if (error) throw error;
  
  const accounts = [...new Set(data?.map(d => d.account) || [])];
  return accounts;
}

/**
 * List fields for an account
 */
export async function listFields(provider: string, account: string): Promise<string[]> {
  if (!isUnlocked()) {
    throw new Error('Vault is locked. Please unlock first.');
  }
  
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('vault_credentials')
    .select('field_name')
    .eq('provider', provider)
    .eq('account', account)
    .order('field_name');
  
  if (error) throw error;
  
  return data?.map(d => d.field_name) || [];
}

/**
 * Log audit entry
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!supabase) return;
  
  await supabase.from('vault_audit_log').insert({
    ...entry,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get audit log
 */
export async function getAuditLog(limit: number = 100): Promise<AuditEntry[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('vault_audit_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return data || [];
}

/**
 * Sync credentials from Supabase to local cache
 */
async function syncFromSupabase(): Promise<void> {
  // Local cache sync happens on-demand
  // Real-time updates handled via subscriptions
}

/**
 * Subscribe to vault changes
 */
export function subscribeToChanges(callback: (payload: any) => void): void {
  if (!supabase) return;
  
  supabase
    .channel('vault_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vault_credentials' },
      callback
    )
    .subscribe();
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

function generateSaltBase64(): string {
  return arrayBufferToBase64(generateSalt());
}

// Export vault object for convenience
export const vault = {
  unlock,
  lock,
  isUnlocked,
  isSessionExpired,
  getSessionExpiry,
  get,
  add,
  edit,
  delete: deleteCredential,
  listProviders,
  listAccounts,
  listFields,
  getAuditLog,
  initializeSupabase,
  subscribeToChanges
};
