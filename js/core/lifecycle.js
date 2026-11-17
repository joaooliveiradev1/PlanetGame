export const state = { current: null, finished: false };

let cleanups = [];

export function onCleanup(fn) {
  cleanups.push(fn);
}

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

  onCleanup(() => {
    target.removeEventListener(ev, fn, options);
  });
}

export function timer(fn, delay) {
  const t = setTimeout(fn, delay);

  onCleanup(() => clearTimeout(t));

  return t;
}

export function interval(fn, delay) {
  const i = setInterval(fn, delay);

  onCleanup(() => clearInterval(i));

  return i;
}

export function animation(fn) {
  let alive = true;
  let frame;

  function go(t) {
    if (!alive) return;

    fn(t);
    frame = requestAnimationFrame(go);
  }

  frame = requestAnimationFrame(go);

  onCleanup(() => {
    alive = false;
    cancelAnimationFrame(frame);
  });
}
