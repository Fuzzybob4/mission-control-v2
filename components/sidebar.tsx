"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Lightbulb, 
  Code2, 
  Gamepad2,
  BarChart3, 
  Settings,
  ShieldCheck,
  Monitor,
  Cpu,
  Clock,
  MoreHorizontal,
  X,
  Sparkles,
  Mail,
  Crosshair
} from "lucide-react"

type TabId = "overview" | "revenue-command" | "lone-star" | "redfox" | "heroes" | "analytics" | "systems" | "vault" | "from-inception"

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview",        label: "Overview",            icon: LayoutDashboard },
  { id: "revenue-command", label: "Revenue Command",     icon: Crosshair },
  { id: "lone-star",       label: "Lone Star Lighting",  icon: Lightbulb },
  { id: "redfox",          label: "RedFox CRM",          icon: Code2 },
  { id: "heroes",          label: "Heroes of the Meta",  icon: Gamepad2 },
  { id: "from-inception",  label: "From Inception",      icon: Monitor },
  { id: "analytics",       label: "Analytics",           icon: BarChart3 },
  { id: "systems",         label: "Systems",             icon: Settings },
  { id: "vault",           label: "Credential Vault",    icon: ShieldCheck },
]

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export type { TabId }

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Kal Mission Control</h1>
              <p className="text-[10px] text-gray-400">Operations Hub</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MoreHorizontal className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide over */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 h-full glass border-r border-white/10 flex flex-col transition-transform duration-300",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo - Hidden on mobile (shown in header) */}
        <div className="hidden lg:block p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Kal Mission Control</h1>
              <p className="text-xs text-gray-400">Operations Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                    "active:scale-95",
                    isActive 
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-6 space-y-2">
            <Link
              href="/cron-jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium border border-white/10 text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Clock className="w-5 h-5 text-violet-300" />
              <span className="truncate">Cron Jobs</span>
              <span className="text-[11px] uppercase tracking-wide text-gray-400 ml-auto">/cron-jobs</span>
            </Link>
            <Link
              href="/agents"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium border border-white/10 text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Cpu className="w-5 h-5 text-blue-300" />
              <span className="truncate">Agent Network</span>
              <span className="text-[11px] uppercase tracking-wide text-gray-400 ml-auto">/agents</span>
            </Link>
            <Link
              href="/skills"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium border border-white/10 text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Sparkles className="w-5 h-5 text-blue-300" />
              <span className="truncate">Skills Inventory</span>
              <span className="text-[11px] uppercase tracking-wide text-gray-400 ml-auto">/skills</span>
            </Link>
            <Link
              href="/cold-outreach"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium border border-white/10 text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Mail className="w-5 h-5 text-emerald-300" />
              <span className="truncate">Pending Cold Outreach</span>
              <span className="text-[11px] uppercase tracking-wide text-gray-400 ml-auto">/cold-outreach</span>
            </Link>
          </div>
        </nav>

        {/* Business Status */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-gray-500 uppercase mb-3">Business Status</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Lone Star</span>
              <span className="text-emerald-400">$18K Pipeline</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">RedFox</span>
              <span className="text-amber-400">In Dev</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Heroes</span>
              <span className="text-gray-500">On Hold</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
