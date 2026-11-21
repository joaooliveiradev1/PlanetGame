import { $, $$, shuffle, setArea, message } from "../core/dom.js";
import { finish } from "../core/router.js";
import { playCorrect, playWrong, playVictory } from "../core/sounds.js";

const TOTAL_NIVEIS = 8;
const OBJETOS_POR_NIVEL = 4;

const OBJETOS = [
  ["jornal", "Jornal", "papel"],
  ["caixa-papelao", "Caixa de papelão", "papel"],
  ["folha-caderno", "Folha de caderno", "papel"],
  ["revista", "Revista", "papel"],
  ["envelope-papel", "Envelope de papel", "papel"],
  ["papel-desenho", "Papel de desenho", "papel"],
  ["caixa-cereal", "Caixa de cereal limpa", "papel"],
  ["caixa-sapato", "Caixa de sapato", "papel"],

  ["lata-conserva", "Lata de conserva", "metal"],
  ["latinha-bebida", "Latinha de bebida", "metal"],
  ["lata-milho", "Lata de milho", "metal"],
  ["lata-ervilha", "Lata de ervilha", "metal"],
  ["lata-molho", "Lata de molho", "metal"],
  ["lata-leite-po", "Lata de leite em pó", "metal"],
  ["parafuso", "Parafuso de metal", "metal"],
  ["colher", "Colher de metal", "metal"],

  ["frasco-plastico", "Frasco plástico vazio", "plastico"],
  ["sacola-plastica", "Sacola plástica limpa", "plastico"],
  ["garrafa-pet", "Garrafa PET vazia", "plastico"],
  ["pote-plastico", "Pote plástico limpo", "plastico"],
  ["frasco-detergente", "Frasco de detergente vazio", "plastico"],
  ["copo-plastico", "Copo plástico limpo", "plastico"],
  ["embalagem-plastica", "Embalagem plástica limpa", "plastico"],
  ["tampa-plastica", "Tampa plástica", "plastico"],

  ["garrafa-vidro", "Garrafa de vidro", "vidro"],
  ["pote-vidro", "Pote de vidro", "vidro"],
  ["frasco-perfume", "Frasco de perfume de vidro vazio", "vidro"],
  ["pote-geleia", "Pote de geleia vazio", "vidro"],
  ["garrafa-azeite", "Garrafa de azeite de vidro", "vidro"],
  ["pote-conserva", "Pote de conserva de vidro", "vidro"],
  ["garrafa-suco", "Garrafa de suco de vidro", "vidro"],
  ["frasco-vidro", "Frasco de vidro vazio", "vidro"],
];

const LIXEIRAS = [
  ["papel", "Papel", "#288fe4"],
  ["plastico", "Plástico", "#f25c62"],
  ["vidro", "Vidro", "#23a751"],
  ["metal", "Metal", "#dfac0d"],
];

const NOMES = {
  papel: "papel",
  plastico: "plástico",
  vidro: "vidro",
  metal: "metal",
};

const EXPLICACOES = {
  papel:
    "Papéis e papelões limpos e secos podem ser separados para reciclagem.",
  plastico:
    "Embalagens plásticas recicláveis devem ser separadas e descartadas corretamente.",
  vidro:
    "O vidro pode ser reciclado. Se estiver quebrado, peça ajuda a um adulto.",
  metal: "Objetos de metal podem ser reaproveitados e reciclados.",
};

const ESTILOS = `
<style>
  .belt .belt-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    box-sizing: border-box;
    padding: 10px 12px;
    overflow: hidden;
  }

  .belt .belt-item .card-icon {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    justify-content: center;
    min-height: 0;
    width: 100%;
    line-height: 1;
  }

  .belt .belt-item .reciclagem-imagem {
    display: block;
    width: 108px;
    height: 108px;
    max-width: 100%;
    object-fit: contain;
    margin: 0 auto;
  }

  .belt .belt-item .reciclagem-nome {
    display: block;
    position: static;
    flex: 0 0 auto;
    width: 100%;
    margin: 0;
    padding: 0;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.2;
    text-align: center;
    color: #245343;
    overflow-wrap: break-word;
  }

  .reciclagem-simbolo {
    display: block;
    margin: 0 auto 6px;
    font-size: 29px;
    color: white;
    font-weight: 900;
  }

  @media (max-width: 520px) {
    .belt .belt-item {
      padding: 7px;
      gap: 4px;
    }

    .belt .belt-item .reciclagem-imagem {
      width: 84px;
      height: 84px;
    }

    .belt .belt-item .reciclagem-nome {
      font-size: 12px;
    }

    .reciclagem-simbolo {
      font-size: 23px;
    }
  }
</style>
`;

export function initFactory() {
  let indice = 0;
  let respondeu = false;
  let erros = 0;
  let acertos = 0;

  const objetos = shuffle([...OBJETOS]);

  function nivelAtual() {
    return Math.floor(indice / OBJETOS_POR_NIVEL) + 1;
  }

  function numeroObjeto() {
    return (indice % OBJETOS_POR_NIVEL) + 1;
  }

  function desenhar() {
    respondeu = false;

    const objeto = objetos[indice];
    const nivel = nivelAtual();

    const esconderNomes = nivel >= 5;

    const instrucao = esconderNomes
      ? "Desafio das cores! Descubra a lixeira correta sem ver o nome."
      : "Observe o objeto e escolha a lixeira correspondente.";

    setArea(`
      <div class="game-wrap">
        ${ESTILOS}

        <div class="status-line">
          <span class="status-pill">
            Nível ${nivel} de ${TOTAL_NIVEIS}
          </span>

          <span class="tiny-help">
            Objeto ${numeroObjeto()} de ${OBJETOS_POR_NIVEL}
          </span>
        </div>

        <h2 class="panel-title">
          Esteira da Reciclagem
        </h2>

        <p class="panel-subtitle">
          ${instrucao}
        </p>

        <div class="belt">
          <div class="belt-item">
            <div class="card-icon">
              <img
                class="reciclagem-imagem"
                src="assets/reciclagem/${objeto[0]}.svg"
                alt="Ilustração de ${objeto[1]}"
                width="108"
                height="108"
              >
            </div>

            <strong class="reciclagem-nome">
              ${objeto[1]}
            </strong>
          </div>
        </div>

        <div class="bins">
          ${LIXEIRAS.map(
            (lixeira) => `
              <button
                type="button"
                class="bin"
                style="--bin:${lixeira[2]}"
                data-bin="${lixeira[0]}"
                aria-label="Lixeira ${lixeira[1]}"
                title="${esconderNomes ? "" : lixeira[1]}"
              >
                <span
                  class="reciclagem-simbolo"
                  aria-hidden="true"
                >
                  ♻
                </span>

                ${esconderNomes ? "" : `<span>${lixeira[1]}</span>`}
              </button>
            `,
          ).join("")}
        </div>

        <div id="message"></div>

        <div
          class="btn-row"
          id="next-holder"
        ></div>
      </div>
    `);

    $$("[data-bin]").forEach((botao) => {
      botao.onclick = () => {
        if (respondeu) return;

        const resposta = botao.dataset.bin;

        // RESPOSTA INCORRETA
        if (resposta !== objeto[2]) {
          erros++;

          // Novo: som de erro.
          playWrong();

          botao.classList.add("wrong");

          message(
            "Ainda não! Observe o material do objeto e tente novamente.",
            false,
          );

          setTimeout(() => {
            if (botao.isConnected) {
              botao.classList.remove("wrong");
            }
          }, 600);

          return;
        }

        // RESPOSTA CORRETA
        respondeu = true;
        acertos++;

        // Novo: som de acerto.
        playCorrect();

        botao.classList.add("correct");

        $$("[data-bin]").forEach((lixeira) => {
          lixeira.disabled = true;
        });

        message(
          "Muito bem! " +
            objeto[1] +
            " pertence à categoria " +
            NOMES[objeto[2]] +
            ". " +
            EXPLICACOES[objeto[2]],
        );

        const ultimoObjetoDoNivel = numeroObjeto() === OBJETOS_POR_NIVEL;

        const ultimoObjetoDoJogo = indice === objetos.length - 1;

        const proximo = document.createElement("button");

        proximo.type = "button";
        proximo.className = "btn";
        proximo.id = "next-object";

        proximo.textContent = ultimoObjetoDoJogo
          ? "Concluir aventura"
          : ultimoObjetoDoNivel
            ? "Próximo nível"
            : "Próximo objeto";

        $("#next-holder").appendChild(proximo);

        let avancando = false;

        proximo.onclick = () => {
          if (avancando) return;

          avancando = true;
          proximo.disabled = true;

          indice++;

          // CONCLUSÃO DO JOGO
          if (indice >= objetos.length) {
            // Novo: som de vitória final.
            playVictory();

            finish(
              "Reciclagem completa!",
              "Parabéns! Você concluiu os 8 níveis, separou " +
                acertos +
                " objetos e realizou " +
                erros +
                " tentativa(s) incorreta(s). Agora você conhece melhor as cores da coleta seletiva!",
            );

            return;
          }

          // DESAFIO DAS CORES
          if (nivelAtual() === 5 && numeroObjeto() === 1) {
            desenhar();

            message(
              "Novo desafio! Agora os nomes das lixeiras ficaram escondidos. Use as cores para acertar!",
            );

            return;
          }

          desenhar();
        };
      };
    });
  }

  desenhar();
}
