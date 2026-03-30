export type ColdOutreachBrand = "from_inception" | "lone_star_lighting"
export type ColdOutreachStatus = "pending" | "approved" | "denied" | "sent"

export type LeadClass = "direct_buyer" | "channel_partner" | "vendor" | "competitor"

export type ColdOutreachRecord = {
  id: string
  business_name: string
  contact_name: string | null
  contact_email: string | null
  website: string | null
  draft_subject: string
  draft_body: string
  brand: ColdOutreachBrand
  sender_email: string
  status: ColdOutreachStatus
  source_file: string | null
  source_generated_at: string | null
  source_kind: "ruby_research" | "manual" | "imported" | "api"
  company_type: string | null
  territory: string | null
  lead_class: LeadClass
  notes: string | null
  approved_at: string | null
  denied_at: string | null
  archived_at: string | null
  sent_at: string | null
  send_status: "not_sent" | "ready" | "stubbed" | "sent" | "failed"
  send_error: string | null
  created_at: string | null
  updated_at: string | null
}

export const BRAND_CONFIG: Record<ColdOutreachBrand, { label: string; senderEmail: string; outreachFilePrefix: string; prospectsFilePrefix: string }> = {
  from_inception: {
    label: "From Inception",
    senderEmail: "frominception.co@gmail.com",
    outreachFilePrefix: "from-inception-outreach",
    prospectsFilePrefix: "from-inception-prospects",
  },
  lone_star_lighting: {
    label: "Lone Star Lighting",
    senderEmail: "Lonestarlightingdisplays@outlook.com",
    outreachFilePrefix: "lone-star-lighting-outreach",
    prospectsFilePrefix: "lone-star-lighting-prospects",
  },
}
