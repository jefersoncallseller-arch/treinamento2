// api/falar.js — Vercel Serverless Function (Node)
// Recebe { text, voice } e gera voz natural (PT-BR) via ElevenLabs.
// A chave nunca vai pro navegador — fica só na env var ELEVENLABS_API_KEY.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voice } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "text ausente" });
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "ELEVENLABS_API_KEY não configurada" });
  }

  // Vozes padrão do ElevenLabs (dá pra trocar pelas env vars por gênero).
  const VF = process.env.ELEVENLABS_VOICE_F || "EXAVITQu4vr4xnSDxMaL"; // Sarah (fem) — premade, ok no plano free
  const VM = process.env.ELEVENLABS_VOICE_M || "JBFqnCBsd6RMkjVDRZzb"; // George (masc) — premade, ok no plano free
  const voiceId = voice === "m" ? VM : VF;

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.slice(0, 1500),
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
        }),
      }
    );

    if (!r.ok) {
      const detalhe = await r.text();
      return res.status(r.status).json({ error: "ElevenLabs falhou", detalhe });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
