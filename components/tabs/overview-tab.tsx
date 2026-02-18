"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { KPICard } from "@/components/kpi-card"
import { TimeFilter } from "@/components/time-filter"
import { FileUploadWidget } from "@/components/file-upload-widget"
import { RecentActivity } from "@/components/recent-activity"
import { Lightbulb, Code2, Gamepad2, TrendingUp, Activity, Zap, AlertCircle } from "lucide-react"
import { DailyMotivationWidget } from "@/components/daily-motivation-widget"

export function OverviewTab() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter" | "year">("month")

  // Sample sparkline data
  const revenueSparkline = [15000, 16500, 14200, 18900, 20100, 19800, 20021]
  const pipelineSparkline = [12000, 13500, 15000, 16500, 18000, 17500, 18000]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Time Filter */}
      <div className="flex justify-end">
        <TimeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Daily Motivation Quote */}
      <DailyMotivationWidget />

      {/* File Upload for Assets */}
      <FileUploadWidget 
        businessUnit="lone-star" 
        onFilesUploaded={(files) => console.log("Uploaded:", files)}
      />
      {/* KPI Stats with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KPICard
          title="Total Revenue"
          value="$20,021"
          change="+12% from last month"
          changeType="positive"
          sparklineData={revenueSparkline}
          icon={<TrendingUp className="w-4 h-4 text-gray-400" />}
        />

        <KPICard
          title="Active Businesses"
          value="1"
          change="2 in development"
          changeType="neutral"
          icon={<Activity className="w-4 h-4 text-gray-400" />}
        />

        <KPICard
          title="Pipeline Value"
          value="$18,000"
          change="+8% this week"
          changeType="positive"
          sparklineData={pipelineSparkline}
          icon={<Zap className="w-4 h-4 text-gray-400" />}
        />

        <KPICard
          title="Goal Progress"
          value="33%"
          change="To $60K/mo target"
          changeType="neutral"
          icon={<TrendingUp className="w-4 h-4 text-gray-400" />}
        />
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Lone Star Lighting</h3>
              <p className="text-xs text-gray-400 mt-1">Holiday lighting - main revenue</p>
              <div className="mt-3">
                <StatusBadge status="active" label="Active" />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Code2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">RedFox CRM</h3>
              <p className="text-xs text-gray-400 mt-1">SaaS for light installers</p>
              <div className="mt-3">
                <StatusBadge status="in-progress" label="In Dev" />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Gamepad2 className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Heroes of the Meta</h3>
              <p className="text-xs text-gray-400 mt-1">Trading cards marketplace</p>
              <div className="mt-3">
                <StatusBadge status="paused" label="On Hold" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity & Urgent Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity Feed */}
        <RecentActivity maxItems={5} />

        {/* Urgent Actions */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Urgent Actions
          </h3>
          <div className="space-y-2">
            <GlassCard className="p-3 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Alora Hess Follow-up</p>
                  <p className="text-xs text-gray-400">Due: Feb 20, 2026</p>
                </div>
                <span className="text-sm font-semibold text-emerald-400">$17K-$19K</span>
              </div>
            </GlassCard>
            
            <GlassCard className="p-3 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Review RedFox CRM PR</p>
                  <p className="text-xs text-gray-400">New features ready for review</p>
                </div>
                <span className="text-xs text-blue-400">Dev</span>
              </div>
            </GlassCard>
            
            <GlassCard className="p-3 border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Inventory Update</p>
                  <p className="text-xs text-gray-400">Heroes of the Meta - 12 new cards</p>
                </div>
                <span className="text-xs text-violet-400">Side</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
