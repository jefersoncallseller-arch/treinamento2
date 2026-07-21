# Site de Treinamento — Crossell / CallSeller

> No ar em https://site-treinamento.vercel.app — deploy automático via Vercel a cada push na `main`.

Site com 3 abas:
- **Treinamento** — o guia completo de crossell (material).
- **Fazer o treino** — roleplay com IA cliente + avaliação com nota.
- **Ligações** — gravações pra escutar, com transcrição.

Stack: Vite + React (frontend) e uma função serverless em `api/ia.js` que
chama o **Groq** com a chave server-side (a chave nunca vai pro navegador).

## Rodar local

```bash
npm install
# copie .env.example para .env e coloque sua GROQ_API_KEY
npm run dev        # abas de conteúdo
# para testar o roleplay (usa /api/ia), rode com a CLI da Vercel:
npm i -g vercel
vercel dev
```

## Deploy na Vercel

1. `git init && git add . && git commit -m "primeiro commit"` e push pro GitHub.
2. Na Vercel: Add New > Project > importar o repo (detecta Vite sozinho).
3. Em Environment Variables, adicionar `GROQ_API_KEY`.
4. Deploy. Cada push na `main` republica automático.

> Ajuste o nome do modelo em `api/ia.js` conforme o que estiver disponível
> no seu console do Groq.
