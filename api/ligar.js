// api/ligar.js — Vercel Serverless Function (Node)
// Faz TUDO numa viagem só: recebe o áudio do vendedor, transcreve (Whisper turbo)
// e já pega a resposta do cliente (LLM). Reduz a latência da ligação ao vivo.

const GROQ = "https://api.groq.com/openai/v1";

async function transcrever(key, audioB64, mime) {
  const buf = Buffer.from(audioB64, "base64");
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime || "audio/webm" }), "audio.webm");
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "pt");
  form.append("temperature", "0");
  const r = await fetch(`${GROQ}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!r.ok) throw new Error("whisper " + r.status + " " + (await r.text()).slice(0, 160));
  return ((await r.json()).text || "").trim();
}

async function responder(key, system, messages) {
  const body = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    max_tokens: 220,
    messages: [...(system ? [{ role: "system", content: system }] : []), ...messages],
  });
  let lastErr = "";
  // até 3 tentativas: repete se der 429/5xx OU se a resposta vier vazia
  for (let tent = 0; tent < 3; tent++) {
    const r = await fetch(`${GROQ}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body,
    });
    if (!r.ok) {
      lastErr = "llm " + r.status + " " + (await r.text()).slice(0, 160);
      if (r.status !== 429 && r.status < 500) throw new Error(lastErr);
      await new Promise((res) => setTimeout(res, 1500));
      continue;
    }
    const data = await r.json();
    const txt = (data.choices?.[0]?.message?.content || "").trim();
    if (txt) return txt;
    // veio vazio — tenta de novo
  }
  throw new Error(lastErr || "resposta vazia");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { audio, mime, system, messages } = req.body || {};
  if (!audio) return res.status(400).json({ error: "audio ausente" });
  if (!Array.isArray(messages)) return res.status(400).json({ error: "messages inválido" });
  const key = process.env.GROQ_API_KEY;
  try {
    const texto = await transcrever(key, audio, mime);
    if (!texto) return res.status(200).json({ texto: "", reply: "" });
    const reply = await responder(key, system, [...messages, { role: "user", content: texto }]);
    return res.status(200).json({ texto, reply });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
