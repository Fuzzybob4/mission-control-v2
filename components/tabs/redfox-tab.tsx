"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { FileUploadWidget } from "@/components/file-upload-widget"
import { TimeFilter } from "@/components/time-filter"
import { Code2, DollarSign, Users, Rocket, CheckCircle, AlertCircle } from "lucide-react"

export function RedFoxTab() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter" | "year">("month")

  const pricingTiers = [
    { name: "Starter", price: "$29/mo", contacts: "1,000", features: ["Basic pipeline", "Email integration", "Standard support"] },
    { name: "Professional", price: "$79/mo", contacts: "10,000", features: ["Advanced pipeline", "Calendar sync", "Priority support", "Custom workflows"], popular: true },
    { name: "Enterprise", price: "$199/mo", contacts: "Unlimited", features: ["White-label", "Custom integrations", "Dedicated support", "On-premise option"] },
  ]

  const roadmap = [
    { phase: "Phase 1", status: "complete", title: "Infrastructure", items: ["Database schema", "Multi-tenant architecture", "API endpoints"] },
    { phase: "Phase 2", status: "in-progress", title: "Core CRM", items: ["Lead management", "Customer lifecycle", "Work orders"] },
    { phase: "Phase 3", status: "pending", title: "Automation", items: ["Email sequences", "SMS notifications", "Route optimization"] },
    { phase: "Phase 4", status: "pending", title: "Market Launch", items: ["Beta testing", "Onboarding flow", "Billing integration"] },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Time Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Code2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">RedFox CRM</h2>
            <p className="text-xs text-gray-400">SaaS for Christmas light installers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="in-progress" label="In Development" />
          <TimeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* File Upload */}
      <FileUploadWidget 
        businessUnit="redfox" 
        onFilesUploaded={(files) => console.log("RedFox files:", files)}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Target MRR</span>
          </div>
          <p className="text-2xl font-bold text-white">$10K</p>
          <p className="text-xs text-gray-500">First 100 customers</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">Beta</span>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-xs text-gray-500">Target: 3-5</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">Current</span>
          </div>
          <p className="text-2xl font-bold text-white">1</p>
          <p className="text-xs text-gray-500">Lone Star</p>
        </GlassCard>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingTiers.map((tier) => (
            <GlassCard key={tier.name} className={tier.popular ? "border-blue-500/30" : ""}>
              {tier.popular && (
                <div className="text-xs text-blue-400 font-medium mb-2">Most Popular</div>
              )}
              <h4 className="text-lg font-bold text-white">{tier.name}</h4>
              <p className="text-2xl font-bold text-blue-400 mt-1">{tier.price}</p>
              <p className="text-xs text-gray-400 mt-1">{tier.contacts} contacts</p>
              
              <ul className="mt-3 space-y-1.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-blue-400" />
          Roadmap
        </h3>
        <div className="space-y-3">
          {roadmap.map((phase, idx) => (
            <GlassCard key={phase.phase} className="p-0 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${phase.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' : 
                      phase.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-gray-700 text-gray-400'}
                  `}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{phase.title}</h4>
                    <p className="text-xs text-gray-400">{phase.phase}</p>
                  </div>
                  <StatusBadge 
                    status={phase.status === 'complete' ? 'completed' : phase.status === 'in-progress' ? 'in-progress' : 'queued'} 
                    label={phase.status}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
