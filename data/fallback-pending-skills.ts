export type PendingSkillRecord = {
  id: string
  code: string
  name: string
  purpose: string
  triggers: string[]
  why: string
  status: "pending" | "approved" | "denied"
  impact: "high" | "medium" | "low"
  effort: "high" | "medium" | "low"
  requestedBy: string
  stack?: string[]
  createdAt: string
}

export const fallbackPendingSkills: PendingSkillRecord[] = [
  {
    id: "skill-mission-control-vault",
    code: "mission-control-vault",
    name: "Mission Control Vault",
    purpose: "Securely query and manage API keys from the Supabase vault",
    triggers: [
      "Retrieve a specific API credential",
      "List everything stored in the vault",
      "Add/update API secrets without leaving Mission Control"
    ],
    why: "RLS currently blocks direct vault reads. This grants encrypted, audited access for Kal.",
    status: "pending",
    impact: "high",
    effort: "medium",
    requestedBy: "Kal",
    stack: ["Supabase", "Next.js", "Telegram"],
    createdAt: "2026-03-04T15:00:00-06:00",
  },
  {
    id: "skill-vercel-dashboard",
    code: "vercel-dashboard",
    name: "Vercel Dashboard",
    purpose: "Manage Vercel deployments and environment variables",
    triggers: [
      "Check deployment status",
      "Push env var changes",
      "Trigger redeploys directly from Mission Control"
    ],
    why: "No visibility into Vercel from within OpenClaw. This unblocks release and infra work.",
    status: "pending",
    impact: "high",
    effort: "low",
    requestedBy: "Kal",
    stack: ["Vercel API", "Next.js"],
    createdAt: "2026-03-04T15:05:00-06:00",
  },
  {
    id: "skill-session-archivist",
    code: "session-archivist",
    name: "Session Archivist",
    purpose: "Automate session cleanup with smart archiving",
    triggers: [
      "Weekly session cleanups",
      "Extract key decisions before deletion",
      "Update MEMORY.md automatically"
    ],
    why: "Manual cleanup is error prone and time consuming. Automation keeps the workspace lean.",
    status: "pending",
    impact: "medium",
    effort: "medium",
    requestedBy: "Kal",
    stack: ["Node.js", "Supabase Storage"],
    createdAt: "2026-03-04T15:10:00-06:00",
  },
  {
    id: "skill-supabase-admin",
    code: "supabase-admin",
    name: "Supabase Admin",
    purpose: "Direct Supabase management with service role access",
    triggers: [
      "Query tables with RLS",
      "Run migrations and schema diff",
      "Monitor API costs"
    ],
    why: "Needed so Kal can act as database admin without waiting on human intervention.",
    status: "pending",
    impact: "high",
    effort: "low",
    requestedBy: "Kal",
    stack: ["Supabase", "CLI"],
    createdAt: "2026-03-04T15:15:00-06:00",
  },
  {
    id: "skill-github-connected",
    code: "github-connected",
    name: "GitHub Connected",
    purpose: "Full GitHub CLI integration with PAT handling",
    triggers: [
      "Check repo status",
      "Push PRs",
      "Review open issues without leaving Mission Control"
    ],
    why: "`gh` is installed but unauthenticated. This unlocks repo and CI automation.",
    status: "pending",
    impact: "medium",
    effort: "low",
    requestedBy: "Kal",
    stack: ["GitHub API", "gh CLI"],
    createdAt: "2026-03-04T15:20:00-06:00",
  },
  {
    id: "skill-kal-ops",
    code: "kal-ops",
    name: "Kal Ops Orchestrator",
    purpose: "Master skill that coordinates all Mission Control operations",
    triggers: [
      "Deploy new feature to Mission Control",
      "Rotate GitHub + Supabase tokens",
      "Aggregate system health across infrastructure"
    ],
    why: "Provides orchestration layer that unifies Vault, Vercel, Supabase, GitHub into one play.",
    status: "pending",
    impact: "high",
    effort: "high",
    requestedBy: "Kal",
    stack: ["Supabase", "Vercel", "GitHub"],
    createdAt: "2026-03-04T15:30:00-06:00",
  }
]
