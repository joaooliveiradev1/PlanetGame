import { $, $$, esc, shuffle, setArea, message } from "../core/dom.js";
import { timer } from "../core/lifecycle.js";
import { finish } from "../core/router.js";

const QUIZ = {
  facil: [
    [
      "💧",
      "O que ajuda a economizar água?",
      [
        "Fechar a torneira ao escovar os dentes",
        "Deixar a torneira aberta",
        "Lavar a calçada com mangueira",
      ],
      0,
      "Fechar a torneira evita desperdício de água tratada.",
    ],
    [
      "🌳",
      "O que uma árvore ajuda a oferecer?",
      ["Mais fumaça", "Sombra e abrigo para animais", "Lixo nas ruas"],
      1,
      "Árvores oferecem sombra, ajudam a refrescar os lugares e abrigam seres vivos.",
    ],
    [
      "🐢",
      "O que fazer com o lixo na praia?",
      ["Deixar na areia", "Jogar no mar", "Levar para o descarte adequado"],
      2,
      "Resíduos na praia podem machucar animais e chegar ao oceano.",
    ],
    [
      "💡",
      "A luz está acesa num quarto vazio. O que fazer?",
      ["Apagar a luz", "Ligar mais lâmpadas", "Deixar sempre acesa"],
      0,
      "Apagar luzes desnecessárias reduz o consumo de energia.",
    ],
    [
      "🐝",
      "Por que as abelhas são importantes?",
      [
        "Elas polinizam muitas plantas",
        "Elas desligam a energia",
        "Elas limpam os rios",
      ],
      0,
      "Polinizadores ajudam muitas plantas a produzir frutos e sementes.",
    ],
    [
      "🛍️",
      "Para reduzir sacolas descartáveis, podemos...",
      [
        "Usar mais embalagens",
        "Levar uma sacola reutilizável",
        "Comprar uma sacola a cada item",
      ],
      1,
      "Usar uma sacola resistente por bastante tempo pode reduzir descartáveis.",
    ],
  ],

  medio: [
    [
      "☀️",
      "Qual destes pode gerar eletricidade renovável?",
      ["Carvão mineral", "Painel solar", "Óleo diesel"],
      1,
      "Painéis solares transformam a luz do Sol em eletricidade.",
    ],
    [
      "🍂",
      "Qual material pode ser usado numa composteira adequada?",
      ["Cascas de frutas", "Pilhas usadas", "Vidro quebrado"],
      0,
      "Restos vegetais adequados podem se transformar em composto.",
    ],
    [
      "🚲",
      "Em distâncias curtas, qual opção geralmente polui menos?",
      ["Bicicleta", "Carro com uma pessoa", "Moto"],
      0,
      "A bicicleta não emite gases de escapamento durante o trajeto.",
    ],
    [
      "🌊",
      "O que é uma mata ciliar?",
      [
        "Floresta próxima a rios e córregos",
        "Uma floresta artificial no teto",
        "Uma planta marinha",
      ],
      0,
      "A vegetação nas margens ajuda a proteger o solo e os cursos d’água.",
    ],
    [
      "♻️",
      "Uma embalagem vazia e limpa de papelão costuma ir para...",
      ["Resíduos perigosos", "Reciclagem de papel", "Descarte de óleo"],
      1,
      "Papelão limpo e seco pode seguir para a coleta de recicláveis.",
    ],
    [
      "🥕",
      "Uma cenoura torta, mas conservada, deve ser...",
      [
        "Descartada só pela aparência",
        "Aproveitada na refeição",
        "Colocada com pilhas",
      ],
      1,
      "Formato irregular não torna um alimento impróprio para consumo.",
    ],
  ],

  dificil: [
    [
      "🌍",
      "O que é biodiversidade?",
      [
        "Variedade de seres vivos e ecossistemas",
        "Quantidade de lixeiras",
        "Apenas número de árvores",
      ],
      0,
      "Biodiversidade inclui diferentes espécies, genes e ecossistemas.",
    ],
    [
      "🌱",
      "Por que preferir espécies nativas na restauração ambiental?",
      [
        "Porque sempre crescem em um dia",
        "Porque integram ecossistemas locais",
        "Porque não precisam de água nunca",
      ],
      1,
      "Plantas nativas podem apoiar as relações ecológicas da região.",
    ],
    [
      "🔋",
      "Por que baterias podem ajudar redes com energia solar?",
      [
        "Guardam energia para outros momentos",
        "Produzem sol à noite",
        "Impedem qualquer consumo",
      ],
      0,
      "Armazenamento ajuda a usar energia em períodos de menor geração.",
    ],
    [
      "🌧️",
      "O que ajuda a diminuir alagamentos urbanos?",
      [
        "Cobrir todo o solo com cimento",
        "Preservar áreas permeáveis e drenagem",
        "Jogar lixo nos bueiros",
      ],
      1,
      "Solo permeável, vegetação e drenagem adequada podem reduzir alagamentos.",
    ],
    [
      "🏭",
      "O que significa reduzir emissões de gases de efeito estufa?",
      [
        "Aumentar a fumaça",
        "Diminuir gases que contribuem para o aquecimento",
        "Eliminar as nuvens",
      ],
      1,
      "Reduzir certas emissões ajuda a limitar o aquecimento do planeta.",
    ],
    [
      "🧵",
      "Qual atitude representa economia circular?",
      [
        "Consertar e reutilizar produtos",
        "Descartar um produto utilizável",
        "Comprar sempre o mais novo",
      ],
      0,
      "Reparar e reutilizar prolonga a vida útil e reduz resíduos.",
    ],
  ],
};

export function initQuiz() {
  let level = "facil";
  let questions = [];
  let pos = 0;
  let answered = false;
  let advancing = false;

  function draw() {
    const question = questions[pos];

    setArea(`
      <div class="game-wrap">
        <h2 class="panel-title">🧠 Desafio do Conhecimento</h2>

        <p class="panel-subtitle">
          Escolha o nível e descubra como cuidar do planeta.
        </p>

        <div class="level-select">
          ${[
            ["facil", "🌱 Fácil"],
            ["medio", "🌳 Médio"],
            ["dificil", "🌍 Difícil"],
          ]
            .map(
              ([value, label]) => `
                <button
                  type="button"
                  class="level-btn ${level === value ? "active" : ""}"
                  data-level="${value}"
                  aria-pressed="${level === value}"
                >
                  ${label}
                </button>
              `,
            )
            .join("")}
        </div>

        <div class="status-line">
          <span class="status-pill">
            Pergunta ${pos + 1} de ${questions.length}
          </span>

          <span class="tiny-help">
            Sem pressa: você pode tentar novamente!
          </span>
        </div>

        <div class="question-box">
          <div class="question-emoji" aria-hidden="true">
            ${question[0]}
          </div>

          <div class="question-text">
            ${esc(question[1])}
          </div>
        </div>

        <div class="opt-grid">
          ${question[2]
            .map(
              (option, index) => `
                <button
                  type="button"
                  class="option-btn"
                  data-answer="${index}"
                >
                  ${esc(option)}
                </button>
              `,
            )
            .join("")}
        </div>

        <div id="message"></div>
        <div class="btn-row" id="next-holder"></div>
      </div>
    `);

    $$(".level-btn").forEach((button) => {
      button.onclick = () => {
        level = button.dataset.level;
        start();
      };
    });

    $$("[data-answer]").forEach((button) => {
      button.onclick = () => {
        if (answered) return;

        const chosen = Number(button.dataset.answer);

        if (chosen !== question[3]) {
          button.classList.add("wrong");

          message(
            "Ainda não! Pense com calma e tente outra alternativa.",
            false,
          );

          timer(() => {
            if (button.isConnected) {
              button.classList.remove("wrong");
            }
          }, 700);

          return;
        }

        answered = true;
        button.classList.add("correct");

        $$("[data-answer]").forEach((option) => {
          option.disabled = true;
        });

        message("Isso mesmo! " + question[4]);

        const next = document.createElement("button");
        next.type = "button";
        next.id = "next";
        next.className = "btn";
        next.textContent =
          pos === questions.length - 1
            ? "Concluir aventura"
            : "Próxima pergunta →";

        $("#next-holder").appendChild(next);

        next.onclick = () => {
          if (advancing) return;

          advancing = true;
          next.disabled = true;
          pos++;

          if (pos >= questions.length) {
            finish(
              "Mandou bem! 🌎",
              "Você terminou o EcoQuiz e explorou formas de cuidar da natureza!",
            );
            return;
          }

          answered = false;
          advancing = false;
          draw();
        };
      };
    });
  }

  function start() {
    questions = shuffle(QUIZ[level]).slice(0, 5);
    pos = 0;
    answered = false;
    advancing = false;
    draw();
  }

  start();
}
