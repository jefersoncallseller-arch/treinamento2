import { useState, useRef, useEffect } from "react";

/* ==================================================================
   SITE DE TREINAMENTO — CROSSELL / CALLSELLER  (protótipo)
   Abas: Treinamento (material) · Fazer o treino (roleplay IA) · Ligações
   ================================================================== */

/* ------------------------- CONTEÚDO DO MÉTODO ------------------------- */

const PILARES = [
  ["1", "Você é o especialista", "O cliente te vê como um amigo entendido, genuinamente interessado no problema dele — não como quem só quer vender. Especialista pergunta antes de falar."],
  ["2", "O produto é forte", "Ele precisa sentir: “eu preciso muito disso”. Um dos principais tratamentos do Brasil pra aquele problema, indicado por especialistas."],
  ["3", "A empresa é sólida", "Mais de 10 mil pacientes por dia, sem reclamação na internet, acompanhamento durante todo o tratamento. Tira o medo de golpe."],
  ["4", "A garantia elimina o risco", "30 dias de garantia (a lei exige só 7). O argumento mais poderoso: “você não tem nada a perder”."],
];

const VIRADA = [
  ["“Preciso fechar essa venda.”", "“Preciso garantir que esse paciente tenha resultado.”"],
  ["Foco no pedido / na comissão.", "Foco na pessoa e na dor dela."],
  ["Ofereço o produto logo de cara.", "Confirmo o pedido, entendo a dor, explico o tratamento — e SÓ DEPOIS conecto a oferta ao modo de uso."],
  ["Pressão e urgência de compra.", "Autoridade calma de quem orienta um tratamento de saúde."],
  ["Sou vendedor.", "Sou especialista / consultor — aliado, não quem empurra."],
  ["Se resiste, insisto no mesmo argumento.", "Se resiste, acolho, entendo a dor de novo e devolvo com valor."],
];

const ETAPAS_FULL = [
  { n: "1", nome: "Abordagem e confirmação do pedido",
    objetivo: "Abrir com um motivo natural e desarmar o cliente. O motivo NÃO é vender — é confirmar o pedido e o endereço. Isso é verdade e deixa ele relaxado.",
    falar: ["“Olá, falo com o(a) Sr(a). [Nome]? Aqui é o(a) [seu nome], especialista aqui da [empresa]. Tudo bem?”", "“Seu pedido do [produto] já foi confirmado. Antes de liberar a entrega eu só preciso confirmar rapidinho seu endereço e te passar as orientações certas do tratamento. Pode ser?”"],
    erro: "Chegar oferecendo produto (“tenho uma oferta pra você”). Isso liga o alarme de vendedor na hora." },
  { n: "2", nome: "Diagnóstico — faça o cliente falar da dor",
    objetivo: "Construir a necessidade. Você faz o cliente VERBALIZAR o problema que o levou a comprar. Quanto mais ele fala da dor, mais fácil a venda.",
    falar: ["“Me conta, o que te levou a procurar esse tratamento? Há quanto tempo você sente isso?”", "“E isso te atrapalha no dia a dia? Como?”", "“Você já tentou alguma outra coisa antes?”"],
    erro: "Fazer as perguntas no automático sem ouvir. Esta etapa é de ESCUTA: fale menos, ouça mais." },
  { n: "3", nome: "Explicação do problema — eduque o cliente",
    objetivo: "Fazer o cliente entender que o que ele tem tem solução, mas exige atenção e o tratamento correto — não é qualquer coisa.",
    falar: ["“Pelo que você me contou, isso costuma acontecer por [causa]. Tem solução sim, mas o segredo é fazer o tratamento certo e completo — quando a pessoa faz pela metade, o resultado não vem e ela acha que não tem jeito. E tem.”"],
    erro: "Pular essa etapa e ir direto pro produto. Sem ela, o produto vira só um item à venda." },
  { n: "4", nome: "Modo de uso do produto que ele já comprou",
    objetivo: "Entregar valor de verdade orientando o uso do que ele comprou. Aqui você reforça a autoridade e prepara o terreno pra ponte.",
    falar: ["“Deixa eu te orientar como usar certinho. O [produto] você vai tomar [modo de uso]. Ele age [benefício]. Fazendo assim, em [tempo] você já começa a sentir [resultado].”"],
    erro: "Ser raso aqui. Quanto mais seguro e detalhado no modo de uso, mais autoridade — e mais fácil a próxima etapa." },
  { n: "5", nome: "A ponte — o modo de uso dos DOIS juntos (nasce o crossell)",
    objetivo: "Explicar o uso do que ele comprou EM CONJUNTO com o complementar, como um protocolo único. Assim o complementar parece parte natural do tratamento.",
    falar: ["Comprou cápsulas → oferece gotas (“absorção mais rápida”). Comprou gotas → oferece cápsulas (“ação mais prolongada”).", "“Pra ter o resultado completo, o ideal é usar junto com [complementar]. Um age [de um jeito] e o outro [potencializa]. Você usa um de manhã e o outro à noite, um puxa o resultado do outro.”"],
    erro: "Apresentar o complementar como “uma oferta”. Ele entra DENTRO da orientação de uso, como parte do protocolo." },
  { n: "6", nome: "A oferta e o fechamento",
    objetivo: "Se as 5 etapas foram bem feitas, o cliente já chega querendo. Agora é apresentar a condição e conduzir com naturalidade, com garantia e escassez.",
    falar: ["“O [complementar] hoje sai por 12x de R$ 24 — menos de R$ 1 por dia. E você tem 30 dias de garantia: testa com calma, se não for o que esperava, não paga mais nada.”", "“O estoque tá reduzido porque a matéria-prima é importada. Pra você não ficar sem no meio do tratamento, posso já deixar garantido?”"],
    erro: "Desistir no primeiro “não”. Fallback: se resistir ao completo, ofereça ao menos UM frasco pra começar certo." },
];

const OBJECOES = [
  ["“Não vi esse produto no site.”", "“Faz sentido — ele fica na aba de tratamentos complementares, que aparece pra quem já é paciente e está iniciando, como você. É justamente o protocolo indicado pra fazer do jeito certo desde o início.”"],
  ["“Tá caro / não tenho condições agora.”", "Reforce o valor (principal tratamento do Brasil, indicado por especialistas) e quebre o preço: “12x de R$ 24, menos de R$ 1 por dia.” Se persistir, use o fallback do frasco único."],
  ["“Já comprei bastante, já gastei.”", "“Justamente por isso não quero que você gaste à toa. O que você comprou sozinho não completa o tratamento — sem o complementar você para no meio e o dinheiro que já colocou acaba não valendo. É pra garantir o que você já começou.”"],
  ["“Vou pensar / depois eu vejo.”", "“Entendo. Mas com o estoque reduzido não consigo te garantir o preço nem o produto depois. Deixa eu ao menos garantir o seu agora pra você não parar no meio? Você testa com os 30 dias de garantia, sem risco.”"],
  ["“Só quero cápsula (ou só gotas).”", "“Na verdade os dois se completam: gotas têm absorção rápida, cápsula ação prolongada — juntos potencializam. Não é trocar um pelo outro, é usar os dois. É assim que o protocolo funciona pra quem quer resultado de verdade.”"],
  ["“Preciso falar com meu esposo(a)/filho(a).”", "“Claro, é uma decisão sua de saúde. E você tem 30 dias de garantia — se depois decidirem que não é pra você, é só avisar e não paga nada. Como o estoque tá acabando, deixa eu garantir agora pra não faltar, e você resolve com calma dentro do prazo?”"],
  ["“E se não funcionar comigo?”", "“Por isso a gente dá 30 dias de garantia (a lei exige só 7). São mais de 10 mil pacientes por dia com acompanhamento e nenhuma reclamação. Você não tem risco nenhum de testar.”"],
  ["“Não confio, parece golpe.”", "“Entendo total, ainda bem que você tem esse cuidado. Somos uma empresa que atende mais de 10 mil pacientes por dia, com acompanhamento e 30 dias de garantia. Seu pedido já está confirmado, é por isso que estou te ligando pra orientar direitinho.”"],
  ["(Silêncio / “sei não…”)", "Volte pra dor: “Aquela dor que você me falou, você quer resolver de vez ou conviver com ela mais um tempo? O caminho pra resolver é esse aqui, e você faz sem risco nenhum por 30 dias.”"],
];

const NAO_FAZER = [
  "Não abra oferecendo produto. Abre confirmando pedido e endereço.",
  "Não pule o diagnóstico. Sem a dor na mesa, a oferta vira empurra-empurra.",
  "Não fale preço antes de construir valor. Primeiro dor + tratamento, depois preço.",
  "Não trate como venda, trate como consulta.",
  "Não discuta a objeção. Acolha (“faz sentido”) e devolva com valor.",
  "Não apresente o complementar como segunda venda — ele entra no modo de uso.",
  "Não desligue no primeiro “não”. Sempre ofereça ao menos um frasco.",
  "Não corra. Pressa é sinal de vendedor. Calma é sinal de autoridade.",
];

const COLA_ETAPAS = [
  ["1 · Abordagem", "Confirmar pedido + endereço (esse é o motivo da ligação)."],
  ["2 · Diagnóstico", "Fazer o cliente falar da dor. Escutar."],
  ["3 · Explicação", "“Tem solução, mas exige o tratamento certo e completo.”"],
  ["4 · Modo de uso", "Orientar o produto que ele comprou. Mostrar autoridade."],
  ["5 · Ponte", "Modo de uso dos DOIS juntos → nasce o crossell."],
  ["6 · Oferta", "12x R$24 + garantia 30 dias + escassez. Resistiu? 1 frasco."],
];

const RODADAS = [
  ["Rodada 1 — só as etapas", "Ligação fingida seguindo as 6 etapas na ordem, sem objeção. Grave a sequência na cabeça."],
  ["Rodada 2 — a ponte", "Treine só a Etapa 5 até sair natural, sem parecer oferta."],
  ["Rodada 3 — objeções", "O colega joga objeções e você responde com Acolher → Devolver. Repita até não travar."],
  ["Rodada 4 — ligação inteira", "Do “olá” ao fechamento, com objeção no meio. Grave e ouça: soou como especialista ou vendedor?"],
];

/* ------------------------- LIGAÇÕES (exemplos) ------------------------- */

const LIGACOES = [
  {
    id: "l1", titulo: "Articulação — a ligação modelo do guia", cliente: "Dona Maria",
    tipo: "Crossell", resultado: "Fechou", dur: "3:58", modelo: true,
    resumo: "As 6 etapas encaixadas numa conversa real. Repare: o vendedor nunca disse “tenho uma oferta” — a gota apareceu dentro do tratamento.",
    transcript: [
      ["V", "Olá, falo com a Dona Maria? Aqui é o Lucas, especialista aqui da empresa, tudo bem?"],
      ["C", "Tudo, e você?"],
      ["V", "Tudo ótimo! Dona Maria, tô ligando porque seu pedido do produto pra articulação já foi confirmado. Antes de liberar a entrega eu só preciso confirmar rapidinho seu endereço e te passar as orientações certas do tratamento, pode ser?"],
      ["C", "Pode sim."],
      ["V", "Seu endereço é Rua tal, número tal, certo? Perfeito. Me conta uma coisa, o que te levou a procurar esse tratamento? Faz tempo que você sente essa dor?"],
      ["C", "Ah, faz uns dois anos, é no joelho, dói pra subir escada..."],
      ["V", "Entendi. E isso te atrapalha bastante no dia a dia? De fazer as coisas de casa, sair?"],
      ["C", "Atrapalha, às vezes nem saio direito."],
      ["V", "Poxa. Olha, Dona Maria, o que você tem é bem comum e tem solução sim, viu? Mas o segredo é fazer o tratamento certo e completo — muita gente faz pela metade, o resultado demora, e acha que não tem jeito. E tem. Deixa eu te orientar: o produto a senhora vai tomar certinho, ele age reduzindo a inflamação da articulação. Fazendo assim a senhora já começa a sentir alívio em algumas semanas."],
      ["C", "Ah que bom."],
      ["V", "E olha, pra ter o resultado completo mesmo, o ideal é usar junto com a versão em gotas. A cápsula age de forma mais prolongada e a gota tem absorção mais rápida, alivia mais rápido. A senhora usa uma de manhã e a outra à noite, uma puxa o resultado da outra. É assim que a gente indica pra quem quer resolver de vez."],
      ["C", "Mas eu só comprei as cápsulas..."],
      ["V", "Isso, e a senhora fez certo em começar. As gotas entram justamente pra completar o tratamento. E pra ficar tranquilo no bolso, saem por 12x de R$ 24 — menos de R$ 1 por dia. E a senhora ainda tem 30 dias de garantia: testa com calma, se não for o que esperava, não paga mais nada. Só adianto que o estoque tá reduzido porque a matéria-prima é importada. Pra senhora não ficar sem no meio do tratamento, posso já deixar garantido?"],
      ["C", "Ah... acho que sim, né."],
      ["V", "Perfeito, Dona Maria, fez a escolha certa pra sua saúde. Vou deixar tudo certinho pra senhora começar o tratamento completo."],
    ],
  },
  {
    id: "l2", titulo: "Sono — boa ponte, fechou no fallback", cliente: "Seu Ademar",
    tipo: "Crossell", resultado: "Fechou", dur: "5:12",
    resumo: "Cliente resistente (“já gastei”). O vendedor acolheu, voltou pra dor e fechou com um frasco.",
    transcript: [
      ["V", "Seu Ademar? Aqui é o Rafael, especialista da empresa. Seu pedido do tratamento pro sono já foi confirmado, só preciso confirmar seu endereço e te orientar o uso, tudo bem?"],
      ["C", "Tá, mas já comprei, já gastei bastante nisso."],
      ["V", "Entendo, e é justamente por isso que eu não quero que você gaste à toa. Deixa eu te perguntar: faz tempo que o senhor não dorme direito?"],
      ["C", "Uns meses, acordo três, quatro vezes de noite."],
      ["V", "[...continua diagnóstico, explicação, modo de uso e ponte...]"],
      ["V", "Então vamos fazer assim: pra você ao menos iniciar do jeito certo, eu incluo um frasco pra começar o tratamento como indicado. Melhor começar certo do que pela metade, concorda?"],
      ["C", "Isso eu consigo, pode mandar um."],
    ],
  },
  {
    id: "l3", titulo: "Próstata — falou preço cedo (o que evitar)", cliente: "Seu Nilton",
    tipo: "Crossell", resultado: "Não fechou", dur: "2:41", alerta: true,
    resumo: "Exemplo de erro: o vendedor jogou o preço antes de construir dor e valor. O cliente esfriou e foi pro “vou pensar”.",
    transcript: [
      ["V", "Seu Nilton? Tenho uma oferta especial de um complementar por 12x de R$ 24 que combina com o que você comprou."],
      ["C", "Ah não, nem vi isso no site. Vou pensar."],
      ["V", "Mas é só hoje esse preço..."],
      ["C", "Depois eu vejo. Obrigado."],
    ],
  },
  {
    id: "l4", titulo: "Recuperação de abandono (a outra demanda)", cliente: "Cliente novo",
    tipo: "Abandono", resultado: "—", dur: "4:30",
    resumo: "Referência do tipo de ligação que o vendedor já fazia — pra sentir a diferença de postura em relação ao crossell.",
    transcript: [
      ["V", "Oi, tudo bem? Vi que você começou a comprar no nosso site e não finalizou..."],
      ["C", "É, fiquei na dúvida ainda."],
      ["V", "[...abordagem de recuperação — convencer alguém que ainda NÃO comprou...]"],
    ],
  },
];

/* ------------------------- ROLEPLAY: MÉTODO + PROMPTS ------------------------- */

const METODO = `MÉTODO DE CROSSELL DA CALLSELLER (nutracêuticos — cliente JÁ comprou).
Regra do complementar: quem comprou CÁPSULAS recebe oferta de GOTAS (absorção mais rápida); quem comprou GOTAS recebe CÁPSULAS (ação mais prolongada).
AS 6 ETAPAS: 1) Abordagem+confirmação do pedido/endereço (nunca abrir com "oferta"). 2) Diagnóstico (fazer falar da dor). 3) Explicação do problema ("tem solução, mas exige tratamento certo e completo"). 4) Modo de uso do que comprou. 5) Ponte: uso dos DOIS juntos, complementar como protocolo (não "oferta"). 6) Oferta+fechamento: 12x R$24 + garantia 30 dias + escassez real; fallback 1 frasco.
4 PILARES: Especialista · Produto (dos melhores do Brasil) · Empresa (+10 mil/dia, sem reclamação) · Garantia (30 dias, risco zero).
OBJEÇÃO: Acolher → não discutir → devolver com valor.
ERROS: abrir oferecendo; pular diagnóstico; falar preço cedo; tratar como venda; discutir objeção; complementar como 2ª venda; desligar no 1º não; ter pressa.`;

function clientSystem(s) {
  return `${METODO}

VOCÊ É O CLIENTE numa ligação. Você é ${s.persona}. JÁ COMPROU o ${s.produto} em ${s.comprou} — já pagou. Queixa: ${s.dor}. Jeito: ${s.humor}.
Quem ligou é um vendedor que se apresenta como especialista. Você não sabe de método nenhum — é só uma pessoa real no telefone.
- Fale português coloquial do Brasil, falas CURTAS (1–3 frases). Sem narração, sem asteriscos.
- Você não está louco pra comprar mais; já gastou. Fica meio na defensiva, sem ser grosseiro.
- Só esquenta e considera o complementar (${s.complementar}) SE o vendedor fizer o método: confirmar pedido, perguntar da dor e ESCUTAR, explicar o problema, orientar o uso, e trazer o complementar como parte do tratamento. Se ele abrir empurrando oferta, tiver pressa, falar preço cedo ou DISCUTIR sua objeção, você esfria e tende ao "vou pensar".
- Solte objeções reais, uma por vez, na hora natural — suas principais: ${s.objecoes.map((o) => `"${o}"`).join(", ")}. Também: "tá caro", "vou pensar", "preciso falar com meu/minha [cônjuge]", "não vi no site".
- Dificuldade ${s.dificuldade}. Fácil = esquenta rápido, 1 objeção, fecha se razoável. Média = 2 objeções. Difícil = cético, 3+ objeções, só fecha se muito bem feito.
- Decide sozinho se compra, conforme o vendedor merecer. Pode não comprar se ele foi empurrão.
- NUNCA ensine o vendedor, NUNCA saia do personagem, NUNCA diga que é IA nem cite etapas.
Responda agora só como o cliente, com uma fala curta de telefone.`;
}

const EVAL_SYSTEM = `${METODO}

Você é um AVALIADOR. Recebe a transcrição de uma ligação de crossell (V = vendedor, C = cliente) e avalia o VENDEDOR contra o método.
Responda APENAS com JSON válido, sem markdown/crases. Campos curtos (obs até ~12 palavras). Formato:
{"nota":number 0-10 uma decimal,"resumo":"1 frase","etapas":[{"nome":"Abordagem e confirmação","status":"feita|parcial|nao_feita","obs":"curto"},{"nome":"Diagnóstico da dor","status":"...","obs":"..."},{"nome":"Explicação do problema","status":"...","obs":"..."},{"nome":"Modo de uso do produto comprado","status":"...","obs":"..."},{"nome":"A ponte (crossell)","status":"...","obs":"..."},{"nome":"Oferta e fechamento","status":"...","obs":"..."}],"pilares":{"especialista":"sim|parcial|nao","produto":"...","empresa":"...","garantia":"..."},"objecoes":"1 frase","fortes":["curto"],"faltou":["curto"],"dicas":["curto","curto","curto"],"fechou":true|false}`;

const SCENARIOS = [
  { id: "articulacao", emoji: "🦵", titulo: "Dor no joelho", persona: "Dona Cleusa, 58 anos", produto: "tratamento para articulação", comprou: "cápsulas", complementar: "gotas", dor: "dor no joelho há uns 2 anos, dói pra subir escada", dificuldade: "Média", humor: "educada, cansada do problema, receptiva se sentir cuidado", objecoes: ["mas eu só comprei as cápsulas", "vou pensar"] },
  { id: "sono", emoji: "😴", titulo: "Insônia", persona: "Seu Ademar, 63 anos", produto: "tratamento para o sono", comprou: "gotas", complementar: "cápsulas", dor: "não dorme direito há meses, acorda várias vezes", dificuldade: "Difícil", humor: "desconfiado, sente que já gastou", objecoes: ["tá caro", "já gastei bastante", "preciso falar com minha esposa"] },
  { id: "prostata", emoji: "🩺", titulo: "Próstata", persona: "Seu Nilton, 60 anos", produto: "tratamento para a próstata", comprou: "cápsulas", complementar: "gotas", dor: "levanta 3, 4 vezes por noite pra ir ao banheiro", dificuldade: "Difícil", humor: "reservado, cético, não gosta de se sentir empurrado", objecoes: ["vou pensar", "não vi isso no site quando comprei"] },
  { id: "energia", emoji: "⚡", titulo: "Cansaço", persona: "Márcia, 45 anos", produto: "tratamento para energia", comprou: "cápsulas", complementar: "gotas", dor: "vive cansada, sem energia pro dia a dia", dificuldade: "Fácil", humor: "animada e aberta, só precisa de segurança", objecoes: ["tá um pouco caro"] },
  { id: "circulacao", emoji: "🦶", titulo: "Circulação", persona: "Dona Ivone, 67 anos", produto: "tratamento para circulação", comprou: "gotas", complementar: "cápsulas", dor: "pernas inchadas e pesadas no fim do dia", dificuldade: "Média", humor: "simpática mas teimosa, apegada ao que escolheu", objecoes: ["mas eu já escolhi as gotas, só quero elas mesmo"] },
];

async function callClaude({ system, messages }) {
  // Fala com o backend em /api/ia.js, que chama o Groq com a chave server-side.
  const res = await fetch("/api/ia", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  return (data.text || "").trim();
}

const STATUS_META = {
  feita: { label: "Feita", color: "var(--good)", bg: "rgba(134,176,73,.14)" },
  parcial: { label: "Parcial", color: "var(--warn)", bg: "rgba(224,164,88,.16)" },
  nao_feita: { label: "Não feita", color: "var(--bad)", bg: "rgba(201,85,74,.16)" },
  sim: { label: "Sim", color: "var(--good)", bg: "rgba(134,176,73,.14)" },
  nao: { label: "Não", color: "var(--bad)", bg: "rgba(201,85,74,.16)" },
};
const diffColor = (d) => (d === "Fácil" ? "var(--good)" : d === "Média" ? "var(--warn)" : "var(--bad)");

/* ============================== APP SHELL ============================== */

const TABS = [
  ["treinamento", "Treinamento", "📚"],
  ["roleplay", "Fazer o treino", "🎯"],
  ["ligacoes", "Ligações", "🎧"],
];

export default function App() {
  const [view, setView] = useState("treinamento");
  return (
    <div className="tr-root">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" width="44" height="44" alt="CallSeller" />
          <div className="brand-text">
            <div className="brand-title">Central Ligações <span>CallSeller</span></div>
            <div className="brand-sub">Treinamento de Crossell · time de vendas</div>
          </div>
        </div>
        <div className="tabs">
          {TABS.map(([k, label, ico]) => (
            <button key={k} className={`tab ${view === k ? "active" : ""}`} onClick={() => setView(k)}>
              <span className="tab-ico">{ico}</span>{label}
            </button>
          ))}
        </div>
      </nav>
      {view === "treinamento" && <Material go={setView} />}
      {view === "roleplay" && <RoleplayView />}
      {view === "ligacoes" && <Ligacoes />}
    </div>
  );
}

/* ============================== MATERIAL ============================== */

const SECTIONS = [
  ["cenario", "1 · O que é crossell"],
  ["pilares", "2 · Os 4 pilares"],
  ["etapas", "3 · As 6 etapas"],
  ["objecoes", "4 · Manual de objeções"],
  ["kit", "5 · Estratégia de KIT"],
  ["nao", "6 · O que NÃO fazer"],
  ["cola", "7 · Cola rápida"],
  ["treinar", "8 · Como treinar"],
];

function Material({ go }) {
  return (
    <div className="mat-layout">
      <aside className="mat-nav">
        <div className="mat-nav-label">Guia do vendedor</div>
        {SECTIONS.map(([id, t]) => (
          <a key={id} href={`#${id}`} className="mat-nav-item">{t}</a>
        ))}
        <button className="mat-cta" onClick={() => go("roleplay")}>Treinar agora →</button>
      </aside>

      <article className="mat">
        <header className="mat-hero">
          <div className="kicker">Central de Ligações · CallSeller</div>
          <h1 className="mat-title">Treinamento de <em>Crossell</em></h1>
          <p className="mat-lede">Do zero ao fechamento — pra quem sempre fez recuperação de abandono e agora vai começar a fazer crossell.</p>
          <div className="promessa">
            <div><b>Para quem é:</b> vendedor que vinha de recuperação de abandono e agora faz crossell.</div>
            <div><b>A promessa:</b> entender POR QUE o crossell funciona, ter o roteiro exato de uma ligação, um exemplo completo e uma resposta pronta pra cada objeção.</div>
            <div><b>Como usar:</b> leia uma vez inteiro. Deixe as etapas, as objeções e a cola do lado na hora de ligar. Treine na aba <i>Fazer o treino</i> antes de ligar pra valer.</div>
          </div>
        </header>

        <section id="cenario" className="mat-sec">
          <h2>1 · O que é crossell (e por que é mais fácil do que você pensa)</h2>
          <p>A gente trabalha com <b>nutracêuticos</b> — produtos naturais que tratam a saúde do cliente. Ele entra no site, escolhe um tratamento e compra no cartão. <b>A venda já aconteceu. Ele já pagou.</b></p>
          <p>O crossell é o passo seguinte: você liga pra esse cliente que <b>JÁ comprou</b> e oferece um produto complementar que potencializa o resultado. Não é vender de novo do zero — é completar o tratamento. Ex: comprou em cápsulas, você oferece as gotas (absorção mais rápida); os dois se completam.</p>
          <div className="callout">
            <b>Por que é MAIS fácil que a recuperação de abandono:</b> o cliente já comprou (já confiou), já é seu paciente (não é estranho) e está aberto ao acompanhamento. Você não precisa “vender” — precisa <b>cuidar</b>. No crossell, quem cuida bem, vende.
          </div>
          <h3>A virada de chave (a parte mais importante)</h3>
          <div className="virada">
            <div className="virada-head"><span>Cabeça de abandono (o vício)</span><span>Cabeça de crossell (o novo jeito)</span></div>
            {VIRADA.map(([a, b], i) => (
              <div className="virada-row" key={i}><span className="v-old">{a}</span><span className="v-new">{b}</span></div>
            ))}
          </div>
          <div className="regra">Regra de ouro: no segundo em que o cliente sentir que você está “vendendo”, você perdeu. No segundo em que ele sentir que você é um especialista que quer o bem dele, ele compra sozinho.</div>
        </section>

        <section id="pilares" className="mat-sec">
          <h2>2 · A base: a postura de especialista (4 pilares)</h2>
          <p>Tudo o que você fala só funciona se vier de um lugar de autoridade tranquila. Você não recita os pilares — você os transmite ao longo da conversa.</p>
          <div className="pilar-grid">
            {PILARES.map(([n, t, d]) => (
              <div className="pilar-card" key={n}><div className="pilar-n">{n}</div><h4>{t}</h4><p>{d}</p></div>
            ))}
          </div>
        </section>

        <section id="etapas" className="mat-sec">
          <h2>3 · O passo a passo (as 6 etapas)</h2>
          <p>NUNCA pule etapas — cada uma prepara a próxima. Se pular pra oferta antes de construir a dor, a venda cai.</p>
          {ETAPAS_FULL.map((e) => (
            <div className="etapa-block" key={e.n}>
              <div className="etapa-num">{e.n}</div>
              <div className="etapa-body">
                <h4>{e.nome}</h4>
                <p className="etapa-obj">{e.objetivo}</p>
                <div className="etapa-falar">
                  {e.falar.map((f, i) => <div className="falar-line" key={i}>{f}</div>)}
                </div>
                <div className="etapa-erro"><b>Erro comum:</b> {e.erro}</div>
              </div>
            </div>
          ))}
        </section>

        <section id="objecoes" className="mat-sec">
          <h2>4 · Manual de objeções (converter é aqui)</h2>
          <div className="callout">
            Objeção NÃO é “não”. É o cliente pedindo mais segurança. A técnica é sempre a mesma:
            <b> Acolher</b> (“faz sentido”, “eu entendo”) → <b>não discutir</b> → <b>devolver com valor</b> (reconecta com a dor + garantia/resultado/preço por dia/escassez).
          </div>
          <div className="obj-list">
            {OBJECOES.map(([q, a], i) => (
              <div className="obj-item" key={i}>
                <div className="obj-q">{q}</div>
                <div className="obj-a">{a}</div>
              </div>
            ))}
          </div>
          <div className="regra">Fallback final: se não fechar o completo, não desligue sem oferecer ao menos <b>um frasco</b> pra começar do jeito certo.</div>
          <button className="inline-link" onClick={() => go("ligacoes")}>▶ Ouvir a ligação modelo completa na aba Ligações</button>
        </section>

        <section id="kit" className="mat-sec">
          <h2>5 · Estratégia de KIT (aumentar o valor do fechamento)</h2>
          <p>Quando o cliente já está convencido, você não para no mínimo — conduz pro <b>tratamento completo</b>, que é o que dá resultado (e o melhor fechamento pra você).</p>
          <div className="falar-line">“Pra ter o resultado completo, o ideal é fazer o tratamento por [X] meses sem interromper. Com o que você tem hoje, você faz só uma parte. Deixa eu já deixar o completo garantido pra você não parar no meio.”</div>
          <div className="falar-line">“A matéria-prima é importada e saiu muito, devemos zerar e só volta lá pro fim do ano. Se não garantir o restante agora, quando o seu acabar pode não ter mais — e interromper no meio é o pior pra você.”</div>
          <div className="regra">A escassez só funciona se for <b>verdadeira</b> e dita com calma, como aviso de quem se importa. “Não quero que você fique sem” ≠ “compra agora que vai acabar”. Nesta fase o foco é o KIT — não trabalhe amostra.</div>
        </section>

        <section id="nao" className="mat-sec">
          <h2>6 · O que NÃO fazer (os erros de quem vem do abandono)</h2>
          <ul className="nao-list">
            {NAO_FAZER.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </section>

        <section id="cola" className="mat-sec">
          <h2>7 · Cola rápida (deixe do lado na hora de ligar)</h2>
          <div className="cola-grid">
            {COLA_ETAPAS.map(([t, d]) => (
              <div className="cola-card" key={t}><b>{t}</b><span>{d}</span></div>
            ))}
          </div>
          <div className="cola-foot">
            <div><b>4 pilares:</b> Especialista · Produto · Empresa · Garantia.</div>
            <div><b>Objeção:</b> Acolher → Não discutir → Devolver com valor.</div>
          </div>
        </section>

        <section id="treinar" className="mat-sec">
          <h2>8 · Como treinar antes de ligar pra valer</h2>
          <p>Ninguém acerta o crossell na primeira. Treine 15 minutos por dia — aqui no site, contra a IA, ou com um colega.</p>
          <div className="rodadas">
            {RODADAS.map(([t, d]) => (
              <div className="rodada" key={t}><b>{t}</b><span>{d}</span></div>
            ))}
          </div>
          <div className="regra">Frase pra levar pra cada ligação: “Eu não tô aqui pra te vender nada — tô aqui pra garantir que o seu tratamento dê certo.”</div>
          <button className="mat-cta big" onClick={() => go("roleplay")}>Fazer o treino com a IA →</button>
        </section>
      </article>
    </div>
  );
}

/* ============================== LIGAÇÕES ============================== */

function toSec(d) { const [m, s] = d.split(":").map(Number); return m * 60 + s; }

function Player({ dur }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const total = toSec(dur);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((x) => { if (x + 1 >= total) { setPlaying(false); return total; } return x + 1; }), 1000);
    return () => clearInterval(id);
  }, [playing, total]);
  const fmt = (x) => `${Math.floor(x / 60)}:${String(x % 60).padStart(2, "0")}`;
  return (
    <div className="player">
      <button className="play" onClick={() => { if (t >= total) setT(0); setPlaying(!playing); }}>
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="pbar" onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setT(Math.round(((e.clientX - r.left) / r.width) * total));
      }}>
        <div className="pfill" style={{ width: `${(t / total) * 100}%` }} />
      </div>
      <div className="ptime">{fmt(t)} / {dur}</div>
    </div>
  );
}

function Ligacoes() {
  const [sel, setSel] = useState(LIGACOES[0]);
  return (
    <div className="lig-layout">
      <aside className="lig-list">
        <div className="lig-list-head">Ligações pra escutar</div>
        {LIGACOES.map((l) => (
          <button key={l.id} className={`lig-item ${sel.id === l.id ? "active" : ""}`} onClick={() => setSel(l)}>
            <div className="lig-item-top">
              <span className="lig-item-title">{l.titulo}</span>
              {l.modelo && <span className="tag modelo">modelo</span>}
              {l.alerta && <span className="tag alerta">evitar</span>}
            </div>
            <div className="lig-item-meta">
              <span className={`dot ${l.resultado === "Fechou" ? "g" : l.resultado === "Não fechou" ? "b" : ""}`} />
              {l.tipo} · {l.resultado !== "—" ? l.resultado : "referência"} · {l.dur}
            </div>
          </button>
        ))}
        <div className="lig-note">Aqui plugam as gravações reais da operação — a transcrição já sai automática (Groq Whisper).</div>
      </aside>

      <main className="lig-detail">
        <div className="lig-d-head">
          <h2>{sel.titulo}</h2>
          <div className="lig-d-tags">
            <span className="tag">{sel.tipo}</span>
            {sel.resultado !== "—" && <span className={`tag ${sel.resultado === "Fechou" ? "g" : "b"}`}>{sel.resultado}</span>}
            <span className="tag ghost">{sel.cliente}</span>
          </div>
        </div>
        <p className="lig-resumo">{sel.resumo}</p>
        <Player dur={sel.dur} />
        <div className="transcript">
          <div className="transcript-label">Transcrição</div>
          {sel.transcript.map(([who, text], i) => (
            <div key={i} className={`t-row ${who === "V" ? "v" : "c"}`}>
              <span className="t-who">{who === "V" ? "Vendedor" : "Cliente"}</span>
              <span className="t-text">{text}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ============================== ROLEPLAY ============================== */

const COLA_MINI = COLA_ETAPAS;

function RoleplayView() {
  const [stage, setStage] = useState("select"); // select | chat | result
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");
  const [showCola, setShowCola] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, waiting]);

  function start(s) {
    setScenario(s); setMessages([{ role: "cliente", text: "Alô?", opening: true }]);
    setInput(""); setError(""); setEvaluation(null); setStage("chat");
  }
  function buildApi(msgs) {
    const mapped = msgs.map((m) => ({ role: m.role === "cliente" ? "assistant" : "user", content: m.text }));
    let i = 0; while (i < mapped.length && mapped[i].role === "assistant") i++;
    return mapped.slice(i);
  }
  async function send() {
    const text = input.trim(); if (!text || waiting) return;
    const next = [...messages, { role: "vendedor", text }];
    setMessages(next); setInput(""); setWaiting(true); setError("");
    try {
      const reply = await callClaude({ system: clientSystem(scenario), messages: buildApi(next) });
      setMessages((m) => [...m, { role: "cliente", text: reply || "..." }]);
    } catch { setError("Falha ao falar com o cliente. Tente de novo."); }
    finally { setWaiting(false); }
  }
  async function finish() {
    if (evaluating) return;
    if (messages.filter((m) => m.role === "vendedor").length === 0) { setError("Conduza parte da ligação antes de avaliar."); return; }
    setEvaluating(true); setError("");
    const transcript = messages.map((m) => (m.role === "cliente" ? "C: " : "V: ") + m.text).join("\n");
    try {
      const raw = await callClaude({ system: EVAL_SYSTEM, messages: [{ role: "user", content: `Cenário: ${scenario.persona}, comprou ${scenario.comprou} (${scenario.produto}); complementar: ${scenario.complementar}. Dificuldade ${scenario.dificuldade}.\n\nTRANSCRIÇÃO:\n${transcript}\n\nAvalie e retorne SÓ o JSON.` }] });
      const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
      setEvaluation(parsed); setStage("result");
    } catch { setError("Não consegui gerar a avaliação. Tente de novo."); }
    finally { setEvaluating(false); }
  }

  if (stage === "select") return <RpSelect onPick={start} />;
  if (stage === "result" && evaluation) return <RpResult ev={evaluation} scenario={scenario} onRetry={() => start(scenario)} onNew={() => setStage("select")} />;
  return (
    <div className="chat-layout">
      <aside className="side">
        <button className="link-back" onClick={() => setStage("select")}>← trocar cenário</button>
        <div className="crm">
          <div className="crm-emoji">{scenario.emoji}</div>
          <div className="crm-name">{scenario.persona}</div>
          <div className="crm-line"><span>Queixa</span>{scenario.dor}</div>
          <div className="crm-line"><span>Comprou</span>{scenario.comprou} — {scenario.produto}</div>
          <div className="crm-line highlight"><span>Oferecer</span>{scenario.complementar}</div>
          <div className="crm-line"><span>Nível</span><b style={{ color: diffColor(scenario.dificuldade) }}>{scenario.dificuldade}</b></div>
        </div>
        <button className="cola-toggle" onClick={() => setShowCola(!showCola)}>{showCola ? "▾" : "▸"} Cola rápida — 6 etapas</button>
        {showCola && <ol className="cola">{COLA_MINI.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}</ol>}
      </aside>
      <main className="chat">
        <div className="chat-head">
          <div>
            <div className="chat-head-title">Ligação em andamento</div>
            <div className="chat-head-sub">Você é o especialista. Comece se apresentando e confirmando o pedido.</div>
          </div>
          <button className="finish-btn" onClick={finish} disabled={evaluating}>{evaluating ? "Avaliando…" : "Encerrar e avaliar"}</button>
        </div>
        <div className="stream" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`row ${m.role}`}>
              <div className="who">{m.role === "cliente" ? scenario.persona.split(",")[0] : "Você"}</div>
              <div className={`bubble ${m.role}`}>{m.text}</div>
            </div>
          ))}
          {waiting && <div className="row cliente"><div className="who">{scenario.persona.split(",")[0]}</div><div className="bubble cliente typing"><span></span><span></span><span></span></div></div>}
        </div>
        {error && <div className="err">{error}</div>}
        <div className="composer">
          <textarea className="input" rows={1} placeholder="Fale como o especialista…" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={waiting} />
          <button className="send-btn" onClick={send} disabled={waiting || !input.trim()}>Enviar</button>
        </div>
      </main>
    </div>
  );
}

function RpSelect({ onPick }) {
  return (
    <div className="wrap">
      <div className="rp-intro">
        <div className="kicker">Fazer o treino</div>
        <h1 className="mat-title" style={{ fontSize: "40px" }}>Roleplay com a <em>IA cliente</em></h1>
        <p className="mat-lede">Escolha um cenário. O cliente atende, resiste e joga objeções reais. Conduza pelo método e receba uma nota no fim.</p>
      </div>
      <div className="cards">
        {SCENARIOS.map((s, i) => (
          <button key={s.id} className="card reveal" style={{ animationDelay: `${0.06 * i + 0.05}s` }} onClick={() => onPick(s)}>
            <div className="card-top"><span className="card-emoji">{s.emoji}</span>
              <span className="pill" style={{ color: diffColor(s.dificuldade), borderColor: diffColor(s.dificuldade) }}>{s.dificuldade}</span></div>
            <div className="card-title">{s.titulo}</div>
            <div className="card-persona">{s.persona}</div>
            <div className="card-meta">Comprou <b>{s.comprou}</b> · oferecer <b>{s.complementar}</b></div>
            <div className="card-cta">Iniciar ligação →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Gauge({ nota }) {
  const n = Math.max(0, Math.min(10, Number(nota) || 0));
  const R = 52, C = 2 * Math.PI * R;
  const col = n >= 7.5 ? "var(--good)" : n >= 5 ? "var(--warn)" : "var(--bad)";
  return (
    <div className="gauge">
      <svg viewBox="0 0 130 130" width="130" height="130">
        <circle cx="65" cy="65" r={R} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="10" />
        <circle cx="65" cy="65" r={R} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - n / 10)} transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="gauge-num" style={{ color: col }}>{n.toFixed(1)}<small>/10</small></div>
    </div>
  );
}

function RpResult({ ev, scenario, onRetry, onNew }) {
  const pil = ev.pilares || {};
  const pilaresList = [["Especialista", pil.especialista], ["Produto", pil.produto], ["Empresa", pil.empresa], ["Garantia", pil.garantia]];
  return (
    <div className="wrap result">
      <div className="res-head">
        <Gauge nota={ev.nota} />
        <div>
          <div className="kicker">Avaliação · {scenario.persona.split(",")[0]}</div>
          <h2 className="res-title">{ev.fechou ? "Fechou a venda ✓" : "Não fechou"}</h2>
          <p className="res-resumo">{ev.resumo}</p>
        </div>
      </div>
      <div className="res-grid">
        <section className="panel">
          <h3 className="panel-h">As 6 etapas</h3>
          <ul className="etapas">
            {(ev.etapas || []).map((e, i) => {
              const meta = STATUS_META[e.status] || STATUS_META.nao_feita;
              return (<li key={i}><div className="et-top"><span className="et-nome">{e.nome}</span>
                <span className="chip" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span></div>
                {e.obs && <div className="et-obs">{e.obs}</div>}</li>);
            })}
          </ul>
        </section>
        <div className="res-col">
          <section className="panel">
            <h3 className="panel-h">4 pilares</h3>
            <div className="pilares">
              {pilaresList.map(([nome, st]) => { const meta = STATUS_META[st] || STATUS_META.nao;
                return (<div key={nome} className="pilar" style={{ borderColor: meta.color }}><span>{nome}</span><b style={{ color: meta.color }}>{meta.label}</b></div>); })}
            </div>
            {ev.objecoes && <div className="objecoes"><b>Objeções:</b> {ev.objecoes}</div>}
          </section>
          <section className="panel"><h3 className="panel-h good-h">Pontos fortes</h3><ul className="bullets good">{(ev.fortes || []).map((x, i) => <li key={i}>{x}</li>)}</ul></section>
          <section className="panel"><h3 className="panel-h bad-h">O que faltou</h3><ul className="bullets bad">{(ev.faltou || []).map((x, i) => <li key={i}>{x}</li>)}</ul></section>
        </div>
      </div>
      <section className="panel dicas-panel"><h3 className="panel-h">Dicas pra próxima ligação</h3><ol className="dicas">{(ev.dicas || []).map((x, i) => <li key={i}>{x}</li>)}</ol></section>
      <div className="res-actions">
        <button className="btn primary" onClick={onRetry}>↻ Treinar de novo (mesmo cliente)</button>
        <button className="btn ghost" onClick={onNew}>Escolher outro cenário</button>
      </div>
    </div>
  );
}

/* ============================== ESTILOS ============================== */

const CSS = `
.tr-root{
  --bg:#0d0d0d;--surface:#1a1a19;--surface2:#242422;--line:rgba(255,255,255,.10);
  --text:#f4f5f2;--muted:#a7a7a0;--dim:#75756e;--accent:#2fe371;--accent2:#22c55e;
  --good:#2fe371;--warn:#e0a458;--bad:#e0574a;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--text);line-height:1.5;min-height:100%;
  background:radial-gradient(900px 500px at 12% -8%,rgba(47,227,113,.10),transparent 60%),radial-gradient(800px 600px at 108% 8%,rgba(34,197,94,.06),transparent 55%),var(--bg);
}
.tr-root *{box-sizing:border-box;}
.tr-root a{color:inherit;text-decoration:none;}

/* nav */
.nav{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;
  padding:12px 26px;border-bottom:1px solid var(--line);backdrop-filter:blur(10px);background:rgba(13,13,13,.85);}
.brand{display:flex;align-items:center;gap:12px;}
.brand-logo{width:44px;height:44px;border-radius:11px;flex-shrink:0;box-shadow:0 0 0 1px rgba(47,227,113,.22);}
.brand-title{font-size:16px;font-weight:700;letter-spacing:-.01em;line-height:1.15;}
.brand-title span{color:var(--accent);}
.brand-sub{font-size:11.5px;color:var(--muted);margin-top:2px;}
.tabs{display:flex;gap:2px;background:rgba(0,0,0,.3);border:1px solid var(--line);border-radius:12px;padding:4px;}
.tab{display:flex;align-items:center;gap:7px;background:none;border:none;color:var(--muted);font-family:inherit;font-size:14px;font-weight:500;
  padding:8px 15px;border-radius:9px;cursor:pointer;transition:.18s;}
.tab-ico{font-size:15px;line-height:1;}
.tab:hover{color:var(--text);}
.tab.active{background:rgba(47,227,113,.14);color:var(--accent);font-weight:600;box-shadow:inset 0 0 0 1px rgba(47,227,113,.30);}

.wrap{max-width:1040px;margin:0 auto;padding:40px 28px 64px;}
.kicker{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:600;}
.mat-title{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:600;font-size:clamp(34px,5vw,52px);line-height:1.03;margin:12px 0 0;letter-spacing:-.02em;}
.mat-title em{font-style:italic;color:var(--accent);}
.mat-lede{color:var(--muted);font-size:17px;margin-top:14px;max-width:600px;}

/* material layout */
.mat-layout{display:grid;grid-template-columns:230px 1fr;gap:0;max-width:1120px;margin:0 auto;}
.mat-nav{position:sticky;top:64px;align-self:start;height:calc(100vh - 64px);overflow-y:auto;padding:32px 20px;border-right:1px solid var(--line);}
.mat-nav-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:12px;}
.mat-nav-item{display:block;padding:8px 10px;border-radius:8px;color:var(--muted);font-size:14px;transition:.15s;}
.mat-nav-item:hover{background:var(--surface);color:var(--text);}
.mat-cta{margin-top:18px;width:100%;background:var(--accent2);color:#04160b;border:none;border-radius:10px;padding:11px;font-family:inherit;font-weight:600;font-size:14px;cursor:pointer;}
.mat-cta:hover{filter:brightness(1.07);}
.mat-cta.big{width:auto;padding:14px 26px;font-size:16px;margin-top:20px;}
.mat{padding:40px 44px 80px;max-width:760px;}
.mat-hero{margin-bottom:24px;}
.promessa{margin-top:22px;display:flex;flex-direction:column;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px 20px;font-size:14.5px;color:var(--muted);}
.promessa b{color:var(--text);}
.mat-sec{padding:34px 0;border-top:1px solid var(--line);scroll-margin-top:80px;}
.mat-sec h2{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:26px;font-weight:600;letter-spacing:-.01em;margin:0 0 14px;}
.mat-sec h3{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:19px;font-weight:600;margin:26px 0 12px;}
.mat-sec p{font-size:15.5px;margin:0 0 14px;color:#e4dccf;}
.mat-sec p b{color:var(--text);}
.callout{background:rgba(47,227,113,.09);border:1px solid rgba(47,227,113,.28);border-radius:12px;padding:16px 18px;font-size:15px;margin:16px 0;}
.callout b{color:var(--accent);}
.regra{border-left:3px solid var(--accent2);padding:10px 16px;margin:18px 0;font-size:15px;color:#e4dccf;background:rgba(134,176,73,.06);border-radius:0 8px 8px 0;}
.regra b{color:var(--text);}
.virada{border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:8px 0 4px;}
.virada-head,.virada-row{display:grid;grid-template-columns:1fr 1fr;}
.virada-head span{padding:11px 14px;font-size:12px;font-weight:600;letter-spacing:.03em;background:var(--surface2);}
.virada-head span:first-child{color:var(--bad);border-right:1px solid var(--line);}
.virada-head span:last-child{color:var(--good);}
.virada-row{border-top:1px solid var(--line);}
.virada-row span{padding:11px 14px;font-size:13.5px;}
.v-old{color:var(--muted);border-right:1px solid var(--line);}
.v-new{color:var(--text);}
.pilar-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.pilar-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;position:relative;}
.pilar-n{position:absolute;top:16px;right:18px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:30px;color:rgba(47,227,113,.35);font-weight:600;}
.pilar-card h4{font-size:16px;margin:0 0 8px;padding-right:30px;}
.pilar-card p{font-size:13.5px;color:var(--muted);margin:0;}
.etapa-block{display:flex;gap:16px;padding:18px 0;border-top:1px dashed var(--line);}
.etapa-block:first-of-type{border-top:none;}
.etapa-num{flex-shrink:0;width:38px;height:38px;border-radius:11px;background:var(--accent);color:#04160b;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:600;font-size:20px;display:grid;place-items:center;}
.etapa-body{flex:1;min-width:0;}
.etapa-body h4{font-size:17px;margin:6px 0 8px;}
.etapa-obj{font-size:14.5px;color:var(--muted);margin:0 0 10px;}
.etapa-falar{display:flex;flex-direction:column;gap:8px;margin:10px 0;}
.falar-line{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--accent2);border-radius:0 8px 8px 0;padding:10px 14px;font-size:14px;color:#e9e2d6;}
.etapa-erro{font-size:13.5px;color:var(--warn);margin-top:6px;}
.etapa-erro b{color:var(--warn);}
.obj-list{display:flex;flex-direction:column;gap:10px;margin:14px 0;}
.obj-item{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;}
.obj-q{padding:12px 16px;font-weight:600;font-size:14.5px;background:rgba(201,85,74,.10);color:#f0c9c3;border-bottom:1px solid var(--line);}
.obj-a{padding:13px 16px;font-size:14px;color:#e4dccf;}
.inline-link{margin-top:10px;background:none;border:1px solid var(--line);color:var(--accent);border-radius:10px;padding:10px 16px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;}
.inline-link:hover{border-color:var(--accent);}
.nao-list{margin:0;padding:0;list-style:none;}
.nao-list li{padding:11px 0 11px 30px;border-top:1px solid var(--line);font-size:15px;position:relative;color:#e4dccf;}
.nao-list li:first-child{border-top:none;}
.nao-list li::before{content:"✕";position:absolute;left:4px;color:var(--bad);font-weight:700;}
.cola-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.cola-card{background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:13px 15px;}
.cola-card b{display:block;font-size:14px;margin-bottom:3px;}
.cola-card span{font-size:13px;color:var(--muted);}
.cola-foot{margin-top:14px;display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--muted);}
.cola-foot b{color:var(--text);}
.rodadas{display:flex;flex-direction:column;gap:10px;margin:8px 0;}
.rodada{background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:13px 16px;}
.rodada b{display:block;font-size:15px;margin-bottom:3px;}
.rodada span{font-size:13.5px;color:var(--muted);}

/* ligações */
.lig-layout{display:grid;grid-template-columns:320px 1fr;gap:0;min-height:calc(100vh - 60px);}
.lig-list{border-right:1px solid var(--line);padding:24px 18px;overflow-y:auto;background:rgba(0,0,0,.14);}
.lig-list-head{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:14px;padding:0 6px;}
.lig-item{width:100%;text-align:left;background:none;border:1px solid transparent;border-radius:12px;padding:13px 14px;cursor:pointer;color:var(--text);margin-bottom:6px;transition:.15s;}
.lig-item:hover{background:var(--surface);}
.lig-item.active{background:var(--surface);border-color:rgba(47,227,113,.45);}
.lig-item-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.lig-item-title{font-size:14.5px;font-weight:500;}
.lig-item-meta{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--muted);margin-top:5px;}
.dot{width:7px;height:7px;border-radius:50%;background:var(--dim);}
.dot.g{background:var(--good);}.dot.b{background:var(--bad);}
.tag{font-size:11px;font-weight:600;border:1px solid var(--line);border-radius:999px;padding:3px 9px;color:var(--muted);}
.tag.modelo{color:var(--accent2);border-color:var(--accent2);}
.tag.alerta{color:var(--bad);border-color:var(--bad);}
.tag.g{color:var(--good);border-color:var(--good);}
.tag.b{color:var(--bad);border-color:var(--bad);}
.tag.ghost{color:var(--dim);}
.lig-note{margin-top:16px;padding:12px 14px;font-size:12.5px;color:var(--dim);background:var(--surface);border:1px dashed var(--line);border-radius:10px;}
.lig-detail{padding:32px 40px;overflow-y:auto;max-width:760px;}
.lig-d-head h2{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:26px;font-weight:600;margin:0 0 10px;}
.lig-d-tags{display:flex;gap:7px;flex-wrap:wrap;}
.lig-resumo{color:var(--muted);font-size:15px;margin:16px 0 20px;}
.player{display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:8px;}
.play{width:44px;height:44px;flex-shrink:0;border-radius:50%;border:none;background:var(--accent);color:#04160b;font-size:15px;cursor:pointer;}
.play:hover{filter:brightness(1.08);}
.pbar{flex:1;height:6px;background:rgba(255,255,255,.1);border-radius:99px;cursor:pointer;overflow:hidden;}
.pfill{height:100%;background:var(--accent);border-radius:99px;}
.ptime{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap;}
.transcript{margin-top:22px;}
.transcript-label{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:12px;}
.t-row{display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--line);}
.t-row:first-of-type{border-top:none;}
.t-who{flex-shrink:0;width:66px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;}
.t-row.v .t-who{color:var(--accent);}
.t-row.c .t-who{color:var(--muted);}
.t-text{font-size:14.5px;color:#e4dccf;}

/* roleplay reused */
.rp-intro{margin-bottom:26px;}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;}
.card{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px;cursor:pointer;color:var(--text);transition:.22s cubic-bezier(.2,.7,.3,1);}
.card:hover{transform:translateY(-4px);border-color:rgba(47,227,113,.5);background:var(--surface2);}
.card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.card-emoji{font-size:26px;}
.pill{font-size:11px;font-weight:600;border:1px solid;border-radius:999px;padding:3px 9px;}
.card-title{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:20px;font-weight:600;}
.card-persona{color:var(--muted);font-size:14px;margin-top:2px;}
.card-meta{color:var(--dim);font-size:13px;margin-top:14px;}
.card-meta b{color:var(--text);}
.card-cta{margin-top:16px;color:var(--accent);font-size:14px;font-weight:600;opacity:0;transform:translateX(-6px);transition:.22s;}
.card:hover .card-cta{opacity:1;transform:translateX(0);}
.reveal{opacity:0;transform:translateY(14px);animation:rise .5s cubic-bezier(.2,.7,.3,1) forwards;}
@keyframes rise{to{opacity:1;transform:translateY(0);}}
.chat-layout{display:grid;grid-template-columns:290px 1fr;height:calc(100vh - 60px);}
.side{border-right:1px solid var(--line);padding:24px 22px;overflow-y:auto;background:rgba(0,0,0,.14);}
.link-back{background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;padding:0;margin-bottom:20px;}
.link-back:hover{color:var(--text);}
.crm{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;}
.crm-emoji{font-size:30px;}
.crm-name{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:20px;font-weight:600;margin:6px 0 14px;}
.crm-line{display:flex;flex-direction:column;gap:1px;font-size:14px;padding:8px 0;border-top:1px solid var(--line);}
.crm-line span{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--dim);}
.crm-line.highlight span{color:var(--accent);}
.crm-line.highlight{color:var(--accent);font-weight:600;}
.cola-toggle{margin-top:18px;width:100%;text-align:left;background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;font-weight:600;padding:6px 0;}
.cola{list-style:none;margin:8px 0 0;padding:0;}
.cola li{padding:9px 0;border-top:1px solid var(--line);font-size:13px;}
.cola li b{display:block;color:var(--text);}
.cola li span{color:var(--muted);}
.chat{display:flex;flex-direction:column;height:100%;min-width:0;}
.chat-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:20px 26px;border-bottom:1px solid var(--line);}
.chat-head-title{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:19px;font-weight:600;}
.chat-head-sub{color:var(--muted);font-size:13px;margin-top:2px;}
.finish-btn{white-space:nowrap;background:var(--accent);color:#04160b;border:none;border-radius:10px;padding:10px 16px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;transition:.18s;}
.finish-btn:hover:not(:disabled){filter:brightness(1.08);}
.finish-btn:disabled{opacity:.6;cursor:default;}
.stream{flex:1;overflow-y:auto;padding:24px 26px;display:flex;flex-direction:column;gap:16px;}
.row{display:flex;flex-direction:column;max-width:74%;}
.row.vendedor{align-self:flex-end;align-items:flex-end;}
.row.cliente{align-self:flex-start;}
.who{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin:0 4px 4px;}
.bubble{padding:12px 15px;border-radius:16px;font-size:15px;white-space:pre-wrap;word-wrap:break-word;}
.bubble.cliente{background:var(--surface);border:1px solid var(--line);border-bottom-left-radius:5px;}
.bubble.vendedor{background:linear-gradient(180deg,#34d977,#22c55e);color:#04160b;border-bottom-right-radius:5px;font-weight:600;}
.bubble.typing{display:flex;gap:5px;padding:15px;}
.bubble.typing span{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:blink 1.2s infinite both;}
.bubble.typing span:nth-child(2){animation-delay:.2s;}
.bubble.typing span:nth-child(3){animation-delay:.4s;}
@keyframes blink{0%,60%,100%{opacity:.25;transform:translateY(0);}30%{opacity:1;transform:translateY(-3px);}}
.err{margin:0 26px;color:var(--bad);font-size:13px;padding:8px 0;}
.composer{display:flex;gap:10px;padding:16px 26px 22px;border-top:1px solid var(--line);align-items:flex-end;}
.input{flex:1;resize:none;background:var(--surface);border:1px solid var(--line);border-radius:12px;color:var(--text);font-family:inherit;font-size:15px;padding:12px 14px;max-height:120px;line-height:1.45;}
.input:focus{outline:none;border-color:rgba(47,227,113,.55);}
.send-btn{background:var(--accent);color:#04160b;border:none;border-radius:12px;padding:12px 20px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;transition:.18s;}
.send-btn:hover:not(:disabled){filter:brightness(1.08);}
.send-btn:disabled{opacity:.4;cursor:default;}
.result{max-width:920px;}
.res-head{display:flex;gap:26px;align-items:center;margin-bottom:26px;}
.gauge{position:relative;flex-shrink:0;width:130px;height:130px;display:grid;place-items:center;}
.gauge-num{position:absolute;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:600;font-size:34px;}
.gauge-num small{font-size:14px;color:var(--dim);font-weight:400;}
.res-title{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:30px;font-weight:600;margin:8px 0 6px;}
.res-resumo{color:var(--muted);font-size:16px;max-width:520px;}
.res-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:16px;align-items:start;}
.res-col{display:flex;flex-direction:column;gap:16px;}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px 22px;}
.panel-h{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;font-weight:600;margin:0 0 14px;}
.good-h{color:var(--good);}.bad-h{color:var(--warn);}
.etapas{list-style:none;margin:0;padding:0;}
.etapas li{padding:11px 0;border-top:1px solid var(--line);}
.etapas li:first-child{border-top:none;padding-top:0;}
.et-top{display:flex;justify-content:space-between;gap:10px;align-items:center;}
.et-nome{font-size:14px;font-weight:500;}
.chip{font-size:11px;font-weight:600;border-radius:999px;padding:3px 9px;white-space:nowrap;}
.et-obs{color:var(--muted);font-size:13px;margin-top:3px;}
.pilares{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.pilar{display:flex;justify-content:space-between;align-items:center;border:1px solid;border-radius:10px;padding:9px 12px;font-size:13px;background:rgba(0,0,0,.15);}
.pilar b{font-size:12px;}
.objecoes{margin-top:12px;font-size:13px;color:var(--muted);}
.objecoes b{color:var(--text);}
.bullets{margin:0;padding-left:18px;}
.bullets li{font-size:14px;margin:5px 0;}
.bullets.good li::marker{color:var(--good);}
.bullets.bad li::marker{color:var(--warn);}
.dicas-panel{margin-top:16px;}
.dicas{margin:0;padding-left:20px;}
.dicas li{font-size:14.5px;margin:7px 0;}
.res-actions{display:flex;gap:12px;margin-top:24px;flex-wrap:wrap;}
.btn{border:none;border-radius:12px;padding:13px 22px;font-weight:600;font-size:15px;cursor:pointer;font-family:inherit;transition:.18s;}
.btn.primary{background:var(--accent);color:#04160b;}
.btn.primary:hover{filter:brightness(1.08);}
.btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line);}
.btn.ghost:hover{border-color:var(--muted);}
@media (max-width:860px){
  .nav{flex-direction:column;gap:10px;align-items:flex-start;}
  .mat-layout{grid-template-columns:1fr;}
  .mat-nav{display:none;}
  .mat{padding:28px 22px 60px;}
  .lig-layout,.chat-layout{grid-template-columns:1fr;height:auto;}
  .lig-list{border-right:none;border-bottom:1px solid var(--line);}
  .side{border-right:none;border-bottom:1px solid var(--line);}
  .res-grid{grid-template-columns:1fr;}
  .res-head{flex-direction:column;text-align:center;}
  .pilar-grid,.cola-grid,.virada-head,.virada-row{grid-template-columns:1fr;}
}
`;
