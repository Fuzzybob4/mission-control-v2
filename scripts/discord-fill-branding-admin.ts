import { readFileSync, existsSync } from 'node:fs'
import { basename } from 'node:path'
import { vault } from '../skills/credential-vault/lib/encryption'

const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'

const BRANDING: Record<string, { content: string; files: string[] }> = {
  'KNIGHTFORGE | LONE STAR LIGHTING': {
    content: `# KNIGHTFORGE | LONE STAR LIGHTING — Branding Admin

**Brand Assets**
- Logo: no standalone logo file found locally yet
- Favicon: attached from live site
- Source of truth: live site + future asset vault upload

**Brand Theme**
- Identity: Texas-forward, premium outdoor lighting, clean and trustworthy
- Tone: warm, professional, confident, homeowner-friendly
- Visual style: bright lighting against darker outdoor/nighttime context

**Colors**
- Provisional primary: warm gold / amber
- Provisional secondary: deep charcoal / near-black
- Supporting neutral: white
- Notes: these are inferred from the live site positioning and lighting aesthetic; refine once source brand files are uploaded

**Typography**
- Observed style: clean modern sans-serif
- Script / display font: none observed on live site

**Usage Rules**
- Keep visuals premium, bright, and high-contrast
- Show transformation, curb appeal, and nighttime atmosphere
- Avoid cluttered holiday-only visuals when marketing year-round lighting`,
    files: [
      '/Users/christian/.openclaw/workspace/mission-control-v2/tmp/brand-assets/lonestarlightingdisplays-com.ico',
    ],
  },
  'KNIGHTFORGE | REDFOX CRM': {
    content: `# KNIGHTFORGE | REDFOX CRM — Branding Admin

**Brand Assets**
- Logo: attached light + dark versions from local repo
- Favicon: attached from live site
- Source of truth: v0-redfox-crm-2026/public

**Brand Theme**
- Identity: modern CRM for operators and service businesses
- Tone: sharp, systems-first, modern, practical
- Visual style: clean SaaS UI with warm accent energy

**Colors**
- Primary accent: #FF8C42
- Secondary accent: #E85C2B
- Light background: #FFF5E6
- Soft neutral: #F5F2EA
- Dark text/base: #1A1A1A

**Typography**
- Observed style: modern sans-serif UI stack
- Script / display font: none observed

**Usage Rules**
- Keep the fox/orange identity consistent
- Favor clean dashboards, clarity, and action-oriented layouts
- Avoid overly playful visuals that weaken the operator-grade product feel`,
    files: [
      '/Users/christian/.openclaw/workspace/v0-redfox-crm-2026/public/redfox-logo-light.png',
      '/Users/christian/.openclaw/workspace/v0-redfox-crm-2026/public/redfox-logo-dark.png',
      '/Users/christian/.openclaw/workspace/mission-control-v2/tmp/brand-assets/redfoxcrm-com.ico',
    ],
  },
  'KNIGHTFORGE | FROMINCEPTION': {
    content: `# KNIGHTFORGE | FROMINCEPTION — Branding Admin

**Brand Assets**
- Logo: no separate standalone logo file located in workspace yet
- Favicon: attached from local/live site
- Source of truth: frominception-site app + future asset upload

**Brand Theme**
- Identity: high-end web design and client portal studio
- Tone: strategic, premium, polished, outcomes-focused
- Visual style: dark navy foundation with gold accents and editorial contrast

**Colors**
- Navy / background: #0B1120
- Card navy: #111827
- Foreground / light text: #F0EDE6
- Muted slate: #1E2A3A
- Muted text: #94A3B8
- Gold: #D4AF37
- Gold light: #E8C84A

**Typography**
- Sans: DM Sans
- Serif / display: DM Serif Display
- Script type: none; elegant serif used for emphasis

**Usage Rules**
- Preserve dark-luxury feel with gold restraint
- Use serif for premium emphasis, sans for clarity
- Keep layouts clean, bespoke, and conversion-focused`,
    files: [
      '/Users/christian/.openclaw/workspace/frominception-site/app/favicon.ico',
      '/Users/christian/.openclaw/workspace/mission-control-v2/tmp/brand-assets/frominception-co.ico',
    ],
  },
  'KNIGHTFORGE | HEROES OF THE META': {
    content: `# KNIGHTFORGE | HEROES OF THE META — Branding Admin

**Brand Assets**
- Logo: attached from live site
- Favicon: attached from live site
- Source of truth: heroesofthemeta.com assets until a local vault is uploaded

**Brand Theme**
- Identity: premium trading-card marketplace with collector energy
- Tone: knowledgeable, adventurous, trustworthy, niche-expert
- Visual style: competitive TCG meets premium collectible shop

**Colors**
- Provisional primary: black / dark neutral base
- Provisional secondary: white
- Accent direction: franchise / game-color flexibility depending on product mix
- Notes: refine exact palette once the original brand files are uploaded

**Typography**
- Observed style: bold modern ecommerce sans-serif
- Script / display font: none clearly observed from extracted page content

**Usage Rules**
- Keep the brand collector-forward, not toy-store generic
- Support MTG, Pokémon, and One Piece without muddying the core identity
- Use product art and rarity/value cues carefully so the store still feels premium`,
    files: [
      '/Users/christian/.openclaw/workspace/mission-control-v2/tmp/brand-assets/heroes-logo.png',
      '/Users/christian/.openclaw/workspace/mission-control-v2/tmp/brand-assets/heroesofthemeta-com.ico',
    ],
  },
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

async function postWithFiles(channelId: string, token: string, content: string, files: string[]) {
  const form = new FormData()
  const validFiles = files.filter((f) => existsSync(f))
  form.set('payload_json', JSON.stringify({ content }))
  for (let i = 0; i < validFiles.length; i++) {
    const path = validFiles[i]
    const blob = new Blob([readFileSync(path)])
    form.append(`files[${i}]`, blob, basename(path))
  }
  const res = await fetch(`${API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}` },
    body: form,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`POST /channels/${channelId}/messages failed: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}

async function main() {
  const token = await getBotToken()
  const channels = await api('GET', `/guilds/${GUILD_ID}/channels`, token)

  for (const [categoryName, brand] of Object.entries(BRANDING)) {
    const category = channels.find((c: any) => c.type === 4 && c.name === categoryName)
    if (!category) continue
    const channel = channels.find((c: any) => c.type === 0 && c.parent_id === category.id && c.name === 'branding-admin')
    if (!channel) continue
    await postWithFiles(channel.id, token, brand.content, brand.files)
    console.log(`posted branding card: ${categoryName}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
