import { $, $$, esc, rand, shuffle, setArea, message } from "../core/dom.js";
import { timer, interval, listen } from "../core/lifecycle.js";
import { finish } from "../core/router.js";

// 1 — QUIZ
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

function initQuiz() {
  let level = "facil",
    questions = [],
    pos = 0,
    answered = false;
  function draw() {
    const q = questions[pos];
    setArea(
      `<div class="game-wrap"><h2 class="panel-title">🧠 Desafio do Conhecimento</h2><p class="panel-subtitle">Escolha o nível e descubra como cuidar do planeta.</p><div class="level-select">${[
        ["facil", "🌱 Fácil"],
        ["medio", "🌳 Médio"],
        ["dificil", "🌍 Difícil"],
      ]
        .map(
          ([v, t]) =>
            `<button class="level-btn ${level === v ? "active" : ""}" data-level="${v}">${t}</button>`,
        )
        .join(
          "",
        )}</div><div class="status-line"><span class="status-pill">Pergunta ${pos + 1} de ${questions.length}</span><span class="tiny-help">✨ Sem pressa: você pode tentar novamente!</span></div><div class="question-box"><div class="question-emoji">${q[0]}</div><div class="question-text">${q[1]}</div></div><div class="opt-grid">${q[2].map((opt, i) => `<button class="option-btn" data-answer="${i}">${esc(opt)}</button>`).join("")}</div><div id="message"></div><div class="btn-row" id="next-holder"></div></div>`,
    );
    $$(".level-btn").forEach(
      (b) =>
        (b.onclick = () => {
          level = b.dataset.level;
          start();
        }),
    );
    $$("[data-answer]").forEach(
      (b) =>
        (b.onclick = () => {
          if (answered) return;
          const chosen = +b.dataset.answer;
          if (chosen === q[3]) {
            answered = true;
            b.classList.add("correct");
            $$("[data-answer]").forEach((k) => (k.disabled = true));
            message("✅ Isso mesmo! " + q[4]);
            $("#next-holder").innerHTML =
              `<button id="next" class="btn">${pos === questions.length - 1 ? "Concluir aventura" : "Próxima pergunta →"}</button>`;
            $("#next").onclick = () => {
              pos++;
              if (pos === questions.length)
                finish(
                  "Mandou bem! 🌎",
                  "Você terminou o EcoQuiz e aprendeu novas formas de cuidar da natureza!",
                );
              else {
                answered = false;
                draw();
              }
            };
          } else {
            b.classList.add("wrong");
            message(
              "Ainda não! Pense com calma e tente outra alternativa. 💛",
              false,
            );
            timer(() => {
              if (b.isConnected) b.classList.remove("wrong");
            }, 700);
          }
        }),
    );
  }
  function start() {
    questions = shuffle(QUIZ[level]).slice(0, 5);
    pos = 0;
    answered = false;
    draw();
  }
  start();
}

// 3 — FÁBRICA
function initFactory() {
  let idx = 0;
  const items = shuffle([
    ["📰", "Jornal", "papel"],
    ["📦", "Caixa de papelão", "papel"],
    ["🥫", "Lata de conserva", "metal"],
    ["🥤", "Latinha de bebida", "metal"],
    ["🧴", "Frasco plástico vazio", "plastico"],
    ["🛍️", "Sacola plástica", "plastico"],
    ["🍾", "Garrafa de vidro", "vidro"],
    ["🫙", "Pote de vidro", "vidro"],
  ]);
  const bins = [
    ["papel", "Papel", "🔵", "#288fe4"],
    ["plastico", "Plástico", "🔴", "#f25c62"],
    ["vidro", "Vidro", "🟢", "#23a751"],
    ["metal", "Metal", "🟡", "#dfac0d"],
  ];
  function draw() {
    const item = items[idx];
    setArea(
      `<div class="game-wrap"><div class="status-line"><span class="status-pill">Objeto ${idx + 1} de ${items.length}</span><span class="tiny-help">♻️ Separe pelo material do objeto</span></div><h2 class="panel-title">🏭 Esteira da Reciclagem</h2><p class="panel-subtitle">Uma máquina traz os objetos. Escolha qual lixeira deve recebê-los!</p><div class="belt"><div class="belt-item"><div class="card-icon">${item[0]}</div><strong>${item[1]}</strong></div></div><div class="bins">${bins.map((b) => `<button class="bin" style="--bin:${b[3]}" data-bin="${b[0]}"><span>${b[2]}</span>${b[1]}</button>`).join("")}</div><div id="message"></div></div>`,
    );
    $$("[data-bin]").forEach(
      (b) =>
        (b.onclick = () => {
          if (b.dataset.bin === item[2]) {
            idx++;
            if (idx >= items.length)
              finish(
                "Reciclagem completa! ♻️",
                "Você separou todos os materiais da esteira para a coleta seletiva.",
              );
            else draw();
          } else
            message(
              "Observe o material! " +
                item[1] +
                " não pertence a essa lixeira. Tente outra!",
              false,
            );
        }),
    );
  }
  draw();
}

// 4 — ÁGUA
function initPipes() {
  const path = {
    "0,0": [3, 1],
    "0,1": [3, 2],
    "1,1": [0, 2],
    "2,1": [0, 1],
    "2,2": [3, 1],
    "2,3": [3, 2],
    "3,3": [0, 1],
  };
  const cells = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      let d = path[`${r},${c}`] || [
        (r + c) % 2 === 0 ? 0 : 1,
        (r + c) % 2 === 0 ? 2 : 3,
      ];
      let target = [...d].sort().join(",");
      let rot = rand(1, 3);
      cells.push({ r, c, base: d, rot, target, onPath: !!path[`${r},${c}`] });
    }
  const dirs = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];
  function exposed(cell) {
    return cell.base.map((d) => (d + cell.rot) % 4);
  }
  function graphic(cell) {
    let shapes = `<circle cx="50" cy="50" r="14" fill="#2088c2"/>`;
    for (const d of exposed(cell)) {
      let rects = [
        [36, 0, 28, 50],
        [50, 36, 50, 28],
        [36, 50, 28, 50],
        [0, 36, 50, 28],
      ];
      let [x, y, rw, rh] = rects[d];
      shapes += `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="#2796d2" stroke="#166da6" stroke-width="3"/>`;
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${shapes}<circle cx="50" cy="50" r="14" fill="#2796d2" stroke="#166da6" stroke-width="3"/></svg>`;
  }
  function pathWorks() {
    let seen = new Set(),
      stack = [[0, 0]];
    const start = cells[0];
    if (!exposed(start).includes(3)) return false;
    while (stack.length) {
      const [r, c] = stack.pop(),
        k = r * 4 + c;
      if (seen.has(k)) continue;
      seen.add(k);
      const a = cells[k],
        s = exposed(a);
      if (r === 3 && c === 3 && s.includes(1)) return true;
      for (let dir = 0; dir < 4; dir++) {
        if (!s.includes(dir)) continue;
        const [dr, dc] = dirs[dir],
          nr = r + dr,
          nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= 4 || nc >= 4) continue;
        const b = cells[nr * 4 + nc];
        if (exposed(b).includes((dir + 2) % 4)) stack.push([nr, nc]);
      }
    }
    return false;
  }
  function draw() {
    setArea(
      `<div class="game-wrap"><h2 class="panel-title">💧 Conecte a Água!</h2><p class="panel-subtitle">Gire as peças até formar um caminho para a água. Cada toque gira o cano um quarto de volta.</p><div class="water-guide">🚰 ENTRADA: no lado esquerdo superior &nbsp; → &nbsp; 🌱 SAÍDA: no lado direito inferior</div><div class="pipes">${cells.map((cell, i) => `<button data-cell="${i}" class="pipe" aria-label="Girar cano da linha ${cell.r + 1}, coluna ${cell.c + 1}">${graphic(cell)}${i === 0 ? '<span class="pipe-tag">🚰</span>' : ""}${i === 15 ? '<span class="pipe-tag">🌱</span>' : ""}</button>`).join("")}</div><div class="btn-row"><button class="btn" id="test-water">💦 Testar o fluxo</button></div><div id="message"></div></div>`,
    );
    $$("[data-cell]").forEach(
      (el) =>
        (el.onclick = () => {
          const i = +el.dataset.cell;
          cells[i].rot = (cells[i].rot + 1) % 4;
          el.innerHTML =
            graphic(cells[i]) +
            (i === 0
              ? '<span class="pipe-tag">🚰</span>'
              : i === 15
                ? '<span class="pipe-tag">🌱</span>'
                : "");
        }),
    );
    $("#test-water").onclick = () => {
      if (pathWorks())
        finish(
          "Água chegando! 💦",
          "Você conectou os canos e conseguiu levar água até a horta!",
        );
      else
        message(
          "A água ainda não chega até a horta. Confira se os canos se conectam uns aos outros.",
          false,
        );
    };
  }
  draw();
}

// 6 — JARDIM
function initGarden() {
  let day = 1,
    selected = 0,
    plots = [null, null, null],
    hint =
      "Escolha uma espécie para começar. Depois regue, adube e avance os dias.";
  const seeds = [
    ["🌼", "Ipê-amarelo"],
    ["🌸", "Pitanga"],
    ["🌺", "Maracujá"],
  ];
  let chosenSeed = 0;
  function plantedCount() {
    return plots.filter((p) => p && p.stage >= 3).length;
  }
  function draw() {
    setArea(
      `<div class="game-wrap"><div class="status-line"><span class="status-pill">☀️ Dia ${day}</span><span class="status-pill">🌸 Plantas crescendo: ${plantedCount()} de 3</span></div><h2 class="panel-title">🌱 Meu Jardim Sustentável</h2><p class="panel-subtitle">Plante espécies nativas e cuide delas sem desperdiçar água.</p><div class="garden-scene"><div class="garden-plots">${plots.map((p, i) => `<button class="garden-plot ${selected === i ? "active" : ""}" data-plot="${i}"><span class="plant-sprite">${!p ? "🟤" : p.stage === 0 ? "🌱" : p.stage === 1 ? "🌿" : p.stage === 2 ? "🌳" : seeds[p.seed][0]}</span><div>${p ? seeds[p.seed][1] : "Canteiro vazio"}</div>${p ? `<small>💧 ${p.water ? "Regado" : "Precisa de água"} · 🪱 ${p.compost ? "Adubado" : "Sem adubo"}</small>` : ""}</button>`).join("")}</div></div><div class="center" style="margin-bottom:9px"><strong>Canteiro ${selected + 1}:</strong> ${plots[selected] ? "Cuidar da planta" : "Escolher a semente"}</div>${!plots[selected] ? `<div class="level-select">${seeds.map((s, i) => `<button data-seed="${i}" class="level-btn ${chosenSeed === i ? "active" : ""}">${s[0]} ${s[1]}</button>`).join("")}</div>` : ""}<div class="garden-toolbar">${!plots[selected] ? '<button class="btn" id="plant-btn">🌱 Plantar</button>' : '<button class="btn" id="water-btn">💧 Regar</button><button class="btn btn-outline" id="compost-btn">🍂 Adubar</button>'}<button class="btn btn-sun" id="next-day">☀️ Próximo dia</button></div><div id="message" class="notice">${hint}</div></div>`,
    );
    $$("[data-plot]").forEach(
      (b) =>
        (b.onclick = () => {
          selected = +b.dataset.plot;
          draw();
        }),
    );
    $$("[data-seed]").forEach(
      (b) =>
        (b.onclick = () => {
          chosenSeed = +b.dataset.seed;
          draw();
        }),
    );
    if ($("#plant-btn"))
      $("#plant-btn").onclick = () => {
        plots[selected] = {
          seed: chosenSeed,
          stage: 0,
          water: 0,
          compost: false,
        };
        hint = "Boa escolha! Agora regue sua plantinha e adube o solo.";
        draw();
      };
    if ($("#water-btn"))
      $("#water-btn").onclick = () => {
        const p = plots[selected];
        if (p.water)
          message(
            "Uma rega por dia já é suficiente para esta fase. Excesso de água pode prejudicar plantas.",
            false,
          );
        else {
          p.water = 1;
          hint = "💧 A terra recebeu água na medida certa.";
          draw();
        }
      };
    if ($("#compost-btn"))
      $("#compost-btn").onclick = () => {
        plots[selected].compost = true;
        hint = "🍂 Composto orgânico ajuda a melhorar o solo.";
        draw();
      };
    $("#next-day").onclick = () => {
      let grew = false;
      plots.forEach((p) => {
        if (!p || p.stage >= 3) return;
        if (p.water && p.compost) {
          p.stage++;
          grew = true;
        } else if (p.water && p.stage < 1) {
          p.stage++;
          grew = true;
        }
        p.water = 0;
      });
      day++;
      hint = grew
        ? "☀️ Um novo dia chegou! As plantas bem cuidadas cresceram."
        : "🌱 Para as plantas crescerem, lembre-se da água e do adubo.";
      if (plantedCount() === 3)
        finish(
          "Que jardim lindo! 🌼",
          "Você cultivou três plantas, economizou água e cuidou do solo. Borboletas e abelhas agradecem!",
        );
      else draw();
    };
  }
  draw();
}

export const INITS = {
  quiz: initQuiz,
  factory: initFactory,
  pipes: initPipes,
  garden: initGarden,
};
