"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { SkillRegistry } from "@/components/skill-registry"
import { AgentNetwork } from "@/components/agents"
import { supabase } from "@/lib/supabase"
import { Bot, Wrench, Network } from "lucide-react"

interface Agent {
  id: string
  slug: string
  name: string
  role: string
  tier: number
  status: string
  business_unit: string | null
}

const STATIC_AGENTS: Agent[] = [
  { id: '1', slug: 'atlas',    name: 'Atlas',    role: 'Executive Coordinator', tier: 1, status: 'active', business_unit: null },
  { id: '2', slug: 'vera',     name: 'Vera',     role: 'Lone Star Lead',        tier: 2, status: 'active', business_unit: 'lone-star' },
  { id: '3', slug: 'iris',     name: 'Iris',     role: 'RedFox Lead',           tier: 2, status: 'active', business_unit: 'redfox' },
  { id: '4', slug: 'scarlett', name: 'Scarlett', role: 'Heroes Lead',           tier: 2, status: 'active', business_unit: 'heroes' },
  { id: '5', slug: 'ruby',     name: 'Ruby',     role: 'Sales Specialist',      tier: 3, status: 'idle',   business_unit: null },
  { id: '6', slug: 'sierra',   name: 'Sierra',   role: 'Marketing Specialist',  tier: 3, status: 'idle',   business_unit: null },
  { id: '7', slug: 'scout',    name: 'Scout',    role: 'Research Specialist',   tier: 3, status: 'idle',   business_unit: null },
  { id: '8', slug: 'maverick', name: 'Maverick', role: 'DevOps Specialist',     tier: 3, status: 'idle',   business_unit: null },
  { id: '9', slug: 'barnes',   name: 'Barnes',   role: 'Documentation Agent',   tier: 4, status: 'idle',   business_unit: null },
  { id: '10', slug: 'pax',     name: 'Pax',      role: 'Communications Agent',  tier: 4, status: 'idle',   business_unit: null },
  { id: '11', slug: 'otis',    name: 'Otis',     role: 'Data Agent',            tier: 4, status: 'idle',   business_unit: null },
  { id: '12', slug: 'otto',    name: 'Otto',     role: 'Quality Agent',         tier: 4, status: 'idle',   business_unit: null },
]

type AgentsView = "network" | "map" | "skills"

export function AgentsTab() {
  const [activeView, setActiveView] = useState<AgentsView>("network")
  const [agents, setAgents] = useState<Agent[]>(STATIC_AGENTS)

  useEffect(() => {
    supabase
      .from("agents")
      .select("*")
      .order("tier")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setAgents(data as Agent[])
      })
  }, [])

  const tier1 = agents.filter(a => a.tier === 1)
  const tier2 = agents.filter(a => a.tier === 2)
  const tier3 = agents.filter(a => a.tier === 3)
  const tier4 = agents.filter(a => a.tier === 4)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Agent Network</h2>
            <p className="text-xs text-gray-400">{agents.length} agents · Live visualization</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/5 rounded-lg p-1">
          {([
            { id: "network", icon: Bot,     label: "Agents"   },
            { id: "map",     icon: Network, label: "Live Map" },
            { id: "skills",  icon: Wrench,  label: "Skills"   },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeView === id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "skills" ? (
        <SkillRegistry />
      ) : activeView === "map" ? (
        <AgentNetwork />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <GlassCard>
              <p className="text-2xl font-bold text-white">{agents.length}</p>
              <p className="text-xs text-gray-500">Total Agents</p>
            </GlassCard>
            <GlassCard>
              <p className="text-2xl font-bold text-emerald-400">
                {agents.filter(a => a.status === 'active').length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </GlassCard>
            <GlassCard>
              <p className="text-2xl font-bold text-amber-400">
                {agents.filter(a => a.status === 'busy').length}
              </p>
              <p className="text-xs text-gray-500">Busy</p>
            </GlassCard>
            <GlassCard>
              <p className="text-2xl font-bold text-blue-400">
                {agents.filter(a => a.status === 'idle').length}
              </p>
              <p className="text-xs text-gray-500">Idle</p>
            </GlassCard>
          </div>

          {/* Tier 1 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Tier 1 — Executive</h3>
            <div className="space-y-2">
              {tier1.map(agent => (
                <GlassCard key={agent.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
                      <p className="text-xs text-gray-400">{agent.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status as any} label={agent.status} />
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Tier 2 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Tier 2 — Business Leads</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {tier2.map(agent => (
                <GlassCard key={agent.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
                    <StatusBadge status={agent.status as any} label={agent.status} />
                  </div>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Tier 3 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Tier 3 — Specialists</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tier3.map(agent => (
                <GlassCard key={agent.id} className="p-3">
                  <h4 className="text-sm font-medium text-white">{agent.name}</h4>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                  <StatusBadge status={agent.status as any} label={agent.status} className="mt-2" />
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Tier 4 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Tier 4 — Workers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tier4.map(agent => (
                <GlassCard key={agent.id} className="p-3">
                  <h4 className="text-sm font-medium text-white">{agent.name}</h4>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                  <StatusBadge status={agent.status as any} label={agent.status} className="mt-2" />
                </GlassCard>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
