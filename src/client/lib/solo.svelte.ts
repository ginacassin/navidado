import { cryptoRng, GameError, newGame, tick, type GameConfig, type GameState } from '../../shared/game';
import { showBanner } from './alerts.svelte';

const KEY = 'navidado:solo';

function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export const solo = $state<{ s: GameState | null }>({ s: load() });

function persist() {
  try {
    if (solo.s) localStorage.setItem(KEY, JSON.stringify(solo.s));
    else localStorage.removeItem(KEY);
  } catch {}
}

export function hasSoloGame(): boolean {
  return !!solo.s && solo.s.phase !== 'finished' && solo.s.players.length > 0;
}

export function soloNew(config: GameConfig) {
  const prev = solo.s;
  solo.s = newGame(config);
  // mantener los nombres de la última partida para no volver a escribirlos
  if (prev && prev.players.length) solo.s.players = prev.players.map((p) => ({ ...p, isProtected: false, seatWarning: false }));
  persist();
}

export function soloClear() {
  solo.s = null;
  persist();
}

/** Aplica una acción del motor; los errores se muestran como aviso. */
export function act(fn: (s: GameState) => GameState): boolean {
  if (!solo.s) return false;
  try {
    solo.s = fn($state.snapshot(solo.s) as GameState);
    persist();
    return true;
  } catch (e) {
    showBanner(e instanceof GameError ? e.message : 'Algo ha fallado', 'info', 3000);
    return false;
  }
}

export const soloHistory: GameState[] = [];

setInterval(() => {
  const s = solo.s;
  if (!s || s.phase !== 'playing' || s.paused) return;
  const n = tick($state.snapshot(s) as GameState, cryptoRng, Date.now());
  if (n.seq !== s.seq || n.phase !== s.phase) {
    solo.s = n;
    persist();
  }
}, 250);
