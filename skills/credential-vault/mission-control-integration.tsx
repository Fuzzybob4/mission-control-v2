/**
 * Mission Control - Vault Integration
 * 
 * Add this to your Mission Control hub to integrate the Credential Vault
 */

import React, { useState, useEffect } from 'react';
import { VaultUI } from '../credential-vault/components/vault-ui';
import { vault } from '../credential-vault/lib/encryption';

// Add Vault tab to main navigation
export const missionControlTabs = [
  { id: 'hub', label: '🏠 Hub', component: MissionControlHub },
  { id: 'vault', label: '🔐 Vault', component: VaultUI },
  { id: 'api-keys', label: '🔑 API Keys', component: APIKeyVault },
  { id: 'browser', label: '🌐 Browser', component: BrowserAutomation },
  { id: 'settings', label: '⚙️ Settings', component: Settings },
];

// Vault unlock flow at startup
export function useVaultSession() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  useEffect(() => {
    // Check vault status on mount
    const checkVault = () => {
      const unlocked = vault.isUnlocked();
      const expired = vault.isSessionExpired();
      
      if (!unlocked || expired) {
        setShowPinEntry(true);
        setIsUnlocked(false);
      } else {
        setIsUnlocked(true);
        setSessionExpiry(vault.getSessionExpiry());
      }
    };

    checkVault();

    // Check session expiry periodically
    const interval = setInterval(() => {
      if (vault.isUnlocked() && vault.isSessionExpired()) {
        setShowPinEntry(true);
        setIsUnlocked(false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
    setShowPinEntry(false);
    setSessionExpiry(vault.getSessionExpiry());
  };

  return {
    isUnlocked,
    showPinEntry,
    sessionExpiry,
    handleUnlock,
    setShowPinEntry
  };
}

// Link from API Key Vault to Credential Vault
export const APIKeyVaultLink: React.FC = () => {
  return (
    <div className="api-key-vault-link">
      <p>Looking for more credentials?</p>
      <a href="#vault" className="vault-link">
        🔐 Open Credential Vault →
      </a>
      <span className="vault-hint">Secure storage with PIN protection</span>
    </div>
  );
};

// Quick credential access for automation
export async function getCredentialForAutomation(
  provider: string,
  account: string,
  field: string
): Promise<string | null> {
  try {
    if (!vault.isUnlocked()) {
      console.warn('Vault is locked. Cannot retrieve credential.');
      return null;
    }
    
    const value = await vault.get(provider, account, field);
    
    // Log automation access
    await vault.logAudit({
      action: 'automation_get',
      provider,
      account,
      field,
      success: true
    });
    
    return value;
  } catch (err) {
    console.error('Failed to get credential:', err);
    return null;
  }
}

// Vault status indicator for header
export const VaultStatus: React.FC = () => {
  const [unlocked, setUnlocked] = useState(vault.isUnlocked());
  const [expiry, setExpiry] = useState<Date | null>(vault.getSessionExpiry());

  useEffect(() => {
    const interval = setInterval(() => {
      setUnlocked(vault.isUnlocked());
      setExpiry(vault.getSessionExpiry());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!unlocked) {
    return (
      <div className="vault-status locked" title="Vault is locked">
        🔒
      </div>
    );
  }

  const hoursLeft = expiry 
    ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60))
    : 0;

  return (
    <div 
      className={`vault-status unlocked ${hoursLeft <= 1 ? 'expiring' : ''}`}
      title={`Vault unlocked. Expires in ${hoursLeft} hours`}
    >
      🔓 {hoursLeft}h
    </div>
  );
};

// Placeholder components (replace with actual implementations)
function MissionControlHub() {
  return <div>Mission Control Hub</div>;
}

function APIKeyVault() {
  return (
    <div>
      <h2>API Key Vault</h2>
      <APIKeyVaultLink />
    </div>
  );
}

function BrowserAutomation() {
  return <div>Browser Automation</div>;
}

function Settings() {
  return <div>Settings</div>;
}
