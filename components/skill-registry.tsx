"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { 
  Bot, 
  MessageSquare, 
  Mail, 
  Database, 
  Cloud, 
  Calendar, 
  FileText, 
  Search,
  Zap,
  Globe,
  CreditCard,
  BarChart3,
  Key,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react"
import { useState } from "react"

interface Skill {
  id: string
  name: string
  category: string
  status: "active" | "beta" | "development" | "planned"
  description: string
  icon: React.ElementType
  applications: string[]
  businesses: string[]
  docsPath?: string
}

const skills: Skill[] = [
  {
    id: "telegram-bot",
    name: "Telegram Bot API",
    category: "Messaging",
    status: "active",
    description: "Send messages, handle commands, and interact with users via Telegram. Supports rich media, inline keyboards, reactions, and scheduled messaging.",
    icon: MessageSquare,
    applications: ["Lead notifications", "Quote follow-ups", "Installation updates", "Beta signups", "System alerts", "Payment confirmations"],
    businesses: ["Lone Star Lighting", "RedFox CRM"],
    docsPath: "/docs/skills/telegram-bot-api.md"
  },
  {
    id: "email",
    name: "Email Integration",
    category: "Messaging",
    status: "active",
    description: "Outlook/Gmail integration for sending and reading emails with attachment support.",
    icon: Mail,
    applications: ["Customer communication", "Quote delivery", "Invoice sending", "Newsletters"],
    businesses: ["Lone Star Lighting", "RedFox CRM"]
  },
  {
    id: "supabase",
    name: "Supabase Database",
    category: "Database",
    status: "active",
    description: "PostgreSQL database with real-time subscriptions, authentication, and storage.",
    icon: Database,
    applications: ["Lead storage", "Customer records", "File storage", "Analytics"],
    businesses: ["Lone Star Lighting", "RedFox CRM"]
  },
  {
    id: "web-search",
    name: "Web Search",
    category: "Research",
    status: "active",
    description: "Brave Search API for web research with region and language filtering.",
    icon: Search,
    applications: ["Market research", "Competitor analysis", "Lead qualification", "Trend monitoring"],
    businesses: ["Lone Star Lighting", "RedFox CRM", "Heroes of the Meta"]
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    category: "CRM",
    status: "active",
    description: "CRM integration for contacts, deals, and marketing automation.",
    icon: Globe,
    applications: ["Contact sync", "Pipeline tracking", "Email sequences"],
    businesses: ["Lone Star Lighting"]
  },
  {
    id: "square",
    name: "Square Payments",
    category: "Payments",
    status: "active",
    description: "Payment processing for invoices, quotes, and subscriptions.",
    icon: CreditCard,
    applications: ["Quote payments", "Invoice collection", "Recurring billing"],
    businesses: ["Lone Star Lighting"]
  },
  {
    id: "tts",
    name: "Text-to-Speech",
    category: "Media",
    status: "active",
    description: "Convert text to audio for voice messages and accessibility.",
    icon: Zap,
    applications: ["Voice notifications", "Audio summaries", "Accessibility"],
    businesses: ["Lone Star Lighting", "RedFox CRM"]
  },
  {
    id: "calendar",
    name: "Calendar Integration",
    category: "Productivity",
    status: "beta",
    description: "Outlook calendar for scheduling appointments and reminders.",
    icon: Calendar,
    applications: ["Appointment booking", "Follow-up reminders", "Installation scheduling"],
    businesses: ["Lone Star Lighting"]
  },
  {
    id: "file-upload",
    name: "File Upload",
    category: "Storage",
    status: "active",
    description: "Upload and manage files with business unit organization.",
    icon: FileText,
    applications: ["Photo storage", "Document management", "Asset organization"],
    businesses: ["Lone Star Lighting", "RedFox CRM"]
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    category: "Analytics",
    status: "active",
    description: "Business metrics, KPI tracking, and performance visualization.",
    icon: BarChart3,
    applications: ["Revenue tracking", "Lead conversion", "Goal monitoring"],
    businesses: ["Lone Star Lighting", "RedFox CRM"]
  },
  {
    id: "browser",
    name: "Browser Automation",
    category: "Automation",
    status: "beta",
    description: "Control browser for web scraping, form filling, and UI automation.",
    icon: Globe,
    applications: ["Lead research", "Form automation", "Data extraction"],
    businesses: ["Lone Star Lighting", "RedFox CRM"]
  },
  {
    id: "api-vault",
    name: "API Key Vault",
    category: "Security",
    status: "active",
    description: "Secure encrypted storage for API keys, credentials, and 2FA backups with ROI tracking.",
    icon: Key,
    applications: ["Credential management", "Cost tracking", "Security compliance"],
    businesses: ["Lone Star Lighting", "RedFox CRM", "Heroes of the Meta"]
  }
]

const categories = Array.from(new Set(skills.map(s => s.category)))

export function SkillRegistry() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredSkills = selectedCategory 
    ? skills.filter(s => s.category === selectedCategory)
    : skills

  const activeCount = skills.filter(s => s.status === "active").length
  const betaCount = skills.filter(s => s.status === "beta").length
  const devCount = skills.filter(s => s.status === "development").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard>
          <p className="text-2xl font-bold text-white">{skills.length}</p>
          <p className="text-xs text-gray-500">Total Skills</p>
        </GlassCard>
        <GlassCard>
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-xs text-gray-500">Active</p>
        </GlassCard>
        <GlassCard>
          <p className="text-2xl font-bold text-amber-400">{betaCount}</p>
          <p className="text-xs text-gray-500">Beta</p>
        </GlassCard>
        <GlassCard>
          <p className="text-2xl font-bold text-blue-400">{devCount}</p>
          <p className="text-xs text-gray-500">In Dev</p>
        </GlassCard>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map(skill => {
          const Icon = skill.icon
          const isExpanded = expandedSkill === skill.id

          return (
            <GlassCard 
              key={skill.id} 
              className={`transition-all ${isExpanded ? 'ring-1 ring-blue-500/30' : ''}`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{skill.name}</h4>
                      <p className="text-xs text-gray-400">{skill.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge 
                      status={skill.status === 'active' ? 'active' : skill.status === 'beta' ? 'busy' : 'idle'} 
                      label={skill.status} 
                    />
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <p className="text-xs text-gray-300">{skill.description}</p>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-2">Applications</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skill.applications.map(app => (
                          <span 
                            key={app}
                            className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-2">Used By</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skill.businesses.map(biz => (
                          <span 
                            key={biz}
                            className="px-2 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-400"
                          >
                            {biz}
                          </span>
                        ))}
                      </div>
                    </div>

                    {skill.docsPath && (
                      <div className="pt-2">
                        <a 
                          href={skill.docsPath}
                          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Documentation
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
