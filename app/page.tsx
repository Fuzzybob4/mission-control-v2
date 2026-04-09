"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Sidebar } from "@/components/sidebar"
import { HeartbeatSection } from "@/components/heartbeat-section"
import { DailyMotivationWidget } from "@/components/daily-motivation-widget"
import { QuickActions } from "@/components/quick-actions"
import { NotificationCenter } from "@/components/notification-center"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { ConnectionStatus } from "@/components/connection-status"
import { ScrollToTop } from "@/components/scroll-to-top"
import { useKeyboardShortcuts, ShortcutConfig } from "@/hooks/use-keyboard-shortcuts"
import { useToast } from "@/hooks/use-toast"

const CommanderCard = dynamic(() => import("@/components/commander-card").then((m) => m.CommanderCard))
const ActiveMissions = dynamic(() => import("@/components/active-missions").then((m) => m.ActiveMissions))
const ShipTimeClock = dynamic(() => import("@/components/ship-time-clock").then((m) => m.ShipTimeClock), { ssr: false })
const ObsidianTycoonMap = dynamic(() => import("@/components/obsidian-tycoon-map").then((m) => m.ObsidianTycoonMap))
const ElevenLabsVoiceLab = dynamic(() => import("@/components/elevenlabs-voice-lab").then((m) => m.ElevenLabsVoiceLab))

const OverviewTab = dynamic(() => import("@/components/tabs/overview-tab").then((m) => m.OverviewTab))
const RevenueCommandTab = dynamic(() => import("@/components/tabs/revenue-command-tab").then((m) => m.RevenueCommandTab))
const LoneStarTab = dynamic(() => import("@/components/tabs/lone-star-tab").then((m) => m.LoneStarTab))
const RedFoxTab = dynamic(() => import("@/components/tabs/redfox-tab").then((m) => m.RedFoxTab))
const HeroesTab = dynamic(() => import("@/components/tabs/heroes-tab").then((m) => m.HeroesTab))
const AnalyticsTab = dynamic(() => import("@/components/tabs/analytics-tab").then((m) => m.AnalyticsTab))
const SystemsTab = dynamic(() => import("@/components/tabs/systems-tab").then((m) => m.SystemsTab))
const FromInceptionTab = dynamic(() => import("@/components/tabs/from-inception-tab").then((m) => m.FromInceptionTab))
const VaultUI = dynamic(() => import("@/skills/credential-vault/components/vault-ui").then((m) => m.VaultUI), { ssr: false })

const TAB_TITLES = {
  overview: "Overview",
  "revenue-command": "Revenue Command",
  "lone-star": "Lone Star Lighting",
  redfox: "RedFox CRM",
  heroes: "Heroes of the Meta",
  analytics: "Analytics",
  systems: "Systems",
  vault: "Credential Vault",
  "voice-lab": "Voice Lab",
  "from-inception": "From Inception",
} as const

type TabId = keyof typeof TAB_TITLES

const TABS: TabId[] = ["overview", "revenue-command", "lone-star", "redfox", "heroes", "analytics", "systems", "vault", "voice-lab", "from-inception"]
const DASHBOARD_TABS: TabId[] = ["overview", "revenue-command", "analytics", "systems"]

function TabSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
      <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
        ))}
      </div>
    </div>
  )
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const { success, info } = useToast()

  const switchTab = (tab: TabId) => {
    setActiveTab(tab)
  }

  const shortcuts: ShortcutConfig[] = [
    { key: "1", description: "Overview", action: () => switchTab("overview") },
    { key: "2", description: "Revenue Command", action: () => switchTab("revenue-command") },
    { key: "3", description: "Lone Star", action: () => switchTab("lone-star") },
    { key: "4", description: "RedFox", action: () => switchTab("redfox") },
    { key: "5", description: "Heroes", action: () => switchTab("heroes") },
    { key: "6", description: "Analytics", action: () => switchTab("analytics") },
    { key: "7", description: "Systems", action: () => switchTab("systems") },
    { key: "8", description: "Vault", action: () => switchTab("vault") },
    { key: "9", description: "Voice Lab", action: () => switchTab("voice-lab") },
    { key: "?", description: "Toggle help", action: () => setShowShortcutsHelp((prev) => !prev) },
    { key: "n", description: "New lead", action: () => success("New Lead", "Opening lead queue...") },
    { key: "t", description: "Open cron jobs", action: () => success("Task Console", "Opening cron jobs...") },
    { key: "e", description: "Check outreach", action: () => info("Checking Queue", "Opening outreach and email flow...") },
    { key: "r", description: "Refresh data", action: () => info("Refreshing", "Syncing latest data...") },
    {
      key: "ArrowRight",
      description: "Next tab",
      action: () => {
        const currentIndex = TABS.indexOf(activeTab)
        const nextIndex = (currentIndex + 1) % TABS.length
        switchTab(TABS[nextIndex])
      },
    },
    {
      key: "ArrowLeft",
      description: "Previous tab",
      action: () => {
        const currentIndex = TABS.indexOf(activeTab)
        const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length
        switchTab(TABS[prevIndex])
      },
    },
  ]

  useKeyboardShortcuts(shortcuts)

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onNavigate={(tab) => setActiveTab(tab as TabId)} />
      case "revenue-command":
        return <RevenueCommandTab />
      case "lone-star":
        return <LoneStarTab />
      case "redfox":
        return <RedFoxTab />
      case "heroes":
        return <HeroesTab />
      case "analytics":
        return <AnalyticsTab />
      case "systems":
        return <SystemsTab />
      case "vault":
        return <VaultUI />
      case "voice-lab":
        return <ElevenLabsVoiceLab />
      case "from-inception":
        return <FromInceptionTab />
      default:
        return <TabSkeleton />
    }
  }, [activeTab])

  return (
    <div className="flex h-screen overflow-hidden bg-background nebula-bg">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          <div className="mb-4 flex items-start justify-between lg:mb-6">
            <div>
              <h1
                className="text-xl font-bold uppercase tracking-wider lg:text-2xl"
                style={{ color: "#00e5ff", textShadow: "0 0 15px rgba(0,229,255,0.4)", fontFamily: "var(--font-orbitron), monospace" }}
              >
                {TAB_TITLES[activeTab]}
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest" style={{ color: "rgba(0,229,255,0.4)" }}>
                Kal Mission Control
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 lg:gap-3">
              <span className="status-online hidden lg:inline-flex">Status: Online</span>
              <ShipTimeClock />
              <ConnectionStatus onRefresh={() => info("Refreshing", "Syncing latest data...")} />
              <Link
                href="/skills"
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono tracking-wider transition-colors lg:inline-flex"
                style={{ border: "1px solid rgba(0,229,255,0.2)", color: "rgba(0,229,255,0.6)" }}
              >
                SKILL INV
              </Link>
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-mono transition-colors lg:flex"
                style={{
                  background: "rgba(0,229,255,0.05)",
                  border: "1px solid rgba(0,229,255,0.15)",
                  color: "rgba(0,229,255,0.5)",
                }}
                title="Keyboard shortcuts (?)"
              >
                <span>?</span>
              </button>
              {DASHBOARD_TABS.includes(activeTab) && <NotificationCenter />}
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <CommanderCard />
              <ObsidianTycoonMap
                onEnterDistrict={(tab) => {
                  if (tab === "agents") {
                    window.location.href = "/agents"
                    return
                  }
                  setActiveTab(tab as TabId)
                }}
              />
              <ActiveMissions />
            </>
          )}

          {DASHBOARD_TABS.includes(activeTab) && <DailyMotivationWidget />}
          {DASHBOARD_TABS.includes(activeTab) && <HeartbeatSection />}

          {tabContent}
        </div>
      </main>

      <QuickActions />
      <KeyboardShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
      <ScrollToTop />
    </div>
  )
}
