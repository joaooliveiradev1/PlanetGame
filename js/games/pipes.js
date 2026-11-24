import { $, rand, setArea, message } from "../core/dom.js";
import { listen, timer, onCleanup } from "../core/lifecycle.js";
import { finish } from "../core/router.js";
import {
  playWater,
  stopWater,
  playCorrect,
  playWrong,
  playVictory,
} from "../core/sounds.js";

const SIZE = 4;
const LAST = SIZE * SIZE - 1;

const DIRECTIONS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

const NAMES = ["cima", "direita", "baixo", "esquerda"];

const LEVELS = [
  {
    title: "Do rio até a horta",
    description:
      "A horta precisa de água! Gire os canos para ligar o rio à horta.",
    source: "Rio",
    destination: "Horta",
    icons: ["🥕", "🌱", "🌽"],
    success: "Você ajudou a regar a horta!",
    lesson:
      "A água é essencial para as plantas. Usá-la com cuidado evita desperdícios.",
    path: [0, 1, 5, 6, 10, 11, 15],
  },
  {
    title: "Água para os passarinhos",
    description:
      "Os passarinhos estão com sede. Encontre o caminho até o bebedouro!",
    source: "Rio",
    destination: "Bebedouro",
    icons: ["🐦", "💧", "🕊️"],
    success: "Os passarinhos receberam água!",
    lesson: "Os animais também precisam de água limpa para viver.",
    path: [0, 4, 5, 1, 2, 3, 7, 11, 15],
  },
  {
    title: "As mudas da praça",
    description:
      "As mudinhas precisam crescer. Cuidado com os canos que levam ao lugar errado!",
    source: "Rio",
    destination: "Praça",
    icons: ["🌱", "🌳", "🌻"],
    success: "As mudinhas foram regadas!",
    lesson: "Cuidar das árvores ajuda a criar sombra e proteger a natureza.",
    path: [0, 1, 2, 6, 5, 9, 10, 11, 15],
  },
  {
    title: "A cisterna e o jardim",
    description:
      "A cisterna guarda água da chuva. Descubra como levá-la até o jardim!",
    source: "Cisterna",
    destination: "Jardim",
    icons: ["🌼", "🌿", "🌷"],
    success: "A água chegou ao jardim!",
    lesson: "As cisternas podem armazenar água da chuva para diferentes usos.",
    path: [0, 4, 5, 1, 2, 3, 7, 11, 10, 14, 15],
  },
  {
    title: "Água para a comunidade",
    description:
      "Durante a seca, a água é muito importante. Ligue os canos com atenção!",
    source: "Reservatório",
    destination: "Comunidade",
    icons: ["🏠", "💧", "🏡"],
    success: "Você conseguiu levar água até a comunidade!",
    lesson:
      "No semiárido, armazenar e usar bem a água é especialmente importante.",
    path: [0, 4, 5, 1, 2, 3, 7, 11, 10, 9, 13, 14, 15],
  },
  {
    title: "Missão final: proteger a Caatinga",
    description:
      "Este é o maior desafio! Encontre o caminho completo para ajudar as plantas da Caatinga.",
    source: "Reservatório",
    destination: "Caatinga",
    icons: ["🌵", "🌳", "🦋"],
    success: "Você completou a missão da água!",
    lesson:
      "A Caatinga possui plantas e animais adaptados ao clima semiárido. Proteger esse bioma é muito importante!",
    path: [0, 4, 5, 1, 2, 3, 7, 11, 10, 9, 8, 12, 13, 14, 15],
  },
];

const WALLS = [
  [36, 0, 28, 50],
  [50, 36, 50, 28],
  [36, 50, 28, 50],
  [0, 36, 50, 28],
];

const WATER = [
  [42, 0, 16, 50],
  [50, 42, 50, 16],
  [42, 50, 16, 50],
  [0, 42, 50, 16],
];

const FROM_EDGE = ["50% 0%", "100% 50%", "50% 100%", "0% 50%"];

const FROM_CENTER = ["50% 100%", "0% 50%", "50% 0%", "100% 50%"];

export function initPipes() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PART = reduced ? 0 : 0.25;
  const STEP = reduced ? 0 : 0.55;

  let levelIndex = 0;
  let cells = [];
  let busy = false;
  let done = false;
  let attempts = 0;
  let active = true;

  // Interrompe a água quando o jogador sai do jogo.
  onCleanup(() => {
    active = false;
    stopWater();
  });

  function currentLevel() {
    return LEVELS[levelIndex];
  }

  function directionBetween(from, to) {
    const fromRow = Math.floor(from / SIZE);
    const fromCol = from % SIZE;
    const toRow = Math.floor(to / SIZE);
    const toCol = to % SIZE;

    return DIRECTIONS.findIndex(
      ([dr, dc]) => fromRow + dr === toRow && fromCol + dc === toCol,
    );
  }

  function buildCells() {
    const path = currentLevel().path;
    const required = new Map();

    path.forEach((index, position) => {
      const previous = path[position - 1];
      const next = path[position + 1];

      const entry = position === 0 ? 3 : directionBetween(index, previous);

      const exit =
        position === path.length - 1 ? 1 : directionBetween(index, next);

      if (entry === -1 || exit === -1) {
        throw new Error("Caminho inválido no nível " + (levelIndex + 1));
      }

      required.set(index, [entry, exit]);
    });

    cells = [];

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const index = row * SIZE + col;

        let base = required.get(index);

        if (!base) {
          const decoys = [
            [0, 2],
            [1, 3],
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 0],
          ];

          const options = levelIndex < 2 ? decoys.slice(0, 2) : decoys;

          base = options[rand(0, options.length - 1)];
        }

        cells.push({
          row,
          col,
          base: [...base],
          rotation: rand(1, 3),
          flow: null,
          leak: null,
          leakDelay: 0,
        });
      }
    }

    // Impede que o nível comece resolvido.
    if (trace().result === "win") {
      cells[0].rotation = (cells[0].rotation + 1) % 4;
    }
  }

  function exposed(cell) {
    return cell.base.map((direction) => (direction + cell.rotation) % 4);
  }

  function trace() {
    const steps = [];
    const seen = new Set();

    let index = 0;
    let from = 3;

    if (!exposed(cells[0]).includes(from)) {
      return {
        steps,
        result: "noentry",
      };
    }

    while (!seen.has(index)) {
      seen.add(index);

      const to = exposed(cells[index]).find((direction) => direction !== from);

      steps.push({
        index,
        from,
        to,
      });

      if (index === LAST && to === 1) {
        return {
          steps,
          result: "win",
        };
      }

      const cell = cells[index];
      const [dr, dc] = DIRECTIONS[to];

      const row = cell.row + dr;
      const col = cell.col + dc;

      const inside = row >= 0 && col >= 0 && row < SIZE && col < SIZE;

      if (!inside) {
        return {
          steps,
          result: "leak",
          at: index,
          dir: to,
          outside: true,
        };
      }

      const next = row * SIZE + col;
      const opposite = (to + 2) % 4;

      if (!exposed(cells[next]).includes(opposite)) {
        return {
          steps,
          result: "leak",
          at: index,
          dir: to,
          outside: false,
        };
      }

      index = next;
      from = opposite;
    }

    return {
      steps,
      result: "loop",
    };
  }

  function graphic(cell) {
    const open = exposed(cell);

    const walls = open
      .map((direction) => {
        const [x, y, w, h] = WALLS[direction];

        return `
          <rect
            x="${x}"
            y="${y}"
            width="${w}"
            height="${h}"
            fill="#9db8c6"
            stroke="#5d8196"
            stroke-width="3"
          />
        `;
      })
      .join("");

    let water = "";

    if (cell.flow) {
      water = open
        .map((direction) => {
          const isEntry = direction === cell.flow.from;

          const delay = cell.flow.delay + (isEntry ? 0 : PART);

          const origin = isEntry
            ? FROM_EDGE[direction]
            : FROM_CENTER[direction];

          const axis = direction % 2 === 0 ? "ax-y" : "ax-x";

          const [x, y, w, h] = WATER[direction];

          return `
            <rect
              class="w ${axis}"
              x="${x}"
              y="${y}"
              width="${w}"
              height="${h}"
              rx="4"
              fill="#35b8f5"
              style="--d:${delay}s;--o:${origin}"
            />
          `;
        })
        .join("");

      water += `
        <circle
          class="w hub"
          cx="50"
          cy="50"
          r="9"
          fill="#35b8f5"
          style="--d:${cell.flow.delay + PART * 0.8}s"
        />
      `;
    }

    return `
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        ${walls}
        <circle
          cx="50"
          cy="50"
          r="14"
          fill="#9db8c6"
          stroke="#5d8196"
          stroke-width="3"
        />
        ${water}
      </svg>
    `;
  }

  function cellContent(cell) {
    const leak =
      cell.leak === null
        ? ""
        : `
          <span
            class="leak leak-${cell.leak}"
            style="--d:${cell.leakDelay}s"
            aria-hidden="true"
          >💧</span>
        `;

    return graphic(cell) + leak;
  }

  function cellLabel(cell, index) {
    const openings = exposed(cell)
      .map((direction) => NAMES[direction])
      .join(" e ");

    let label =
      `Girar cano da linha ${cell.row + 1}, ` +
      `coluna ${cell.col + 1}. ` +
      `Aberturas para ${openings}.`;

    if (index === 0) {
      label += " Aqui a água pode entrar.";
    }

    if (index === LAST) {
      label += " Aqui a água pode sair.";
    }

    return label;
  }

  function paintCell(index) {
    const button = $(`[data-cell="${index}"]`);

    if (!button) return;

    button.innerHTML = cellContent(cells[index]);

    button.setAttribute("aria-label", cellLabel(cells[index], index));
  }

  function clearFlow() {
    // Evita que o áudio continue após
    // reiniciar a tentativa.
    stopWater();

    const scene = $("#pipes-scene");
    const garden = $("#garden-strip");
    const feedback = $("#message");

    if (scene) {
      scene.classList.remove("flowing", "win");
    }

    if (garden) {
      garden.classList.remove("watered");
    }

    cells.forEach((cell, index) => {
      if (cell.flow || cell.leak !== null) {
        cell.flow = null;
        cell.leak = null;
        cell.leakDelay = 0;

        paintCell(index);
      }
    });

    if (feedback) {
      feedback.textContent = "";
      feedback.className = "";
    }
  }

  function leakText(info) {
    if (info.result === "loop") {
      return (
        "A água ficou dando voltas! " +
        "Tente criar um caminho que chegue ao destino."
      );
    }

    const cell = cells[info.at];

    const place = `linha ${cell.row + 1}, ` + `coluna ${cell.col + 1}`;

    const side = NAMES[info.dir];

    if (info.outside) {
      return (
        `A água escapou na ${place}, ` +
        `pelo lado ${side}. ` +
        "Gire os canos e tente novamente!"
      );
    }

    return (
      `A água parou na ${place}. ` +
      `O cano aponta para ${side}, ` +
      "mas não está ligado ao próximo. " +
      "Vamos tentar de novo?"
    );
  }

  function nextLevel() {
    stopWater();

    if (levelIndex === LEVELS.length - 1) {
      // Som especial da conclusão final.
      playVictory();

      const totalAttempts = attempts;

      finish(
        "Missão da água concluída! 💧🏆",
        `Você completou os 6 níveis do Gota a Gota! ` +
          `Foram ${totalAttempts} testes de água ` +
          "durante a aventura. " +
          "Agora você sabe como ligar caminhos e " +
          "por que precisamos cuidar da água!",
      );

      return;
    }

    levelIndex++;
    busy = false;
    done = false;

    buildCells();
    draw();
  }

  function startFlow() {
    if (!active || busy || done) {
      return;
    }

    clearFlow();

    attempts++;

    const info = trace();

    if (info.result === "noentry") {
      playWrong();

      message(
        "💧 A água não consegue entrar! " +
          "O primeiro cano precisa ter uma " +
          "abertura para a esquerda.",
        false,
      );

      return;
    }

    busy = true;

    const scene = $("#pipes-scene");
    const garden = $("#garden-strip");

    const arrive = (info.steps.length - 1) * STEP + PART * 2;

    info.steps.forEach((step, order) => {
      cells[step.index].flow = {
        from: step.from,
        to: step.to,
        delay: order * STEP,
      };
    });

    if (info.result === "leak") {
      const cell = cells[info.at];

      cell.leak = info.dir;

      cell.leakDelay = cell.flow.delay + PART * 2;
    }

    info.steps.forEach((step) => {
      paintCell(step.index);
    });

    scene.style.setProperty("--out-delay", `${arrive}s`);

    scene.classList.add("flowing");

    if (info.result === "win") {
      scene.classList.add("win");
    }

    message("💧 A água está correndo pelos canos...");

    const total = Math.round((arrive + PART) * 1000) + 300;

    // Som de água em TODOS os níveis
    // e em todas as tentativas válidas.
    playWater(total);

    timer(() => {
      if (!active) return;

      // Finaliza o som quando a
      // animação da água termina.
      stopWater();

      if (info.result === "win") {
        done = true;

        garden.classList.add("watered");

        // Som de acerto por nível.
        playCorrect();

        message(`🎉 ${currentLevel().success}`);

        timer(
          () => {
            if (!active) return;

            if (levelIndex === LEVELS.length - 1) {
              nextLevel();
              return;
            }

            const level = currentLevel();

            const feedback = $("#message");

            if (!feedback) return;

            feedback.innerHTML = `
              <div>
                <strong>
                  🌟 Nível ${levelIndex + 1} concluído!
                </strong>

                <p>
                  ${level.lesson}
                </p>

                <button
                  type="button"
                  class="btn"
                  id="next-pipes-level"
                >
                  Próximo nível →
                </button>
              </div>
            `;

            const nextButton = $("#next-pipes-level");

            if (nextButton) {
              nextButton.onclick = nextLevel;
            }
          },
          reduced ? 300 : 900,
        );

        return;
      }

      busy = false;

      // Som de tentativa incorreta.
      playWrong();

      message(leakText(info), false);
    }, total);
  }

  function draw() {
    const level = currentLevel();

    setArea(`
      <div class="game-wrap">
        <div class="status-line">
          <span class="status-pill">
            💧 Nível ${levelIndex + 1}
            de ${LEVELS.length}
          </span>

          <span class="tiny-help">
            Caminho com ${level.path.length} canos
          </span>
        </div>

        <h2 class="panel-title">
          💧 ${level.title}
        </h2>

        <p class="panel-subtitle">
          ${level.description}
          Toque nos canos para girá-los.
          Depois, solte a água!
        </p>

        <div
          class="pipes-scene"
          id="pipes-scene"
        >
          <div
            class="river"
            aria-hidden="true"
          >
            <b>${level.source}</b>
            <span class="fish f1">🐟</span>
            <span class="fish f2">🐠</span>
          </div>

          <div class="pipes-center">
            <div class="pipes-board">
              <div
                class="stub stub-in"
                aria-hidden="true"
              >
                <i></i>
              </div>

              <div
                class="pipes"
                id="pipes-grid"
              >
                ${cells
                  .map(
                    (cell, index) => `
                      <button
                        type="button"
                        class="pipe"
                        data-cell="${index}"
                        aria-label="${cellLabel(cell, index)}"
                      >
                        ${cellContent(cell)}
                      </button>
                    `,
                  )
                  .join("")}
              </div>

              <div
                class="stub stub-out"
                aria-hidden="true"
              >
                <i></i>
              </div>
            </div>
          </div>

          <div
            class="garden-strip"
            id="garden-strip"
            aria-hidden="true"
          >
            <b>${level.destination}</b>

            ${level.icons.map((icon) => `<span>${icon}</span>`).join("")}
          </div>
        </div>

        <div class="btn-row">
          <button
            type="button"
            class="btn"
            id="test-water"
          >
            💦 Soltar a água
          </button>
        </div>

        <div id="message"></div>
      </div>
    `);

    listen($("#pipes-grid"), "click", (event) => {
      const button = event.target.closest("[data-cell]");

      if (!button || busy || done || !active) {
        return;
      }

      clearFlow();

      const index = Number(button.dataset.cell);

      cells[index].rotation = (cells[index].rotation + 1) % 4;

      paintCell(index);
    });

    $("#test-water").onclick = startFlow;
  }

  buildCells();
  draw();
}
