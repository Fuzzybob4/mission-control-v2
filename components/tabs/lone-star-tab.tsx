"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Lightbulb, DollarSign, Users, Calendar, TrendingUp, MapPin } from "lucide-react"

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  status: string
  priority: string
  estimated_value?: number
  notes?: string
  follow_up_date?: string
}

export function LoneStarTab() {
  const [leads] = useState<Lead[]>([])

  // Mock data for demonstration - connect to Supabase to load real leads

  const pipeline = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)
  const activeLeads = leads.filter(l => ['new', 'contacted', 'quoted'].includes(l.status)).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Lone Star Lighting Displays</h2>
          <p className="text-xs text-gray-400">Holiday & event lighting installation</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status="active" label="Active" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-white">${pipeline.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{leads.length} leads</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">Active Leads</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeLeads}</p>
          <p className="text-xs text-gray-500">2,227 contacts</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">2024 Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">$20,021</p>
          <p className="text-xs text-gray-500">69 invoices</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Season</span>
          </div>
          <p className="text-2xl font-bold text-white">Off-Season</p>
          <p className="text-xs text-gray-500">Install: Nov-Jan</p>
        </GlassCard>
      </div>

      {/* Active Leads */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Active Leads</h3>
        {leads.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-sm text-gray-400">No active leads</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <GlassCard key={lead.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">{lead.name}</h4>
                      {lead.company && (
                        <span className="text-xs text-gray-400">({lead.company})</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && <span>{lead.phone}</span>}
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{lead.notes}</p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    {lead.estimated_value && (
                      <p className="text-lg font-bold text-emerald-400">
                        ${lead.estimated_value.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={lead.status as any} label={lead.status} />
                      <StatusBadge status={lead.priority as any} label={lead.priority} />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
