"use client"

import { useEffect, useMemo, useState } from "react"
import { Mic, Play, Sparkles, Volume2, Wand2, AlertCircle, CheckCircle2, Lock } from "lucide-react"
import { vaultClient } from "@/skills/credential-vault/lib/client"

type VaultField = {
  name: string
  value: string
  updatedAt?: string
}

type VoiceProfile = {
  voiceId: string
  name: string
  labels?: Record<string, string>
  previewUrl?: string | null
  description?: string | null
  category?: string | null
}

const ELEVENLABS_PROVIDER_CANDIDATES = ["elevenlabs", "11labs"]
const ELEVENLABS_FIELD_CANDIDATES = ["api_key", "elevenlabs_api_key", "key", "secret_key"]
const ELEVENLABS_ACCOUNT_CANDIDATES = ["ElevenLabs", "11labs", "Kal Voice", "Kal Obsidian"]

const defaultPrompt = `You are Kal Obsidian, a sleek digital sorcerer with cyberpunk noir energy. Voice should feel confident, strategic, calm, masculine, and slightly mysterious. Avoid sounding like a cartoon villain. Aim for polished founder-operator energy with clear diction and a subtle edge.`

async function loadElevenLabsKey() {
  for (const provider of ELEVENLABS_PROVIDER_CANDIDATES) {
    try {
      const accounts = await vaultClient.listAccounts(provider)
      const orderedAccounts = [
        ...ELEVENLABS_ACCOUNT_CANDIDATES.filter(candidate => accounts.includes(candidate)),
        ...accounts.filter(account => !ELEVENLABS_ACCOUNT_CANDIDATES.includes(account)),
      ]

      for (const account of orderedAccounts) {
        const fields = await vaultClient.getFields(provider, account)
        const match = fields.find(field => ELEVENLABS_FIELD_CANDIDATES.includes(field.name.toLowerCase()))
        if (match?.value) {
          return { provider, account, field: match }
        }
      }
    } catch {
      // ignore missing provider and continue hunting
    }
  }

  throw new Error("No ElevenLabs API key found in the vault. Add provider 'elevenlabs' with an 'api_key' field first.")
}

export function ElevenLabsVoiceLab() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [error, setError] = useState<string>("")
  const [vaultSource, setVaultSource] = useState<{ provider: string; account: string; field: VaultField } | null>(null)
  const [voices, setVoices] = useState<VoiceProfile[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")
  const [testText, setTestText] = useState("Christian, the signal is clean. Kal Obsidian is online and the voice circuit is stable.")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      if (!vaultClient.isUnlocked()) {
        setStatus("error")
        setError("Unlock the Credential Vault first, then return here.")
        return
      }

      try {
        setStatus("loading")
        setError("")
        const source = await loadElevenLabsKey()
        if (cancelled) return
        setVaultSource(source)

        const response = await fetch("/api/admin/elevenlabs/voices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: source.field.value }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || "Failed to load ElevenLabs voices")

        const loadedVoices = Array.isArray(data.voices) ? data.voices : []
        if (cancelled) return
        setVoices(loadedVoices)
        setSelectedVoiceId(loadedVoices[0]?.voiceId || "")
        setStatus("ready")
      } catch (err) {
        if (cancelled) return
        setStatus("error")
        setError(err instanceof Error ? err.message : "Failed to load ElevenLabs")
      }
    }

    boot()
    return () => { cancelled = true }
  }, [])

  const selectedVoice = useMemo(() => voices.find(voice => voice.voiceId === selectedVoiceId) || null, [voices, selectedVoiceId])

  const handleGeneratePreview = async () => {
    if (!selectedVoiceId) {
      setError("Choose a voice first.")
      return
    }

    try {
      setGenerating(true)
      setError("")
      const source = vaultSource || await loadElevenLabsKey()
      const response = await fetch("/api/admin/elevenlabs/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: source.field.value,
          voiceId: selectedVoiceId,
          text: testText,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Failed to synthesize preview")
      setPreviewUrl(data.audioUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to synthesize preview")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs uppercase tracking-[0.2em] mb-2">
            <Sparkles className="w-4 h-4" />
            Voice Lab
          </div>
          <h3 className="text-xl font-semibold text-white">ElevenLabs Voice Forge</h3>
          <p className="text-sm text-gray-400 mt-1">Pulls the API key from Credential Vault, lists available voices, and lets us audition Kal’s signal.</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div className="flex items-center justify-end gap-1.5 text-emerald-300">
            <Lock className="w-3.5 h-3.5" /> Vault-routed
          </div>
          {vaultSource && <p className="mt-1">{vaultSource.provider} / {vaultSource.account}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-medium"><Mic className="w-4 h-4 text-cyan-300" /> Voice target</div>
          <textarea
            value={defaultPrompt}
            readOnly
            className="w-full min-h-[120px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-300"
          />
          <p className="text-xs text-gray-500">Next step after this panel: clone or craft a custom Kal voice with samples.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-medium"><Wand2 className="w-4 h-4 text-fuchsia-300" /> Status</div>
          {status === "loading" && <p className="text-sm text-gray-300">Scrying the ElevenLabs voice list...</p>}
          {status === "ready" && (
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="w-4 h-4" /> Voice circuit linked</p>
              <p className="text-gray-400">{voices.length} voices detected in the account.</p>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-2 text-sm text-rose-300">
              <p className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <label className="block text-sm font-medium text-white">Available voices</label>
          <select
            value={selectedVoiceId}
            onChange={e => setSelectedVoiceId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            disabled={status !== "ready" || voices.length === 0}
          >
            {voices.length === 0 ? (
              <option value="">No voices found</option>
            ) : voices.map(voice => (
              <option key={voice.voiceId} value={voice.voiceId}>{voice.name}</option>
            ))}
          </select>

          {selectedVoice && (
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-gray-300 space-y-1">
              <p><span className="text-gray-500">Category:</span> {selectedVoice.category || "n/a"}</p>
              {selectedVoice.description && <p>{selectedVoice.description}</p>}
              {selectedVoice.labels && Object.keys(selectedVoice.labels).length > 0 && (
                <p><span className="text-gray-500">Labels:</span> {Object.entries(selectedVoice.labels).map(([k, v]) => `${k}: ${v}`).join(" • ")}</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <label className="block text-sm font-medium text-white">Preview script</label>
          <textarea
            value={testText}
            onChange={e => setTestText(e.target.value)}
            className="w-full min-h-[120px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-200"
          />
          <button
            onClick={handleGeneratePreview}
            disabled={generating || status !== "ready" || !selectedVoiceId}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-200 border border-cyan-400/30 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {generating ? "Forging preview..." : "Generate preview"}
          </button>
          {previewUrl && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-sm text-white"><Volume2 className="w-4 h-4 text-emerald-300" /> Preview ready</div>
              <audio controls src={previewUrl} className="w-full" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ElevenLabsVoiceLab
