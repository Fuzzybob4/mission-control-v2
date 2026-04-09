import { NextResponse } from "next/server"

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin"

const SQUARE_VERSION = "2025-09-24"
const LOCATION_ID = "9MV8Y3QW75WA1"

function dollars(amount?: number) {
  return (amount || 0) / 100
}

async function getSquareSummary() {
  const token = process.env.SQUARE_ACCESS_TOKEN

  if (!token) {
    return {
      totalInvoices: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      paidCount: 0,
      unpaidCount: 0,
      overdueCount: 0,
    }
  }

  const res = await fetch(`https://connect.squareup.com/v2/invoices?location_id=${LOCATION_ID}&limit=50`, {
    headers: {
      "Square-Version": SQUARE_VERSION,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  const payload = await res.json()

  if (!res.ok) {
    throw new Error(payload?.errors?.[0]?.detail || "Failed to load Square invoices")
  }

  const invoices = Array.isArray(payload.invoices) ? payload.invoices : []
  const now = Date.now()

  return invoices.reduce(
    (acc: {
      totalInvoices: number
      paidAmount: number
      unpaidAmount: number
      paidCount: number
      unpaidCount: number
      overdueCount: number
    }, invoice: any) => {
      const req = Array.isArray(invoice.payment_requests) ? invoice.payment_requests[0] : null
      const cents = req?.computed_amount_money?.amount || 0
      const dueAt = req?.due_date ? new Date(req.due_date).getTime() : null
      const status = invoice.status || "UNKNOWN"

      acc.totalInvoices += 1

      if (status === "PAID") {
        acc.paidCount += 1
        acc.paidAmount += cents
      }

      if (status === "UNPAID") {
        acc.unpaidCount += 1
        acc.unpaidAmount += cents
        if (dueAt && dueAt < now) {
          acc.overdueCount += 1
        }
      }

      return acc
    },
    {
      totalInvoices: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      paidCount: 0,
      unpaidCount: 0,
      overdueCount: 0,
    },
  )
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()

    const [square, outreachResult, eventsResult] = await Promise.all([
      getSquareSummary(),
      supabase
        .from("mc_cold_outreach_queue")
        .select("status,brand,created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("mc_events")
        .select("id,timestamp", { count: "exact" })
        .gte("timestamp", new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()),
    ])

    if (outreachResult.error) throw outreachResult.error
    if (eventsResult.error) throw eventsResult.error

    const outreachRows = outreachResult.data ?? []
    const latestOutreachAt = outreachRows[0]?.created_at ?? null

    const outreach = outreachRows.reduce(
      (acc: {
        total: number
        loneStar: number
        fromInception: number
        byStatus: {
          pending: number
          approved: number
          denied: number
          sent: number
        }
      }, row: any) => {
        acc.total += 1
        if (row.status in acc.byStatus) {
          acc.byStatus[row.status as keyof typeof acc.byStatus] += 1
        }
        if (row.brand === "lone_star_lighting") acc.loneStar += 1
        if (row.brand === "from_inception") acc.fromInception += 1
        return acc
      },
      {
        total: 0,
        loneStar: 0,
        fromInception: 0,
        byStatus: {
          pending: 0,
          approved: 0,
          denied: 0,
          sent: 0,
        },
      },
    )

    const actions = [
      square.overdueCount > 0
        ? `${square.overdueCount} overdue Lone Star invoice${square.overdueCount === 1 ? "" : "s"} need pressure.`
        : null,
      outreach.byStatus.pending > 0
        ? `${outreach.byStatus.pending} outreach draft${outreach.byStatus.pending === 1 ? "" : "s"} waiting for approval or send.`
        : null,
      outreach.byStatus.sent === 0 && outreach.total > 0
        ? "Outreach is drafted but none are marked sent yet. Push the queue." : null,
      (eventsResult.count ?? 0) === 0
        ? "No activity events logged in the last 24 hours. Check automations and ingestion." : null,
    ].filter(Boolean)

    return NextResponse.json({
      revenue: {
        totalInvoices: square.totalInvoices,
        paidAmount: dollars(square.paidAmount),
        unpaidAmount: dollars(square.unpaidAmount),
        paidCount: square.paidCount,
        unpaidCount: square.unpaidCount,
        overdueCount: square.overdueCount,
      },
      outreach,
      operations: {
        recentEvents24h: eventsResult.count ?? 0,
        latestOutreachAt,
      },
      actions,
      refreshedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[mission-control-summary]", error)
    return NextResponse.json({ error: "Failed to load Mission Control summary." }, { status: 500 })
  }
}
