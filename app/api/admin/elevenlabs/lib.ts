export function getElevenLabsApiKey() {
  const direct = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY
  if (direct) return direct

  throw new Error("Missing ElevenLabs server key. Set ELEVENLABS_API_KEY in Vercel project env vars.")
}
