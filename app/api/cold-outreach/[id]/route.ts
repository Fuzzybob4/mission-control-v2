import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin"

const bodySchema = z.object({
  business_name: z.string().min(1).optional(),
  contact_name: z.string().min(1).nullable().optional().or(z.literal("")),
  contact_email: z.string().email().nullable().optional().or(z.literal("")),
  website: z.string().url().nullable().optional().or(z.literal("")),
  draft_subject: z.string().min(1).optional(),
  draft_body: z.string().min(1).optional(),
  brand: z.enum(["from_inception", "lone_star_lighting"]).optional(),
  status: z.enum(["pending", "approved", "denied", "sent"]).optional(),
  company_type: z.string().min(1).nullable().optional().or(z.literal("")),
  territory: z.string().min(1).nullable().optional().or(z.literal("")),
  lead_class: z.enum(["direct_buyer", "channel_partner", "vendor", "competitor"]).optional(),
  notes: z.string().nullable().optional(),
})

function normalizeEmpty(value?: string | null) {
  if (value === undefined) return undefined
  if (value === "") return null
  return value
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const payload = bodySchema.parse(await req.json())

    const update = {
      ...payload,
      contact_name: normalizeEmpty(payload.contact_name as string | null | undefined),
      contact_email: normalizeEmpty(payload.contact_email as string | null | undefined),
      website: normalizeEmpty(payload.website as string | null | undefined),
      company_type: normalizeEmpty(payload.company_type as string | null | undefined),
      territory: normalizeEmpty(payload.territory as string | null | undefined),
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("mc_cold_outreach_queue")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    console.error("[cold-outreach-patch]", error)
    return NextResponse.json({ error: "Failed to update cold outreach item." }, { status: 500 })
  }
}
