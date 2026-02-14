"use client"

import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Lightbulb, 
  Code2, 
  Gamepad2,
  Bot, 
  BarChart3, 
  Settings,
} from "lucide-react"

type TabId = "overview" | "lone-star" | "redfox" | "heroes" | "agents" | "analytics" | "systems"

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "lone-star", label: "Lone Star Lighting", icon: Lightbulb },
  { id: "redfox", label: "RedFox CRM", icon: Code2 },
  { id: "heroes", label: "Heroes of the Meta", icon: Gamepad2 },
  { id: "agents", label: "Agent Network", icon: Bot },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "systems", label: "Systems", icon: Settings },
]

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 sm:w-72 lg:w-64 h-full glass border-r border-white/10 flex flex-col bg-background/95">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-lg font-bold text-white">Atlas</h1>
            <p className="text-xs text-gray-400">Mission Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3.5 sm:py-4 lg:py-3 rounded-lg text-sm sm:text-base lg:text-sm font-medium transition-all",
                  "min-h-[44px]",
                  isActive 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
                )}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Business Status */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-500 uppercase mb-3">Business Status</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm lg:text-xs">
            <span className="text-gray-400">Lone Star</span>
            <span className="text-emerald-400">$18K Pipeline</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm lg:text-xs">
            <span className="text-gray-400">RedFox</span>
            <span className="text-amber-400">In Dev</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm lg:text-xs">
            <span className="text-gray-400">Heroes</span>
            <span className="text-gray-500">On Hold</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
