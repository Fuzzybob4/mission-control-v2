import { vault } from '../skills/credential-vault/lib/encryption'

const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'
const REMOVE_CATEGORY = 'KNIGHTFORGE | RENTALS (VRBO/AIRBNB)'

const ADDITIONS = [
  { name: 'KNIGHTFORGE | HEROES OF THE META', type: 4 },
  { name: 'overview', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Business overview, positioning, systems, and operating notes for Heroes of the Meta.' },
  { name: 'inventory', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Inventory planning, sourcing, and stock status.' },
  { name: 'sales-orders', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Sales, orders, and fulfillment coordination.' },
  { name: 'market-watch', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Card trends, pricing, and market intelligence.' },
  { name: 'marketing-content', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Content, promos, and audience growth ideas.' },
] as const

async function main() {
  const token = await getBotToken()
  const headers = { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' }

  let channels = await api('GET', `/guilds/${GUILD_ID}/channels`, headers)
  const rentalsCategory = channels.find((c: any) => c.type === 4 && c.name === REMOVE_CATEGORY)
  if (rentalsCategory) {
    const children = channels.filter((c: any) => c.parent_id === rentalsCategory.id)
    for (const child of children) {
      await api('DELETE', `/channels/${child.id}`, headers)
      console.log(`deleted channel: ${child.name}`)
    }
    await api('DELETE', `/channels/${rentalsCategory.id}`, headers)
    console.log(`deleted category: ${rentalsCategory.name}`)
  }

  channels = await api('GET', `/guilds/${GUILD_ID}/channels`, headers)
  let heroesCategory = channels.find((c: any) => c.type === 4 && c.name === 'KNIGHTFORGE | HEROES OF THE META')
  if (!heroesCategory) {
    heroesCategory = await api('POST', `/guilds/${GUILD_ID}/channels`, headers, { name: 'KNIGHTFORGE | HEROES OF THE META', type: 4 })
    console.log(`created category: ${heroesCategory.name}`)
  }

  channels = await api('GET', `/guilds/${GUILD_ID}/channels`, headers)
  for (const spec of ADDITIONS.filter(x => x.type === 0)) {
    const exists = channels.find((c: any) => c.type === 0 && c.parent_id === heroesCategory.id && c.name === spec.name)
    if (exists) continue
    const created = await api('POST', `/guilds/${GUILD_ID}/channels`, headers, {
      name: spec.name,
      type: 0,
      parent_id: heroesCategory.id,
      topic: spec.topic,
    })
    console.log(`created channel: ${created.name}`)
  }

  console.log('KnightForge reconciliation complete.')
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
