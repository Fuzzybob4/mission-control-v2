import { vault } from '../skills/credential-vault/lib/encryption'

const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'
const CATEGORIES = [
  'KNIGHTFORGE | LONE STAR LIGHTING',
  'KNIGHTFORGE | REDFOX CRM',
  'KNIGHTFORGE | FROMINCEPTION',
  'KNIGHTFORGE | HEROES OF THE META',
] as const

function template(category: string) {
  return `# ${category} — Branding Admin

**Brand Assets**
- Logo:
- Favicon:
- Alternate logo marks:
- File storage / source of truth:

**Brand Theme**
- Core vibe / identity:
- Tagline / core message:
- Visual style notes:

**Colors**
- Primary color:
- Secondary color:
- Accent color:
- Background / neutral palette:
- HEX codes:

**Typography**
- Primary font:
- Secondary font:
- Script / display font:
- Fallback font stack:

**Usage Rules**
- Logo do / do not:
- Voice / tone notes:
- Image style notes:
- Social / web consistency rules:

**Notes**
- `
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

async function api(method: string, path: string, token: string, body?: any) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}

async function main() {
  const token = await getBotToken()
  const channels = await api('GET', `/guilds/${GUILD_ID}/channels`, token)

  for (const categoryName of CATEGORIES) {
    const category = channels.find((c: any) => c.type === 4 && c.name === categoryName)
    if (!category) continue
    const branding = channels.find((c: any) => c.type === 0 && c.parent_id === category.id && c.name === 'branding-admin')
    if (!branding) continue
    const messages = await api('GET', `/channels/${branding.id}/messages?limit=10`, token)
    const existing = Array.isArray(messages)
      ? messages.find((m: any) => typeof m.content === 'string' && m.content.includes('— Branding Admin'))
      : null

    if (existing) {
      await api('PATCH', `/channels/${branding.id}/messages/${existing.id}`, token, { content: template(categoryName) })
      console.log(`updated branding template: ${categoryName}`)
    } else {
      await api('POST', `/channels/${branding.id}/messages`, token, { content: template(categoryName) })
      console.log(`posted branding template: ${categoryName}`)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
