import { $ } from "./core/dom.js";

import {
  renderMenu,
  openGame,
  showHome,
  registerGames,
} from "./core/router.js";

import { state } from "./core/lifecycle.js";

import { INITS } from "./games/legacy.js";

import { initQuiz } from "./games/quiz.js";
import { initFactory } from "./games/factory.js";

registerGames({
  ...INITS,
  quiz: initQuiz,
  factory: initFactory,
});

renderMenu();

$("#back-btn").addEventListener("click", showHome);

$("#restart-btn").addEventListener("click", () => {
  openGame(state.current);
});
