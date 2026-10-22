import { $, $$, shuffle, setArea } from "../core/dom.js";
import { finish } from "../core/router.js";

// EcoQuiz — EF02CI04 e EF03CI04 (animais: onde vivem, o que comem, como se movem)
const BANK = [
  {
    e: "🐟",
    q: "Onde o peixe vive?",
    opts: [
      ["🌊", "Na água"],
      ["🌳", "Na árvore"],
      ["🕳️", "Na toca"],
    ],
    a: 0,
    hint: "Pense: ele precisa nadar.",
    why: "O peixe vive na água e respira com as guelras.",
  },
  {
    e: "🐦",
    q: "Onde o passarinho guarda os ovos?",
    opts: [
      ["🪹", "No ninho"],
      ["🌊", "No mar"],
      ["🕳️", "Debaixo da terra"],
    ],
    a: 0,
    hint: "Ele faz uma casinha de gravetos.",
    why: "Os passarinhos fazem ninhos para proteger os ovos e os filhotes.",
  },
  {
    e: "🐝",
    q: "Onde as abelhas fazem o mel?",
    opts: [
      ["🏠", "Na colmeia"],
      ["🌊", "No rio"],
      ["🕳️", "Na toca do tatu"],
    ],
    a: 0,
    hint: "É a casa das abelhas.",
    why: "As abelhas moram na colmeia e fazem mel com o néctar das flores.",
  },
  {
    e: "🐄",
    q: "O que a vaca come?",
    opts: [
      ["🌿", "Capim"],
      ["🥩", "Carne"],
      ["🐟", "Peixe"],
    ],
    a: 0,
    hint: "Ela vive no pasto.",
    why: "A vaca come capim e outras plantas.",
  },
  {
    e: "🦋",
    q: "O que a borboleta bebe?",
    opts: [
      ["🌸", "Néctar das flores"],
      ["🥛", "Leite"],
      ["🌊", "Água do mar"],
    ],
    a: 0,
    hint: "Ela pousa nas flores.",
    why: "A borboleta tem uma língua comprida, como um canudinho, para beber o néctar.",
  },
  {
    e: "🐱",
    q: "O que o gato gosta de caçar?",
    opts: [
      ["🐭", "Ratinho"],
      ["🥕", "Cenoura"],
      ["🌿", "Capim"],
    ],
    a: 0,
    hint: "O gato é um caçador.",
    why: "O gato come carne. Ele caça ratinhos e outros bichinhos.",
  },
  {
    e: "🐸",
    q: "O que o sapo come?",
    opts: [
      ["🪰", "Insetos"],
      ["🌽", "Milho"],
      ["🥕", "Cenoura"],
    ],
    a: 0,
    hint: "Ele pega com a língua grudenta.",
    why: "O sapo pega moscas e outros insetos com a língua.",
  },
  {
    e: "🐢",
    q: "Como a tartaruga anda?",
    opts: [
      ["🐌", "Devagar"],
      ["🏃", "Muito rápido"],
      ["🪽", "Voando"],
    ],
    a: 0,
    hint: "Ela carrega uma casa nas costas.",
    why: "A tartaruga anda devagar e o casco protege o corpo dela.",
  },
  {
    e: "🐍",
    q: "Como a cobra se move?",
    opts: [
      ["〰️", "Rastejando"],
      ["🦘", "Pulando"],
      ["🪽", "Voando"],
    ],
    a: 0,
    hint: "Ela não tem pernas.",
    why: "A cobra não tem pernas. Ela se move rastejando pelo chão.",
  },
  {
    e: "🐦",
    q: "Como o passarinho se move pelo céu?",
    opts: [
      ["🪽", "Voando"],
      ["🏊", "Nadando"],
      ["〰️", "Rastejando"],
    ],
    a: 0,
    hint: "Ele tem asas.",
    why: "O passarinho tem asas e penas, e por isso consegue voar.",
  },
];

function speak(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F]/gu, "")
      .trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "pt-BR";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

export function initQuiz() {
  const TOTAL = 6;
  const rounds = shuffle(BANK)
    .slice(0, TOTAL)
    .map((r) => ({
      ...r,
      opts: shuffle(
        r.opts.map((o, i) => ({ e: o[0], l: o[1], ok: i === r.a })),
      ),
    }));
  const first = [];
  let pos = 0,
    mistakes = 0,
    answered = false,
    stars = 0;
  const theo = '<img src="assets/theo.png" alt="Theo" class="theo-mini">';

  function intro() {
    setArea(`<div class="game-wrap"><h2 class="panel-title">🐾 Como os bichinhos vivem?</h2>
      <div class="garden-hud">${theo}<div class="theo-say">Oi! Vou perguntar sobre os bichinhos. Toque na figura certa! 🔊 lê a pergunta.</div></div>
      <div class="btn-row" style="margin-top:20px"><button class="btn btn-xl" id="go">Vamos! ➜</button></div></div>`);
    $("#go").onclick = draw;
  }

  function feedback(text) {
    const box = $("#qz-fb");
    if (!box) return;
    box.style.visibility = "visible";
    $("#qz-say").textContent = text;
    speak(text);
  }

  function draw() {
    const r = rounds[pos];
    setArea(`<div class="game-wrap">
      <div class="qz-trail">${rounds.map((_, i) => `<span class="qz-dot ${i < pos ? (first[i] ? "gold" : "done") : i === pos ? "now" : ""}">${i < pos ? (first[i] ? "⭐" : "✔️") : i + 1}</span>`).join("")}</div>
      <div class="question-box"><div class="question-emoji">${r.e}</div><div class="question-text">${r.q}</div>
        <div class="btn-row" style="margin-top:12px"><button class="btn btn-outline btn-small" id="say">🔊 Ouvir</button></div></div>
      <div class="qz-opts">${r.opts.map((o, i) => `<button class="qz-card" data-i="${i}"><span>${o.e}</span><b>${o.l}</b></button>`).join("")}</div>
      <div class="garden-hud" id="qz-fb" style="visibility:hidden">${theo}<div class="theo-say" id="qz-say"></div></div>
      <div class="btn-row" id="next-holder"></div></div>`);

    $("#say").onclick = () => speak(r.q);
    $$(".qz-card").forEach(
      (b) =>
        (b.onclick = () => {
          if (answered) return;
          const o = r.opts[+b.dataset.i];
          if (o.ok) {
            answered = true;
            first[pos] = mistakes === 0;
            if (first[pos]) stars++;
            b.classList.add("correct");
            $$(".qz-card").forEach((k) => {
              k.disabled = true;
            });
            feedback("Isso mesmo! " + r.why);
            $("#next-holder").innerHTML =
              `<button class="btn btn-xl" id="next">${pos === TOTAL - 1 ? "Ver resultado" : "Próxima ➜"}</button>`;
            $("#next").onclick = () => {
              pos++;
              if (pos === TOTAL) {
                finish(
                  stars === TOTAL ? "Perfeito! 🌟" : "Muito bem! 🐾",
                  `Você acertou de primeira ${stars} de ${TOTAL} perguntas. Os bichinhos agradecem!`,
                );
              } else {
                answered = false;
                mistakes = 0;
                draw();
              }
            };
          } else {
            mistakes++;
            b.classList.add("wrong");
            b.disabled = true;
            feedback("Hmm, ainda não. " + r.hint);
          }
        }),
    );
    speak(r.q);
  }

  intro();
}
