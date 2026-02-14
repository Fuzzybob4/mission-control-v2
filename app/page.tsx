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
            <NotificationCenter />
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
    </div>
  )
}
