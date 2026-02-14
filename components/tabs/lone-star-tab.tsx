"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { TimeFilter } from "@/components/time-filter"
import { FileUploadWidget } from "@/components/file-upload-widget"
import { KPICard } from "@/components/kpi-card"
import { Lightbulb, DollarSign, Users, Calendar, TrendingUp, MapPin } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter" | "year">("month")

  // Sample sparkline data
  const revenueSparkline = [12000, 14500, 16200, 18900, 20100, 19800, 20021]
  const pipelineSparkline = [8000, 10500, 12000, 15000, 18000, 17500, 18000]

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('mc_leads')
        .select('*')
        .eq('business_unit', 'lone_star')
        .neq('status', 'spam')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pipeline = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)
  const activeLeads = leads.filter(l => ['new', 'contacted', 'quoted'].includes(l.status)).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Time Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Lone Star Lighting Displays</h2>
            <p className="text-xs text-gray-400">Holiday & event lighting installation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="active" label="Active" />
          <TimeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* File Upload */}
      <FileUploadWidget 
        businessUnit="lone-star" 
        onFilesUploaded={(files) => console.log("Lone Star files:", files)}
      />

      {/* KPI Stats with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KPICard
          title="Pipeline Value"
          value={`$${pipeline.toLocaleString()}`}
          change={`${leads.length} leads`}
          changeType="neutral"
          sparklineData={pipelineSparkline}
          icon={<DollarSign className="w-4 h-4 text-gray-400" />}
        />

        <KPICard
          title="Active Leads"
          value={activeLeads.toString()}
          change="2,227 contacts"
          changeType="neutral"
          icon={<Users className="w-4 h-4 text-gray-400" />}
        />

        <KPICard
          title="2024 Revenue"
          value="$20,021"
          change="69 invoices"
          changeType="neutral"
          sparklineData={revenueSparkline}
          icon={<TrendingUp className="w-4 h-4 text-gray-400" />}
        />

        <KPICard
          title="Season Status"
          value="Off-Season"
          change="Install: Nov-Jan"
          changeType="neutral"
          icon={<Calendar className="w-4 h-4 text-gray-400" />}
        />
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
