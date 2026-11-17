import { listen, onCleanup } from "./lifecycle.js";

const AudioContextClass = window.AudioContext || window.webkitAudioContext;

let context = null;
let master = null;
let musicBus = null;
let effectsBus = null;
let noiseBuffer = null;

let muted = false;
let activated = false;
let unlocking = false;
let musicClock = null;
let melodyPosition = 0;
let control = null;

const musicSources = new Set();
const effectSources = new Set();
const interruptionHandlers = new Set();

const melody = [
  523.25,
  659.25,
  783.99,
  659.25,
  587.33,
  698.46,
  880.0,
  698.46,
  659.25,
  783.99,
  1046.5,
  783.99,
  587.33,
  659.25,
  523.25,
  null,
];

const speakerIcon = `
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="M15 8a6 6 0 0 1 0 8" />
    <path d="M18 5a10 10 0 0 1 0 14" />
  </svg>
`;

const mutedIcon = `
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="m16 9 5 6m0-6-5 6" />
  </svg>
`;

function ready() {
  return context && context.state === "running" && !muted && !document.hidden;
}

function stopSources(collection) {
  for (const source of [...collection]) {
    try {
      source.stop();
    } catch (error) {}

    try {
      source.disconnect();
    } catch (error) {}
  }

  collection.clear();
}

function registerSource(source, nodes, collection) {
  collection.add(source);

  source.onended = () => {
    collection.delete(source);

    for (const node of [source, ...nodes]) {
      try {
        node.disconnect();
      } catch (error) {}
    }
  };
}

function tone(frequency, duration, volume, bus, collection, delay = 0) {
  if (!ready()) return;

  const source = context.createOscillator();
  const envelope = context.createGain();

  const start = context.currentTime + delay;
  const end = start + duration;

  source.type = "sine";
  source.frequency.setValueAtTime(frequency, start);

  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(volume, start + 0.015);
  envelope.gain.exponentialRampToValueAtTime(0.001, end);

  source.connect(envelope);
  envelope.connect(bus);

  registerSource(source, [envelope], collection);

  source.start(start);
  source.stop(end + 0.03);
}

function playClick() {
  tone(420, 0.065, 0.18, effectsBus, effectSources);
}

function playDrops() {
  tone(950, 0.12, 0.16, effectsBus, effectSources);
  tone(700, 0.16, 0.12, effectsBus, effectSources, 0.16);
}

function playSuccess() {
  [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
    tone(note, 0.3, 0.17, effectsBus, effectSources, index * 0.13);
  });
}

function stopMusic() {
  window.clearInterval(musicClock);
  musicClock = null;

  stopSources(musicSources);
}

function startMusic() {
  if (!ready() || musicClock !== null) return;

  function playNext() {
    if (!ready()) return;

    const note = melody[melodyPosition % melody.length];
    melodyPosition++;

    if (note) {
      tone(note, 0.55, 0.15, musicBus, musicSources);
    }
  }

  playNext();
  musicClock = window.setInterval(playNext, 650);
}

function interruptAudio() {
  stopMusic();

  for (const handler of interruptionHandlers) {
    handler();
  }

  stopSources(effectSources);
}

function updateControl() {
  if (!control) return;

  control.innerHTML = muted ? mutedIcon : speakerIcon;

  let description = "Silenciar som";

  if (muted) {
    description = "Som desligado até recarregar a página";
  } else if (document.hidden) {
    description = "Som pausado enquanto a página está oculta";
  } else if (!ready()) {
    description =
      "Som habilitado. A reprodução pode aguardar uma interação. Clique para silenciar";
  }

  control.title = description;
  control.setAttribute("aria-label", description);
  control.disabled = muted;

  control.style.opacity = muted ? "0.65" : "1";
  control.style.cursor = muted ? "default" : "pointer";
}

async function activateAudio() {
  if (!AudioContextClass || muted || document.hidden || unlocking) {
    return false;
  }

  unlocking = true;

  try {
    if (!context) {
      context = new AudioContextClass();

      master = context.createGain();
      musicBus = context.createGain();
      effectsBus = context.createGain();

      master.gain.value = 1.0;
      musicBus.gain.value = 0.25;
      effectsBus.gain.value = 0.6;

      musicBus.connect(master);
      effectsBus.connect(master);
      master.connect(context.destination);

      context.addEventListener("statechange", updateControl);
    }

    if (context.state !== "running") {
      await context.resume();
    }

    if (muted || document.hidden) {
      interruptAudio();

      if (context.state === "running") {
        await context.suspend();
      }

      return false;
    }

    if (context.state !== "running") return false;

    activated = true;
    startMusic();

    return true;
  } catch (error) {
    return false;
  } finally {
    unlocking = false;
    updateControl();
  }
}

function resumeFromInteraction() {
  if (muted || document.hidden) return;

  /*
   * Uma tentativa automática de resume() pode continuar pendente.
   * Repetimos a solicitação dentro da interação real do usuário.
   */
  if (context && context.state !== "running") {
    context
      .resume()
      .then(() => {
        if (muted || document.hidden) {
          interruptAudio();

          if (context.state === "running") {
            context.suspend().catch(() => {});
          }

          return;
        }

        if (context.state === "running") {
          activated = true;
          startMusic();
        }

        updateControl();
      })
      .catch(() => {});

    return;
  }

  void activateAudio();
}

function createWaterSource() {
  if (!ready()) return null;

  if (!noiseBuffer) {
    const length = Math.floor(context.sampleRate * 2);

    noiseBuffer = context.createBuffer(1, length, context.sampleRate);

    const samples = noiseBuffer.getChannelData(0);

    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.random() * 2 - 1;
    }
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = noiseBuffer;
  source.loop = true;

  filter.type = "lowpass";
  filter.frequency.value = 1100;
  gain.gain.value = 0.12;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(effectsBus);

  registerSource(source, [filter, gain], effectSources);

  source.start();

  return source;
}

function initializePageAudio() {
  if (!AudioContextClass || control) return;

  control = document.createElement("button");
  control.type = "button";

  Object.assign(control.style, {
    position: "fixed",
    right: "12px",
    bottom: "12px",
    zIndex: "1000",
    display: "grid",
    placeItems: "center",
    width: "44px",
    height: "44px",
    minWidth: "44px",
    minHeight: "44px",
    padding: "0",
    border: "1px solid rgba(255,255,255,0.85)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.85)",
    color: "#173f3b",
    boxShadow: "0 3px 10px rgba(23,63,59,0.15)",
    cursor: "pointer",
    touchAction: "manipulation",
  });

  control.addEventListener("focus", () => {
    control.style.outline = "3px solid #173f3b";
    control.style.outlineOffset = "3px";
  });

  control.addEventListener("blur", () => {
    control.style.outline = "";
    control.style.outlineOffset = "";
  });

  control.addEventListener("click", () => {
    if (muted) return;

    muted = true;
    interruptAudio();

    if (master) {
      master.gain.value = 0;
    }

    if (context && context.state === "running") {
      context.suspend().catch(() => {});
    }

    updateControl();
  });

  document.body.appendChild(control);
  updateControl();

  function handleInteraction(event) {
    if (!event.isTrusted || muted || control.contains(event.target)) {
      return;
    }

    if (
      event.type === "keydown" &&
      ![
        "Enter",
        " ",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(event.key)
    ) {
      return;
    }

    resumeFromInteraction();
  }

  document.addEventListener("pointerdown", handleInteraction, {
    capture: true,
    passive: true,
  });

  document.addEventListener("click", handleInteraction, true);
  document.addEventListener("keydown", handleInteraction, true);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      interruptAudio();

      if (context && context.state === "running") {
        context.suspend().catch(() => {});
      }

      updateControl();
      return;
    }

    if (activated && !muted) {
      resumeFromInteraction();
    }
  });

  window.addEventListener("pagehide", () => {
    interruptAudio();

    if (context && context.state === "running") {
      context.suspend().catch(() => {});
    }
  });

  window.addEventListener("pageshow", () => {
    if (activated && !muted) {
      resumeFromInteraction();
    }
  });

  void activateAudio();
}

export function attachPipesAudio(area) {
  const scene = area.querySelector("#pipes-scene");
  const garden = area.querySelector("#garden-strip");
  const grid = area.querySelector("#pipes-grid");
  const testButton = area.querySelector("#test-water");

  if (!scene || !garden || !grid || !testButton) return;

  let disposed = false;
  let waterSource = null;
  let waterClock = null;

  let flowWasActive = scene.classList.contains("flowing");
  let gardenWasWatered = garden.classList.contains("watered");
  let resultWasShown = false;

  function stopWater() {
    window.clearTimeout(waterClock);
    waterClock = null;

    if (waterSource) {
      try {
        waterSource.stop();
      } catch (error) {}

      waterSource = null;
    }
  }

  function startWater(duration) {
    stopWater();

    if (disposed || !ready()) return;

    waterSource = createWaterSource();

    waterClock = window.setTimeout(() => {
      stopWater();

      if (
        !disposed &&
        !garden.classList.contains("watered") &&
        !scene.classList.contains("win")
      ) {
        playDrops();
      }
    }, duration);
  }

  function interruptGameAudio() {
    stopWater();
  }

  interruptionHandlers.add(interruptGameAudio);

  listen(grid, "click", (event) => {
    if (
      disposed ||
      !event.target.closest("[data-cell]") ||
      scene.classList.contains("flowing") ||
      garden.classList.contains("watered")
    ) {
      return;
    }

    playClick();
  });

  listen(testButton, "click", () => {
    if (!disposed && !scene.classList.contains("flowing")) {
      playDrops();
    }
  });

  const observer = new MutationObserver(() => {
    if (disposed) return;

    const flowing = scene.classList.contains("flowing");
    const watered = garden.classList.contains("watered");
    const resultShown = Boolean(area.querySelector(".result-overlay"));

    if (flowing && !flowWasActive) {
      const delay = Number.parseFloat(
        scene.style.getPropertyValue("--out-delay"),
      );

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const duration =
        (Number.isFinite(delay) ? delay * 1000 : 0) + (reduced ? 300 : 550);

      startWater(duration);
    }

    if (!flowing && flowWasActive) {
      stopWater();
    }

    if (watered && !gardenWasWatered) {
      stopWater();
      playSuccess();
    }

    if (resultShown && !resultWasShown) {
      stopWater();
    }

    flowWasActive = flowing;
    gardenWasWatered = watered;
    resultWasShown = resultShown;
  });

  observer.observe(area, {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
  });

  onCleanup(() => {
    disposed = true;

    observer.disconnect();
    interruptionHandlers.delete(interruptGameAudio);

    stopWater();
    stopSources(effectSources);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePageAudio, {
    once: true,
  });
} else {
  initializePageAudio();
}
