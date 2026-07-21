// api/transcrever.js — Vercel Serverless Function (Node)
// Recebe { audio: base64, mime } do frontend e transcreve com o Groq Whisper.
// A chave nunca vai pro navegador — fica só na env var GROQ_API_KEY.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { audio, mime } = req.body || {};
  if (!audio) {
    return res.status(400).json({ error: "audio ausente" });
  }

  try {
    const buf = Buffer.from(audio, "base64");
    const form = new FormData();
    form.append("file", new Blob([buf], { type: mime || "audio/webm" }), "audio.webm");
    form.append("model", "whisper-large-v3");
    form.append("language", "pt");
    form.append("temperature", "0");

    const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: form,
    });

    if (!r.ok) {
      const detalhe = await r.text();
      return res.status(r.status).json({ error: "Groq Whisper falhou", detalhe });
    }

    const data = await r.json();
    return res.status(200).json({ text: (data.text || "").trim() });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
