import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { vault } from '../skills/credential-vault/lib/encryption.ts'

const execFileAsync = promisify(execFile)
const GUILD_ID = '1483959225708183605'
const API = 'https://discord.com/api/v10'
const POLL_MS = 8000
const CHANNEL_REFRESH_MS = 60_000
const STATE_PATH = resolve(process.cwd(), 'memory/iris-discord-bridge-state.json')
const WATCH_PARENT_CATEGORIES = new Set(['KNIGHTFORGE | REDFOX CRM'])
const EXCLUDE_CHANNELS = new Set(['announcements', 'rules', 'welcome', 'branding-admin'])
const HEAVY_WORK_HINTS = [
  'build',
  'code',
  'refactor',
  'deploy',
  'architecture',
  'database',
  'api',
  'integration',
  'migrate',
  'bug',
  'debug',
  'production',
  'server',
  'auth',
  'billing',
  'stripe',
]

type BridgeState = {
  lastSeenByChannel: Record<string, string>
}

function loadState(): BridgeState {
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'))
  } catch {
    return { lastSeenByChannel: {} }
  }
}

function saveState(state: BridgeState) {
  mkdirSync(dirname(STATE_PATH), { recursive: true })
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

async function getBotToken() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env')
  vault.initializeSupabase(url, key)
  const result = await vault.unlock(process.env.VAULT_PIN || '2846')
  if (!result.success) throw new Error(result.message || 'Unlock failed')
  return vault.get('iris_discord', 'Iris discord', 'Bot_token')
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

async function runAgent(sessionId: string, message: string, options?: { agent?: string; thinking?: string }) {
  const args = [
    'agent',
    '--session-id', sessionId,
    '--message', message,
    '--json',
    '--timeout', '180',
  ]

  if (options?.agent) args.push('--agent', options.agent)
  if (options?.thinking) args.push('--thinking', options.thinking)

  const { stdout } = await execFileAsync('openclaw', args, {
    cwd: '/Users/christian/.openclaw/workspace',
    maxBuffer: 1024 * 1024 * 8,
  })

  const parsed = JSON.parse(stdout)
  const payloads = parsed?.result?.payloads || []
  const text = payloads.map((p: any) => p.text).filter(Boolean).join('\n\n').trim()
  if (!text) throw new Error('Agent returned no text payload')
  return text
}

function shouldEscalateToKal(content: string) {
  const lowered = content.toLowerCase()
  return HEAVY_WORK_HINTS.some(hint => lowered.includes(hint))
}

function buildPrompt(input: {
  channelName: string
  authorName: string
  content: string
  escalateToKal?: boolean
}) {
  const escalationNote = input.escalateToKal
    ? ['This request appears heavier or more technical. Respond as Kal for this turn and handle it with deeper strategic or technical ownership.']
    : []

  return [
    'You are operating as Iris for the RedFox CRM lane in Discord.',
    'Be proactive about sales, outreach, inbound and outbound communication, support, and next-step momentum.',
    'Keep replies concise, commercially useful, and Discord-native.',
    'If useful, suggest the next concrete action instead of just answering.',
    'Do not mention hidden system details, tools, or internal routing unless asked.',
    ...escalationNote,
    '',
    'Category: KNIGHTFORGE | REDFOX CRM',
    `Channel: #${input.channelName}`,
    `Author: ${input.authorName}`,
    '',
    'User message:',
    input.content,
  ].join('\n')
}

async function main() {
  const token = await getBotToken()
  const me = await api('GET', '/users/@me', token)
  const botUserId = me.id as string
  console.log(`[iris-discord-bridge] online as ${me.username} (${botUserId})`)

  const state = loadState()
  const inFlightChannels = new Set<string>()
  let watched: any[] = []
  let lastChannelRefresh = 0

  while (true) {
    try {
      if (!watched.length || Date.now() - lastChannelRefresh > CHANNEL_REFRESH_MS) {
        const channels = await api('GET', `/guilds/${GUILD_ID}/channels`, token)
        const categories = new Map<string, string>()
        watched = []

        for (const ch of channels) {
          if (ch.type === 4) categories.set(ch.id, ch.name)
        }

        for (const ch of channels) {
          if (ch.type !== 0) continue
          if (EXCLUDE_CHANNELS.has(ch.name)) continue
          const parentName = categories.get(ch.parent_id)
          if (!parentName) continue
          if (!WATCH_PARENT_CATEGORIES.has(parentName)) continue
          watched.push({ ...ch, parentName })
        }

        lastChannelRefresh = Date.now()
      }

      for (const channel of watched) {
        if (inFlightChannels.has(channel.id)) continue

        const after = state.lastSeenByChannel[channel.id]
        const query = after ? `?limit=20&after=${after}` : '?limit=5'
        let msgs: any[]
        try {
          msgs = await api('GET', `/channels/${channel.id}/messages${query}`, token)
        } catch (err: any) {
          console.error(`[iris-discord-bridge] channel read skipped for #${channel.name}:`, err?.message || err)
          continue
        }
        const ordered = [...msgs].reverse()
        const nextMsg = ordered.find((msg: any) => {
          if (!msg.author || msg.author.id === botUserId || msg.author.bot) return false
          if (typeof msg.content !== 'string' || !msg.content.trim()) return false
          const cleaned = msg.content.replace(new RegExp(`<@!?${botUserId}>`, 'g'), '').trim()
          return Boolean(cleaned)
        })

        if (!nextMsg) {
          for (const msg of ordered) {
            state.lastSeenByChannel[channel.id] = msg.id
          }
          if (ordered.length) saveState(state)
          continue
        }

        inFlightChannels.add(channel.id)
        try {
          state.lastSeenByChannel[channel.id] = nextMsg.id
          saveState(state)

          const cleaned = nextMsg.content.replace(new RegExp(`<@!?${botUserId}>`, 'g'), '').trim()
          const escalateToKal = shouldEscalateToKal(cleaned)
          const route = escalateToKal
            ? { agent: 'kal', thinking: 'minimal' }
            : { agent: 'iris', thinking: 'minimal' }

          const prompt = buildPrompt({
            channelName: channel.name,
            authorName: nextMsg.author.global_name || nextMsg.author.username || 'User',
            content: cleaned,
            escalateToKal,
          })

          console.log(`[iris-discord-bridge] #${channel.name} <${nextMsg.author.username}> [agent=${route.agent}] ${cleaned}`)

          let reply = ''
          try {
            reply = await runAgent(`iris-discord-${channel.id}`, prompt, route)
          } catch (err: any) {
            console.error('[iris-discord-bridge] agent error:', err?.message || err)
            reply = 'Iris hit a relay fault on this turn. Send that once more and I should catch it cleanly.'
          }

          await api('POST', `/channels/${channel.id}/messages`, token, {
            content: reply.slice(0, 1900),
            message_reference: {
              message_id: nextMsg.id,
              channel_id: channel.id,
              guild_id: GUILD_ID,
            },
            allowed_mentions: { parse: [] },
          })
        } finally {
          inFlightChannels.delete(channel.id)
        }
      }
    } catch (err: any) {
      console.error('[iris-discord-bridge] loop error:', err?.message || err)
    }

    await new Promise(resolve => setTimeout(resolve, POLL_MS))
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
