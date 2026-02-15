"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { OverviewTab } from "@/components/tabs/overview-tab"
import { LoneStarTab } from "@/components/tabs/lone-star-tab"
import { RedFoxTab } from "@/components/tabs/redfox-tab"
import { HeroesTab } from "@/components/tabs/heroes-tab"
import { AgentsTab } from "@/components/tabs/agents-tab"
import { AnalyticsTab } from "@/components/tabs/analytics-tab"
import { SystemsTab } from "@/components/tabs/systems-tab"
import { HeartbeatSection } from "@/components/heartbeat-section"
import { QuickActions } from "@/components/quick-actions"
import { NotificationCenter } from "@/components/notification-center"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { useKeyboardShortcuts, ShortcutConfig } from "@/hooks/use-keyboard-shortcuts"

type TabId = "overview" | "lone-star" | "redfox" | "heroes" | "agents" | "analytics" | "systems"

const TAB_TITLES: Record<TabId, string> = {
  overview: "Overview",
  "lone-star": "Lone Star Lighting",
  redfox: "RedFox CRM",
  heroes: "Heroes of the Meta",
  agents: "Agent Network",
  analytics: "Analytics",
  systems: "Systems",
}

const TABS: TabId[] = ["overview", "lone-star", "redfox", "heroes", "agents", "analytics", "systems"]

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)

  // Keyboard shortcuts configuration
  const shortcuts: ShortcutConfig[] = [
    { key: "1", description: "Overview", action: () => setActiveTab("overview") },
    { key: "2", description: "Lone Star", action: () => setActiveTab("lone-star") },
    { key: "3", description: "RedFox", action: () => setActiveTab("redfox") },
    { key: "4", description: "Heroes", action: () => setActiveTab("heroes") },
    { key: "5", description: "Agents", action: () => setActiveTab("agents") },
    { key: "6", description: "Analytics", action: () => setActiveTab("analytics") },
    { key: "7", description: "Systems", action: () => setActiveTab("systems") },
    { key: "?", description: "Toggle help", action: () => setShowShortcutsHelp(prev => !prev) },
    { key: "n", description: "New lead", action: () => console.log("New lead shortcut") },
    { key: "t", description: "New task", action: () => console.log("New task shortcut") },
    { key: "e", description: "Check email", action: () => console.log("Check email shortcut") },
    { key: "ArrowRight", description: "Next tab", action: () => {
      const currentIndex = TABS.indexOf(activeTab)
      const nextIndex = (currentIndex + 1) % TABS.length
      setActiveTab(TABS[nextIndex])
    }},
    { key: "ArrowLeft", description: "Previous tab", action: () => {
      const currentIndex = TABS.indexOf(activeTab)
      const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length
      setActiveTab(TABS[prevIndex])
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
              <p className="text-xs lg:text-sm text-gray-400 mt-1">
                Atlas Command Center
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <span>?</span>
              </button>
              <NotificationCenter />
            </div>
          </div>

          {/* Heartbeat Section */}
          <HeartbeatSection />

          {/* Tab Content */}
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "lone-star" && <LoneStarTab />}
          {activeTab === "redfox" && <RedFoxTab />}
          {activeTab === "heroes" && <HeroesTab />}
          {activeTab === "agents" && <AgentsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "systems" && <SystemsTab />}
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
    </div>
  )
}
