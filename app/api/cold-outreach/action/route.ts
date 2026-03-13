import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin"

const actionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "deny"]),
})

export async function POST(req: NextRequest) {
  try {
    const payload = actionSchema.parse(await req.json())
    const now = new Date().toISOString()

    const status = payload.action === "approve" ? "approved" : "denied"
    const update = payload.action === "approve"
      ? {
          status,
          approved_at: now,
          denied_at: null,
          send_status: "stubbed",
          send_error: "Email send not wired in V1. Item approved and queued for manual delivery.",
        }
      : {
          status,
          denied_at: now,
          approved_at: null,
        }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("mc_cold_outreach_queue")
      .update(update)
      .eq("id", payload.id)
      .eq("status", "pending")
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

    console.error("[cold-outreach-action]", error)
    return NextResponse.json({ error: "Failed to process cold outreach action." }, { status: 500 })
  }
}
