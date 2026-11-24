let ctx: AudioContext | null = null;
let muted = localStorage.getItem('navidado:mute') === '1';

export function isMuted() {
  return muted;
}
export function setMuted(m: boolean) {
  muted = m;
  localStorage.setItem('navidado:mute', m ? '1' : '0');
}

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

addEventListener('pointerdown', () => ac(), { once: true });

function tone(freq: number, start: number, dur: number, gain = 0.18, type: OscillatorType = 'sine') {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.05);
}

/** Campanada de fin de partida. */
export function bell() {
  [0, 0.35, 0.7].forEach((t) => {
    tone(880, t, 1.4, 0.2);
    tone(1320, t, 1.0, 0.08);
  });
}
/** Aviso corto (te toca, quedan minutos). */
export function ding() {
  tone(1046, 0, 0.35, 0.15);
  tone(1568, 0.12, 0.4, 0.1);
}
/** Ruido de dado rodando. */
export function rattle() {
  for (let i = 0; i < 6; i++) tone(180 + Math.random() * 220, i * 0.12, 0.06, 0.06, 'square');
}
