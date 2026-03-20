import { vault } from '../skills/credential-vault/lib/encryption'

const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'

const OVERVIEWS: Record<string, string> = {
  'KNIGHTFORGE | REDFOX CRM': `# KNIGHTFORGE | REDFOX CRM — Overview

**Business Summary**
- Red Fox CRM is the KnightForge-owned CRM and automation platform being built into a scalable SaaS for service businesses.
- Core offer: pipeline management, follow-up automation, customer ops, and backend systems.
- Target customer: service businesses that need a cleaner operating system for leads, customers, and revenue.
- Current stage: active build and positioning phase.

**Communication**
- Primary outbound email: redfoxcrm1@gmail.com
- Support / reply-to email: redfoxcrm1@gmail.com
- Brand voice: clear, sharp, operator-minded, systems-first.
- Approval: Christian

**Assigned Agents**
- Executive coordination: Kal / Atlas
- Business lead: Iris
- Dev / systems / coding: Otis
- Sales support: Ruby
- Research: Scout
- Content / positioning: Sierra

**Systems**
- CRM: Red Fox CRM
- Lead sources: founder outreach, referrals, future inbound
- Automations: product automation is core to the offer

**KPIs To Watch**
- Qualified demos / product conversations
- Demo-to-paid conversion
- Feature velocity and bug resolution
- Early MRR growth

**Current Priorities**
1. Tighten the core product and reduce friction.
2. Strengthen backend structure through Otis.
3. Sharpen positioning so Red Fox becomes the obvious operator choice.` ,

  'KNIGHTFORGE | FROMINCEPTION': `# KNIGHTFORGE | FROMINCEPTION — Overview

**Business Summary**
- From Inception is the web agency / systems arm focused on websites, digital infrastructure, and automation.
- Core offer: website builds, backend systems, and business infrastructure that turns chaos into clean execution.
- Target customer: owners who need a stronger website and better operating systems.
- Current stage: active client-services business with room to productize delivery.

**Communication**
- Primary outbound email: frominception.co@gmail.com
- Support / reply-to email: frominception.co@gmail.com
- Brand voice: strategic, confident, clean, outcomes-focused.
- Approval: Christian

**Assigned Agents**
- Executive coordination: Kal / Atlas
- Business lead: Nova
- Dev / systems / coding: Otis
- Sales support: Ruby
- Research: Scout
- Content / brand support: Sierra

**Systems**
- CRM: HubSpot where needed
- Lead sources: referrals, direct outreach, inbound website leads
- Automations: email monitoring, reporting, future client-delivery automation

**KPIs To Watch**
- Qualified website/system conversations
- Proposal-to-close rate
- Monthly client revenue
- Delivery speed and retention

**Current Priorities**
1. Strengthen the systems-first positioning.
2. Keep delivery scalable with stronger backend structure.
3. Use the business as both a revenue engine and a proving ground for KnightForge systems.` ,

  'KNIGHTFORGE | HEROES OF THE META': `# KNIGHTFORGE | HEROES OF THE META — Overview

**Business Summary**
- Heroes of the Meta is the KnightForge trading-card lane focused on Magic: The Gathering sales, inventory movement, and market-aware merchandising.
- Core offer: MTG card sales, curated inventory, and margin-conscious collectible commerce.
- Target customer: players, collectors, and buyers looking for desirable cards and product.
- Current stage: active niche commerce lane with room to improve inventory systems and sales flow.

**Communication**
- Primary outbound email: heroesofthemeta@gmail.com
- Support / reply-to email: heroesofthemeta@gmail.com
- Brand voice: knowledgeable, trustworthy, enthusiastic, sharp.
- Approval: Christian

**Assigned Agents**
- Executive coordination: Kal / Atlas
- Business lead: Scarlett
- Dev / systems / coding: Otis
- Sales support: Ruby
- Market research: Scout
- Content / brand support: Sierra

**Systems**
- Storefront: Heroes of the Meta sales channels
- Lead sources: organic buyers, community discovery, collector demand
- Automations: market watch, inventory tracking, sales reporting

**KPIs To Watch**
- Inventory turnover
- Margin-positive sales
- Repeat buyer growth
- Listing accuracy and turnaround time

**Current Priorities**
1. Tighten inventory visibility and tracking.
2. Improve market-watch discipline.
3. Build cleaner backend systems for listings, movement, and reporting.` ,
}

const HOLDINGS_OVERVIEW = `# KNIGHTFORGE HOLDINGS — Overview

**Business Summary**
- KnightForge Holdings is the parent operating structure coordinating the portfolio under one command system.
- Core offer: strategic oversight, capital allocation, shared systems, and executive coordination.
- This is the holdco command layer, not the main outward-facing sales brand.
- Current stage: active executive structure and operating center for growth, systems, and future acquisitions.

**Communication**
- Primary outbound email: knightforgeholdings@outlook.com
- Support / reply-to email: knightforgeholdings@outlook.com
- Brand voice: executive, decisive, strategic, disciplined.
- Approval: Christian

**Assigned Agents**
- Executive coordination: Kal / Atlas
- Lone Star lead: Vera
- From Inception lead: Nova
- Red Fox lead: Iris
- Heroes lead: Scarlett
- Sales support: Ruby
- Research: Scout
- Content / brand support: Sierra
- Dev / systems / coding across all businesses: Otis

**Systems**
- Mission Control
- Discord command center
- Business-specific CRMs / billing / storefronts
- Cross-business reporting and future orchestration

**KPIs To Watch**
- Portfolio revenue growth
- Recurring revenue strength
- Execution speed across lanes
- Cross-business clarity and reduced chaos

**Current Priorities**
1. Build a unified operating system across the businesses.
2. Increase visibility into priorities, agents, execution, and KPIs.
3. Prepare the holdco layer for stronger reporting and future acquisitions.`

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

async function ensureHoldingsOverview(channels: any[], token: string) {
  const categories = new Map<string, any>()
  for (const ch of channels) if (ch.type === 4) categories.set(ch.name, ch)
  const execCategory = categories.get('EXECUTIVE / STRATEGY')
  if (!execCategory) throw new Error('Missing EXECUTIVE / STRATEGY category')
  let overview = channels.find((c: any) => c.type === 0 && c.parent_id === execCategory.id && c.name === 'holdings-overview')
  if (!overview) {
    overview = await api('POST', `/guilds/${GUILD_ID}/channels`, token, {
      name: 'holdings-overview',
      type: 0,
      parent_id: execCategory.id,
      topic: 'KnightForge Holdings command overview, executive structure, and portfolio operating notes.',
      permission_overwrites: execCategory.permission_overwrites,
    })
    console.log('created channel: holdings-overview')
  }
  return overview
}

async function postOrUpdateOverview(channelId: string, token: string, content: string) {
  const messages = await api('GET', `/channels/${channelId}/messages?limit=20`, token)
  const existing = Array.isArray(messages)
    ? messages.find((m: any) => typeof m.content === 'string' && m.content.startsWith('# '))
    : null

  if (existing) {
    await api('PATCH', `/channels/${channelId}/messages/${existing.id}`, token, { content })
    return 'updated'
  }

  await api('POST', `/channels/${channelId}/messages`, token, { content })
  return 'posted'
}

async function main() {
  const token = await getBotToken()
  const channels = await api('GET', `/guilds/${GUILD_ID}/channels`, token)

  for (const [categoryName, content] of Object.entries(OVERVIEWS)) {
    const category = channels.find((c: any) => c.type === 4 && c.name === categoryName)
    if (!category) {
      console.log(`missing category: ${categoryName}`)
      continue
    }
    const overview = channels.find((c: any) => c.type === 0 && c.parent_id === category.id && c.name === 'overview')
    if (!overview) {
      console.log(`missing overview: ${categoryName}`)
      continue
    }
    const result = await postOrUpdateOverview(overview.id, token, content)
    console.log(`${result} overview: ${categoryName}`)
  }

  const holdings = await ensureHoldingsOverview(channels, token)
  const holdingsResult = await postOrUpdateOverview(holdings.id, token, HOLDINGS_OVERVIEW)
  console.log(`${holdingsResult} overview: KNIGHTFORGE HOLDINGS`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
