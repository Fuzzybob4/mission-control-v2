declare module "node-telegram-bot-api"

export type CronJobRecord = {
  id: string
  name: string
  description?: string | null
  schedule: string
  timezone: string | null
  target: string | null
  enabled: boolean
  created_at?: string | null
  updated_at?: string | null
}

export type CronRunRecord = {
  id: string
  job_id: string
  started_at: string | null
  finished_at: string | null
  status: "ok" | "error" | string
  duration_ms: number | null
  error: string | null
}

export type AgentStatusRecord = {
  id?: string
  gateway_online: boolean
  last_checked: string | null
  last_success: string | null
  failure_streak: number | null
  last_error: string | null
}

export type PendingSkillRecord = {
  id: string
  name: string
  description: string | null
  category: string | null
  install_command: string | null
  status: "pending" | "approved" | "denied" | string
  requested_by: string | null
  created_at: string | null
  decision_at: string | null
}

export type PendingSkillAction = "approve" | "deny"

export type ColdOutreachRecord = {
  id: string
  business_name: string
  contact_email: string | null
  website: string | null
  draft_subject: string
  draft_body: string
  brand: "from_inception" | "lone_star_lighting"
  sender_email: string
  status: "pending" | "approved" | "denied" | "sent" | string
  source_file: string | null
  source_generated_at: string | null
  notes: string | null
  approved_at: string | null
  denied_at: string | null
  sent_at: string | null
  send_status: "not_sent" | "ready" | "stubbed" | "sent" | "failed" | string
  send_error: string | null
  created_at: string | null
  updated_at: string | null
}
