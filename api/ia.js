// api/ia.js — Vercel Serverless Function (Node)
// Recebe { system, messages } do frontend e chama o Groq com a chave server-side.
// A chave NUNCA vai pro navegador — fica só na env var GROQ_API_KEY.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { system, messages } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages ausente ou inválido" });
  }

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        // Confira o nome do modelo atual no console do Groq e ajuste se precisar.
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages, // já vêm no formato { role: "user"|"assistant", content }
        ],
      }),
    });

    if (!r.ok) {
      const detalhe = await r.text();
      return res.status(r.status).json({ error: "Groq falhou", detalhe });
    }

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
