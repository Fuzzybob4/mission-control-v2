import { vault } from '../skills/credential-vault/lib/encryption'

const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'

const targets = [
  'KNIGHTFORGE | LONE STAR LIGHTING',
  'KNIGHTFORGE | REDFOX CRM',
  'KNIGHTFORGE | FROMINCEPTION',
  'KNIGHTFORGE | HEROES OF THE META',
] as const

function template(business: string) {
  return [
    `# ${business} — Overview`,
    '',
    '**Business Summary**',
    '- What this business does:',
    '- Core offer:',
    '- Target customer:',
    '- Current stage:',
    '',
    '**Communication**',
    '- Primary outbound email:',
    '- Support / reply-to email:',
    '- Brand voice / tone:',
    '- Who approves outbound communication:',
    '',
    '**Assigned Agents**',
    '- Lead agent:',
    '- Ops agent:',
    '- Dev / systems agent:',
    '- Content / marketing agent:',
    '- Escalation path:',
    '',
    '**Systems**',
    '- CRM:',
    '- Billing:',
    '- Website / storefront:',
    '- Lead sources:',
    '- Automations:',
    '',
    '**KPIs To Watch**',
    '- Revenue target:',
    '- Lead target:',
    '- Conversion target:',
    '- Fulfillment / ops metric:',
    '',
    '**Current Priorities**',
    '1. ',
    '2. ',
    '3. ',
    '',
    '**Notes**',
    '- ',
  ].join('\n')
}

async function main() {
  const token = await getBotToken()
  const headers = { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' }

  const channels = await api('GET', `/guilds/${GUILD_ID}/channels`, headers)

  for (const categoryName of targets) {
    const category = channels.find((c: any) => c.type === 4 && c.name === categoryName)
    if (!category) {
      console.log(`missing category: ${categoryName}`)
      continue
    }

    const overview = channels.find((c: any) => c.type === 0 && c.parent_id === category.id && c.name === 'overview')
    if (!overview) {
      console.log(`missing overview channel in: ${categoryName}`)
      continue
    }

    const existing = await api('GET', `/channels/${overview.id}/messages?limit=5`, headers)
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`skipped populated overview: ${categoryName}`)
      continue
    }

    await api('POST', `/channels/${overview.id}/messages`, headers, { content: template(categoryName) })
    console.log(`seeded overview: ${categoryName}`)
  }

  console.log('KnightForge overview seeding complete.')
}

async function getBotToken() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env')
  vault.initializeSupabase(url, key)
  const result = await vault.unlock(process.env.VAULT_PIN || '2846')
  if (!result.success) throw new Error(result.message || 'Unlock failed')
  return vault.get('discord-bot', 'Discord-bot', 'Token')
}

async function api(method: string, path: string, headers: Record<string, string>, body?: any) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`)
  }
  return res.status === 204 ? null : res.json()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
