import Link from "next/link"
import { ArrowLeft, ExternalLink, Sparkles, ShieldCheck, Command } from "lucide-react"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card"

const skills = [
  {
    name: "Email Lead Triage",
    slug: "email-lead-triage",
    category: "Operations",
    type: "Custom",
    description: "Automates the heartbeat-driven inbox sweep: refresh the IMAP queue, summarize pending leads, draft replies, and choose the right send path (SendGrid → Gmail → manual).",
    location: "skills/email-lead-triage/SKILL.md",
    highlights: [
      "Runs scripts/email-monitor-robust.sh before every summary",
      "Drafts replies into memory/email-queue/{lead}_reply.md",
      "Tracks SLA + status updates back to Christian"
    ],
    commands: [
      "./scripts/email-monitor-robust.sh",
      "memory/email-queue/lead*.json",
      "SendGrid or Gmail delivery"
    ],
    status: "Active",
    stack: "Workspace"
  },
  {
    name: "HubSpot CRM",
    slug: "hubspot",
    category: "Revenue",
    type: "Marketplace",
    description: "Full HubSpot CRM/CMS access via REST (contacts, companies, deals, owners, files). Perfect for syncing lead intel back into the CRM.",
    location: "skills/hubspot/SKILL.md",
    highlights: [
      "Create/search/update contacts, companies, and deals",
      "Supports associations + timeline events",
      "Requires HUBSPOT_ACCESS_TOKEN"
    ],
    commands: [
      "curl https://api.hubapi.com/crm/v3/objects/contacts",
      "curl .../deals?limit=10",
      "curl .../files"
    ],
    status: "Ready",
    stack: "HubSpot API"
  },
  {
    name: "Firecrawl",
    slug: "firecrawl",
    category: "Research",
    type: "Marketplace",
    description: "Official Firecrawl CLI skill for search, scrape, crawl, and browser automation with clean markdown output for LLM workflows.",
    location: "~/.openclaw/workspace/.agents/skills/firecrawl/SKILL.md",
    highlights: [
      "search/scrape/map/crawl/browser commands",
      "Handles JS-heavy + authenticated flows",
      "Writes artifacts to .firecrawl/ and reuses cache"
    ],
    commands: [
      "firecrawl search \"from inception web design\" --scrape",
      "firecrawl scrape https://example.com --only-main-content",
      "firecrawl map https://docs.example.com --search auth"
    ],
    status: "Active",
    stack: "Firecrawl API"
  },
  {
    name: "QMD Local Search",
    slug: "qmd",
    category: "Knowledge",
    type: "Marketplace",
    description: "Local doc indexing + BM25/vector search so I can instantly fetch prior work, SOPs, or transcripts without re-reading entire folders.",
    location: "skills/qmd/SKILL.md",
    highlights: [
      "Create/update local search collections",
      "Hybrid BM25 + vector querying",
      "Supports MCP mode when needed"
    ],
    commands: [
      "qmd collection add ./docs --name ops",
      "qmd update",
      "qmd query \"lead follow-up\""
    ],
    status: "Ready",
    stack: "Local"
  },
  {
    name: "Twitter / X Ops",
    slug: "twitter-openclaw",
    category: "Growth",
    type: "Marketplace",
    description: "twclaw-powered X automation for posting, replying, searches, and engagement on @from_inception.",
    location: "skills/x-twitter/SKILL.md",
    highlights: [
      "Timeline/mention search + thread pulls",
      "Post, reply, retweet (with confirmation)",
      "List + follower management"
    ],
    commands: [
      "twclaw mentions -n 10",
      "twclaw tweet \"Value post...\"",
      "twclaw search \"need a website\" --recent"
    ],
    status: "Ready",
    stack: "Twitter API"
  }
]

export default function SkillsPage() {
  const totalSkills = skills.length
  const categories = new Set(skills.map(skill => skill.category)).size
  const customSkills = skills.filter(skill => skill.type === "Custom").length

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mission Control
        </Link>

        <section className="glass-strong rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Skill Stack</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-white mt-2">Kal's Installed Skills</h1>
              <p className="text-gray-400 mt-3 text-sm md:text-base">
                Everything the agent can do right now—CLI integrations, custom workflows, and research stacks. New skills drop here as soon as they’re installed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center min-w-[240px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold">{totalSkills}</p>
                <p className="text-xs uppercase tracking-widest text-gray-400">Total Skills</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold">{categories}</p>
                <p className="text-xs uppercase tracking-widest text-gray-400">Categories</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 col-span-2">
                <p className="text-2xl font-semibold">{customSkills}</p>
                <p className="text-xs uppercase tracking-widest text-gray-400">Custom Workflows</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <div className="inline-flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Authenticated to Supabase, HubSpot, SendGrid, Firecrawl
            </div>
            <div className="inline-flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <div className="inline-flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Command className="w-3.5 h-3.5 text-purple-300" />
              Use via Claude Code, Codex, OpenClaw
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Skill inventory</h2>
            <p className="text-sm text-gray-400">Every skill is production-ready—click into the SKILL.md entries in-repo for full instructions.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => (
              <GlassCard key={skill.slug} className="flex flex-col">
                <GlassCardHeader className="flex items-center justify-between">
                  <div>
                    <GlassCardTitle>{skill.name}</GlassCardTitle>
                    <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-widest text-blue-300">{skill.category}</span>
                    <div className="text-[11px] text-gray-400">{skill.type}</div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="flex-1 flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Highlights</p>
                    <ul className="space-y-1 text-sm text-gray-300 list-disc list-inside">
                      {skill.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Go-to commands</p>
                    <div className="space-y-1">
                      {skill.commands.map((cmd) => (
                        <code key={cmd} className="block text-xs bg-black/30 border border-white/10 rounded-md px-2 py-1 text-gray-200">
                          {cmd}
                        </code>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                    <span>{skill.status} • {skill.stack}</span>
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {skill.location}
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
