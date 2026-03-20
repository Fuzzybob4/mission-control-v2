import { vault } from '../skills/credential-vault/lib/encryption'

type RoleSpec = {
  name: string
  color?: number
  hoist?: boolean
  mentionable?: boolean
}

type ChannelSpec = {
  name: string
  type: 0 | 4
  parentName?: string
  topic?: string
  private?: boolean
}

const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'
const EVERYONE_ROLE_ID = GUILD_ID

const roles: RoleSpec[] = [
  { name: '🛡️ Founder', color: 0xf1c40f, hoist: true, mentionable: true },
  { name: '⚔️ Operator', color: 0xe74c3c, hoist: true, mentionable: true },
  { name: '🧠 Developer', color: 0x5865f2, hoist: true, mentionable: true },
  { name: '🎨 Creative', color: 0xe91e63, hoist: true, mentionable: true },
  { name: '📈 Sales', color: 0x2ecc71, hoist: true, mentionable: true },
  { name: '🤖 Automation', color: 0x95a5a6, hoist: true, mentionable: false },
]

const channels: ChannelSpec[] = [
  { name: 'CORE FOUNDATION', type: 4 },
  { name: 'welcome', type: 0, parentName: 'CORE FOUNDATION', topic: 'Brand intro, KnightForge vision, and mission.' },
  { name: 'rules', type: 0, parentName: 'CORE FOUNDATION', topic: 'Operator-room rules: tight, professional, no fluff, no spam.' },
  { name: 'skills', type: 0, parentName: 'CORE FOUNDATION', topic: 'Registry of KnightForge operating skills, automations, and reusable playbooks.' },
  { name: 'announcements', type: 0, parentName: 'CORE FOUNDATION', topic: 'Big moves only: new ventures, revenue milestones, launches.' },

  { name: 'EXECUTIVE / STRATEGY', type: 4, private: true },
  { name: 'war-room', type: 0, parentName: 'EXECUTIVE / STRATEGY', topic: 'Daily thinking, decisions, strategy dumps, next moves.', private: true },
  { name: 'kpis-dashboard', type: 0, parentName: 'EXECUTIVE / STRATEGY', topic: 'Revenue targets, weekly numbers, and company breakdowns.', private: true },
  { name: 'active-projects', type: 0, parentName: 'EXECUTIVE / STRATEGY', topic: 'What is being built right now and status updates.', private: true },
  { name: 'ideas-pipeline', type: 0, parentName: 'EXECUTIVE / STRATEGY', topic: 'Raw ideas, future acquisitions, monetization plays.', private: true },
  { name: 'potential-acquisitions', type: 0, parentName: 'EXECUTIVE / STRATEGY', topic: 'Targets, diligence notes, and acquisition opportunities.', private: true },

  { name: 'KNIGHTFORGE | LONE STAR LIGHTING', type: 4 },
  { name: 'overview', type: 0, parentName: 'KNIGHTFORGE | LONE STAR LIGHTING', topic: 'Lone Star Lighting overview.' },
  { name: 'branding-admin', type: 0, parentName: 'KNIGHTFORGE | LONE STAR LIGHTING', topic: 'Admin-only brand vault: logo, favicon, colors, fonts, themes, and brand rules.', private: true },
  { name: 'vendors-suppliers', type: 0, parentName: 'KNIGHTFORGE | LONE STAR LIGHTING', topic: 'Vendor, supplier, and sourcing relationships for Lone Star Lighting.' },
  { name: 'leads-sales', type: 0, parentName: 'KNIGHTFORGE | LONE STAR LIGHTING', topic: 'Leads and sales activity for Lone Star Lighting.' },
  { name: 'projects-installations', type: 0, parentName: 'KNIGHTFORGE | LONE STAR LIGHTING', topic: 'Project execution and installation updates.' },
  { name: 'customer-communication', type: 0, parentName: 'KNIGHTFORGE | LONE STAR LIGHTING', topic: 'Customer communication and support.' },
  { name: 'marketing', type: 0, parentName: 'KNIGHTFORGE | LONE STAR LIGHTING', topic: 'Marketing for Lone Star Lighting.' },

  { name: 'KNIGHTFORGE | REDFOX CRM', type: 4 },
  { name: 'overview', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Business overview, positioning, systems, and operating notes for RedFox CRM.' },
  { name: 'branding-admin', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Admin-only brand vault: logo, favicon, colors, fonts, themes, and brand rules.', private: true },
  { name: 'vendors-suppliers', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Vendors, partners, software providers, and supporting suppliers for RedFox CRM.' },
  { name: 'product-dev', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Product development for RedFox CRM.' },
  { name: 'bugs-issues', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Bug reports and issue triage.' },
  { name: 'feature-requests', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Feature requests and customer asks.' },
  { name: 'roadmap', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Roadmap planning and sequencing.' },
  { name: 'stripe-billing', type: 0, parentName: 'KNIGHTFORGE | REDFOX CRM', topic: 'Stripe billing, subscriptions, and payment events.' },

  { name: 'KNIGHTFORGE | FROMINCEPTION', type: 4 },
  { name: 'overview', type: 0, parentName: 'KNIGHTFORGE | FROMINCEPTION', topic: 'Business overview, positioning, systems, and operating notes for FromInception.' },
  { name: 'branding-admin', type: 0, parentName: 'KNIGHTFORGE | FROMINCEPTION', topic: 'Admin-only brand vault: logo, favicon, colors, fonts, themes, and brand rules.', private: true },
  { name: 'vendors-suppliers', type: 0, parentName: 'KNIGHTFORGE | FROMINCEPTION', topic: 'Vendors, contractors, and supplier relationships for From Inception.' },
  { name: 'client-projects', type: 0, parentName: 'KNIGHTFORGE | FROMINCEPTION', topic: 'Client projects and status.' },
  { name: 'design-assets', type: 0, parentName: 'KNIGHTFORGE | FROMINCEPTION', topic: 'Design assets and creative files.' },
  { name: 'website-builds', type: 0, parentName: 'KNIGHTFORGE | FROMINCEPTION', topic: 'Website builds and launch work.' },
  { name: 'templates-systems', type: 0, parentName: 'KNIGHTFORGE | FROMINCEPTION', topic: 'Reusable templates and systems.' },

  { name: 'KNIGHTFORGE | HEROES OF THE META', type: 4 },
  { name: 'overview', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Business overview, positioning, systems, and operating notes for Heroes of the Meta.' },
  { name: 'branding-admin', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Admin-only brand vault: logo, favicon, colors, fonts, themes, and brand rules.', private: true },
  { name: 'vendors-suppliers', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Vendors, distributors, and supplier relationships for Heroes of the Meta.' },
  { name: 'inventory', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Inventory planning, sourcing, and stock status.' },
  { name: 'sales-orders', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Sales, orders, and fulfillment coordination.' },
  { name: 'market-watch', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Card trends, pricing, and market intelligence.' },
  { name: 'marketing-content', type: 0, parentName: 'KNIGHTFORGE | HEROES OF THE META', topic: 'Content, promos, and audience growth ideas.' },

  { name: 'AUTOMATION + AI (KAL ZONE)', type: 4 },
  { name: 'kal-control-center', type: 0, parentName: 'AUTOMATION + AI (KAL ZONE)', topic: 'Commands, prompts, and system instructions.' },
  { name: 'automations', type: 0, parentName: 'AUTOMATION + AI (KAL ZONE)', topic: 'Cron jobs, running systems, and integrations.' },
  { name: 'data-stream', type: 0, parentName: 'AUTOMATION + AI (KAL ZONE)', topic: 'Logs, outputs, and reports from bots.' },

  { name: 'REVENUE & GROWTH', type: 4 },
  { name: 'sales-playbooks', type: 0, parentName: 'REVENUE & GROWTH', topic: 'Scripts, offers, and pricing strategies.' },
  { name: 'marketing-engine', type: 0, parentName: 'REVENUE & GROWTH', topic: 'Ads, content ideas, and campaign tracking.' },
  { name: 'partnerships', type: 0, parentName: 'REVENUE & GROWTH', topic: 'Collaborations, deals, and outreach.' },

  { name: 'OPERATIONS', type: 4 },
  { name: 'vendors-suppliers', type: 0, parentName: 'OPERATIONS', topic: 'Vendors and suppliers.' },
  { name: 'contracts-docs', type: 0, parentName: 'OPERATIONS', topic: 'Contracts and docs.' },
  { name: 'scheduling', type: 0, parentName: 'OPERATIONS', topic: 'Scheduling and calendar coordination.' },
  { name: 'tools-systems', type: 0, parentName: 'OPERATIONS', topic: 'Tools, systems, and stack notes.' },

  { name: 'BRAND & DESIGN', type: 4 },
  { name: 'brand-assets', type: 0, parentName: 'BRAND & DESIGN', topic: 'Logos, colors, fonts, and brand assets.' },
  { name: 'creative-direction', type: 0, parentName: 'BRAND & DESIGN', topic: 'Moodboards, vibes, and creative direction.' },

  { name: 'TEAM', type: 4 },
  { name: 'team-chat', type: 0, parentName: 'TEAM', topic: 'Team chat.' },
  { name: 'tasks-assignments', type: 0, parentName: 'TEAM', topic: 'Tasks and assignments.' },
  { name: 'training', type: 0, parentName: 'TEAM', topic: 'Training materials and onboarding.' },

  { name: 'INVESTOR / HIGH-LEVEL VIEW', type: 4, private: true },
  { name: 'executive-summary', type: 0, parentName: 'INVESTOR / HIGH-LEVEL VIEW', topic: 'High-level executive summary.', private: true },
  { name: 'portfolio-performance', type: 0, parentName: 'INVESTOR / HIGH-LEVEL VIEW', topic: 'Portfolio performance and company view.', private: true },
  { name: 'growth-roadmap', type: 0, parentName: 'INVESTOR / HIGH-LEVEL VIEW', topic: 'Growth roadmap and strategic trajectory.', private: true },
]

async function main() {
  const token = await getBotToken()
  const headers = {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  }

  const existingRoles = await api('GET', `/guilds/${GUILD_ID}/roles`, headers)
  const roleMap = new Map<string, string>()
  for (const role of existingRoles) roleMap.set(role.name, role.id)

  for (const role of roles) {
    if (roleMap.has(role.name)) continue
    const created = await api('POST', `/guilds/${GUILD_ID}/roles`, headers, role)
    roleMap.set(created.name, created.id)
    console.log(`created role: ${created.name}`)
  }

  const founderRoleId = roleMap.get('🛡️ Founder')
  if (!founderRoleId) throw new Error('Founder role missing after creation')

  const existingChannels = await api('GET', `/guilds/${GUILD_ID}/channels`, headers)
  const channelMap = new Map<string, any>()
  for (const channel of existingChannels) {
    const key = `${channel.parent_id || 'root'}::${channel.type}::${channel.name}`
    channelMap.set(key, channel)
  }

  const categoryIds = new Map<string, string>()
  for (const spec of channels.filter(c => c.type === 4)) {
    const key = `root::4::${spec.name}`
    const existing = channelMap.get(key)
    if (existing) {
      categoryIds.set(spec.name, existing.id)
      continue
    }
    const payload: any = { name: spec.name, type: 4 }
    if (spec.private) payload.permission_overwrites = privateOverwrites(founderRoleId)
    const created = await api('POST', `/guilds/${GUILD_ID}/channels`, headers, payload)
    categoryIds.set(spec.name, created.id)
    console.log(`created category: ${created.name}`)
  }

  for (const spec of channels.filter(c => c.type === 0)) {
    const parentId = spec.parentName ? categoryIds.get(spec.parentName) : undefined
    const key = `${parentId || 'root'}::0::${spec.name}`
    if (channelMap.has(key)) continue
    const payload: any = {
      name: spec.name,
      type: 0,
      topic: spec.topic,
      parent_id: parentId,
    }
    if (spec.private) payload.permission_overwrites = privateOverwrites(founderRoleId)
    const created = await api('POST', `/guilds/${GUILD_ID}/channels`, headers, payload)
    console.log(`created channel: ${created.name}`)
  }

  console.log('KnightForge server setup complete.')
}

function privateOverwrites(founderRoleId: string) {
  return [
    { id: EVERYONE_ROLE_ID, type: 0, deny: '1024', allow: '0' },
    { id: founderRoleId, type: 0, allow: '1024', deny: '0' },
  ]
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
