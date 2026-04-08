import { NextRequest, NextResponse } from "next/server"
import { getElevenLabsApiKey } from "../lib"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const apiKey = getElevenLabsApiKey()
    const voiceId = body?.voiceId as string | undefined
    const text = body?.text as string | undefined

    if (!voiceId || !text) {
      return NextResponse.json({ error: "Missing voiceId or text" }, { status: 400 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.72,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => "")
      return NextResponse.json({ error: errText || "Failed to generate ElevenLabs preview" }, { status: response.status })
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer())
    const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`

    return NextResponse.json({ audioUrl })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 })
  }
}
