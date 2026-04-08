"use client"

import { useEffect, useMemo, useState } from "react"
import { Mic, Play, Sparkles, Volume2, Wand2, AlertCircle, CheckCircle2, Radio } from "lucide-react"

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

const TEST_SCRIPTS = [
  "Christian, the signal is clean. Kal Obsidian is online.",
  "Mission Control is stable. I am ready to move.",
  "Good. The circuit holds. Let us build something dangerous and elegant.",
]

async function loadVoices() {
  const response = await fetch("/api/admin/elevenlabs/voices", {
    method: "GET",
    cache: "no-store",
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || "Failed to load ElevenLabs voices")
  return Array.isArray(data.voices) ? data.voices as VoiceProfile[] : []
}
export function ElevenLabsVoiceLab() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [error, setError] = useState<string>("")
  const [voices, setVoices] = useState<VoiceProfile[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")
  const [testText, setTestText] = useState(TEST_SCRIPTS[0])
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        setStatus("loading")
        setError("")
        const loadedVoices = await loadVoices()
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
      const response = await fetch("/api/admin/elevenlabs/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          <p className="text-sm text-gray-400 mt-1">Voice Lab now uses the server-side ElevenLabs key path, so you can audition voices without unlocking the full vault.</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div className="flex items-center justify-end gap-1.5 text-emerald-300">
            <Radio className="w-3.5 h-3.5" /> Direct voice testing
          </div>
          <p className="mt-1">No manual script needed</p>
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
          <div className="flex flex-wrap gap-2">
            {TEST_SCRIPTS.map(script => (
              <button
                key={script}
                type="button"
                onClick={() => setTestText(script)}
                className={`rounded-full border px-3 py-1 text-xs ${testText === script ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200" : "border-white/10 bg-black/20 text-gray-300"}`}
              >
                {script}
              </button>
            ))}
          </div>
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
