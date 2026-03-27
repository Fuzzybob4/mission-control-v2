"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Sidebar } from "@/components/sidebar"
import { OverviewTab } from "@/components/tabs/overview-tab"
import { RevenueCommandTab } from "@/components/tabs/revenue-command-tab"
import { LoneStarTab } from "@/components/tabs/lone-star-tab"
import { RedFoxTab } from "@/components/tabs/redfox-tab"
import { HeroesTab } from "@/components/tabs/heroes-tab"
import { AnalyticsTab } from "@/components/tabs/analytics-tab"
import { SystemsTab } from "@/components/tabs/systems-tab"
import { FromInceptionTab } from "@/components/tabs/from-inception-tab"
import { HeartbeatSection } from "@/components/heartbeat-section"
import { DailyMotivationWidget } from "@/components/daily-motivation-widget"
import { QuickActions } from "@/components/quick-actions"
import { NotificationCenter } from "@/components/notification-center"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { ConnectionStatus } from "@/components/connection-status"
import { ScrollToTop } from "@/components/scroll-to-top"
import { useKeyboardShortcuts, ShortcutConfig } from "@/hooks/use-keyboard-shortcuts"
import { useToast } from "@/hooks/use-toast"

const ClockWidget = dynamic(
  () => import("@/components/clock-widget").then(m => m.ClockWidget),
  { ssr: false }
)

const VaultUI = dynamic(
  () => import("@/skills/credential-vault/components/vault-ui").then(m => m.VaultUI),
  { ssr: false }
)

type TabId = "overview" | "revenue-command" | "lone-star" | "redfox" | "heroes" | "analytics" | "systems" | "vault" | "from-inception"

const TAB_TITLES: Record<TabId, string> = {
  overview: "Overview",
  "revenue-command": "Revenue Command",
  "lone-star": "Lone Star Lighting",
  redfox: "RedFox CRM",
  heroes: "Heroes of the Meta",
  analytics: "Analytics",
  systems: "Systems",
  vault: "Credential Vault",
  "from-inception": "From Inception",
}

const TABS: TabId[] = ["overview", "revenue-command", "lone-star", "redfox", "heroes", "analytics", "systems", "vault", "from-inception"]

// Only show the quote, heartbeat, and notifications on top-level dashboard tabs
const DASHBOARD_TABS: TabId[] = ["overview", "revenue-command", "analytics", "systems"]

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const { success, info, warning } = useToast()

  // Helper to switch tabs with toast feedback
  const switchTab = (tab: TabId) => {
    setActiveTab(tab)
  }

  // Keyboard shortcuts configuration
  const shortcuts: ShortcutConfig[] = [
    { key: "1", description: "Overview", action: () => switchTab("overview") },
    { key: "2", description: "Revenue Command", action: () => switchTab("revenue-command") },
    { key: "3", description: "Lone Star", action: () => switchTab("lone-star") },
    { key: "4", description: "RedFox", action: () => switchTab("redfox") },
    { key: "5", description: "Heroes", action: () => switchTab("heroes") },
    { key: "6", description: "Analytics", action: () => switchTab("analytics") },
    { key: "7", description: "Systems", action: () => switchTab("systems") },
    { key: "8", description: "Vault", action: () => switchTab("vault") },
    { key: "9", description: "From Inception", action: () => switchTab("from-inception") },
    { key: "?", description: "Toggle help", action: () => setShowShortcutsHelp(prev => !prev) },
    { key: "n", description: "New lead", action: () => success("New Lead", "Opening lead creation form...") },
    { key: "t", description: "New task", action: () => success("New Task", "Opening task creation dialog...") },
    { key: "e", description: "Check email", action: () => info("Checking Email", "Connecting to Outlook...") },
    { key: "r", description: "Refresh data", action: () => info("Refreshing", "Syncing latest data...") },
    { key: "ArrowRight", description: "Next tab", action: () => {
      const currentIndex = TABS.indexOf(activeTab)
      const nextIndex = (currentIndex + 1) % TABS.length
      switchTab(TABS[nextIndex])
    }},
    { key: "ArrowLeft", description: "Previous tab", action: () => {
      const currentIndex = TABS.indexOf(activeTab)
      const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length
      switchTab(TABS[prevIndex])
    }},
  ]

  // Register keyboard shortcuts
  useKeyboardShortcuts(shortcuts)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {/* Page Header with Notifications */}
          <div className="flex items-start justify-between mb-4 lg:mb-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">{TAB_TITLES[activeTab]}</h1>
              <p className="text-xs lg:text-sm text-gray-400 mt-1">Kal Mission Control</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              <ClockWidget />
              <ConnectionStatus onRefresh={() => info("Refreshing", "Syncing latest data...")} />
              <Link
                href="/skills"
                className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs text-gray-300 hover:text-white hover:border-white/30 transition-colors"
              >
                Skill Inventory
              </Link>
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <span>?</span>
              </button>
              {DASHBOARD_TABS.includes(activeTab) && <NotificationCenter />}
            </div>
          </div>

          {/* Daily Motivation Quote */}
          {DASHBOARD_TABS.includes(activeTab) && <DailyMotivationWidget />}

          {/* Heartbeat Section */}
          {DASHBOARD_TABS.includes(activeTab) && <HeartbeatSection />}

          {/* Tab Content */}
          {activeTab === "overview" && <OverviewTab onNavigate={(tab) => setActiveTab(tab as TabId)} />}
          {activeTab === "revenue-command" && <RevenueCommandTab />}
          {activeTab === "lone-star" && <LoneStarTab />}
          {activeTab === "redfox" && <RedFoxTab />}
          {activeTab === "heroes" && <HeroesTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "systems" && <SystemsTab />}
          {activeTab === "vault" && <VaultUI />}
          {activeTab === "from-inception" && <FromInceptionTab />}
        </div>
      </main>

      {/* Quick Actions Floating Button */}
      <QuickActions 
        onNewLead={() => console.log("New lead")}
        onCheckEmail={() => console.log("Check email")}
        onNewTask={() => console.log("New task")}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp 
        isOpen={showShortcutsHelp} 
        onClose={() => setShowShortcutsHelp(false)} 
      />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
