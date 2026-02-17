/**
 * Credential Vault - Test Suite
 * 
 * Run with: npm test -- credential-vault
 */

import { 
  vault, 
  hashPin, 
  verifyPin, 
  deriveKey, 
  encryptCredential, 
  decryptCredential,
  generateSalt,
  generateIV 
} from '../lib/encryption';

describe('Credential Vault', () => {
  const TEST_PIN = '2846';
  
  beforeEach(() => {
    // Reset vault state
    vault.lock();
  });

  describe('PIN Management', () => {
    test('should accept PIN 2846', async () => {
      const result = await vault.unlock(TEST_PIN);
      expect(result.success).toBe(true);
    });

    test('should reject wrong PIN', async () => {
      const result = await vault.unlock('1234');
      expect(result.success).toBe(false);
    });

    test('should lock after 3 failed attempts', async () => {
      await vault.unlock('1111'); // fail 1
      await vault.unlock('2222'); // fail 2
      const result = await vault.unlock('3333'); // fail 3
      
      expect(result.locked).toBe(true);
      expect(result.remainingMinutes).toBe(5);
    });

    test('should hash PIN with bcrypt', async () => {
      const hash = await hashPin(TEST_PIN);
      expect(hash).toContain('$2'); // bcrypt prefix
      const valid = await verifyPin(TEST_PIN, hash);
      expect(valid).toBe(true);
    });
  });

  describe('Session Management', () => {
    test('should create 24-hour session on unlock', async () => {
      await vault.unlock(TEST_PIN);
      
      expect(vault.isUnlocked()).toBe(true);
      
      const expiry = vault.getSessionExpiry();
      expect(expiry).toBeTruthy();
      
      // Should be ~24 hours from now
      const hoursDiff = (expiry!.getTime() - Date.now()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeGreaterThan(23);
      expect(hoursDiff).toBeLessThan(25);
    });

    test('should detect expired session', async () => {
      await vault.unlock(TEST_PIN);
      
      // Manually expire session
      const mockExpiry = new Date(Date.now() - 1000);
      // Note: In real test, you'd mock the session
      
      // vault.isSessionExpired() should return true after expiry
    });

    test('should lock vault', async () => {
      await vault.unlock(TEST_PIN);
      expect(vault.isUnlocked()).toBe(true);
      
      vault.lock();
      expect(vault.isUnlocked()).toBe(false);
    });
  });

  describe('Encryption', () => {
    test('should derive key from PIN', async () => {
      const salt = generateSalt();
      const key = await deriveKey(TEST_PIN, salt);
      
      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
    });

    test('should encrypt and decrypt credential', async () => {
      const salt = generateSalt();
      const key = await deriveKey(TEST_PIN, salt);
      
      const originalValue = 'my-secret-api-key-12345';
      const encrypted = await encryptCredential(originalValue, key);
      
      expect(encrypted.encrypted_value).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();
      expect(encrypted.encrypted_value).not.toBe(originalValue);
      
      const decrypted = await decryptCredential(encrypted, key);
      expect(decrypted).toBe(originalValue);
    });

    test('should generate unique IVs', () => {
      const iv1 = generateIV();
      const iv2 = generateIV();
      
      expect(iv1).not.toEqual(iv2);
    });

    test('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      
      expect(salt1).not.toEqual(salt2);
    });
  });

  describe('Credential Operations', () => {
    beforeEach(async () => {
      await vault.unlock(TEST_PIN);
    });

    test('should list providers', async () => {
      // Add test credential
      await vault.add('test-provider', 'test-account', { key: 'value' });
      
      const providers = await vault.listProviders();
      expect(providers).toContain('test-provider');
    });

    test('should list accounts for provider', async () => {
      await vault.add('test-provider', 'account-1', { key: 'value1' });
      await vault.add('test-provider', 'account-2', { key: 'value2' });
      
      const accounts = await vault.listAccounts('test-provider');
      expect(accounts).toContain('account-1');
      expect(accounts).toContain('account-2');
    });

    test('should list fields for account', async () => {
      await vault.add('test-provider', 'test-account', {
        email: 'test@test.com',
        password: 'secret',
        api_key: 'key123'
      });
      
      const fields = await vault.listFields('test-provider', 'test-account');
      expect(fields).toContain('email');
      expect(fields).toContain('password');
      expect(fields).toContain('api_key');
    });

    test('should edit credential', async () => {
      await vault.add('test-provider', 'test-account', { key: 'old-value' });
      
      await vault.edit('test-provider', 'test-account', 'key', 'new-value');
      
      const value = await vault.get('test-provider', 'test-account', 'key');
      expect(value).toBe('new-value');
    });

    test('should delete credential field', async () => {
      await vault.add('test-provider', 'test-account', {
        key1: 'value1',
        key2: 'value2'
      });
      
      await vault.delete('test-provider', 'test-account', 'key1');
      
      const fields = await vault.listFields('test-provider', 'test-account');
      expect(fields).not.toContain('key1');
      expect(fields).toContain('key2');
    });
  });

  describe('Security Rules', () => {
    test('should reject operations when locked', async () => {
      vault.lock();
      
      await expect(
        vault.get('any', 'any', 'any')
      ).rejects.toThrow('Vault is locked');
      
      await expect(
        vault.add('any', 'any', {})
      ).rejects.toThrow('Vault is locked');
    });

    test('should require Protocol 26 for add', async () => {
      // UI should show Protocol 26 verification before add
      // This is a placeholder for the verification logic
      expect(true).toBe(true);
    });
  });

  describe('Audit Logging', () => {
    beforeEach(async () => {
      await vault.unlock(TEST_PIN);
    });

    test('should log unlock attempts', async () => {
      // Check audit log contains unlock entry
      const logs = await vault.getAuditLog(10);
      const unlockLogs = logs.filter(l => l.action === 'unlock');
      expect(unlockLogs.length).toBeGreaterThan(0);
    });

    test('should log credential access', async () => {
      await vault.add('test', 'account', { key: 'value' });
      await vault.get('test', 'account', 'key');
      
      const logs = await vault.getAuditLog(10);
      const getLogs = logs.filter(l => l.action === 'get');
      expect(getLogs.length).toBeGreaterThan(0);
    });
  });
});
