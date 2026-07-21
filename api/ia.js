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

  const payload = {
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      ...messages, // já vêm no formato { role: "user"|"assistant", content }
    ],
  };

  try {
    // até 3 tentativas: repete se der 429/5xx OU se a resposta vier vazia
    let text = "", lastStatus = 0, lastDetail = "";
    for (let tent = 0; tent < 3; tent++) {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        lastStatus = r.status; lastDetail = (await r.text()).slice(0, 200);
        if (r.status !== 429 && r.status < 500) return res.status(r.status).json({ error: "Groq falhou", detalhe: lastDetail });
        await new Promise((res2) => setTimeout(res2, 1500));
        continue;
      }
      const data = await r.json();
      text = (data.choices?.[0]?.message?.content ?? "").trim();
      if (text) break;
    }
    if (!text && lastStatus) return res.status(lastStatus).json({ error: "Groq falhou", detalhe: lastDetail });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
