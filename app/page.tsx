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
import { Menu, X } from "lucide-react"

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

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-11 h-11 flex items-center justify-center rounded-lg glass-strong text-white"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 sm:p-6 pt-16 lg:pt-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white text-balance">{TAB_TITLES[activeTab]}</h1>
            <p className="text-sm text-gray-400 mt-1">
              Atlas Command Center
            </p>
          </div>

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
    </div>
  )
}
