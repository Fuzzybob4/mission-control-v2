import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin"

const actionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "deny"]),
})

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { id, action } = actionSchema.parse(payload)

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("mc_pending_skills")
      .update({
        status: action === "approve" ? "approved" : "denied",
        decision_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select()
      .single()

    if (error) {
      console.error("[pending-skills-action]", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "Pending skill not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 })
    }
    console.error("[pending-skills-action]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
