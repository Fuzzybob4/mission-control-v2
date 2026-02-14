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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">{TAB_TITLES[activeTab]}</h1>
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
