import { vault } from '../skills/credential-vault/lib/encryption'

const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'

const CONTENT = `# KnightForge Skills Registry

These are the current reusable operating skills behind the KnightForge system.

## Core operating skills
- **knightforge-discord-ops** — manages the Discord command-center structure, lane design, overview channels, permissions, and Mission Control alignment
- **knightforge-business-branding** — captures and maintains source-of-truth branding for each business

## Existing platform skills already in play
- Mission Control / Discord bridge scripts
- overview channel seeding
- branding-admin seeding
- business architecture reconciliation

## Purpose
This channel is the index of reusable operating spells — the things we can rerun, extend, or formalize instead of rebuilding from scratch each time.`

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
  const channel = channels.find((c: any) => c.name === 'skills')
  if (!channel) throw new Error('skills channel missing')
  const messages = await api('GET', `/channels/${channel.id}/messages?limit=10`, token)
  const existing = Array.isArray(messages) ? messages.find((m: any) => typeof m.content === 'string' && m.content.startsWith('# KnightForge Skills Registry')) : null
  if (existing) {
    await api('PATCH', `/channels/${channel.id}/messages/${existing.id}`, token, { content: CONTENT })
  } else {
    await api('POST', `/channels/${channel.id}/messages`, token, { content: CONTENT })
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
