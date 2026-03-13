import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin"
import { importLatestColdOutreachMarkdown } from "@/lib/cold-outreach"

const querySchema = z.object({
  brand: z.enum(["from_inception", "lone_star_lighting"]).optional(),
  status: z.enum(["pending", "approved", "denied", "sent", "all"]).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const params = querySchema.parse({
      brand: req.nextUrl.searchParams.get("brand") || undefined,
      status: req.nextUrl.searchParams.get("status") || undefined,
    })

    const supabase = getSupabaseAdminClient()
    let query = supabase.from("mc_cold_outreach_queue").select("*").order("created_at", { ascending: false })

    if (params.brand) {
      query = query.eq("brand", params.brand)
    }

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to load cold outreach queue." }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient()
    const { items, latestFolder } = await importLatestColdOutreachMarkdown()

    if (!items.length) {
      return NextResponse.json({ data: [], imported: 0, latestFolder, message: "No importable outreach markdown found." })
    }

    const { data, error } = await supabase
      .from("mc_cold_outreach_queue")
      .upsert(items, { onConflict: "brand,business_name,source_file" })
      .select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data ?? [], imported: data?.length ?? 0, latestFolder })
  } catch (error) {
    console.error("[cold-outreach-import]", error)
    return NextResponse.json({ error: "Failed to import cold outreach items." }, { status: 500 })
  }
}
