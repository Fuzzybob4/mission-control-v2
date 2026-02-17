# Credential Vault

Secure credential management for Mission Control with real-time Supabase sync.

## 🔐 Quick Start

### First Time Setup

The vault is pre-configured with PIN **2846**. Simply enter this PIN to unlock.

**Session Duration:** 24 hours - Enter once, access all day.

### Unlocking the Vault

```typescript
import { vault } from './lib/encryption';

// Unlock with PIN 2846
const result = await vault.unlock('2846');
if (result.success) {
  console.log('Vault unlocked for 24 hours');
  console.log('Session expires:', result.sessionExpiry);
} else if (result.locked) {
  console.log(`Locked. Try again in ${result.remainingMinutes} minutes`);
}
```

### Storing Credentials

```typescript
// Add new credentials (requires Protocol 26)
await vault.add('google', 'My Account', {
  email: 'user@gmail.com',
  password: 'mypassword',
  api_key: 'AIza...'
});
```

### Retrieving Credentials

```typescript
// Get a specific credential
const apiKey = await vault.get('google', 'My Account', 'api_key');

// Use in automation
await browser.authenticate({
  apiKey: await vault.get('google', 'My Account', 'api_key')
});
```

## 📱 UI Components

```tsx
import { VaultUI } from './components/vault-ui';

// Full vault interface
<VaultUI />

// PIN entry only
<VaultUI.PinEntry onUnlock={handleUnlock} />

// Credential browser
<VaultUI.CredentialBrowser />
```

### UI Features

- **PIN Entry**: Numeric keypad with visual feedback
- **Provider Tabs**: Quick navigation between services
- **Account Dropdown**: Select account per provider
- **Masked Display**: •••••• with reveal toggle
- **Reveal Button**: 👁️ Show credential (for authorized eyes only)
- **Copy Button**: 📋 Copy to clipboard
- **Edit Button**: ✏️ Modify existing entries
- **Add New Service**: ➕ Add new provider/account

## 🔒 Security Features

- **PIN**: 2846 (hashed with bcrypt)
- **Session**: 24-hour duration
- **Encryption**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Lockout**: 3 failed attempts = 5-minute lockout
- **Audit Logging**: All access tracked
- **Protocol 26**: Required for adding credentials

## 🔄 Supabase Integration

Real-time sync between devices via Supabase.

### Database Schema

```sql
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

### Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 📋 Storage Structure

```
providers/
  google/
    - Lone Star Lighting Displays
      - email: [encrypted]
      - password: [encrypted]
      - api_key: [encrypted]
      - cli_token: [encrypted]
    - RedFox CRM
      - email: [encrypted]
      - password: [encrypted]
  gumroad/
    - accounts...
  hubspot/
    - accounts...
  facebook/
    - accounts...
  x/
    - accounts...
  yahoo/
    - accounts...
  stripe/
    - accounts...
  payment_methods/
    - primary: [encrypted card data]
```

## 🎯 Mission Control Integration

Add to navigation in `MissionControl.tsx`:

```typescript
tabs: [
  { id: 'hub', label: 'Hub', component: MissionControlHub },
  { id: 'vault', label: '🔐 Vault', component: VaultUI },
  { id: 'api-keys', label: 'API Keys', component: APIKeyVault },
  // ...
]
```

Add unlock flow at app startup:

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

## 🔑 API Reference

### Core Methods

| Method | Description |
|--------|-------------|
| `vault.unlock(pin)` | Unlock vault with PIN (2846) |
| `vault.lock()` | Manually lock vault |
| `vault.get(provider, account, field)` | Retrieve decrypted credential |
| `vault.add(provider, account, data)` | Add new credentials |
| `vault.edit(provider, account, field, value)` | Edit existing credential |
| `vault.delete(provider, account, field?)` | Delete credential/account/provider |
| `vault.listProviders()` | List all providers |
| `vault.listAccounts(provider)` | List accounts for provider |
| `vault.listFields(provider, account)` | List fields for account |
| `vault.getAuditLog(limit?)` | Get audit log entries |

### Session Management

```typescript
// Check status
vault.isUnlocked();        // boolean
vault.isSessionExpired();  // boolean
vault.getSessionExpiry();  // Date | null
```

## 🛡️ Security Best Practices

1. **Never share PIN 2846** - Keep it secure
2. **Use unique credentials** - Don't reuse passwords
3. **Review audit log** - Check for unauthorized access
4. **Lock when away** - Click "🔒 Lock" button
5. **Protocol 26** - Always verify before adding credentials

## ⚠️ Security Rules

1. **NEVER share credentials in chat/Telegram/email**
2. **Protocol 26 required** to add new credentials
3. **Website automation** can use stored credentials
4. **Audit log** tracks all access with timestamps
5. **Reveal button** - For authorized eyes only

## 🐛 Troubleshooting

### Forgot PIN
PIN is fixed as **2846**. If changed, you must reset the vault.

### Vault Won't Unlock
- Wait for lockout period if exceeded 3 attempts
- Verify Supabase connection
- Check network connectivity

### Credentials Not Found
- Ensure vault is unlocked
- Check provider/account name spelling
- Verify credential exists in Supabase

### Session Expired
Session lasts 24 hours. Re-enter PIN 2846 to unlock.

## 🧪 Testing

```bash
# Run tests
npm test -- credential-vault

# Manual test checklist
- [ ] PIN 2846 unlocks vault
- [ ] 24-hour session persists
- [ ] Lockout after 3 failed attempts
- [ ] Encryption/decryption works
- [ ] Supabase real-time sync
- [ ] Add/Edit/Delete operations
- [ ] Reveal/Copy buttons work
- [ ] Audit logging
```

## 📦 Dependencies

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "bcryptjs": "^2.4.3",
  "crypto-js": "^4.2.0"
}
```

## 🔗 Links

- [SKILL.md](SKILL.md) - Detailed documentation
- [Mission Control Hub](../mission-control/README.md)
- [Supabase Dashboard](https://app.supabase.com)

## 📄 License

Internal Mission Control Component
