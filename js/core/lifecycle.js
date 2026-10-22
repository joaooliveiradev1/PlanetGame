export const state = { current: null, finished: false };
let cleanups = [];

export function cleanup() {
  cleanups.forEach((fn) => {
    try {
      fn();
    } catch (e) {}
  });
  cleanups = [];
  state.finished = false;
  window.onkeydown = null;
}
export function listen(target, ev, fn, options) {
  target.addEventListener(ev, fn, options);
  cleanups.push(() => target.removeEventListener(ev, fn, options));
}
export function timer(fn, delay) {
  const t = setTimeout(fn, delay);
  cleanups.push(() => clearTimeout(t));
  return t;
}
export function interval(fn, delay) {
  const i = setInterval(fn, delay);
  cleanups.push(() => clearInterval(i));
  return i;
}
export function animation(fn) {
  let alive = true,
    frame;
  function go(t) {
    if (!alive) return;
    fn(t);
    frame = requestAnimationFrame(go);
  }
  frame = requestAnimationFrame(go);
  cleanups.push(() => {
    alive = false;
    cancelAnimationFrame(frame);
  });
}
