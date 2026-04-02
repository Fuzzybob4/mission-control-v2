import { NextRequest, NextResponse } from "next/server"
import { execSync } from "child_process"
import path from "path"
import fs from "fs"

const PROJECT_ROOT = "/Users/christian/.openclaw/workspace/mission-control-v2"

const componentFileMap: Record<string, string> = {
  "commander-card": "components/commander-card.tsx",
  "active-missions": "components/active-missions.tsx",
  "ship-time-clock": "components/ship-time-clock.tsx",
  "kpi-card": "components/kpi-card.tsx",
  "sidebar": "components/sidebar.tsx",
  "recent-activity": "components/recent-activity.tsx",
  "heartbeat-section": "components/heartbeat-section.tsx",
  "skill-registry": "components/skill-registry.tsx",
}

function findFileBySnippet(outerHTML: string): string | null {
  // Try to find a unique text fragment from the outerHTML to grep for
  const snippet = outerHTML.slice(0, 80).replace(/[^\w\s-]/g, "").trim().split(/\s+/).slice(0, 5).join(" ")
  if (!snippet) return null

  try {
    const result = execSync(
      `cd ${JSON.stringify(PROJECT_ROOT)} && grep -rl ${JSON.stringify(snippet)} components/ app/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -1`,
      { timeout: 10000, encoding: "utf8" }
    ).trim()
    return result || null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { instruction, elementInfo } = await req.json()

    if (!instruction || !elementInfo) {
      return NextResponse.json({ success: false, error: "Missing instruction or elementInfo" }, { status: 400 })
    }

    // Determine file path
    let filePath: string | null = null

    if (elementInfo.componentHint && componentFileMap[elementInfo.componentHint]) {
      filePath = componentFileMap[elementInfo.componentHint]
    }

    if (!filePath) {
      const found = findFileBySnippet(elementInfo.outerHTML || "")
      if (found) filePath = found
    }

    if (!filePath) {
      return NextResponse.json({ success: false, error: "Could not determine which file to edit. Try clicking a component with a data-component attribute." }, { status: 400 })
    }

    // Verify the file exists
    const absolutePath = path.join(PROJECT_ROOT, filePath)
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ success: false, error: `File not found: ${filePath}` }, { status: 400 })
    }

    const prompt = `You are editing a Next.js component file.
File: ${filePath}
Element info: ${JSON.stringify(elementInfo)}
User instruction: "${instruction}"

Read the file at ${absolutePath}, make ONLY the specific change described, preserve everything else exactly. Apply the change now.`

    execSync(
      `cd ${JSON.stringify(PROJECT_ROOT)} && claude --permission-mode bypassPermissions --print ${JSON.stringify(prompt)}`,
      { timeout: 60000, encoding: "utf8" }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
