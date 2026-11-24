import { $, setArea, shuffle } from "../core/dom.js";
import { finish } from "../core/router.js";
import { playCorrect, playWrong, playVictory } from "../core/sounds.js";

const SPECIES = [
  {
    name: "Mandacaru",
    scientific: "Cereus jamacaru",
    fact: "O mandacaru é um cacto da Caatinga. Seus frutos servem de alimento para animais.",
    emoji: "🌵",
  },
  {
    name: "Tatu-bola",
    scientific: "Tolypeutes tricinctus",
    fact: "O tatu-bola consegue se enrolar para se proteger de alguns perigos.",
    emoji: "🐾",
  },
  {
    name: "Umbuzeiro",
    scientific: "Spondias tuberosa",
    fact: "O umbuzeiro é uma árvore da Caatinga que produz o fruto chamado umbu.",
    emoji: "🌳",
  },
  {
    name: "Asa-branca",
    scientific: "Patagioenas picazuro",
    fact: "A asa-branca é uma ave conhecida no Nordeste brasileiro.",
    emoji: "🕊️",
  },
  {
    name: "Carcará",
    scientific: "Caracara plancus",
    fact: "O carcará é uma ave de rapina encontrada em diferentes ambientes brasileiros.",
    emoji: "🦅",
  },
  {
    name: "Xique-xique",
    scientific: "Pilosocereus gounellei",
    fact: "O xique-xique é um cacto adaptado às condições secas da Caatinga.",
    emoji: "🌵",
  },
  {
    name: "Juazeiro",
    scientific: "Sarcomphalus joazeiro",
    fact: "O juazeiro é uma árvore que pode continuar verde durante períodos de seca.",
    emoji: "🌿",
  },
  {
    name: "Mocó",
    scientific: "Kerodon rupestris",
    fact: "O mocó é um roedor que vive em ambientes rochosos e ocorre na Caatinga.",
    emoji: "🐾",
  },
];

const LEVELS = [
  { pairs: 2, title: "Primeiros encontros" },
  { pairs: 3, title: "Explorando a Caatinga" },
  { pairs: 4, title: "Conhecendo os animais" },
  { pairs: 5, title: "Amigos da natureza" },
  { pairs: 6, title: "Desafio da memória" },
  { pairs: 8, title: "Guardião da Caatinga" },
];

const API = "https://commons.wikimedia.org/w/api.php";
const ROOT_ID = "memory-caatinga";

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function allowedLicense(metadata) {
  const license = metadata?.LicenseShortName?.value || "";

  return /^(CC BY|CC0|Public domain|PD-)/i.test(license);
}

async function searchPhoto(species) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: `filetype:bitmap "${species.scientific}"`,
    gsrnamespace: "6",
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "600",
  });

  const response = await fetch(`${API}?${params}`);

  if (!response.ok) {
    throw new Error("Não foi possível consultar as fotografias.");
  }

  const data = await response.json();

  const pages = Object.values(data.query?.pages || {});

  const candidates = pages
    .map((page) => ({
      title: page.title,
      info: page.imageinfo?.[0],
    }))
    .filter(
      ({ info }) =>
        info &&
        /^image\/(jpeg|png|webp)$/.test(info.mime || "") &&
        info.thumburl &&
        allowedLicense(info.extmetadata),
    );

  if (!candidates.length) {
    throw new Error(`Nenhuma foto encontrada para ${species.name}.`);
  }

  const selected = candidates[0];

  return {
    ...species,
    image: selected.info.thumburl,
    page: selected.info.descriptionurl,
    license:
      selected.info.extmetadata?.LicenseShortName?.value || "Licença aberta",
  };
}

const STYLES = `
<style>
  #${ROOT_ID} {
    --memory-green: #168b70;
    --memory-dark: #245343;
    --memory-light: #e9f8ee;
    --memory-yellow: #ffe59a;
  }

  #${ROOT_ID} .memory-intro {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 18px;
  }

  #${ROOT_ID} .memory-stats {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    margin: 16px auto 22px;
  }

  #${ROOT_ID} .memory-stat {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #f1f8f6;
    border: 2px solid #ccebd9;
    border-radius: 16px;
    padding: 12px 20px;
    font-size: 15px;
    font-weight: 800;
    color: var(--memory-dark);
    box-shadow: 0 3px 8px #0000000a;
  }

  #${ROOT_ID} .memory-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    width: 100%;
    max-width: 920px;
    margin: 24px auto;
  }

  #${ROOT_ID} .memory-card {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    min-height: 150px;
    padding: 0;
    border: 0;
    border-radius: 20px;
    background: transparent;
    perspective: 1000px;
    cursor: pointer;
    font: inherit;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.2s ease;
  }

  #${ROOT_ID} .memory-card:hover:not(:disabled) {
    transform: translateY(-4px);
  }

  #${ROOT_ID} .memory-card:focus-visible {
    outline: 4px solid #f1bd42;
    outline-offset: 4px;
  }

  #${ROOT_ID} .memory-card-inner {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    transform-style: preserve-3d;
    transition: transform 0.5s ease;
  }

  #${ROOT_ID} .memory-card.open .memory-card-inner,
  #${ROOT_ID} .memory-card.matched .memory-card-inner {
    transform: rotateY(180deg);
  }

  #${ROOT_ID} .memory-face {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    border-radius: inherit;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  #${ROOT_ID} .memory-back {
    background:
      radial-gradient(
        circle at 25% 20%,
        #55c69a 0%,
        transparent 40%
      ),
      linear-gradient(
        145deg,
        #22a783,
        #0d6459
      );
    border: 4px solid #d8f4e4;
    box-shadow: 0 6px 14px #0000001c;
    color: white;
  }

  #${ROOT_ID} .memory-symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: #ffffff20;
    border: 2px solid #ffffff45;
    font-size: clamp(38px, 5vw, 62px);
    line-height: 1;
  }

  #${ROOT_ID} .memory-back-label {
    margin-top: 14px;
    font-size: clamp(11px, 1.4vw, 15px);
    font-weight: 900;
    letter-spacing: 1px;
  }

  #${ROOT_ID} .memory-front {
    transform: rotateY(180deg);
    background: white;
    border: 4px solid #b9e6d0;
    box-shadow: 0 6px 14px #00000018;
  }

  #${ROOT_ID} .memory-front img {
    display: block;
    width: 100%;
    height: calc(100% - 45px);
    object-fit: cover;
  }

  #${ROOT_ID} .memory-name {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 45px;
    padding: 5px;
    background: white;
    color: var(--memory-dark);
    font-size: clamp(12px, 1.4vw, 16px);
    font-weight: 900;
    text-align: center;
    line-height: 1.15;
  }

  #${ROOT_ID} .memory-card.matched {
    cursor: default;
  }

  #${ROOT_ID} .memory-card.matched .memory-front {
    border-color: #36bc78;
    box-shadow:
      0 0 0 3px #d5f6df,
      0 6px 18px #26a56a30;
  }

  #${ROOT_ID} .memory-card.matched::after {
    content: "✓";
    position: absolute;
    z-index: 2;
    top: -8px;
    right: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #26a56a;
    color: white;
    font-size: 22px;
    font-weight: 900;
    box-shadow: 0 3px 8px #00000022;
  }

  #${ROOT_ID} .memory-info {
    max-width: 800px;
    margin: 24px auto;
    padding: 20px;
    border-radius: 20px;
    border: 2px solid #bce9cb;
    background: #f0fbf3;
    text-align: center;
    box-shadow: 0 4px 12px #0000000a;
  }

  #${ROOT_ID} .memory-info h3 {
    margin: 0 0 8px;
    color: #26734a;
    font-size: clamp(18px, 2vw, 24px);
  }

  #${ROOT_ID} .memory-info p {
    margin: 0;
    color: #355f49;
    font-size: 15px;
    line-height: 1.6;
  }

  #${ROOT_ID} .memory-credits {
    max-width: 850px;
    margin: 26px auto 0;
    font-size: 12px;
    line-height: 1.8;
    color: #647b72;
    text-align: center;
  }

  #${ROOT_ID} .memory-credits a {
    color: #177f69;
    text-decoration: underline;
  }

  /* Remove dicas extras apenas deste jogo. */
  #${ROOT_ID} .game-tips {
    display: none !important;
  }

  @media (max-width: 650px) {
    #${ROOT_ID} .memory-grid {
      gap: 10px;
    }

    #${ROOT_ID} .memory-card {
      min-height: 100px;
      border-radius: 14px;
    }

    #${ROOT_ID} .memory-back,
    #${ROOT_ID} .memory-front {
      border-width: 2px;
    }

    #${ROOT_ID} .memory-symbol {
      width: 48px;
      height: 48px;
      font-size: 34px;
    }

    #${ROOT_ID} .memory-back-label {
      margin-top: 7px;
      font-size: 10px;
    }

    #${ROOT_ID} .memory-name {
      min-height: 34px;
      font-size: 11px;
    }

    #${ROOT_ID} .memory-front img {
      height: calc(100% - 34px);
    }
  }

  @media (max-width: 400px) {
    #${ROOT_ID} .memory-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    #${ROOT_ID} .memory-card {
      min-height: 115px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #${ROOT_ID} .memory-card,
    #${ROOT_ID} .memory-card-inner {
      transition: none;
    }
  }
</style>
`;

export function initGarden() {
  let levelIndex = 0;
  let deck = [];
  let selected = [];
  let matched = new Set();
  let attempts = 0;
  let locked = false;
  let photos = [];

  // Identifica cada rodada para impedir que
  // animações antigas afetem um novo nível.
  let roundId = 0;

  // Identifica tentativas de carregamento.
  let loadId = 0;

  function isCurrent() {
    return Boolean(document.getElementById(ROOT_ID));
  }

  function isSameRound(id) {
    return isCurrent() && id === roundId;
  }

  function showLoading() {
    setArea(`
      <div class="game-wrap" id="${ROOT_ID}">
        ${STYLES}

        <h2 class="panel-title">
          🌵 Memória da Caatinga
        </h2>

        <p class="panel-subtitle">
          Vamos conhecer os animais e as plantas
          da Caatinga por meio de fotografias reais!
        </p>

        <div class="question-box">
          <div class="question-text">
            🌿 Carregando fotografias da natureza...
          </div>
        </div>
      </div>
    `);
  }

  function showLoadError() {
    if (!isCurrent()) return;

    setArea(`
      <div class="game-wrap" id="${ROOT_ID}">
        ${STYLES}

        <h2 class="panel-title">
          🌵 Memória da Caatinga
        </h2>

        <div class="question-box">
          <div class="question-text">
            Não conseguimos carregar todas as fotografias.
            Verifique sua conexão com a internet
            e tente novamente.
          </div>
        </div>

        <div class="btn-row">
          <button
            type="button"
            class="btn"
            id="memory-retry"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    `);

    $("#memory-retry").onclick = loadPhotos;
  }

  async function loadPhotos() {
    const currentLoad = ++loadId;

    showLoading();

    try {
      const results = await Promise.all(SPECIES.map(searchPhoto));

      if (currentLoad !== loadId || !isCurrent()) {
        return;
      }

      photos = results;
      startLevel();
    } catch (error) {
      if (currentLoad !== loadId || !isCurrent()) {
        return;
      }

      console.error("Erro ao carregar fotografias:", error);

      showLoadError();
    }
  }

  function startLevel() {
    roundId++;

    const level = LEVELS[levelIndex];

    selected = [];
    matched = new Set();
    attempts = 0;
    locked = false;

    const chosen = photos.slice(0, level.pairs);

    deck = shuffle(
      chosen.flatMap((species) => [
        {
          ...species,
          cardId: `${species.scientific}-a`,
        },
        {
          ...species,
          cardId: `${species.scientific}-b`,
        },
      ]),
    );

    draw();
  }

  function draw() {
    const level = LEVELS[levelIndex];

    setArea(`
      <div class="game-wrap" id="${ROOT_ID}">
        ${STYLES}

        <div class="status-line">
          <span class="status-pill">
            🌵 Nível ${levelIndex + 1}
            de ${LEVELS.length}
          </span>

          <span class="tiny-help">
            ${escapeHTML(level.title)}
          </span>
        </div>

        <div class="memory-intro">
          <h2 class="panel-title">
            🦋 Memória da Caatinga
          </h2>

          <p class="panel-subtitle">
            Vire duas cartas e encontre as
            fotografias iguais.
            Descubra curiosidades sobre
            a nossa natureza!
          </p>
        </div>

        <div class="memory-stats">
          <span
            class="memory-stat"
            id="memory-pairs"
          >
            🌟 Pares: 0/${level.pairs}
          </span>

          <span
            class="memory-stat"
            id="memory-attempts"
          >
            🎯 Tentativas: 0
          </span>
        </div>

        <div
          class="memory-grid"
          id="memory-grid"
        >
          ${deck
            .map(
              (card, index) => `
                <button
                  type="button"
                  class="memory-card"
                  data-index="${index}"
                  aria-label="Carta ${index + 1}, virada para baixo"
                  aria-pressed="false"
                >
                  <span class="memory-card-inner">

                    <span class="memory-face memory-back">
                      <span class="memory-symbol">
                        🌵
                      </span>

                      <span class="memory-back-label">
                        CAATINGA
                      </span>
                    </span>

                    <span class="memory-face memory-front">
                      <img
                        src="${escapeHTML(card.image)}"
                        alt="${escapeHTML(card.name)}"
                        loading="eager"
                      >

                      <span class="memory-name">
                        ${escapeHTML(card.name)}
                      </span>
                    </span>

                  </span>
                </button>
              `,
            )
            .join("")}
        </div>

        <div
          class="memory-info"
          id="memory-info"
          role="status"
          aria-live="polite"
        >
          <h3>🌿 Encontre os pares!</h3>

          <p>
            Observe as imagens e use sua memória.
            Cada par revela uma curiosidade!
          </p>
        </div>

        <div
          class="btn-row"
          id="memory-actions"
        >
          <button
            type="button"
            class="btn btn-outline"
            id="memory-restart"
          >
            🔄 Reiniciar nível
          </button>
        </div>

        <div class="memory-credits">
          Fotografias: Wikimedia Commons.

          <a
            href="https://commons.wikimedia.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Conhecer a fonte
          </a>

          <div id="memory-photo-credits"></div>
        </div>
      </div>
    `);

    $("#memory-grid").addEventListener("click", (event) => {
      const button = event.target.closest("[data-index]");

      if (!button) return;

      flipCard(Number(button.dataset.index));
    });

    $("#memory-restart").onclick = startLevel;

    const credits = $("#memory-photo-credits");

    photos.slice(0, level.pairs).forEach((photo, index) => {
      const link = document.createElement("a");

      link.href = photo.page;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      link.textContent = `${photo.name} (${photo.license})`;

      if (index > 0) {
        credits.appendChild(document.createTextNode(" · "));
      }

      credits.appendChild(link);
    });
  }

  function updateStats() {
    const pairsElement = $("#memory-pairs");

    const attemptsElement = $("#memory-attempts");

    if (pairsElement) {
      pairsElement.textContent = `🌟 Pares: ${matched.size}/${LEVELS[levelIndex].pairs}`;
    }

    if (attemptsElement) {
      attemptsElement.textContent = `🎯 Tentativas: ${attempts}`;
    }
  }

  function showInfo(title, text) {
    const info = $("#memory-info");

    if (!info) return;

    info.innerHTML = `
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(text)}</p>
    `;
  }

  function flipCard(index) {
    if (locked || !isCurrent()) {
      return;
    }

    const card = deck[index];

    if (!card || matched.has(card.scientific) || selected.includes(index)) {
      return;
    }

    const button = $(`[data-index="${index}"]`);

    if (!button) return;

    button.classList.add("open");

    button.setAttribute("aria-pressed", "true");

    button.setAttribute("aria-label", `${card.name}, carta revelada`);

    selected.push(index);

    if (selected.length < 2) {
      return;
    }

    locked = true;
    attempts++;

    updateStats();

    const currentRound = roundId;

    const [firstIndex, secondIndex] = selected;

    const first = deck[firstIndex];
    const second = deck[secondIndex];

    // PAR CORRETO
    if (first.scientific === second.scientific) {
      matched.add(first.scientific);

      // Som ao encontrar um par.
      playCorrect();

      showInfo(`🌟 Você encontrou ${first.name}!`, first.fact);

      setTimeout(() => {
        if (!isSameRound(currentRound)) {
          return;
        }

        [firstIndex, secondIndex].forEach((i) => {
          const element = $(`[data-index="${i}"]`);

          if (!element) return;

          element.classList.remove("open");

          element.classList.add("matched");

          element.disabled = true;

          element.setAttribute("aria-label", `${deck[i].name}, par encontrado`);
        });

        selected = [];
        locked = false;

        updateStats();

        if (matched.size === LEVELS[levelIndex].pairs) {
          completeLevel();
        }
      }, 650);

      return;
    }

    // PAR INCORRETO
    playWrong();

    showInfo(
      "🌿 Ainda não são iguais!",
      "Observe bem as fotografias e tente novamente.",
    );

    setTimeout(() => {
      if (!isSameRound(currentRound)) {
        return;
      }

      [firstIndex, secondIndex].forEach((i) => {
        const element = $(`[data-index="${i}"]`);

        if (!element) return;

        element.classList.remove("open");

        element.setAttribute("aria-pressed", "false");

        element.setAttribute("aria-label", `Carta ${i + 1}, virada para baixo`);
      });

      selected = [];
      locked = false;
    }, 1100);
  }

  function completeLevel() {
    const isLast = levelIndex === LEVELS.length - 1;

    // Comemoração ao completar o nível.
    playVictory();

    showInfo(
      "🏆 Parabéns! Nível concluído!",
      `Você encontrou todos os pares em ${attempts} tentativas.`,
    );

    const actions = $("#memory-actions");

    if (!actions) return;

    actions.innerHTML = `
      <button
        type="button"
        class="btn"
        id="memory-next"
      >
        ${isLast ? "🏆 Concluir aventura" : "Próximo nível →"}
      </button>
    `;

    $("#memory-next").onclick = () => {
      if (isLast) {
        finish(
          "Guardião da Caatinga! 🌵🏆",
          "Você completou os seis níveis do jogo da memória! " +
            "Conheceu animais e plantas da Caatinga e descobriu " +
            "por que esse bioma é tão especial. Continue " +
            "aprendendo e cuidando da natureza!",
        );

        return;
      }

      levelIndex++;
      startLevel();
    };
  }

  loadPhotos();
}
