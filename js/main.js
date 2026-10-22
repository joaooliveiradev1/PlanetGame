import { $ } from "./core/dom.js";
import {
  renderMenu,
  openGame,
  showHome,
  registerGames,
} from "./core/router.js";
import { state } from "./core/lifecycle.js";
import { INITS } from "./games/legacy.js";

registerGames(INITS);
renderMenu();
$("#play-btn").addEventListener("click", () =>
  $("#choices").scrollIntoView({ behavior: "smooth" }),
);
$("#back-btn").addEventListener("click", showHome);
$("#restart-btn").addEventListener("click", () => openGame(state.current));
