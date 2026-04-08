import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const apiKey = body?.apiKey as string | undefined

    if (!apiKey) {
      return NextResponse.json({ error: "Missing apiKey" }, { status: 400 })
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: data?.detail?.message || data?.detail || data?.error || "Failed to load ElevenLabs voices" }, { status: response.status })
    }

    const voices = Array.isArray(data?.voices)
      ? data.voices.map((voice: any) => ({
          voiceId: voice.voice_id,
          name: voice.name,
          labels: voice.labels || {},
          previewUrl: voice.preview_url || null,
          description: voice.description || null,
          category: voice.category || null,
        }))
      : []

    return NextResponse.json({ voices })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
  }
}
