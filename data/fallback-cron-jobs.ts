export type CronJobRecord = {
  id: string
  name: string
  description: string
  schedule: string
  timezone: string
  command: string
  owner: string
  businessUnit: "lone-star" | "redfox" | "heroes" | "shared" | "from-inception"
  window?: string
  status: "healthy" | "warning" | "error"
  lastRunAt?: string
  lastOutcome?: "success" | "failed"
  slaMinutes?: number
}

export const fallbackCronJobs: CronJobRecord[] = [
  {
    id: "cron-email-monitor",
    name: "Email Lead Triage Sweep",
    description: "Refresh IMAP queue and summarize pending leads during business hours.",
    schedule: "*/20 7-21 * * *",
    timezone: "America/Chicago",
    command: "scripts/email-monitor-robust.sh",
    owner: "Atlas",
    businessUnit: "shared",
    window: "Every 20 minutes, 7 AM – 9 PM",
    status: "healthy",
    lastRunAt: "2026-03-09T07:40:00-06:00",
    lastOutcome: "success",
    slaMinutes: 20,
  },
  {
    id: "cron-morning-leadgen",
    name: "Morning Lead Generation Pulse",
    description: "Kick off the weekday morning routine with research + outbound prompts.",
    schedule: "0 9 * * 1-5",
    timezone: "America/Chicago",
    command: "echo '=== MORNING ROUTINE ==='",
    owner: "Vera",
    businessUnit: "lone-star",
    window: "Weekdays at 9:00 AM",
    status: "healthy",
    lastRunAt: "2026-03-07T09:00:00-06:00",
    lastOutcome: "success",
    slaMinutes: 60,
  },
  {
    id: "cron-daily-report",
    name: "Daily Business Report",
    description: "Compile KPIs, pipeline, and ops notes for the daily closeout.",
    schedule: "0 17 * * *",
    timezone: "America/Chicago",
    command: "scripts/daily-report.sh",
    owner: "Atlas",
    businessUnit: "shared",
    window: "Daily at 5:00 PM",
    status: "warning",
    lastRunAt: "2026-03-08T17:00:00-06:00",
    lastOutcome: "failed",
    slaMinutes: 60,
  },
  {
    id: "cron-social-reminder",
    name: "Social Media Reminder",
    description: "Ping Christian for the daily social proof or value drop.",
    schedule: "0 13 * * 1-5",
    timezone: "America/Chicago",
    command: "echo '=== SOCIAL POST REMINDER ==='",
    owner: "Sierra",
    businessUnit: "from-inception",
    window: "Weekdays at 1:00 PM",
    status: "healthy",
    lastRunAt: "2026-03-08T13:00:00-06:00",
    lastOutcome: "success",
    slaMinutes: 90,
  },
  {
    id: "cron-lead-tracker",
    name: "Lead Tracker Digest",
    description: "Pull lead tracker stats and share delta vs yesterday.",
    schedule: "0 18 * * 1-5",
    timezone: "America/Chicago",
    command: "scripts/track-leads.sh status",
    owner: "Ruby",
    businessUnit: "lone-star",
    window: "Weekdays at 6:00 PM",
    status: "healthy",
    lastRunAt: "2026-03-08T18:00:00-06:00",
    lastOutcome: "success",
    slaMinutes: 60,
  },
]
