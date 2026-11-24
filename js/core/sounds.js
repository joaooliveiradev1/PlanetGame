let context = null;
let waterNodes = [];
let waterTimeout = null;

function getContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!context) {
    context = new AudioContextClass();
  }

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  return context;
}

function tone(frequency, start, duration, volume = 0.1) {
  const ctx = getContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration);
}

export function playCorrect() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  tone(523.25, now, 0.16);
  tone(659.25, now + 0.14, 0.16);
  tone(783.99, now + 0.28, 0.26);
}

export function playWrong() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  tone(330, now, 0.16, 0.07);
  tone(262, now + 0.15, 0.22, 0.07);
}

export function playVictory() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  [523, 659, 784, 1047].forEach((frequency, index) => {
    tone(frequency, now + index * 0.13, 0.3);
  });
}

export function stopWater() {
  if (waterTimeout !== null) {
    clearTimeout(waterTimeout);
    waterTimeout = null;
  }

  waterNodes.forEach(({ source, gain }) => {
    try {
      gain.gain.cancelScheduledValues(0);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      source.stop();
    } catch (_) {}
  });

  waterNodes = [];
}

export function playWater(duration = 2000) {
  stopWater();

  const ctx = getContext();
  if (!ctx) return;

  const seconds = Math.max(0.2, duration / 1000);
  const length = Math.ceil(ctx.sampleRate * seconds);

  // Ruído filtrado para simular água correndo.
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);

  const samples = buffer.getChannelData(0);

  let previous = 0;

  for (let i = 0; i < length; i++) {
    const noise = Math.random() * 2 - 1;

    previous = (previous + noise * 0.08) / 1.08;
    samples[i] = previous * 2.5;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = 1100;

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(
    0.12,
    ctx.currentTime + Math.max(0.12, seconds - 0.2),
  );

  gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + seconds);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  waterNodes.push({ source, gain });

  source.start();
  source.stop(ctx.currentTime + seconds);

  source.onended = () => {
    waterNodes = waterNodes.filter((node) => node.source !== source);
  };
}
