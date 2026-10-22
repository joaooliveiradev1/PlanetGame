export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export function shuffle(arr) {
  const x = [...arr];
  for (let i = x.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}
export const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const setArea = (html) => {
  $("#game-area").innerHTML = html;
};
export function message(msg, good = true, selector = "#message") {
  const el = $(selector);
  if (!el) return;
  el.textContent = msg;
  el.className = "notice " + (good ? "good" : "bad");
}
