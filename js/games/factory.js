import { $, $$, shuffle, setArea, message } from "../core/dom.js";
import { finish } from "../core/router.js";

export function initFactory() {
  let idx = 0;
  let answered = false;

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

  const names = {
    papel: "papel",
    plastico: "plástico",
    vidro: "vidro",
    metal: "metal",
  };

  const learning = {
    papel: "Papel e papelão limpos podem ser separados para reciclagem.",
    plastico: "Separar o plástico ajuda a coleta seletiva.",
    vidro:
      "O vidro tem uma lixeira própria. Cacos devem ser manuseados por um adulto.",
    metal: "Latas podem ser separadas para a reciclagem de metais.",
  };

  function draw() {
    answered = false;

    const item = items[idx];

    setArea(`
      <div class="game-wrap">
        <div class="status-line">
          <span class="status-pill">
            Objeto ${idx + 1} de ${items.length}
          </span>
          <span class="tiny-help">
            ♻️ Separe pelo material do objeto
          </span>
        </div>

        <h2 class="panel-title">🏭 Esteira da Reciclagem</h2>

        <p class="panel-subtitle">
          Uma máquina traz os objetos.
          Escolha qual lixeira deve recebê-los!
        </p>

        <div class="belt">
          <div class="belt-item">
            <div class="card-icon">${item[0]}</div>
            <strong>${item[1]}</strong>
          </div>
        </div>

        <div class="bins">
          ${bins
            .map(
              (bin) => `
                <button
                  type="button"
                  class="bin"
                  style="--bin:${bin[3]}"
                  data-bin="${bin[0]}"
                >
                  <span aria-hidden="true">${bin[2]}</span>
                  ${bin[1]}
                </button>
              `,
            )
            .join("")}
        </div>

        <div id="message"></div>
        <div class="btn-row" id="next-holder"></div>
      </div>
    `);

    $$("[data-bin]").forEach((button) => {
      button.onclick = () => {
        if (answered) return;

        if (button.dataset.bin !== item[2]) {
          message(
            "Observe o material! " +
              item[1] +
              " não pertence a essa lixeira. Tente outra!",
            false,
          );
          return;
        }

        answered = true;

        $$("[data-bin]").forEach((binButton) => {
          binButton.disabled = true;
        });

        message(
          "Muito bem! " +
            item[1] +
            " é de " +
            names[item[2]] +
            ". " +
            learning[item[2]],
        );

        const next = document.createElement("button");
        next.type = "button";
        next.className = "btn";
        next.id = "next-object";
        next.textContent =
          idx === items.length - 1 ? "Concluir aventura ➜" : "Próximo objeto ➜";

        $("#next-holder").appendChild(next);

        let advancing = false;

        next.onclick = () => {
          if (advancing) return;

          advancing = true;
          next.disabled = true;
          idx++;

          if (idx >= items.length) {
            finish(
              "Reciclagem completa! ♻️",
              "Você separou todos os materiais da esteira e aprendeu sobre cada um deles!",
            );
            return;
          }

          draw();
        };
      };
    });
  }

  draw();
}
