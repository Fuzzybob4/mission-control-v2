/**
 * Credential Vault - React UI Component
 * 
 * Features:
 * - PIN entry with numeric keypad
 * - Provider tabs with account dropdowns
 * - Masked credential display
 * - Reveal button (authorized eyes only)
 * - Copy button for each field
 * - Edit button for existing entries
 * - Add New Service button
 * - 24-hour session persistence
 * - Real-time Supabase sync
 */

import React, { useState, useEffect, useCallback } from 'react';
import { vault, CredentialData } from '../lib/encryption';
import { subscribeToVaultChanges, VaultCredential } from '../lib/supabase';
import './vault-ui.css';

// Types
interface Provider {
  name: string;
  icon: string;
}

interface Account {
  name: string;
  fields: Field[];
}

interface Field {
  name: string;
  value: string;
  masked: boolean;
}

interface PinEntryProps {
  onUnlock: () => void;
  onError?: (message: string) => void;
}

interface CredentialBrowserProps {
  providers: Provider[];
  onEdit: (provider: string, account: string, field: string, value: string) => void;
  onDelete: (provider: string, account: string, field?: string) => void;
}

interface AddCredentialFormProps {
  onSave: (provider: string, account: string, data: CredentialData) => void;
  onCancel: () => void;
  initialProvider?: string;
  initialAccount?: string;
  initialData?: CredentialData;
  isEdit?: boolean;
}

// Constants
const PROVIDERS: Provider[] = [
  { name: 'google', icon: '🔍' },
  { name: 'gumroad', icon: '🛒' },
  { name: 'hubspot', icon: '📊' },
  { name: 'facebook', icon: '📘' },
  { name: 'x', icon: '🐦' },
  { name: 'yahoo', icon: '📧' },
  { name: 'stripe', icon: '💳' },
  { name: 'payment_methods', icon: '💰' }
];

// PIN Entry Component
export const PinEntry: React.FC<PinEntryProps> = ({ onUnlock, onError }) => {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setMessage('Please enter 4 digits');
      return;
    }

    const result = await vault.unlock(pin);
    
    if (result.success) {
      setMessage('Vault unlocked!');
      setTimeout(onUnlock, 500);
    } else if (result.locked) {
      setIsLocked(true);
      setRemainingMinutes(result.remainingMinutes || 5);
      setMessage(result.message || 'Vault locked');
      onError?.(result.message || 'Vault locked');
    } else {
      setMessage(result.message || 'Invalid PIN');
      setPin('');
      onError?.(result.message || 'Invalid PIN');
    }
  };

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && !isLocked) {
      handleSubmit();
    }
  }, [pin]);

  if (isLocked) {
    return (
      <div className="vault-pin-entry locked">
        <div className="vault-icon">🔒</div>
        <h2>Vault Locked</h2>
        <p>Too many failed attempts.</p>
        <p className="countdown">Try again in {remainingMinutes} minutes</p>
      </div>
    );
  }

  return (
    <div className="vault-pin-entry">
      <div className="vault-icon">🛡️</div>
      <h2>Enter Vault PIN</h2>
      
      <div className="pin-display">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}>
            {i < pin.length ? '•' : ''}
          </span>
        ))}
      </div>

      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
          <button
            key={digit}
            className="keypad-btn"
            onClick={() => handleDigit(digit)}
          >
            {digit}
          </button>
        ))}
        <button className="keypad-btn clear" onClick={handleClear}>C</button>
        <button className="keypad-btn" onClick={() => handleDigit('0')}>0</button>
        <button className="keypad-btn backspace" onClick={handleBackspace}>⌫</button>
      </div>

      {message && (
        <div className={`message ${message.includes('unlocked') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="session-info">
        Session lasts 24 hours
      </div>
    </div>
  );
};

// Add/Edit Credential Form
export const CredentialForm: React.FC<AddCredentialFormProps> = ({
  onSave,
  onCancel,
  initialProvider = '',
  initialAccount = '',
  initialData = {},
  isEdit = false
}) => {
  const [provider, setProvider] = useState(initialProvider);
  const [account, setAccount] = useState(initialAccount);
  const [fields, setFields] = useState<{ name: string; value: string }[]>(
    Object.entries(initialData).map(([name, value]) => ({ name, value }))
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [protocolVerified, setProtocolVerified] = useState(isEdit);

  const addField = () => {
    if (newFieldName && !fields.find(f => f.name === newFieldName)) {
      setFields([...fields, { name: newFieldName, value: '' }]);
      setNewFieldName('');
    }
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!provider || !account) {
      alert('Please enter provider and account name');
      return;
    }

    const data: CredentialData = {};
    fields.forEach(f => {
      if (f.name && f.value) {
        data[f.name] = f.value;
      }
    });

    onSave(provider, account, data);
  };

  const verifyProtocol26 = () => {
    // In production, this would verify Protocol 26
    setProtocolVerified(true);
  };

  if (!protocolVerified) {
    return (
      <div className="credential-form protocol-check">
        <h3>🔒 Security Verification Required</h3>
        <p>Adding new credentials requires Protocol 26 verification.</p>
        <div className="protocol-actions">
          <button className="btn-verify" onClick={verifyProtocol26}>
            Verify Protocol 26
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="credential-form">
      <h3>{isEdit ? 'Edit Credential' : 'Add New Credential'}</h3>
      
      <div className="form-group">
        <label>Provider</label>
        {!isEdit ? (
          <select value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="">Select provider...</option>
            {PROVIDERS.map(p => (
              <option key={p.name} value={p.name}>
                {p.icon} {p.name}
              </option>
            ))}
            <option value="other">➕ Other...</option>
          </select>
        ) : (
          <input type="text" value={provider} disabled />
        )}
        {provider === 'other' && (
          <input
            type="text"
            placeholder="Enter provider name"
            onChange={e => setProvider(e.target.value)}
          />
        )}
      </div>

      <div className="form-group">
        <label>Account Name</label>
        <input
          type="text"
          value={account}
          onChange={e => setAccount(e.target.value)}
          placeholder="e.g., Lone Star Lighting Displays"
          disabled={isEdit}
        />
      </div>

      <div className="form-group fields">
        <label>Fields</label>
        {fields.map((field, index) => (
          <div key={index} className="field-row">
            <input
              type="text"
              value={field.name}
              disabled
              className="field-name"
            />
            <input
              type={field.name.includes('password') || field.name.includes('key') || field.name.includes('token') ? 'password' : 'text'}
              value={field.value}
              onChange={e => updateField(index, e.target.value)}
              placeholder={`Enter ${field.name}`}
              className="field-value"
            />
            <button
              className="btn-remove"
              onClick={() => removeField(index)}
              title="Remove field"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="form-group add-field">
        <input
          type="text"
          value={newFieldName}
          onChange={e => setNewFieldName(e.target.value)}
          placeholder="New field name (e.g., api_key)"
        />
        <button className="btn-add" onClick={addField}>
          Add Field
        </button>
      </div>

      <div className="form-actions">
        <button className="btn-save" onClick={handleSave}>
          {isEdit ? 'Save Changes' : 'Add Credential'}
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// Main Vault Browser Component
export const CredentialBrowser: React.FC = () => {
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [fields, setFields] = useState<{ name: string; value: string; revealed: boolean }[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState<{ field: string; value: string } | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
    setSessionExpiry(vault.getSessionExpiry());

    // Subscribe to real-time changes
    const subscription = subscribeToVaultChanges((payload) => {
      if (selectedProvider) {
        loadAccounts(selectedProvider);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load accounts when provider selected
  useEffect(() => {
    if (selectedProvider) {
      loadAccounts(selectedProvider);
    }
  }, [selectedProvider]);

  // Load fields when account selected
  useEffect(() => {
    if (selectedProvider && selectedAccount) {
      loadFields(selectedProvider, selectedAccount);
    }
  }, [selectedProvider, selectedAccount]);

  const loadProviders = async () => {
    try {
      const list = await vault.listProviders();
      setProviders(list);
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const loadAccounts = async (provider: string) => {
    try {
      const list = await vault.listAccounts(provider);
      setAccounts(list);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const loadFields = async (provider: string, account: string) => {
    try {
      const fieldNames = await vault.listFields(provider, account);
      const fieldData = await Promise.all(
        fieldNames.map(async (name) => {
          try {
            const value = await vault.get(provider, account, name);
            return { name, value, revealed: false };
          } catch {
            return { name, value: '*** ERROR ***', revealed: false };
          }
        })
      );
      setFields(fieldData);
    } catch (err) {
      console.error('Failed to load fields:', err);
    }
  };

  const handleReveal = (index: number) => {
    const newFields = [...fields];
    newFields[index].revealed = !newFields[index].revealed;
    setFields(newFields);
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      // Show brief "Copied!" feedback
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEdit = (field: string, value: string) => {
    setEditMode({ field, value });
  };

  const handleSaveEdit = async (newValue: string) => {
    if (editMode && selectedProvider && selectedAccount) {
      try {
        await vault.edit(selectedProvider, selectedAccount, editMode.field, newValue);
        setEditMode(null);
        loadFields(selectedProvider, selectedAccount);
      } catch (err) {
        console.error('Failed to save edit:', err);
      }
    }
  };

  const handleAddCredential = async (provider: string, account: string, data: CredentialData) => {
    try {
      await vault.add(provider, account, data);
      setShowAddForm(false);
      loadProviders();
      setSelectedProvider(provider);
    } catch (err) {
      console.error('Failed to add credential:', err);
    }
  };

  const handleDelete = async (field?: string) => {
    if (!selectedProvider) return;
    
    const confirmMsg = field
      ? `Delete ${field} from ${selectedAccount}?`
      : selectedAccount
      ? `Delete account ${selectedAccount}?`
      : `Delete provider ${selectedProvider}?`;
    
    if (confirm(confirmMsg)) {
      try {
        await vault.delete(selectedProvider, selectedAccount || undefined, field);
        if (field) {
          loadFields(selectedProvider, selectedAccount);
        } else if (selectedAccount) {
          loadAccounts(selectedProvider);
          setSelectedAccount('');
        } else {
          loadProviders();
          setSelectedProvider('');
        }
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const handleLock = () => {
    vault.lock();
    window.location.reload();
  };

  if (showAddForm) {
    return (
      <CredentialForm
        onSave={handleAddCredential}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  if (editMode) {
    return (
      <div className="edit-form">
        <h3>Edit {editMode.field}</h3>
        <input
          type="text"
          defaultValue={editMode.value}
          id="edit-value"
        />
        <div className="form-actions">
          <button
            className="btn-save"
            onClick={() => {
              const input = document.getElementById('edit-value') as HTMLInputElement;
              handleSaveEdit(input.value);
            }}
          >
            Save
          </button>
          <button className="btn-cancel" onClick={() => setEditMode(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="credential-browser">
      <div className="vault-header">
        <h2>🔐 Credential Vault</h2>
        <div className="session-status">
          {sessionExpiry && (
            <span className="expiry">
              Session expires: {sessionExpiry.toLocaleTimeString()}
            </span>
          )}
          <button className="btn-lock" onClick={handleLock}>
            🔒 Lock
          </button>
        </div>
      </div>

      <button className="btn-add-service" onClick={() => setShowAddForm(true)}>
        ➕ Add New Service
      </button>

      <div className="provider-tabs">
        {providers.map(provider => {
          const providerInfo = PROVIDERS.find(p => p.name === provider);
          return (
            <button
              key={provider}
              className={`provider-tab ${selectedProvider === provider ? 'active' : ''}`}
              onClick={() => {
                setSelectedProvider(provider);
                setSelectedAccount('');
              }}
            >
              {providerInfo?.icon || '📁'} {provider}
            </button>
          );
        })}
      </div>

      {selectedProvider && (
        <div className="account-section">
          <div className="account-header">
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="account-dropdown"
            >
              <option value="">Select account...</option>
              {accounts.map(account => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
            <button
              className="btn-delete-provider"
              onClick={() => handleDelete()}
              title="Delete provider"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {selectedAccount && (
        <div className="credentials-list">
          <h4>Credentials for {selectedAccount}</h4>
          {fields.map((field, index) => (
            <div key={field.name} className="credential-row">
              <span className="field-label">{field.name}:</span>
              <span className="field-value">
                {field.revealed ? field.value : '•'.repeat(Math.min(field.value.length, 12))}
              </span>
              <div className="field-actions">
                <button
                  className="btn-reveal"
                  onClick={() => handleReveal(index)}
                  title={field.revealed ? 'Hide' : 'Reveal'}
                >
                  {field.revealed ? '🙈' : '👁️'}
                </button>
                <button
                  className="btn-copy"
                  onClick={() => handleCopy(field.value)}
                  title="Copy to clipboard"
                >
                  📋
                </button>
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(field.name, field.value)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(field.name)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          <button
            className="btn-delete-account"
            onClick={() => handleDelete()}
          >
            Delete Account
          </button>
        </div>
      )}

      <div className="vault-footer">
        <a href="#api-keys" className="link-api-keys">
          ← Back to API Key Vault
        </a>
      </div>
    </div>
  );
};

// Main Vault UI Component
export const VaultUI: React.FC = () => {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // Check if already unlocked
    if (vault.isUnlocked()) {
      setUnlocked(true);
    }
  }, []);

  if (!unlocked) {
    return <PinEntry onUnlock={() => setUnlocked(true)} />;
  }

  return <CredentialBrowser />;
};

export default VaultUI;
