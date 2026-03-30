import fs from "node:fs/promises"
import path from "node:path"

import { BRAND_CONFIG, type ColdOutreachBrand, type ColdOutreachRecord } from "@/lib/cold-outreach-config"

const LEAD_GEN_ROOT = "/Users/christian/.openclaw/workspace/lead-gen"

function cleanText(value: string) {
  return value.replace(/\r/g, "").trim()
}

function extractGeneratedAt(markdown: string): string | null {
  const match = markdown.match(/Generated:\s*([^\n]+)/i)
  if (!match) return null
  const value = new Date(match[1].trim())
  return Number.isNaN(value.getTime()) ? null : value.toISOString()
}

function splitSections(markdown: string) {
  return markdown
    .split(/\n##\s+\d+\)\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
}

function parseProspects(markdown: string) {
  const sections = splitSections(markdown)
  const map = new Map<string, { website: string | null }>()

  for (const section of sections) {
    const lines = section.split("\n")
    const businessName = cleanText(lines[0] || "")
    if (!businessName) continue

    const websiteMatch = section.match(/- Website:\s*(.+)/i)
    map.set(businessName, {
      website: websiteMatch ? cleanText(websiteMatch[1]) : null,
    })
  }

  return map
}

function parseOutreach(markdown: string) {
  const sections = splitSections(markdown)

  return sections.map((section) => {
    const lines = section.split("\n")
    const businessName = cleanText(lines[0] || "")
    const subjectMatch = section.match(/\*\*Subject:\*\*\s*(.+)/i)
    const subject = subjectMatch ? cleanText(subjectMatch[1]) : ""
    const bodyStart = section.indexOf("\n\n")
    const body = bodyStart >= 0 ? cleanText(section.slice(bodyStart)) : cleanText(section)

    return {
      businessName,
      subject,
      body,
    }
  }).filter((item) => item.businessName && item.subject && item.body)
}

async function getLatestLeadGenFolder(): Promise<string | null> {
  const entries = await fs.readdir(LEAD_GEN_ROOT, { withFileTypes: true })
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  return dirs.length ? path.join(LEAD_GEN_ROOT, dirs[dirs.length - 1]) : null
}

export async function importLatestColdOutreachMarkdown() {
  const latestFolder = await getLatestLeadGenFolder()
  if (!latestFolder) {
    return { items: [], latestFolder: null }
  }

  const imports: Array<Omit<ColdOutreachRecord, "id" | "approved_at" | "denied_at" | "sent_at" | "send_error" | "created_at" | "updated_at">> = []

  for (const [brand, config] of Object.entries(BRAND_CONFIG) as Array<[ColdOutreachBrand, typeof BRAND_CONFIG[ColdOutreachBrand]]>) {
    const outreachPath = path.join(latestFolder, `${config.outreachFilePrefix}.md`)
    const prospectsPath = path.join(latestFolder, `${config.prospectsFilePrefix}.md`)

    try {
      const [outreachMarkdown, prospectsMarkdown] = await Promise.all([
        fs.readFile(outreachPath, "utf8"),
        fs.readFile(prospectsPath, "utf8"),
      ])

      const generatedAt = extractGeneratedAt(outreachMarkdown) ?? extractGeneratedAt(prospectsMarkdown)
      const prospects = parseProspects(prospectsMarkdown)
      const outreachItems = parseOutreach(outreachMarkdown)

      for (const item of outreachItems) {
        const prospect = prospects.get(item.businessName)
        imports.push({
          business_name: item.businessName,
          contact_name: null,
          contact_email: null,
          website: prospect?.website ?? null,
          draft_subject: item.subject,
          draft_body: item.body,
          brand,
          sender_email: config.senderEmail,
          status: "pending",
          source_file: outreachPath,
          source_generated_at: generatedAt,
          source_kind: "ruby_research",
          company_type: null,
          territory: null,
          lead_class: brand === "lone_star_lighting" ? "channel_partner" : "direct_buyer",
          notes: null,
          archived_at: null,
          send_status: "not_sent",
        })
      }
    } catch {
      // Ignore missing or malformed brand files so one brand doesn't block the other.
    }
  }

  return {
    items: imports,
    latestFolder,
  }
}
