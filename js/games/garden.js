import { $, $$, shuffle, setArea, message } from "../core/dom.js";
import { timer, interval, listen } from "../core/lifecycle.js";
import { finish } from "../core/router.js";

// Jardim do Theo — EF02CI05 (água e luz) e EF02CI06 (partes da planta)
export function initGarden() {
  const DECAY = 2,
    FILL = 32,
    GROW = 16,
    LOW = 20,
    HIGH = 85,
    ZLOW = 35,
    ZHIGH = 75;
  const seeds = [
    ["🌼", "Ipê"],
    ["🌸", "Pitanga"],
    ["🌺", "Maracujá"],
  ];
  const plots = [null, null, null];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let phase = "intro",
    tool = "water",
    holding = null;

  const say = (t) => {
    const el = $("#g-say");
    if (el && el.textContent !== t) el.textContent = t;
  };
  const theo = '<img src="assets/theo.png" alt="Theo" class="theo-mini">';

  function intro() {
    setArea(`<div class="game-wrap"><h2 class="panel-title">🌱 Vamos cuidar do jardim!</h2>
      <div class="question-box"><div class="question-text" style="font-size:20px;text-align:left;line-height:1.9">
      1️⃣ Toque no canteiro vazio para <b>plantar</b>.<br>
      2️⃣ Escolha ☁️ chuva ou ☀️ sol e <b>segure o dedo</b> na planta.<br>
      3️⃣ Deixe a barra na parte <b style="color:#1b9a50">verde</b>. Nem pouco, nem demais!</div></div>
      <div class="btn-row" style="margin-top:20px"><button class="btn btn-xl" id="go">Vamos! ➜</button></div></div>`);
    $("#go").onclick = care;
  }

  function status(p) {
    if (p.water > HIGH) return "flood";
    if (p.light > HIGH) return "burn";
    if (p.water < LOW) return "thirst";
    if (p.light < LOW) return "dark";
    const ok = (v) => v >= ZLOW && v <= ZHIGH;
    return ok(p.water) && ok(p.light) ? "good" : "ok";
  }

  function care() {
    phase = "care";
    setArea(`<div class="game-wrap">
      <div class="garden-hud">${theo}<div class="theo-say" id="g-say">Toque num canteiro vazio para plantar!</div></div>
      <div class="garden-field" id="g-field">${plots
        .map(
          (p, i) => `
        <div class="gplot" data-i="${i}" role="button" aria-label="Canteiro ${i + 1}">
          <div class="gplant" id="gp-${i}">🟤</div>
          <div class="gname" id="gn-${i}">Vazio</div>
          <div class="meter"><span class="mi">💧</span><div class="mbar"><div class="mfill water" id="gw-${i}"></div><div class="mzone"></div></div></div>
          <div class="meter"><span class="mi">☀️</span><div class="mbar"><div class="mfill light" id="gl-${i}"></div><div class="mzone"></div></div></div>
          <div class="gprog"><i id="gg-${i}"></i></div>
        </div>`,
        )
        .join("")}</div>
      <div class="tool-row">
        <button class="tool active" data-tool="water">☁️ Chuva</button>
        <button class="tool" data-tool="light">☀️ Sol</button>
      </div>
      <p class="tiny-help">Escolha uma ferramenta e segure o dedo na planta.</p></div>`);

    $$("[data-tool]").forEach(
      (b) =>
        (b.onclick = () => {
          tool = b.dataset.tool;
          $$("[data-tool]").forEach((x) =>
            x.classList.toggle("active", x === b),
          );
        }),
    );
    const field = $("#g-field");
    listen(field, "contextmenu", (e) => e.preventDefault());
    listen(field, "pointerdown", (e) => {
      const el = e.target.closest(".gplot");
      if (!el || phase !== "care") return;
      e.preventDefault();
      const i = +el.dataset.i;
      if (!plots[i]) {
        plots[i] = {
          seed: i,
          stage: 0,
          growth: 0,
          water: 50,
          light: 50,
          s: "good",
        };
        paint();
      } else holding = i;
    });
    const release = () => {
      holding = null;
    };
    listen(window, "pointerup", release);
    listen(window, "pointercancel", release);
    interval(tick, 100);
    paint();
  }

  function paint() {
    plots.forEach((p, i) => {
      const sprite = $("#gp-" + i);
      if (!sprite) return;
      const box = sprite.parentElement;
      if (!p) {
        sprite.textContent = "🟤";
        return;
      }
      const bad = ["flood", "burn", "thirst", "dark"].includes(p.s);
      sprite.textContent = bad
        ? "🥀"
        : p.stage >= 3
          ? seeds[p.seed][0]
          : ["🌱", "🌿", "🌳"][p.stage];
      $("#gn-" + i).textContent = seeds[p.seed][1];
      $("#gw-" + i).style.width = p.water + "%";
      $("#gl-" + i).style.width = p.light + "%";
      $("#gg-" + i).style.width = (p.stage >= 3 ? 100 : p.growth) + "%";
      box.classList.toggle(
        "raining",
        holding === i && tool === "water" && p.stage < 3,
      );
      box.classList.toggle(
        "sunny",
        holding === i && tool === "light" && p.stage < 3,
      );
      box.classList.toggle("bloom", p.stage >= 3);
    });
  }

  function tick() {
    if (phase !== "care") return;
    const dt = 0.1;
    plots.forEach((p, i) => {
      if (!p || p.stage >= 3) return;
      p.water = clamp(p.water - DECAY * dt, 0, 100);
      p.light = clamp(p.light - DECAY * dt, 0, 100);
      if (holding === i) p[tool] = clamp(p[tool] + FILL * dt, 0, 100);
      p.s = status(p);
      if (p.s === "good") p.growth += GROW * dt;
      else if (p.s !== "ok") p.growth = Math.max(0, p.growth - 3 * dt);
      if (p.growth >= 100) {
        p.stage++;
        p.growth = 0;
      }
    });
    const prob = plots.find(
      (p) =>
        p && p.stage < 3 && ["thirst", "dark", "flood", "burn"].includes(p.s),
    );
    if (prob) {
      const n = seeds[prob.seed][1];
      say(
        {
          thirst: `${n} está com sede! 💧 Use a chuva.`,
          dark: `${n} está no escuro! ☀️ Use o sol.`,
          flood: `Ih! Água demais afoga a ${n}. Espere um pouco.`,
          burn: `Sol demais machuca a ${n}. Espere um pouco.`,
        }[prob.s],
      );
    } else if (plots.some((p) => !p))
      say("Toque num canteiro vazio para plantar!");
    else say("Muito bem! Mantenha as barras no verde. 🌿");
    paint();
    if (plots.every((p) => p && p.stage >= 3)) {
      phase = "transition";
      say("Todas floresceram! 🌼 Vamos conhecer as partes da planta?");
      timer(parts, 1800);
    }
  }

  function parts() {
    phase = "parts";
    const info = {
      raiz: ["Raiz", "A raiz bebe a água do solo."],
      caule: ["Caule", "O caule sustenta a planta."],
      folhas: ["Folhas", "As folhas pegam a luz do sol."],
      flor: ["Flor", "A flor é a parte colorida. Dela podem nascer frutos."],
    };
    const order = shuffle([
      ["raiz", "Toque na parte que bebe a água do solo 💧"],
      ["folhas", "Toque nas partes que pegam a luz do sol ☀️"],
      ["caule", "Toque na parte que sustenta a planta"],
      ["flor", "Toque na parte colorida da planta 🌸"],
    ]);
    let k = 0,
      locked = false;
    setArea(`<div class="game-wrap">
      <div class="status-line"><span class="status-pill" id="p-count">Parte 1 de 4</span></div>
      <div class="garden-hud">${theo}<div class="theo-say" id="g-say">${order[0][1]}</div></div>
      <svg viewBox="0 0 220 280" class="plant-svg" role="img" aria-label="Planta com raiz, caule, folhas e flor">
        <rect x="0" y="150" width="220" height="130" fill="#8a5a36"/>
        <rect x="0" y="150" width="220" height="12" fill="#6fbf5e"/>
        <g class="part" data-part="raiz"><rect x="55" y="162" width="110" height="115" fill="transparent"/>
          <path d="M110 162 C105 200 90 215 78 245 M110 162 C112 205 115 225 112 262 M110 162 C120 195 140 215 156 242" stroke="#ecd9b0" stroke-width="7" fill="none" stroke-linecap="round"/></g>
        <g class="part" data-part="caule"><rect x="90" y="70" width="40" height="92" fill="transparent"/><rect x="104" y="70" width="12" height="92" rx="6" fill="#3fa65a"/></g>
        <g class="part" data-part="folhas"><ellipse cx="72" cy="118" rx="32" ry="15" fill="#4ccf6b" transform="rotate(-25 72 118)"/><ellipse cx="148" cy="100" rx="32" ry="15" fill="#4ccf6b" transform="rotate(25 148 100)"/></g>
        <g class="part" data-part="flor"><circle cx="110" cy="20" r="12" fill="#ff7aa8"/><circle cx="129" cy="31" r="12" fill="#ff7aa8"/><circle cx="129" cy="53" r="12" fill="#ff7aa8"/><circle cx="110" cy="64" r="12" fill="#ff7aa8"/><circle cx="91" cy="53" r="12" fill="#ff7aa8"/><circle cx="91" cy="31" r="12" fill="#ff7aa8"/><circle cx="110" cy="42" r="11" fill="#ffd54a"/></g>
      </svg><div id="message"></div></div>`);

    $$(".part").forEach(
      (g) =>
        (g.onclick = () => {
          if (locked) return;
          const got = g.dataset.part,
            want = order[k][0];
          if (got === want) {
            locked = true;
            g.classList.add("right");
            message(`✅ ${info[got][0]}! ${info[got][1]}`);
            k++;
            if (k === order.length) {
              timer(
                () =>
                  finish(
                    "Jardineiro nota 10! 🌼",
                    "Plantas precisam de água e sol na medida certa, e cada parte da planta tem uma função!",
                  ),
                1800,
              );
            } else {
              timer(() => {
                g.classList.remove("right");
                locked = false;
                say(order[k][1]);
                $("#p-count").textContent = `Parte ${k + 1} de 4`;
                const m = $("#message");
                if (m) {
                  m.textContent = "";
                  m.className = "";
                }
              }, 2200);
            }
          } else {
            g.classList.add("shake");
            timer(() => g.classList.remove("shake"), 500);
            message("Quase! Tente outra parte. 💛", false);
          }
        }),
    );
  }

  intro();
}
