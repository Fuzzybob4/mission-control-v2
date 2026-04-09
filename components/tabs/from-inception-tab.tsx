"use client"

import { Monitor, Workflow, Bot, Layers, Rocket, Users } from "lucide-react"

const services = [
  {
    icon: Workflow,
    title: "CRM Systems",
    description: "Custom pipeline systems that keep leads, follow-up, quoting, and jobs moving without leaks.",
  },
  {
    icon: Bot,
    title: "Automation Builds",
    description: "Lead routing, reminders, follow-ups, dashboards, and operator workflows wired around how the business actually runs.",
  },
  {
    icon: Layers,
    title: "Brand Identity",
    description: "Logos, color systems, and visual language that set you apart from day one.",
  },
  {
    icon: Rocket,
    title: "Operational Rollout",
    description: "Deploy the system, train the team, and tighten reporting so the business feels the gain quickly.",
  },
  {
    icon: Users,
    title: "Ongoing Support",
    description: "Monthly retainers for updates, hosting management, and growth features.",
  },
  {
    icon: Monitor,
    title: "Dashboards & Portals",
    description: "Client portals and internal dashboards that turn business chaos into one command surface.",
  },
]

const projects = [
  { name: "From Inception — Positioning + offer system", status: "In Dev", url: "#", tech: "Next.js · Vercel" },
  { name: "Lone Star Lighting — outreach + ops pipeline", status: "Live", url: "#", tech: "Mission Control · Supabase" },
  { name: "RedFox CRM — field-service operating core", status: "In Dev", url: "#", tech: "Next.js · PostgreSQL" },
]

const statusColor: Record<string, string> = {
  Live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "In Dev": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "On Hold": "text-gray-400 bg-gray-400/10 border-gray-400/20",
}

export function FromInceptionTab() {
  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">From Inception</h2>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Custom CRM and business systems studio. We build the machines behind revenue, pipeline visibility, follow-up, and operator control, with websites serving the system instead of pretending to be the system.
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {["CRM Systems", "Automation", "Dashboards", "Branding", "Web Support"].map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3 hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Projects */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Projects</h3>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
          {projects.map(({ name, status, tech }) => (
            <div key={name} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tech}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor[status]}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
