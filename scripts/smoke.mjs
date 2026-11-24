// Prueba de humo del modo sala: crea una sala, une 4 jugadores y juega turnos reales contra el servidor.
// Uso: node scripts/smoke.mjs [http://localhost:3000]
import { io } from 'socket.io-client';

const URL = process.argv[2] ?? 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const connect = () => io(URL, { transports: ['websocket'], forceNew: true });
const call = (s, ev, p = {}) =>
  new Promise((res, rej) =>
    s.timeout(5000).emit(ev, p, (err, r) => (err ? rej(err) : r.ok ? res(r) : rej(new Error(`${ev}: ${r.error}`))))
  );
const assert = (c, m) => {
  if (!c) throw new Error('FALLO: ' + m);
  console.log('  ✓', m);
};

const hostDev = connect();
let last;
hostDev.on('room:state', (s) => (last = s));
const { code, hostToken } = await call(hostDev, 'room:create', { config: { durationMin: 5, rollSeconds: 10 } });
console.log('Sala', code);
await call(hostDev, 'room:watch', { code, hostToken });

const names = ['Ana', 'Luis', 'Marta', 'Carlos'];
const players = [];
for (const name of names) {
  const s = connect();
  const r = await call(s, 'room:join', { code, name, avatar: '🎅' });
  players.push({ name, s, id: r.playerId, token: r.token });
}
await sleep(200);
assert(last.state.players.length === 4, '4 jugadores en el lobby');

// nombre repetido
const dup = connect();
await call(dup, 'room:join', { code, name: 'ana' }).then(
  () => assert(false, 'rechaza nombre repetido'),
  () => assert(true, 'rechaza nombre repetido')
);
dup.close();

// un jugador no puede hacer de anfitrión
await call(players[0].s, 'host:deal').then(
  () => assert(false, 'solo el anfitrión reparte'),
  () => assert(true, 'solo el anfitrión reparte')
);

await call(hostDev, 'host:reorder', { ids: players.map((p) => p.id).reverse() });
await sleep(100);
assert(last.state.players[0].name === 'Carlos', 'reordenar asientos');

await call(hostDev, 'host:deal');
await sleep(100);
assert(last.state.phase === 'deal' && last.state.gifts.every((g) => g.holder !== g.broughtBy), 'reparto sin que nadie se quede el suyo');
await call(hostDev, 'host:start');
await sleep(100);
assert(last.state.phase === 'playing' && last.state.pending?.kind === 'roll', 'partida en marcha');

// reconexión con token
players[1].s.close();
await sleep(1800);
assert(!last.state.players.find((p) => p.id === players[1].id).connected, 'se marca desconectado');
players[1].s = connect();
const re = await call(players[1].s, 'room:join', { code, token: players[1].token });
assert(re.playerId === players[1].id, 'reconecta con su token al mismo sitio');

const byId = Object.fromEntries(players.map((p) => [p.id, p]));
let turns = 0;
let steals = 0;
for (let i = 0; i < 40; i++) {
  const st = last.state;
  const pend = st.pending;
  const p = byId[pend.playerId];
  if (pend.kind === 'roll') {
    await call(p.s, i % 7 === 3 ? 'game:pass' : 'game:roll');
    turns++;
  } else if (pend.kind === 'chooseTarget') {
    const target = st.players.find((x) => x.id !== p.id && !x.isProtected);
    await call(p.s, 'game:target', { targetId: target.id });
    steals++;
  } else {
    await call(p.s, 'game:direction', { dir: 'left' });
  }
  await sleep(40);
  const holders = new Set(last.state.gifts.map((g) => g.holder));
  if (holders.size !== 4) throw new Error('un jugador sin regalo o con dos');
}
assert(true, `${turns} turnos jugados (${steals} robos) y todos con exactamente 1 regalo`);

// jugar fuera de turno
const notTurn = players.find((p) => p.id !== last.state.pending.playerId);
await call(notTurn.s, 'game:roll').then(
  () => assert(false, 'rechaza tirar fuera de turno'),
  () => assert(true, 'rechaza tirar fuera de turno')
);

await call(hostDev, 'host:pause');
await sleep(80);
assert(last.state.paused, 'pausa');
await call(hostDev, 'host:resume');
const seqBefore = last.state.seq;
await call(hostDev, 'host:undo');
await sleep(80);
assert(last.state.seq > seqBefore, 'deshacer');

await call(hostDev, 'host:end');
await sleep(80);
assert(last.state.phase === 'finished' && last.state.openingOrder.length === 4, 'final con orden de apertura');
await call(hostDev, 'host:rematch');
await sleep(80);
assert(last.state.phase === 'lobby' && last.state.players.length === 4, 'revancha con los mismos jugadores');

for (const p of players) p.s.close();
hostDev.close();
console.log('OK: prueba de humo superada');
process.exit(0);
