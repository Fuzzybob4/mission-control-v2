import TelegramBot from 'node-telegram-bot-api'
import { z } from 'zod'
import { vault, initializeSupabase } from '../skills/credential-vault/lib/encryption'

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  TELEGRAM_BOT_TOKEN: z.string().min(10),
  TELEGRAM_ALLOWED_USER_IDS: z.string().optional(),
  TELEGRAM_ALLOWED_USERNAME: z.string().optional(),
  VAULT_PIN: z.string().min(4).optional()
})

const env = envSchema.parse(process.env)

const allowedIds = env.TELEGRAM_ALLOWED_USER_IDS
  ? env.TELEGRAM_ALLOWED_USER_IDS.split(',').map(id => id.trim()).filter(Boolean)
  : []
const allowedUsername = env.TELEGRAM_ALLOWED_USERNAME?.toLowerCase()
const VAULT_PIN = env.VAULT_PIN ?? '2846'

initializeSupabase(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: true })

interface ConversationState {
  stage: 'provider' | 'account' | 'fields'
  provider?: string
  account?: string
  fields: Record<string, string>
}

const conversations = new Map<number, ConversationState>()

async function ensureVaultUnlocked() {
  if (!vault.isUnlocked() || vault.isSessionExpired()) {
    console.log('[telegram-key-ingest] Unlocking vault session')
    const result = await vault.unlock(VAULT_PIN)
    if (!result.success) {
      throw new Error(result.message || 'Failed to unlock vault')
    }
  }
}

function isUserAllowed(msg: TelegramBot.Message) {
  const userId = msg.from?.id ? String(msg.from.id) : null
  const username = msg.from?.username?.toLowerCase()
  if (!userId) return false
  if (allowedIds.length > 0 && !allowedIds.includes(userId)) return false
  if (allowedUsername && username !== allowedUsername) return false
  return true
}

function resetConversation(userId: number) {
  conversations.delete(userId)
}

function startConversation(chatId: number, userId: number) {
  const state: ConversationState = { stage: 'provider', fields: {} }
  conversations.set(userId, state)
  bot.sendMessage(chatId, '🔑 Let\'s add a new credential. First, send the *provider name* (e.g., GitHub, Supabase).', {
    parse_mode: 'Markdown'
  })
}

function handleFieldInput(state: ConversationState, text: string, chatId: number) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  let added = 0

  for (const line of lines) {
    const match = line.match(/^([^:=]+)\s*[:=]\s*(.+)$/)
    if (!match) {
      bot.sendMessage(chatId, `⚠️ Could not parse “${line}”. Use the format *field=value*.`, { parse_mode: 'Markdown' })
      continue
    }

    const field = match[1].trim().toLowerCase().replace(/\s+/g, '_')
    const value = match[2].trim()

    if (!field || !value) {
      bot.sendMessage(chatId, '⚠️ Field name and value are required.', { parse_mode: 'Markdown' })
      continue
    }

    state.fields[field] = value
    added++
  }

  if (added > 0) {
    bot.sendMessage(chatId, `✅ Stored ${added} field${added === 1 ? '' : 's'}. Send more or /done when finished.`)
  }
}

async function finalizeConversation(chatId: number, userId: number) {
  const state = conversations.get(userId)
  if (!state) return

  if (!state.provider || !state.account || Object.keys(state.fields).length === 0) {
    bot.sendMessage(chatId, '⚠️ Need provider, account, and at least one field before saving.')
    return
  }

  try {
    await ensureVaultUnlocked()
    await vault.add(state.provider, state.account, state.fields)
    bot.sendMessage(chatId, `🔐 Saved credentials for *${state.provider} → ${state.account}*.`, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('[telegram-key-ingest] Failed to store credential', error)
    bot.sendMessage(chatId, '❌ Failed to store credential. Check server logs.')
  } finally {
    resetConversation(userId)
  }
}

bot.onText(/\/addkey/i, msg => {
  if (!isUserAllowed(msg)) {
    bot.sendMessage(msg.chat.id, '🚫 You are not authorized to add credentials.')
    return
  }

  const userId = msg.from!.id
  startConversation(msg.chat.id, userId)
})

bot.onText(/\/cancel/i, msg => {
  if (!isUserAllowed(msg)) return
  const userId = msg.from!.id
  if (conversations.has(userId)) {
    resetConversation(userId)
    bot.sendMessage(msg.chat.id, '🛑 Cancelled. Nothing was saved.')
  } else {
    bot.sendMessage(msg.chat.id, 'There is no active credential entry.')
  }
})

bot.onText(/\/done/i, msg => {
  if (!isUserAllowed(msg)) return
  const userId = msg.from!.id
  if (!conversations.has(userId)) {
    bot.sendMessage(msg.chat.id, 'No active credential entry. Send /addkey to begin.')
    return
  }
  finalizeConversation(msg.chat.id, userId)
})

bot.on('message', msg => {
  if (!isUserAllowed(msg)) return
  if (!msg.text || msg.text.startsWith('/')) return

  const userId = msg.from!.id
  const state = conversations.get(userId)
  if (!state) return

  if (state.stage === 'provider') {
    state.provider = msg.text.trim()
    state.stage = 'account'
    bot.sendMessage(msg.chat.id, '👤 Got it. Now send the *account or environment name* (e.g., Production, Cristian Personal).', { parse_mode: 'Markdown' })
    return
  }

  if (state.stage === 'account') {
    state.account = msg.text.trim()
    state.stage = 'fields'
    bot.sendMessage(
      msg.chat.id,
      '✍️ Send credentials as `field=value`. You can send multiple lines per message. When you\'re finished, send /done.',
      { parse_mode: 'Markdown' }
    )
    return
  }

  if (state.stage === 'fields') {
    handleFieldInput(state, msg.text, msg.chat.id)
  }
})

process.on('SIGINT', () => {
  console.log('\n[telegram-key-ingest] Shutting down...')
  bot.stopPolling()
  process.exit(0)
})
