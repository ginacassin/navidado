import { describe, expect, it } from 'vitest';
import {
  addPlayer,
  chooseDirection,
  chooseTarget,
  DICE_MODES,
  eligibleTargets,
  giftOf,
  leftOf,
  newGame,
  pass,
  pause,
  remainingMs,
  reorderPlayers,
  restoreForUndo,
  resume,
  rightOf,
  roll,
  startDeal,
  startPlaying,
  tick,
  timerLabel,
  timerState,
  type GameState,
  type Rng
} from '../src/shared/game';

/** rng que devuelve una secuencia fija (y luego 0). */
const seq = (...vals: number[]): Rng => {
  let i = 0;
  return () => (i < vals.length ? vals[i++] : 0);
};
const faceRng = (face: number) => face / 6 + 0.01;
const T0 = 1_000_000;

function setup(n = 4, config = {}): GameState {
  let s = newGame(config);
  ['Ana', 'Luis', 'Marta', 'Carlos', 'Sofía', 'Pablo'].slice(0, n).forEach((name, i) => {
    s = addPlayer(s, { id: `p${i}`, name });
  });
  s = startDeal(s, Math.random, T0);
  s = startPlaying(s, seq(0), T0); // empieza p0
  return s;
}

const holders = (s: GameState) => Object.fromEntries(s.players.map((p) => [p.id, giftOf(s, p.id)!.id]));

describe('preparación', () => {
  it('reparto inicial: nadie se queda su regalo y todos tienen uno', () => {
    for (let k = 0; k < 50; k++) {
      let s = newGame();
      for (let i = 0; i < 5; i++) s = addPlayer(s, { id: `p${i}`, name: `J${i}` });
      s = startDeal(s, Math.random, T0);
      expect(new Set(s.gifts.map((g) => g.holder)).size).toBe(5);
      s.gifts.forEach((g) => expect(g.holder).not.toBe(g.broughtBy));
      expect(s.deals).toHaveLength(5);
    }
  });

  it('exige 3 jugadores y nombres únicos', () => {
    let s = newGame();
    s = addPlayer(s, { id: 'a', name: 'Ana' });
    expect(() => addPlayer(s, { id: 'b', name: 'ana' })).toThrow();
    s = addPlayer(s, { id: 'b', name: 'Luis' });
    expect(() => startDeal(s, Math.random, T0)).toThrow();
  });

  it('izquierda = siguiente en sentido horario, derecha = anterior', () => {
    const s = setup(4);
    expect(leftOf(s, 'p0').id).toBe('p1');
    expect(rightOf(s, 'p0').id).toBe('p3');
  });

  it('reordenar asientos', () => {
    let s = newGame();
    for (let i = 0; i < 3; i++) s = addPlayer(s, { id: `p${i}`, name: `J${i}` });
    s = reorderPlayers(s, ['p2', 'p0', 'p1']);
    expect(s.players.map((p) => p.id)).toEqual(['p2', 'p0', 'p1']);
  });
});

describe('acciones del dado (modo Clásico)', () => {
  it('Derecha intercambia con el vecino de la derecha y pasa el turno a la izquierda', () => {
    let s = setup(4);
    const before = holders(s);
    s = roll(s, 'p0', seq(faceRng(0)), T0 + 1000);
    expect(s.lastRoll?.action).toBe('right');
    expect(holders(s).p0).toBe(before.p3);
    expect(holders(s).p3).toBe(before.p0);
    expect(s.pending?.playerId).toBe('p1');
  });

  it('Todos a la izquierda rota todos los regalos', () => {
    let s = setup(4);
    const before = holders(s);
    s = roll(s, 'p0', seq(faceRng(4)), T0 + 1000);
    expect(s.lastRoll?.action).toBe('allLeft');
    expect(holders(s).p1).toBe(before.p0);
    expect(holders(s).p0).toBe(before.p3);
    expect(s.events.at(-1)?.instructions.p0).toContain('Pasa tu regalo a Luis');
  });

  it('Robo espera elección y luego intercambia', () => {
    let s = setup(4);
    const before = holders(s);
    s = roll(s, 'p0', seq(faceRng(2)), T0 + 1000);
    expect(s.pending?.kind).toBe('chooseTarget');
    expect(() => chooseTarget(s, 'p0', 'p0', T0 + 2000)).toThrow();
    s = chooseTarget(s, 'p0', 'p2', T0 + 2000);
    expect(holders(s).p0).toBe(before.p2);
    expect(s.stealsBy.p0).toBe(1);
    expect(s.events.at(-1)?.instructions.p2).toBe('Dale tu regalo a Ana; Ana te da el suyo');
  });

  it('¡Feliz Navidad! no cambia nada', () => {
    let s = setup(4);
    const before = holders(s);
    s = roll(s, 'p0', seq(faceRng(5)), T0 + 1000);
    expect(holders(s)).toEqual(before);
  });

  it('cada jugador conserva siempre exactamente un regalo', () => {
    let s = setup(6, { diceMode: 'caotico' });
    let now = T0;
    for (let i = 0; i < 300 && s.phase === 'playing'; i++) {
      now += 500;
      const p = s.pending!;
      if (p.kind === 'roll') s = roll(s, p.playerId, Math.random, now);
      else if (p.kind === 'chooseTarget') s = chooseTarget(s, p.playerId, eligibleTargets(s, p.playerId)[0], now);
      else s = chooseDirection(s, p.playerId, 'right', now);
      expect(new Set(s.gifts.map((g) => g.holder)).size).toBe(6);
    }
  });
});

describe('Me lo quedo y límites de robo', () => {
  it('un jugador protegido no puede ser robado hasta su siguiente turno', () => {
    let s = setup(4, { diceMode: 'estrategico' });
    s = roll(s, 'p0', seq(faceRng(3)), T0 + 1000); // keep
    expect(s.players[0].isProtected).toBe(true);
    s = roll(s, 'p1', seq(faceRng(2)), T0 + 2000); // robo
    expect(eligibleTargets(s, 'p1')).not.toContain('p0');
    s = chooseTarget(s, 'p1', 'p2', T0 + 3000);
    s = pass(s, 'p2', T0 + 4000);
    s = pass(s, 'p3', T0 + 5000);
    expect(s.pending?.playerId).toBe('p0');
    expect(s.players[0].isProtected).toBe(false);
  });

  it('sin venganza: la víctima no puede robar justo al ladrón', () => {
    let s = setup(4, { stealLimit: 'noRevenge' });
    s = roll(s, 'p0', seq(faceRng(2)), T0 + 1000);
    s = chooseTarget(s, 'p0', 'p1', T0 + 2000);
    s = roll(s, 'p1', seq(faceRng(2)), T0 + 3000);
    expect(eligibleTargets(s, 'p1')).not.toContain('p0');
  });
});

describe('turnos, paso y tiempo', () => {
  it('Paso no cambia nada y pasa el turno', () => {
    let s = setup(4);
    const before = holders(s);
    s = pass(s, 'p0', T0 + 1000);
    expect(holders(s)).toEqual(before);
    expect(s.pending?.playerId).toBe('p1');
  });

  it('si no tira a tiempo se salta el turno sin cambios', () => {
    let s = setup(4);
    const before = holders(s);
    s = tick(s, Math.random, T0 + 19_000);
    expect(s.pending?.playerId).toBe('p0');
    s = tick(s, Math.random, T0 + 20_000);
    expect(s.pending?.playerId).toBe('p1');
    expect(s.events.at(-1)?.kind).toBe('timeout');
    expect(holders(s)).toEqual(before);
  });

  it('elección no hecha a tiempo se resuelve al azar', () => {
    let s = setup(4);
    s = roll(s, 'p0', seq(faceRng(2)), T0 + 1000);
    s = tick(s, seq(0), T0 + 1000 + 15_000);
    expect(s.pending?.playerId).toBe('p1');
    expect(s.stealsBy.p0).toBe(1);
  });

  it('al llegar a cero termina; la elección en curso se resuelve', () => {
    let s = setup(4, { durationMin: 5 });
    const end = T0 + 5 * 60_000;
    s = roll(s, 'p0', seq(faceRng(2)), end - 2000);
    s = tick(s, seq(0, 0.5), end);
    expect(s.phase).toBe('finished');
    expect(s.stealsBy.p0).toBe(1);
    expect(s.openingOrder).toHaveLength(4);
    expect(s.stats?.thief?.playerId).toBe('p0');
    expect(() => roll(s, 'p1', Math.random, end + 10)).toThrow();
  });

  it('la pausa congela el temporizador', () => {
    let s = setup(4);
    s = pause(s, T0 + 60_000);
    expect(remainingMs(s, T0 + 500_000)).toBe(14 * 60_000);
    s = resume(s, T0 + 500_000);
    expect(remainingMs(s, T0 + 500_000)).toBe(14 * 60_000);
  });

  it('deshacer no devuelve el tiempo gastado', () => {
    let s0 = setup(4);
    const s1 = roll(s0, 'p0', seq(faceRng(0)), T0 + 1000);
    const u = restoreForUndo(s0, s1, T0 + 5000);
    expect(holders(u)).toEqual(holders(s0));
    expect(u.endsAt).toBe(s1.endsAt);
    expect(u.pending?.playerId).toBe('p0');
  });
});

describe('temporizador: estados y textos', () => {
  it('estados y etiquetas', () => {
    expect(timerState(12 * 60_000)).toBe('normal');
    expect(timerLabel(12 * 60_000)).toBe('Quedan 12 min');
    expect(timerState(3 * 60_000)).toBe('warn');
    expect(timerLabel(3 * 60_000)).toBe('Quedan 3 min');
    expect(timerState(59_000)).toBe('last');
    expect(timerLabel(59_000)).toBe('0:59');
    expect(timerLabel(60_000)).toBe('1:00');
    expect(timerLabel(5_000)).toBe('0:05');
    expect(timerState(0)).toBe('over');
  });

  it('todos los modos tienen 6 caras y al menos un ¡Feliz Navidad!', () => {
    Object.values(DICE_MODES).forEach((m) => {
      expect(m.faces).toHaveLength(6);
      expect(m.faces).toContain('nothing');
    });
  });
});
