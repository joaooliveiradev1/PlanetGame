import { $, $$ } from "./dom.js";
import { cleanup, state } from "./lifecycle.js";
import { GAMES } from "../data/games.js";

const inits = {};
export const registerGames = (map) => Object.assign(inits, map);

export function renderMenu() {
  $("#game-grid").innerHTML = GAMES.map(
    (g) =>
      `<button type="button" class="game-card" style="--tint:${g.tint};--card-color:${g.color}" data-game="${g.id}"><span class="card-category">${g.category}</span><div class="card-art">${g.icon}</div><div class="text"><h3>${g.name}</h3><p>${g.desc}</p></div><span class="card-go">↗</span></button>`,
  ).join("");
  $$(".game-card").forEach((el) =>
    el.addEventListener("click", () => openGame(el.dataset.game)),
  );
}

export function showHome() {
  cleanup();
  state.current = null;
  $("#game-screen").classList.add("hidden");
  $("#home").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function openGame(id) {
  cleanup();
  const g = GAMES.find((x) => x.id === id);
  if (!g || !inits[id]) return;
  state.current = id;
  $("#home").classList.add("hidden");
  $("#game-screen").classList.remove("hidden");
  $("#game-title").textContent = g.name;
  $("#game-icon").textContent = g.icon;
  $("#game-tip").textContent = g.tip;
  $("#game-area").className = "game-area " + g.theme;
  window.scrollTo({ top: 0, behavior: "instant" });
  inits[id]();
}

export function finish(heading, detail) {
  if (state.finished) return;
  state.finished = true;
  const overlay = document.createElement("div");
  overlay.className = "result-overlay";
  overlay.innerHTML = `<div class="result-dialog"><img src="assets/theo.png" alt="Theo feliz"><h2>${heading}</h2><p>${detail}</p><div class="btn-row"><button id="again" class="btn">↻ Jogar de novo</button><button id="to-menu" class="btn btn-outline">🏡 Outros jogos</button></div></div>`;
  $("#game-area").appendChild(overlay);
  $("#again").onclick = () => openGame(state.current);
  $("#to-menu").onclick = showHome;
}
