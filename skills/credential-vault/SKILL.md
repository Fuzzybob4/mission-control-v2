# Credential Vault Skill

A secure, encrypted credential management system for Mission Control with PIN protection, AES-256 encryption, and Supabase real-time sync.

## Overview

The Credential Vault provides a secure way to store and manage sensitive credentials with real-time synchronization between devices via Supabase.

**Session PIN:** 2846 (hashed with bcrypt)
**Session Duration:** 24 hours
**Storage:** Supabase (real-time sync)

## Security Features

- **PIN Protection**: 4-digit PIN (2846) required to unlock vault
- **AES-256 Encryption**: All credentials encrypted at rest
- **Bcrypt Hashing**: PIN stored as bcrypt hash
- **Lockout Protection**: 3 failed attempts = 5-minute lockout
- **24-Hour Sessions**: Enter once, access all day
- **Audit Logging**: All access tracked
- **Protocol 26**: Required for adding new credentials
- **Supabase Sync**: Real-time credential synchronization

## File Structure

```
skills/credential-vault/
├── SKILL.md                    # This documentation
├── README.md                   # Usage guide
├── components/
│   └── vault-ui.tsx           # React UI component
├── lib/
│   ├── encryption.ts          # Crypto functions
│   └── supabase.ts            # Supabase client & sync
└── data/
    └── vault-template.json    # Empty vault template
```

## Vault Storage Structure

### Supabase Tables

```sql
-- vault_metadata table
CREATE TABLE vault_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  encryption_key_salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- vault_credentials table
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

-- vault_audit_log table
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
```

### Local Cache Structure

```
providers/
  google/
    accounts.json
      - Lone Star Lighting Displays
        - email: [encrypted]
        - password: [encrypted]
        - api_key: [encrypted]
        - cli_token: [encrypted]
      - RedFox CRM
        - email: [encrypted]
        - password: [encrypted]
  gumroad/
    accounts.json
  hubspot/
    accounts.json
  facebook/
    accounts.json
  x/
    accounts.json
  yahoo/
    accounts.json
  stripe/
    accounts.json
  payment_methods/
    cards.json
      - primary: [encrypted card data]
```

## API Reference

### Core Methods

#### `vault.unlock(pin: string): Promise<UnlockResult>`
Unlocks the vault with PIN. Returns session token valid for 24 hours.

```typescript
interface UnlockResult {
  success: boolean;
  locked?: boolean;
  remainingMinutes?: number;
  sessionExpiry?: Date;
}

const result = await vault.unlock('2846');
if (result.success) {
  console.log('Vault unlocked for 24 hours');
} else if (result.locked) {
  console.log(`Locked. Try again in ${result.remainingMinutes} minutes`);
}
```

#### `vault.get(provider: string, account: string, field: string): Promise<string>`
Retrieves a decrypted credential.

```typescript
const apiKey = await vault.get('google', 'Lone Star Lighting Displays', 'api_key');
```

#### `vault.add(provider: string, account: string, data: CredentialData): Promise<void>`
Adds new credentials. Requires Protocol 26 verification.

```typescript
await vault.add('google', 'New Account', {
  email: 'user@example.com',
  password: 'secret123',
  api_key: 'key123'
});
```

#### `vault.edit(provider: string, account: string, field: string, value: string): Promise<void>`
Edits an existing credential.

```typescript
await vault.edit('google', 'Lone Star Lighting Displays', 'api_key', 'new_key');
```

#### `vault.delete(provider: string, account: string, field?: string): Promise<void>`
Deletes a credential, account, or entire provider.

```typescript
// Delete specific field
await vault.delete('google', 'Account1', 'api_key');

// Delete entire account
await vault.delete('google', 'Account1');

// Delete entire provider
await vault.delete('google');
```

#### `vault.listProviders(): Promise<string[]>`
Returns list of all providers.

```typescript
const providers = await vault.listProviders();
// ['google', 'gumroad', 'hubspot', ...]
```

#### `vault.listAccounts(provider: string): Promise<string[]>`
Returns list of accounts for a provider.

```typescript
const accounts = await vault.listAccounts('google');
// ['Lone Star Lighting Displays', 'RedFox CRM']
```

#### `vault.listFields(provider: string, account: string): Promise<string[]>`
Returns list of fields for an account.

```typescript
const fields = await vault.listFields('google', 'Lone Star Lighting Displays');
// ['email', 'password', 'api_key', 'cli_token']
```

## Security Rules

1. **NEVER share credentials in chat/Telegram/email**
2. **Protocol 26 required** to add new credentials
3. **Website automation** can use stored credentials
4. **Audit log** tracks all access with timestamps
5. **PIN 2846** - Session-only, never stored in memory unhashed

## UI Components

### PinEntry
Numeric keypad for PIN entry with visual feedback.

### VaultBrowser
Main credential browser with:
- Provider tabs
- Account dropdown per provider
- Masked display (••••••)
- **Reveal button** (for authorized eyes only)
- **Copy button** for each field
- **Edit button** for existing entries
- **Add New Service** button

### CredentialForm
Form for adding/editing credentials with Protocol 26 verification.

## Integration

### Mission Control Integration

Add to navigation:
```typescript
// In MissionControl.tsx
tabs: [
  { id: 'hub', label: 'Hub', component: MissionControlHub },
  { id: 'vault', label: 'Vault', component: VaultUI },
  { id: 'api-keys', label: 'API Keys', component: APIKeyVault },
  // ...
]
```

Add unlock flow at startup:
```typescript
// App.tsx
useEffect(() => {
  if (!vault.isUnlocked() || vault.isSessionExpired()) {
    showPinEntry();
  }
}, []);
```

Link from API Key Vault:
```typescript
// In APIKeyVault.tsx
<a href="#vault" className="vault-link">
  🔐 Manage in Vault →
</a>
```

## Encryption Details

### Key Derivation
- PBKDF2 with SHA-256
- 100,000 iterations
- Unique salt per vault
- 256-bit key derived from PIN (2846) + salt

### Encryption
- AES-256-GCM for authenticated encryption
- Unique IV per credential
- Tag verification prevents tampering

## Supabase Real-Time Sync

### Subscription Setup
```typescript
supabase
  .channel('vault_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'vault_credentials' },
    (payload) => handleVaultChange(payload)
  )
  .subscribe();
```

### Conflict Resolution
- Last-write-wins for credential updates
- Timestamps for audit trail
- Local cache synced on unlock

## Session Management

```typescript
interface VaultSession {
  unlockedAt: Date;
  expiresAt: Date; // 24 hours from unlock
  encryptionKey: CryptoKey; // Derived from PIN
}

// Check session status
if (vault.isUnlocked() && !vault.isSessionExpired()) {
  // Active session
}
```

## Audit Log Format

```json
{
  "audit_log": [
    {
      "timestamp": "2026-02-16T16:00:00Z",
      "action": "unlock",
      "success": true,
      "ip": "127.0.0.1"
    },
    {
      "timestamp": "2026-02-16T16:05:00Z",
      "action": "get",
      "provider": "google",
      "account": "Lone Star Lighting Displays",
      "field": "api_key"
    },
    {
      "timestamp": "2026-02-16T16:10:00Z",
      "action": "add",
      "provider": "stripe",
      "account": "Primary",
      "success": true
    }
  ]
}
```

## Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Vault Configuration
VAULT_PIN_HASH=bcrypt_hash_of_2846
VAULT_SESSION_TTL_HOURS=24
VAULT_MAX_ATTEMPTS=3
VAULT_LOCKOUT_MINUTES=5
```

## Testing

Run the test suite:
```bash
npm test -- credential-vault
```

Manual test checklist:
- [ ] PIN creation on first use (2846)
- [ ] PIN validation and lockout
- [ ] 24-hour session persistence
- [ ] Encryption/decryption of credentials
- [ ] Provider/account listing
- [ ] Add/Edit/Delete operations
- [ ] Audit log recording
- [ ] Supabase real-time sync
- [ ] Security rules enforcement
- [ ] UI: Reveal button works
- [ ] UI: Copy button works
- [ ] UI: Edit functionality works

## Dependencies

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "bcryptjs": "^2.4.3",
  "crypto-js": "^4.2.0"
}
```

## License

Internal Mission Control Component
