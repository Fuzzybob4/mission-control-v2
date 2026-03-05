"use client"

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

import React, { useState, useEffect } from "react"
import { vaultClient, type VaultField } from "../lib/client"
import "./vault-ui.css"


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

type CredentialData = Record<string, string>

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
  onSave: (provider: string, account: string, data: CredentialData, businessUnit: string) => void;
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
  const [submitting, setSubmitting] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !submitting) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (!submitting) {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!submitting) {
      setPin('');
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (pin.length !== 4) {
      setMessage('Please enter 4 digits');
      return;
    }

    try {
      setSubmitting(true);
      await vaultClient.unlock(pin);
      setMessage('Vault unlocked!');
      setTimeout(onUnlock, 400);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid PIN';
      setMessage(errorMessage);
      setPin('');
      onError?.(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4 && !submitting) {
      handleSubmit();
    }
  }, [pin, submitting]);

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
            disabled={submitting}
          >
            {digit}
          </button>
        ))}
        <button className="keypad-btn clear" onClick={handleClear} disabled={submitting}>C</button>
        <button className="keypad-btn" onClick={() => handleDigit('0')} disabled={submitting}>0</button>
        <button className="keypad-btn backspace" onClick={handleBackspace} disabled={submitting}>⌫</button>
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

// Business units available in Mission Control
const BUSINESS_UNITS = [
  { id: "general",        label: "General / Shared" },
  { id: "lone-star",      label: "Lone Star Lighting" },
  { id: "redfox",         label: "RedFox CRM" },
  { id: "heroes",         label: "Heroes of the Meta" },
  { id: "from-inception", label: "From Inception" },
  { id: "agents",         label: "Agent Network" },
]

// Add/Edit Credential Form
export const CredentialForm: React.FC<AddCredentialFormProps> = ({
  onSave,
  onCancel,
  initialProvider = '',
  initialAccount = '',
  initialData = {},
  isEdit = false
}) => {
  const [name, setName] = useState(initialProvider || initialAccount);
  const [businessUnit, setBusinessUnit] = useState('general');
  const [keyValue, setKeyValue] = useState(
    Object.values(initialData)[0] ?? ''
  );
  const [fieldLabel, setFieldLabel] = useState(
    Object.keys(initialData)[0] ?? 'api_key'
  );
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a name for this credential.');
      return;
    }
    if (!keyValue.trim()) {
      setError('Please enter a key value.');
      return;
    }
    setError('');
    const provider = name.trim().toLowerCase().replace(/\s+/g, '_');
    onSave(provider, name.trim(), { [fieldLabel || 'api_key']: keyValue.trim() }, businessUnit);
  };

  return (
    <div className="credential-form">
      <h3>{isEdit ? 'Edit Credential' : 'Add New Credential'}</h3>

      <div className="form-group">
        <label htmlFor="cred-name">Name</label>
        <input
          id="cred-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Stripe, GitHub, Supabase"
          disabled={isEdit}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="cred-business">Business</label>
        <select
          id="cred-business"
          value={businessUnit}
          onChange={e => setBusinessUnit(e.target.value)}
        >
          {BUSINESS_UNITS.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="cred-field-label">Field</label>
        <input
          id="cred-field-label"
          type="text"
          value={fieldLabel}
          onChange={e => setFieldLabel(e.target.value)}
          placeholder="e.g., api_key, token, password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="cred-key">Key / Value</label>
        <input
          id="cred-key"
          type="password"
          value={keyValue}
          onChange={e => setKeyValue(e.target.value)}
          placeholder="Paste your key or secret here"
        />
      </div>

      {error && <div className="message error">{error}</div>}

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

  useEffect(() => {
    setSessionExpiry(vaultClient.getSessionExpiry());
    const unsubscribe = vaultClient.subscribe(() => {
      setSessionExpiry(vaultClient.getSessionExpiry());
    });
    return () => { unsubscribe(); };
  }, []);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
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
      const list = await vaultClient.listProviders();
      setProviders(list);
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const loadAccounts = async (provider: string) => {
    try {
      const list = await vaultClient.listAccounts(provider);
      setAccounts(list);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const loadFields = async (provider: string, account: string) => {
    try {
      const fieldData = await vaultClient.getFields(provider, account);
      setFields(fieldData.map(field => ({
        name: field.name,
        value: field.value,
        revealed: false
      })));
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

  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: string, value: string) => {
    setEditMode({ field, value });
    setEditValue(value);
  };

  const handleSaveEdit = async (newValue: string) => {
    if (editMode && selectedProvider && selectedAccount) {
      try {
        await vaultClient.edit(selectedProvider, selectedAccount, editMode.field, newValue);
        setEditMode(null);
        loadFields(selectedProvider, selectedAccount);
      } catch (err) {
        console.error('Failed to save edit:', err);
      }
    }
  };

  const handleAddCredential = async (provider: string, account: string, data: CredentialData, businessUnit: string) => {
    try {
      await vaultClient.add(provider, account, data, businessUnit);
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
        await vaultClient.delete(selectedProvider, selectedAccount || undefined, field);
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

  const handleLock = async () => {
    await vaultClient.lock();
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
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          autoFocus
        />
        <div className="form-actions">
          <button
            className="btn-save"
            onClick={() => handleSaveEdit(editValue)}
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
  const [unlocked, setUnlocked] = useState(vaultClient.isUnlocked());

  useEffect(() => {
    const update = () => setUnlocked(vaultClient.isUnlocked());
    const unsubscribe = vaultClient.subscribe(update);
    return () => { unsubscribe(); };
  }, []);

  if (!unlocked) {
    return <PinEntry onUnlock={() => setUnlocked(true)} />;
  }

  return <CredentialBrowser />;
};

export default VaultUI;
