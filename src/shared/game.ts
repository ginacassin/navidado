// Motor de juego de Navidado. Puro: sin E/S, el tiempo (`now`) y el azar (`rng`) se pasan siempre.
// Lo usan el navegador (modo un solo móvil) y el servidor (modo sala).

export type ActionId =
  | 'right'
  | 'left'
  | 'steal'
  | 'blindSteal'
  | 'allRight'
  | 'allLeft'
  | 'whirl'
  | 'keep'
  | 'nothing';

export type DiceModeId = 'clasico' | 'tranquilo' | 'caotico' | 'estrategico' | 'minimo';
export type StealLimit = 'none' | 'noRevenge' | 'freezeAfter3';
export type Direction = 'left' | 'right';
export type Rng = () => number;

export const ACTIONS: Record<ActionId, { name: string; desc: string }> = {
  right: { name: 'Derecha', desc: 'Cambias tu regalo con tu vecino de la derecha.' },
  left: { name: 'Izquierda', desc: 'Cambias tu regalo con tu vecino de la izquierda.' },
  steal: { name: 'Robo', desc: 'Eliges a cualquier jugador y os cambiáis los regalos.' },
  blindSteal: { name: 'Robo a ciegas', desc: 'Te cambias con un jugador al azar.' },
  allRight: { name: 'Todos a la derecha', desc: 'Todos pasan su regalo a la derecha a la vez.' },
  allLeft: { name: 'Todos a la izquierda', desc: 'Todos pasan su regalo a la izquierda a la vez.' },
  whirl: { name: 'Remolino', desc: 'Todos pasan su regalo a la vez, en la dirección que elija quien tira.' },
  keep: { name: 'Me lo quedo', desc: 'Nadie puede quitarte el regalo hasta tu siguiente turno.' },
  nothing: { name: '¡Feliz Navidad!', desc: 'No pasa nada.' }
};

export const DICE_MODES: Record<DiceModeId, { name: string; desc: string; faces: ActionId[] }> = {
  clasico: {
    name: 'Clásico',
    desc: 'Equilibrado y fácil de explicar',
    faces: ['right', 'left', 'steal', 'allRight', 'allLeft', 'nothing']
  },
  tranquilo: {
    name: 'Tranquilo',
    desc: '1 de cada 3 tiradas no pasa nada',
    faces: ['right', 'left', 'steal', 'whirl', 'nothing', 'nothing']
  },
  caotico: {
    name: 'Caótico',
    desc: 'Los regalos se mueven mucho',
    faces: ['right', 'left', 'steal', 'blindSteal', 'whirl', 'nothing']
  },
  estrategico: {
    name: 'Estratégico',
    desc: 'Puedes proteger un regalo que te guste',
    faces: ['right', 'left', 'steal', 'keep', 'whirl', 'nothing']
  },
  minimo: {
    name: 'Mínimo',
    desc: 'Casi todo son robos y cambios con los vecinos',
    faces: ['right', 'left', 'steal', 'nothing', 'nothing', 'nothing']
  }
};

export const STEAL_LIMITS: Record<StealLimit, string> = {
  none: 'Sin límite',
  noRevenge: 'Sin venganza',
  freezeAfter3: 'Sin venganza + regalo fijo tras 3 robos'
};

export interface GameConfig {
  diceMode: DiceModeId;
  durationMin: number;
  chooseSeconds: number;
  stealLimit: StealLimit;
  showBroughtBy: boolean;
}

export const DEFAULT_CONFIG: GameConfig = {
  diceMode: 'clasico',
  durationMin: 15,
  chooseSeconds: 15,
  stealLimit: 'none',
  showBroughtBy: true
};

export const LIMITS = {
  minPlayers: 3,
  maxPlayers: 30,
  durationMin: [5, 45] as const,
  chooseSeconds: [5, 30] as const
};

export const AVATARS = ['🎅', '🦌', '🧝', '⛄', '⭐', '🍪', '🐧', '🎄'];

export interface Player {
  id: string;
  name: string;
  avatar: string;
  connected: boolean;
  isProtected: boolean;
  seatWarning?: boolean;
}

export interface Gift {
  id: string;
  broughtBy: string;
  holder: string;
  steals: number;
  moves: number;
}

export interface Pending {
  kind: 'roll' | 'chooseTarget' | 'chooseDirection';
  playerId: string;
  action?: ActionId;
  /** Límite para elegir (ms). En las tiradas es 0: no hay límite de tiempo para tirar. */
  deadline: number;
}

export interface GameEvent {
  seq: number;
  ts: number;
  kind: 'roll' | 'pass' | 'timeout' | 'action' | 'system';
  playerId?: string;
  action?: ActionId;
  text: string;
  /** Instrucción en segunda persona para cada jugador afectado (modo sala). */
  instructions: Record<string, string>;
  /** Parejas que se intercambian (para animaciones). */
  swaps?: [string, string][];
  rotation?: Direction;
}

export interface Deal {
  from: string;
  to: string;
}

export interface FinalStats {
  mostStolen?: { giftId: string; count: number };
  mostTraveled?: { giftId: string; count: number };
  thief?: { playerId: string; count: number };
}

export interface GameState {
  config: GameConfig;
  phase: 'lobby' | 'deal' | 'playing' | 'finished';
  paused: boolean;
  /** Milisegundos restantes congelados mientras está en pausa. */
  pausedRemaining?: number;
  pausedPendingRemaining?: number;
  players: Player[];
  gifts: Gift[];
  turn: number;
  turnCount: number;
  startedAt?: number;
  endsAt?: number;
  pending?: Pending;
  lastRoll?: { seq: number; playerId: string; face: number; action: ActionId };
  lastSteal?: { thief: string; victim: string };
  events: GameEvent[];
  seq: number;
  deals: Deal[];
  stealsBy: Record<string, number>;
  openingOrder?: string[];
  stats?: FinalStats;
}

export class GameError extends Error {}

const MAX_EVENTS = 40;

// ---------- utilidades ----------

export const cryptoRng: Rng = () => {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
};

export function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clone<T>(v: T): T {
  return structuredClone(v);
}

const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, Math.round(v)));

export function sanitizeConfig(c: Partial<GameConfig>): GameConfig {
  const base = { ...DEFAULT_CONFIG, ...c };
  return {
    diceMode: base.diceMode in DICE_MODES ? base.diceMode : 'clasico',
    durationMin: clamp(Number(base.durationMin) || 15, LIMITS.durationMin),
    chooseSeconds: clamp(Number(base.chooseSeconds) || 15, LIMITS.chooseSeconds),
    stealLimit: base.stealLimit in STEAL_LIMITS ? base.stealLimit : 'none',
    showBroughtBy: base.showBroughtBy !== false
  };
}

export function playerName(s: GameState, id: string | undefined): string {
  return s.players.find((p) => p.id === id)?.name ?? '¿?';
}

export function giftOf(s: GameState, playerId: string): Gift | undefined {
  return s.gifts.find((g) => g.holder === playerId);
}

export function giftLabel(s: GameState, giftId: string): string {
  const g = s.gifts.find((x) => x.id === giftId);
  return g ? `el regalo que trajo ${playerName(s, g.broughtBy)}` : 'un regalo';
}

function seatIndex(s: GameState, id: string): number {
  return s.players.findIndex((p) => p.id === id);
}

/** Vecino de la izquierda: el siguiente en sentido horario. */
export function leftOf(s: GameState, id: string): Player {
  const n = s.players.length;
  return s.players[(seatIndex(s, id) + 1) % n];
}

/** Vecino de la derecha: el anterior en sentido horario. */
export function rightOf(s: GameState, id: string): Player {
  const n = s.players.length;
  return s.players[(seatIndex(s, id) - 1 + n) % n];
}

export function currentPlayer(s: GameState): Player | undefined {
  return s.phase === 'playing' ? s.players[s.turn] : undefined;
}

function isFrozen(s: GameState, g: Gift | undefined): boolean {
  return !!g && s.config.stealLimit === 'freezeAfter3' && g.steals >= 3;
}

export function isGiftFrozen(s: GameState, giftId: string): boolean {
  return isFrozen(s, s.gifts.find((g) => g.id === giftId));
}

function pushEvent(s: GameState, now: number, e: Omit<GameEvent, 'seq' | 'ts'>): GameEvent {
  s.seq += 1;
  const ev: GameEvent = { seq: s.seq, ts: now, ...e };
  s.events.push(ev);
  if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS);
  return ev;
}

// ---------- tiempo ----------

export type TimerState = 'normal' | 'warn' | 'last' | 'over';

export function remainingMs(s: GameState, now: number): number {
  if (s.phase === 'finished') return 0;
  if (s.phase !== 'playing') return s.config.durationMin * 60_000;
  if (s.paused) return s.pausedRemaining ?? 0;
  return Math.max(0, (s.endsAt ?? now) - now);
}

export function timerState(ms: number): TimerState {
  if (ms <= 0) return 'over';
  if (ms <= 60_000) return 'last';
  if (ms <= 180_000) return 'warn';
  return 'normal';
}

export function timerLabel(ms: number): string {
  const st = timerState(ms);
  if (st === 'over') return '¡Se acabó!';
  if (st === 'last') return `0:${String(Math.ceil(ms / 1000)).padStart(2, '0').slice(-2)}`.replace('0:60', '1:00');
  return `Quedan ${Math.ceil(ms / 60_000)} min`;
}

export function pendingRemainingMs(s: GameState, now: number): number {
  if (!s.pending || s.pending.kind === 'roll') return 0;
  if (s.paused) return s.pausedPendingRemaining ?? 0;
  return Math.max(0, s.pending.deadline - now);
}

// ---------- preparación ----------

export function newGame(config: Partial<GameConfig> = {}): GameState {
  return {
    config: sanitizeConfig(config),
    phase: 'lobby',
    paused: false,
    players: [],
    gifts: [],
    turn: 0,
    turnCount: 0,
    events: [],
    seq: 0,
    deals: [],
    stealsBy: {}
  };
}

export function addPlayer(state: GameState, p: { id: string; name: string; avatar?: string }): GameState {
  const s = clone(state);
  if (s.phase !== 'lobby') throw new GameError('La partida ya ha empezado');
  const name = p.name.trim().slice(0, 20);
  if (!name) throw new GameError('Escribe un nombre');
  if (s.players.length >= LIMITS.maxPlayers) throw new GameError('La sala está llena (máximo 30)');
  if (s.players.some((x) => x.name.toLowerCase() === name.toLowerCase() && x.id !== p.id))
    throw new GameError('Ese nombre ya está en la partida');
  const existing = s.players.find((x) => x.id === p.id);
  if (existing) {
    existing.name = name;
    existing.avatar = p.avatar || existing.avatar;
  } else {
    s.players.push({
      id: p.id,
      name,
      avatar: p.avatar || AVATARS[s.players.length % AVATARS.length],
      connected: true,
      isProtected: false
    });
  }
  return s;
}

export function removePlayer(state: GameState, id: string): GameState {
  const s = clone(state);
  if (s.phase !== 'lobby') throw new GameError('Solo se puede quitar jugadores antes de empezar');
  s.players = s.players.filter((p) => p.id !== id);
  return s;
}

export function reorderPlayers(state: GameState, ids: string[]): GameState {
  const s = clone(state);
  if (s.phase !== 'lobby') throw new GameError('Los asientos solo se ordenan antes de empezar');
  const byId = new Map(s.players.map((p) => [p.id, p]));
  const ordered = ids.map((id) => byId.get(id)).filter((p): p is Player => !!p);
  const rest = s.players.filter((p) => !ids.includes(p.id));
  s.players = [...ordered, ...rest];
  s.players.forEach((p) => (p.seatWarning = false));
  return s;
}

export function setConfig(state: GameState, c: Partial<GameConfig>): GameState {
  const s = clone(state);
  if (s.phase !== 'lobby') throw new GameError('Los ajustes solo se cambian antes de empezar');
  s.config = sanitizeConfig({ ...s.config, ...c });
  return s;
}

/** Reparto inicial: cada jugador entrega su regalo a otro, nadie se queda el suyo. */
export function startDeal(state: GameState, rng: Rng, now: number): GameState {
  const s = clone(state);
  if (s.phase !== 'lobby') throw new GameError('La partida ya ha empezado');
  if (s.players.length < LIMITS.minPlayers) throw new GameError('Hacen falta al menos 3 jugadores');
  const ids = s.players.map((p) => p.id);
  let perm = shuffle(ids, rng);
  for (let tries = 0; perm.some((id, i) => id === ids[i]); tries++) {
    perm = tries < 200 ? shuffle(ids, rng) : [...ids.slice(1), ids[0]];
  }
  s.deals = ids.map((from, i) => ({ from, to: perm[i] }));
  s.gifts = ids.map((from, i) => ({ id: `g-${from}`, broughtBy: from, holder: perm[i], steals: 0, moves: 0 }));
  s.phase = 'deal';
  const instructions: Record<string, string> = {};
  for (const d of s.deals) instructions[d.from] = `Dale tu regalo a ${playerName(s, d.to)}`;
  pushEvent(s, now, { kind: 'system', text: 'Reparto inicial', instructions });
  return s;
}

export function startPlaying(state: GameState, rng: Rng, now: number): GameState {
  const s = clone(state);
  if (s.phase !== 'deal') throw new GameError('Primero hay que hacer el reparto');
  s.phase = 'playing';
  s.paused = false;
  s.startedAt = now;
  s.endsAt = now + s.config.durationMin * 60_000;
  s.turn = Math.floor(rng() * s.players.length);
  s.turnCount = 0;
  pushEvent(s, now, { kind: 'system', text: '¡Empieza la partida!', instructions: {} });
  beginTurn(s, now);
  return s;
}

function beginTurn(s: GameState, now: number) {
  const p = s.players[s.turn];
  p.isProtected = false; // la protección dura hasta su siguiente turno
  s.pending = { kind: 'roll', playerId: p.id, deadline: 0 };
}

function advance(s: GameState, now: number) {
  s.turn = (s.turn + 1) % s.players.length;
  s.turnCount += 1;
  beginTurn(s, now);
}

function assertTurn(s: GameState, playerId: string, kind: Pending['kind'], now: number) {
  if (s.phase !== 'playing') throw new GameError('La partida no está en juego');
  if (s.paused) throw new GameError('La partida está en pausa');
  if ((s.endsAt ?? 0) <= now) throw new GameError('Se acabó el tiempo');
  if (!s.pending || s.pending.kind !== kind || s.pending.playerId !== playerId)
    throw new GameError('No es tu turno');
}

// ---------- acciones ----------

/** Jugadores a los que `actorId` puede robar ahora mismo. */
export function eligibleTargets(s: GameState, actorId: string): string[] {
  const own = giftOf(s, actorId);
  if (isFrozen(s, own)) return [];
  const noRevenge = s.config.stealLimit !== 'none';
  return s.players
    .filter((p) => p.id !== actorId)
    .filter((p) => !p.isProtected)
    .filter((p) => !isFrozen(s, giftOf(s, p.id)))
    .filter((p) => !(noRevenge && s.lastSteal && s.lastSteal.victim === actorId && s.lastSteal.thief === p.id))
    .map((p) => p.id);
}

export function blockedReason(s: GameState, actorId: string, targetId: string): string | undefined {
  const p = s.players.find((x) => x.id === targetId);
  if (!p || targetId === actorId) return undefined;
  if (p.isProtected) return 'Protegido';
  if (isFrozen(s, giftOf(s, targetId))) return 'Regalo fijo';
  if (s.config.stealLimit !== 'none' && s.lastSteal?.victim === actorId && s.lastSteal.thief === targetId)
    return 'Sin venganza';
  return undefined;
}

function swap(s: GameState, a: string, b: string, isStealBy?: string) {
  const ga = giftOf(s, a)!;
  const gb = giftOf(s, b)!;
  ga.holder = b;
  gb.holder = a;
  ga.moves += 1;
  gb.moves += 1;
  if (isStealBy) {
    const taken = isStealBy === a ? gb : ga;
    taken.steals += 1;
    s.stealsBy[isStealBy] = (s.stealsBy[isStealBy] ?? 0) + 1;
  }
}

function swapInstructions(s: GameState, a: string, b: string): Record<string, string> {
  return {
    [a]: `Dale tu regalo a ${playerName(s, b)}; ${playerName(s, b)} te da el suyo`,
    [b]: `Dale tu regalo a ${playerName(s, a)}; ${playerName(s, a)} te da el suyo`
  };
}

function doSwap(s: GameState, now: number, actor: string, target: string, action: ActionId, steal: boolean) {
  swap(s, actor, target, steal ? actor : undefined);
  s.lastSteal = steal ? { thief: actor, victim: target } : undefined;
  pushEvent(s, now, {
    kind: 'action',
    playerId: actor,
    action,
    text: `${playerName(s, actor)} y ${playerName(s, target)} se intercambian los regalos`,
    instructions: swapInstructions(s, actor, target),
    swaps: [[actor, target]]
  });
}

function nothingEvent(s: GameState, now: number, actor: string, action: ActionId, text: string) {
  s.lastSteal = undefined;
  pushEvent(s, now, { kind: 'action', playerId: actor, action, text, instructions: {} });
}

function neighborSwap(s: GameState, now: number, actor: string, dir: Direction, action: ActionId) {
  const other = dir === 'left' ? leftOf(s, actor) : rightOf(s, actor);
  if (other.id === actor) return nothingEvent(s, now, actor, action, 'No hay vecino con quien cambiar');
  if (other.isProtected) return nothingEvent(s, now, actor, action, `${other.name} está protegido: no pasa nada`);
  if (isFrozen(s, giftOf(s, other.id)) || isFrozen(s, giftOf(s, actor)))
    return nothingEvent(s, now, actor, action, 'Un regalo fijo no se mueve: no pasa nada');
  doSwap(s, now, actor, other.id, action, false);
}

function rotate(s: GameState, now: number, actor: string, dir: Direction, action: ActionId) {
  const movers = s.players.filter((p) => !isFrozen(s, giftOf(s, p.id)));
  if (movers.length < 2) return nothingEvent(s, now, actor, action, 'No hay regalos que mover');
  const gifts = movers.map((p) => giftOf(s, p.id)!);
  const instructions: Record<string, string> = {};
  const n = movers.length;
  movers.forEach((p, i) => {
    const to = dir === 'left' ? movers[(i + 1) % n] : movers[(i - 1 + n) % n];
    const from = dir === 'left' ? movers[(i - 1 + n) % n] : movers[(i + 1) % n];
    gifts[i].holder = to.id;
    gifts[i].moves += 1;
    instructions[p.id] = `Pasa tu regalo a ${to.name}; ${from.name} te da el suyo`;
  });
  s.lastSteal = undefined;
  pushEvent(s, now, {
    kind: 'action',
    playerId: actor,
    action,
    text: `¡Todos pasan su regalo a la ${dir === 'left' ? 'izquierda' : 'derecha'}!`,
    instructions,
    rotation: dir
  });
}

function resolveImmediate(s: GameState, now: number, actor: string, action: ActionId, rng: Rng) {
  switch (action) {
    case 'right':
      return neighborSwap(s, now, actor, 'right', action);
    case 'left':
      return neighborSwap(s, now, actor, 'left', action);
    case 'allRight':
      return rotate(s, now, actor, 'right', action);
    case 'allLeft':
      return rotate(s, now, actor, 'left', action);
    case 'keep': {
      const p = s.players.find((x) => x.id === actor)!;
      p.isProtected = true;
      s.lastSteal = undefined;
      pushEvent(s, now, {
        kind: 'action',
        playerId: actor,
        action,
        text: `${p.name} protege su regalo hasta su siguiente turno`,
        instructions: {}
      });
      return;
    }
    case 'blindSteal': {
      const t = eligibleTargets(s, actor);
      if (!t.length) return nothingEvent(s, now, actor, action, 'No hay nadie a quien robar: no pasa nada');
      return doSwap(s, now, actor, t[Math.floor(rng() * t.length)], action, true);
    }
    case 'nothing':
    default:
      return nothingEvent(s, now, actor, 'nothing', '¡Feliz Navidad! No pasa nada');
  }
}

export function roll(state: GameState, playerId: string, rng: Rng, now: number): GameState {
  const s = clone(state);
  assertTurn(s, playerId, 'roll', now);
  const face = Math.floor(rng() * 6);
  const action = DICE_MODES[s.config.diceMode].faces[face];
  const ev = pushEvent(s, now, {
    kind: 'roll',
    playerId,
    action,
    text: `${playerName(s, playerId)} saca «${ACTIONS[action].name}»`,
    instructions: {}
  });
  s.lastRoll = { seq: ev.seq, playerId, face, action };
  if (action === 'steal') {
    if (!eligibleTargets(s, playerId).length) {
      nothingEvent(s, now, playerId, action, 'No hay nadie a quien robar: no pasa nada');
      advance(s, now);
    } else {
      s.pending = { kind: 'chooseTarget', playerId, action, deadline: now + s.config.chooseSeconds * 1000 };
    }
  } else if (action === 'whirl') {
    s.pending = { kind: 'chooseDirection', playerId, action, deadline: now + s.config.chooseSeconds * 1000 };
  } else {
    resolveImmediate(s, now, playerId, action, rng);
    advance(s, now);
  }
  return s;
}

/** El anfitrión salta el turno de quien debe tirar (por ejemplo, si no está). No cambia ningún regalo. */
export function skipTurn(state: GameState, now: number): GameState {
  const s = clone(state);
  if (!s.pending || s.pending.kind !== 'roll') throw new GameError('Solo se puede saltar un turno antes de tirar');
  const id = s.pending.playerId;
  assertTurn(s, id, 'roll', now);
  s.lastSteal = undefined;
  pushEvent(s, now, { kind: 'pass', playerId: id, text: `Turno de ${playerName(s, id)} saltado por el anfitrión`, instructions: {} });
  advance(s, now);
  return s;
}

export function chooseTarget(state: GameState, playerId: string, targetId: string, now: number): GameState {
  const s = clone(state);
  assertTurn(s, playerId, 'chooseTarget', now);
  if (!eligibleTargets(s, playerId).includes(targetId)) throw new GameError('No puedes elegir a ese jugador');
  doSwap(s, now, playerId, targetId, 'steal', true);
  advance(s, now);
  return s;
}

export function chooseDirection(state: GameState, playerId: string, dir: Direction, now: number): GameState {
  const s = clone(state);
  assertTurn(s, playerId, 'chooseDirection', now);
  rotate(s, now, playerId, dir === 'left' ? 'left' : 'right', 'whirl');
  advance(s, now);
  return s;
}

/** Resuelve una elección pendiente al azar (tiempo agotado). */
function autoResolve(s: GameState, now: number, rng: Rng) {
  const p = s.pending!;
  if (p.kind === 'chooseTarget') {
    const t = eligibleTargets(s, p.playerId);
    if (t.length) doSwap(s, now, p.playerId, t[Math.floor(rng() * t.length)], 'steal', true);
    else nothingEvent(s, now, p.playerId, 'steal', 'No hay nadie a quien robar: no pasa nada');
  } else if (p.kind === 'chooseDirection') {
    rotate(s, now, p.playerId, rng() < 0.5 ? 'left' : 'right', 'whirl');
  }
}

function finish(s: GameState, now: number, rng: Rng) {
  s.phase = 'finished';
  s.pending = undefined;
  s.paused = false;
  s.players.forEach((p) => (p.isProtected = false));
  s.openingOrder = shuffle(
    s.players.map((p) => p.id),
    rng
  );
  const top = <T>(items: T[], val: (t: T) => number) =>
    items.reduce<T | undefined>((best, x) => (val(x) > 0 && (!best || val(x) > val(best)) ? x : best), undefined);
  const stolen = top(s.gifts, (g) => g.steals);
  const traveled = top(s.gifts, (g) => g.moves);
  const thiefId = top(Object.keys(s.stealsBy), (id) => s.stealsBy[id]);
  s.stats = {
    mostStolen: stolen && { giftId: stolen.id, count: stolen.steals },
    mostTraveled: traveled && { giftId: traveled.id, count: traveled.moves },
    thief: thiefId ? { playerId: thiefId, count: s.stealsBy[thiefId] } : undefined
  };
  pushEvent(s, now, { kind: 'system', text: '¡Se acabó!', instructions: {} });
}

/** Avanza el reloj: turnos caducados, elecciones al azar y fin de partida. Devuelve el mismo objeto si nada cambia. */
export function tick(state: GameState, rng: Rng, now: number): GameState {
  if (state.phase !== 'playing' || state.paused) return state;
  const timeUp = (state.endsAt ?? Infinity) <= now;
  const expired = !!state.pending && state.pending.kind !== 'roll' && state.pending.deadline <= now;
  if (!timeUp && !expired) return state;
  const s = clone(state);
  if (timeUp) {
    if (s.pending && s.pending.kind !== 'roll') autoResolve(s, now, rng); // la tirada en curso termina de resolverse
    finish(s, now, rng);
    return s;
  }
  autoResolve(s, now, rng);
  advance(s, now);
  return s;
}

/** El anfitrión termina la partida antes de tiempo. */
export function endNow(state: GameState, rng: Rng, now: number): GameState {
  const s = clone(state);
  if (s.phase !== 'playing') throw new GameError('La partida no está en juego');
  finish(s, now, rng);
  return s;
}

export function pause(state: GameState, now: number): GameState {
  const s = clone(state);
  if (s.phase !== 'playing' || s.paused) return s;
  s.paused = true;
  s.pausedRemaining = Math.max(0, (s.endsAt ?? now) - now);
  s.pausedPendingRemaining = s.pending ? Math.max(0, s.pending.deadline - now) : 0;
  pushEvent(s, now, { kind: 'system', text: 'Partida en pausa', instructions: {} });
  return s;
}

export function resume(state: GameState, now: number): GameState {
  const s = clone(state);
  if (s.phase !== 'playing' || !s.paused) return s;
  s.paused = false;
  s.endsAt = now + (s.pausedRemaining ?? 0);
  if (s.pending && s.pending.kind !== 'roll') s.pending.deadline = now + Math.max(3000, s.pausedPendingRemaining ?? 0);
  s.pausedRemaining = undefined;
  s.pausedPendingRemaining = undefined;
  pushEvent(s, now, { kind: 'system', text: 'Seguimos jugando', instructions: {} });
  return s;
}

/** Deshacer: vuelve al estado anterior sin devolver el tiempo de partida ya gastado. */
export function restoreForUndo(prev: GameState, current: GameState, now: number): GameState {
  const s = clone(prev);
  if (s.phase !== 'playing') return s;
  s.paused = current.paused;
  s.endsAt = current.endsAt;
  s.pausedRemaining = current.pausedRemaining;
  if (s.pending && s.pending.kind !== 'roll') {
    s.pending.deadline = now + s.config.chooseSeconds * 1000;
    s.pausedPendingRemaining = current.paused ? s.config.chooseSeconds * 1000 : undefined;
  }
  s.seq = Math.max(s.seq, current.seq);
  pushEvent(s, now, { kind: 'system', text: 'El anfitrión ha deshecho la última acción', instructions: {} });
  return s;
}

/** Revancha: mismos jugadores y ajustes, vuelta al lobby. */
export function rematch(state: GameState): GameState {
  const s = newGame(state.config);
  s.players = state.players.map((p) => ({ ...p, isProtected: false, seatWarning: false }));
  return s;
}

export function setPlayerFlag(state: GameState, id: string, patch: Partial<Pick<Player, 'connected' | 'seatWarning'>>): GameState {
  const s = clone(state);
  const p = s.players.find((x) => x.id === id);
  if (p) Object.assign(p, patch);
  return s;
}
