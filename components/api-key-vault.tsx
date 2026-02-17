"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { 
  Key, 
  Shield, 
  Eye, 
  EyeOff, 
  Copy, 
  Plus, 
  Trash2, 
  ExternalLink,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search
} from "lucide-react"
import { useState } from "react"

interface APIKey {
  id: string
  siteName: string
  siteUrl?: string
  username?: string
  password?: string
  apiKey?: string
  apiSecret?: string
  twoFABackup?: string
  monthlyCost: number
  category: string
  status: "active" | "expired" | "warning"
  lastUsed?: string
  businessValue?: string
  expiresAt?: string
}

const sampleKeys: APIKey[] = [
  {
    id: "1",
    siteName: "Supabase",
    siteUrl: "supabase.com",
    apiKey: "eyJhbGciOiJIUzI1NiIs...",
    monthlyCost: 25,
    category: "Database",
    status: "active",
    lastUsed: "2026-02-16",
    businessValue: "Critical - All business data"
  },
  {
    id: "2",
    siteName: "HubSpot",
    siteUrl: "hubspot.com",
    username: "atlas@lonestarlighting.com",
    apiKey: "pat-na1-...",
    monthlyCost: 0,
    category: "CRM",
    status: "active",
    lastUsed: "2026-02-15",
    businessValue: "Lead management - $18K pipeline"
  },
  {
    id: "3",
    siteName: "Square",
    siteUrl: "squareup.com",
    apiKey: "sq0idp-...",
    monthlyCost: 0,
    category: "Payments",
    status: "active",
    lastUsed: "2026-02-14",
    businessValue: "Payment processing - 2.9% + $0.30/txn"
  },
  {
    id: "4",
    siteName: "GitHub",
    siteUrl: "github.com",
    username: "atlas-ai",
    apiKey: "ghp_...",
    twoFABackup: "XXXX-XXXX-XXXX-XXXX",
    monthlyCost: 4,
    category: "Development",
    status: "active",
    lastUsed: "2026-02-16",
    businessValue: "Code repository - RedFox CRM"
  },
  {
    id: "5",
    siteName: "Vercel",
    siteUrl: "vercel.com",
    apiKey: "vercel_token_...",
    monthlyCost: 20,
    category: "Hosting",
    status: "active",
    lastUsed: "2026-02-16",
    businessValue: "Mission Control hosting"
  },
  {
    id: "6",
    siteName: "Stripe",
    siteUrl: "stripe.com",
    apiKey: "sk_live_...",
    apiSecret: "whsec_...",
    twoFABackup: "Recovery codes saved in 1Password",
    monthlyCost: 0,
    category: "Payments",
    status: "active",
    lastUsed: "2026-02-10",
    businessValue: "RedFox subscription billing - $10K MRR target"
  },
  {
    id: "7",
    siteName: "Gumroad",
    siteUrl: "gumroad.com",
    apiKey: "gr_live_...",
    monthlyCost: 0,
    category: "Sales",
    status: "warning",
    expiresAt: "2026-03-01",
    businessValue: "Digital products - Heroes of the Meta"
  },
  {
    id: "8",
    siteName: "Brave Search",
    siteUrl: "brave.com/search/api",
    apiKey: "BSA...",
    monthlyCost: 0,
    category: "Research",
    status: "active",
    lastUsed: "2026-02-16",
    businessValue: "Web research - Market analysis"
  }
]

const categories = Array.from(new Set(sampleKeys.map(k => k.category)))

function MaskedValue({ value, show }: { value?: string; show: boolean }) {
  if (!value) return <span className="text-gray-500">-</span>
  if (show) return <span className="font-mono text-xs text-gray-300">{value}</span>
  return <span className="font-mono text-xs text-gray-500">{"•".repeat(Math.min(20, value.length))}</span>
}

export function APIKeyVault() {
  const [keys, setKeys] = useState<APIKey[]>(sampleKeys)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredKeys = keys.filter(key => {
    const matchesCategory = selectedCategory ? key.category === selectedCategory : true
    const matchesSearch = searchQuery 
      ? key.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  const totalMonthlyCost = keys.reduce((sum, key) => sum + key.monthlyCost, 0)
  const activeKeys = keys.filter(k => k.status === "active").length
  const warningKeys = keys.filter(k => k.status === "warning").length

  const toggleSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text?: string) => {
    if (text) navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Key className="w-4 h-4" />
            <span className="text-xs">Total Keys</span>
          </div>
          <p className="text-2xl font-bold text-white">{keys.length}</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Active</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{activeKeys}</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{warningKeys}</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Monthly Cost</span>
          </div>
          <p className="text-2xl font-bold text-white">${totalMonthlyCost}</p>
        </GlassCard>
      </div>

      {/* ROI Summary */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Platform ROI Tracking</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-gray-400 mb-1">Supabase</p>
            <p className="text-emerald-400 font-semibold">∞ ROI</p>
            <p className="text-gray-500">$25/mo | Critical infra</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-gray-400 mb-1">HubSpot</p>
            <p className="text-emerald-400 font-semibold">720x ROI</p>
            <p className="text-gray-500">Free tier | $18K pipeline</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-gray-400 mb-1">Vercel</p>
            <p className="text-emerald-400 font-semibold">High ROI</p>
            <p className="text-gray-500">$20/mo | Mission Control</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-gray-400 mb-1">Stripe</p>
            <p className="text-amber-400 font-semibold">Future ROI</p>
            <p className="text-gray-500">Free | $10K MRR target</p>
          </div>
        </div>
      </GlassCard>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === null
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Key
        </button>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {filteredKeys.map(key => {
          const showSecret = showSecrets[key.id]

          return (
            <GlassCard key={key.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Key className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{key.siteName}</h4>
                      <p className="text-xs text-gray-400">{key.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge 
                      status={key.status === 'active' ? 'active' : key.status === 'warning' ? 'busy' : 'offline'} 
                      label={key.status} 
                    />
                    {key.siteUrl && (
                      <a 
                        href={`https://${key.siteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {key.username && (
                    <div>
                      <p className="text-gray-500 mb-1">Username</p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{key.username}</span>
                        <button 
                          onClick={() => copyToClipboard(key.username)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {(key.apiKey || key.password) && (
                    <div>
                      <p className="text-gray-500 mb-1">{key.apiKey ? "API Key" : "Password"}</p>
                      <div className="flex items-center gap-2">
                        <MaskedValue value={key.apiKey || key.password} show={showSecret} />
                        <button 
                          onClick={() => toggleSecret(key.id)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(key.apiKey || key.password)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {key.apiSecret && (
                    <div>
                      <p className="text-gray-500 mb-1">API Secret</p>
                      <div className="flex items-center gap-2">
                        <MaskedValue value={key.apiSecret} show={showSecret} />
                        <button 
                          onClick={() => toggleSecret(key.id)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(key.apiSecret)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {key.twoFABackup && (
                    <div>
                      <p className="text-gray-500 mb-1">2FA Backup</p>
                      <div className="flex items-center gap-2">
                        <MaskedValue value={key.twoFABackup} show={showSecret} />
                        <button 
                          onClick={() => toggleSecret(key.id)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-500 mb-1">Monthly Cost</p>
                    <p className="text-gray-300">${key.monthlyCost}</p>
                  </div>

                  {key.businessValue && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Business Value</p>
                      <p className="text-gray-300">{key.businessValue}</p>
                    </div>
                  )}

                  {key.expiresAt && (
                    <div>
                      <p className="text-gray-500 mb-1">Expires</p>
                      <p className="text-amber-400">{key.expiresAt}</p>
                    </div>
                  )}

                  {key.lastUsed && (
                    <div>
                      <p className="text-gray-500 mb-1">Last Used</p>
                      <p className="text-gray-300">{key.lastUsed}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setKeys(keys.filter(k => k.id !== key.id))}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Add New API Key</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Site Name</label>
                  <input 
                    type="text"
                    placeholder="e.g., GitHub"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option>Database</option>
                    <option>CRM</option>
                    <option>Payments</option>
                    <option>Development</option>
                    <option>Hosting</option>
                    <option>Sales</option>
                    <option>Research</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Username / Email</label>
                  <input 
                    type="text"
                    placeholder="username@example.com"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">API Key / Password</label>
                  <input 
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">2FA Backup Codes</label>
                  <textarea 
                    placeholder="Backup codes (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Monthly Cost ($)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Business Value</label>
                  <input 
                    type="text"
                    placeholder="e.g., Payment processing - $18K pipeline"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
