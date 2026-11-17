import { $, rand, setArea, message } from "../core/dom.js";
import { listen, timer } from "../core/lifecycle.js";
import { finish } from "../core/router.js";

export function initPipes() {
  const SIZE = 4;
  const LAST = SIZE * SIZE - 1;

  const DIRECTIONS = [
    [-1, 0], // cima
    [0, 1], // direita
    [1, 0], // baixo
    [0, -1], // esquerda
  ];
  const NAMES = ["cima", "direita", "baixo", "esquerda"];

  const PATH = {
    "0,0": [3, 1],
    "0,1": [3, 2],
    "1,1": [0, 2],
    "2,1": [0, 1],
    "2,2": [3, 1],
    "2,3": [3, 2],
    "3,3": [0, 1],
  };

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

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PART = reduced ? 0 : 0.25;
  const STEP = reduced ? 0 : 0.55;

  const cells = [];
  let busy = false;
  let done = false;

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const base =
        PATH[`${row},${col}`] || ((row + col) % 2 === 0 ? [0, 2] : [1, 3]);
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

  function exposed(cell) {
    return cell.base.map((direction) => (direction + cell.rotation) % 4);
  }

  function trace() {
    const steps = [];
    const seen = new Set();
    let index = 0;
    let from = 3;

    if (!exposed(cells[0]).includes(from)) {
      return { steps, result: "noentry" };
    }

    while (!seen.has(index)) {
      seen.add(index);

      const to = exposed(cells[index]).find((d) => d !== from);
      steps.push({ index, from, to });

      if (index === LAST && to === 1) {
        return { steps, result: "win" };
      }

      const cell = cells[index];
      const [dr, dc] = DIRECTIONS[to];
      const row = cell.row + dr;
      const col = cell.col + dc;
      const inside = row >= 0 && col >= 0 && row < SIZE && col < SIZE;
      const next = row * SIZE + col;
      const opposite = (to + 2) % 4;

      if (!inside) {
        return { steps, result: "leak", at: index, dir: to, outside: true };
      }

      if (!exposed(cells[next]).includes(opposite)) {
        return { steps, result: "leak", at: index, dir: to, outside: false };
      }

      index = next;
      from = opposite;
    }

    return { steps, result: "leak", at: index, dir: from, outside: false };
  }

  function graphic(cell) {
    const open = exposed(cell);

    const walls = open
      .map((d) => {
        const [x, y, w, h] = WALLS[d];
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#9db8c6" stroke="#5d8196" stroke-width="3"/>`;
      })
      .join("");

    let water = "";

    if (cell.flow) {
      water = open
        .map((d) => {
          const isEntry = d === cell.flow.from;
          const delay = cell.flow.delay + (isEntry ? 0 : PART);
          const origin = isEntry ? FROM_EDGE[d] : FROM_CENTER[d];
          const axis = d % 2 === 0 ? "ax-y" : "ax-x";
          const [x, y, w, h] = WATER[d];
          return `<rect class="w ${axis}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#35b8f5" style="--d:${delay}s;--o:${origin}"/>`;
        })
        .join("");

      water += `<circle class="w hub" cx="50" cy="50" r="9" fill="#35b8f5" style="--d:${cell.flow.delay + PART * 0.8}s"/>`;
    }

    return `
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        ${walls}
        <circle cx="50" cy="50" r="14" fill="#9db8c6" stroke="#5d8196" stroke-width="3"/>
        ${water}
      </svg>
    `;
  }

  function cellContent(cell) {
    const leak =
      cell.leak === null
        ? ""
        : `<span class="leak leak-${cell.leak}" style="--d:${cell.leakDelay}s" aria-hidden="true">💧</span>`;

    return graphic(cell) + leak;
  }

  function cellLabel(cell, index) {
    const openings = exposed(cell)
      .map((d) => NAMES[d])
      .join(" e ");

    let label =
      `Girar cano da linha ${cell.row + 1}, coluna ${cell.col + 1}. ` +
      `Aberturas para ${openings}.`;

    if (index === 0) label += " Aqui a água do rio pode entrar.";
    if (index === LAST) label += " Aqui a água pode sair para a horta.";

    return label;
  }

  function paintCell(index) {
    const button = $(`[data-cell="${index}"]`);
    if (!button) return;
    button.innerHTML = cellContent(cells[index]);
    button.setAttribute("aria-label", cellLabel(cells[index], index));
  }

  function clearFlow() {
    const scene = $("#pipes-scene");
    const garden = $("#garden-strip");
    const feedback = $("#message");

    if (scene) scene.classList.remove("flowing", "win");
    if (garden) garden.classList.remove("watered");

    cells.forEach((cell, index) => {
      if (cell.flow || cell.leak !== null) {
        cell.flow = null;
        cell.leak = null;
        paintCell(index);
      }
    });

    if (feedback) {
      feedback.textContent = "";
      feedback.className = "";
    }
  }

  function leakText(info) {
    const cell = cells[info.at];
    const place = `linha ${cell.row + 1}, coluna ${cell.col + 1}`;
    const side = NAMES[info.dir];

    if (info.outside) {
      return (
        `A água escapou no cano da ${place}: a abertura dele para ${side} ` +
        "aponta para fora do tabuleiro. Gire os canos para fechar o caminho."
      );
    }

    return (
      `A água escapou no cano da ${place}: a abertura dele para ${side} ` +
      "não encontra outro cano ligado. Gire os canos para ligar um no outro."
    );
  }

  function startFlow() {
    if (busy || done) return;

    clearFlow();

    const info = trace();

    if (info.result === "noentry") {
      message(
        "A água não consegue entrar: o primeiro cano precisa ter uma abertura para a esquerda, onde fica o rio.",
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

    info.steps.forEach((step) => paintCell(step.index));

    scene.style.setProperty("--out-delay", `${arrive}s`);
    scene.classList.add("flowing");
    if (info.result === "win") scene.classList.add("win");

    message("💧 A água está correndo pelos canos...");

    const total = Math.round((arrive + PART) * 1000) + 300;

    timer(() => {
      if (info.result === "win") {
        done = true;
        garden.classList.add("watered");
        message("🌱 A água chegou à horta!");

        timer(
          () =>
            finish(
              "Água chegando! 💦",
              "Você levou a água do rio até a horta sem deixar vazar. Quando os canos se ligam de ponta a ponta, a água chega ao destino!",
            ),
          reduced ? 600 : 1500,
        );
        return;
      }

      busy = false;
      message(leakText(info), false);
    }, total);
  }

  function draw() {
    setArea(`
      <div class="game-wrap">
        <h2 class="panel-title">💧 Do rio até a horta</h2>

        <p class="panel-subtitle">
          A água entra pelo rio, à esquerda. Gire os canos para ligar um no
          outro até ela chegar à horta, à direita, sem escapar.
        </p>

        <div class="pipes-scene" id="pipes-scene">
          <div class="river" aria-hidden="true">
            <b>Rio</b>
            <span class="fish f1">🐟</span>
            <span class="fish f2">🐠</span>
          </div>

          <div class="pipes-center">
            <div class="pipes-board">
              <div class="stub stub-in" aria-hidden="true"><i></i></div>
              <div class="pipes" id="pipes-grid">
                ${cells
                  .map(
                    (cell, index) => `
                      <button
                        type="button"
                        class="pipe"
                        data-cell="${index}"
                        aria-label="${cellLabel(cell, index)}"
                      >${cellContent(cell)}</button>
                    `,
                  )
                  .join("")}
              </div>
              <div class="stub stub-out" aria-hidden="true"><i></i></div>
            </div>
          </div>

          <div class="garden-strip" id="garden-strip" aria-hidden="true">
            <b>Horta</b>
            <span>🥕</span>
            <span>🌱</span>
            <span>🌽</span>
          </div>
        </div>

        <div class="btn-row">
          <button type="button" class="btn" id="test-water">
            💦 Soltar a água
          </button>
        </div>

        <div id="message"></div>
      </div>
    `);

    listen($("#pipes-grid"), "click", (event) => {
      const button = event.target.closest("[data-cell]");
      if (!button || busy || done) return;

      clearFlow();

      const index = Number(button.dataset.cell);
      cells[index].rotation = (cells[index].rotation + 1) % 4;
      paintCell(index);
    });

    $("#test-water").onclick = startFlow;
  }

  draw();
}
