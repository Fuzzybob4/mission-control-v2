import { NextResponse } from "next/server"

const SQUARE_VERSION = "2025-09-24"
const LOCATION_ID = "9MV8Y3QW75WA1"

function dollars(amount?: number) {
  return ((amount || 0) / 100)
}

export async function GET() {
  try {
    const token = process.env.SQUARE_ACCESS_TOKEN

    if (!token) {
      return NextResponse.json({ error: "Missing SQUARE_ACCESS_TOKEN" }, { status: 500 })
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
      return NextResponse.json({ error: payload?.errors?.[0]?.detail || "Failed to load Square invoices" }, { status: 400 })
    }

    const invoices = Array.isArray(payload.invoices) ? payload.invoices : []

    const summary = {
      totalInvoices: invoices.length,
      unpaidCount: 0,
      scheduledCount: 0,
      partiallyPaidCount: 0,
      paidCount: 0,
      unpaidAmount: 0,
      scheduledAmount: 0,
      partiallyPaidAmount: 0,
      paidAmount: 0,
    }

    const actionQueue: Array<{
      invoiceNumber: string
      customer: string
      company: string | null
      email: string | null
      phone: string | null
      status: string
      amount: number
      dueDate: string | null
      action: string
    }> = []

    const recentPaid: Array<{
      invoiceNumber: string
      customer: string
      company: string | null
      amount: number
      updatedAt: string | null
    }> = []

    for (const invoice of invoices) {
      const status = invoice.status || "UNKNOWN"
      const recipient = invoice.primary_recipient || {}
      const req = Array.isArray(invoice.payment_requests) ? invoice.payment_requests[0] : null
      const amount = req?.computed_amount_money?.amount || 0
      const customer = [recipient.given_name, recipient.family_name].filter(Boolean).join(" ").trim() || recipient.company_name || "Unknown"
      const row = {
        invoiceNumber: invoice.invoice_number || invoice.id,
        customer,
        company: recipient.company_name || null,
        email: recipient.email_address || null,
        phone: recipient.phone_number || null,
        status,
        amount: dollars(amount),
        dueDate: req?.due_date || null,
      }

      if (status === "UNPAID") {
        summary.unpaidCount += 1
        summary.unpaidAmount += amount
        actionQueue.push({ ...row, action: "Follow up for payment" })
      } else if (status === "SCHEDULED") {
        summary.scheduledCount += 1
        summary.scheduledAmount += amount
        actionQueue.push({ ...row, action: "Prep before scheduled send/install" })
      } else if (status === "PARTIALLY_PAID") {
        summary.partiallyPaidCount += 1
        summary.partiallyPaidAmount += amount
        actionQueue.push({ ...row, action: "Collect remaining balance + schedule" })
      } else if (status === "PAID") {
        summary.paidCount += 1
        summary.paidAmount += amount
        recentPaid.push({
          invoiceNumber: row.invoiceNumber,
          customer: row.customer,
          company: row.company,
          amount: row.amount,
          updatedAt: invoice.updated_at || null,
        })
      }
    }

    recentPaid.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    actionQueue.sort((a, b) => {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return aDate - bDate
    })

    return NextResponse.json({
      summary: {
        ...summary,
        unpaidAmount: dollars(summary.unpaidAmount),
        scheduledAmount: dollars(summary.scheduledAmount),
        partiallyPaidAmount: dollars(summary.partiallyPaidAmount),
        paidAmount: dollars(summary.paidAmount),
      },
      actionQueue: actionQueue.slice(0, 12),
      recentPaid: recentPaid.slice(0, 8),
      refreshedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[lone-star-board]", error)
    return NextResponse.json({ error: "Failed to load Lone Star board." }, { status: 500 })
  }
}
