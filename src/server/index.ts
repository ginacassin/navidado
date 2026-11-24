import { createServer } from 'node:http';
import { randomBytes, randomInt } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { Server, type Socket } from 'socket.io';
import * as G from '../shared/game';
import type { ClientToServer, RoomSnapshot, ServerToClient } from '../shared/protocol';

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';
const DATA_DIR = resolve(process.env.DATA_DIR ?? './data');
const ROOM_TTL_MS = 12 * 60 * 60 * 1000;
const HISTORY = 30;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I ni O

interface Room {
  code: string;
  hostToken: string;
  state: G.GameState;
  history: G.GameState[];
  tokens: Record<string, string>; // token -> playerId
  hostPlayerId?: string;
  lastActivity: number;
}

const rooms = new Map<string, Room>();
let dirty = false;

// ---------- persistencia ----------

const ROOMS_FILE = join(DATA_DIR, 'rooms.json');

function load() {
  try {
    if (!existsSync(ROOMS_FILE)) return;
    const data = JSON.parse(readFileSync(ROOMS_FILE, 'utf8')) as Room[];
    for (const r of data) {
      r.state.players.forEach((p) => (p.connected = false));
      rooms.set(r.code, r);
    }
    console.log(`[navidado] ${rooms.size} salas recuperadas`);
  } catch (e) {
    console.error('[navidado] no se pudieron cargar las salas', e);
  }
}

function save() {
  if (!dirty) return;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    const tmp = ROOMS_FILE + '.tmp';
    writeFileSync(tmp, JSON.stringify([...rooms.values()]));
    renameSync(tmp, ROOMS_FILE);
    dirty = false;
  } catch (e) {
    console.error('[navidado] error guardando salas', e);
  }
}

// ---------- utilidades ----------

const token = () => randomBytes(16).toString('base64url');

function newCode(): string {
  for (;;) {
    let c = '';
    for (let i = 0; i < 4; i++) c += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    if (!rooms.has(c)) return c;
  }
}

function snapshot(r: Room): RoomSnapshot {
  return { code: r.code, state: r.state, serverNow: Date.now(), hostPlayerId: r.hostPlayerId, canUndo: r.history.length > 0 };
}

// ---------- servidor HTTP ----------

const here = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(here, '../client');
const serveStatic = existsSync(clientDir)
  ? sirv(clientDir, {
      single: true,
      etag: true,
      setHeaders(res, path) {
        if (path.startsWith('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        else res.setHeader('Cache-Control', 'no-cache');
      }
    })
  : null;

const http = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  if (serveStatic) return serveStatic(req, res, () => {
    res.writeHead(404);
    res.end('No encontrado');
  });
  res.writeHead(404);
  res.end('Cliente no compilado');
});

const io = new Server<ClientToServer, ServerToClient, {}, { code?: string; playerId?: string; isHost?: boolean }>(http, {
  cors: { origin: process.env.CORS_ORIGIN ?? false },
  pingInterval: 10_000,
  pingTimeout: 8_000
});

function broadcast(r: Room) {
  dirty = true;
  r.lastActivity = Date.now();
  io.to(r.code).emit('room:state', snapshot(r));
}

function commit(r: Room, next: G.GameState, keepHistory = true) {
  if (next === r.state) return;
  if (keepHistory && r.state.phase === 'playing') {
    r.history.push(r.state);
    if (r.history.length > HISTORY) r.history.shift();
  }
  r.state = next;
  broadcast(r);
}

function playerSockets(r: Room, playerId: string) {
  return [...(io.sockets.adapter.rooms.get(r.code) ?? [])]
    .map((id) => io.sockets.sockets.get(id))
    .filter((s): s is Socket => !!s && s.data.playerId === playerId);
}

type Handler<P> = (r: Room, socket: Socket, p: P) => void | Record<string, unknown>;

function guarded<P>(socket: Socket, needHost: boolean, fn: Handler<P>) {
  return (p: P, ack: (res: any) => void) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    try {
      const r = socket.data.code ? rooms.get(socket.data.code) : undefined;
      if (!r) throw new G.GameError('La sala no existe');
      if (needHost && !socket.data.isHost) throw new G.GameError('Solo el anfitrión puede hacer esto');
      const extra = fn(r, socket, p ?? ({} as P));
      reply({ ok: true, ...(extra ?? {}) });
    } catch (e) {
      reply({ ok: false, error: e instanceof G.GameError ? e.message : 'Algo ha fallado' });
      if (!(e instanceof G.GameError)) console.error(e);
    }
  };
}

function needPlayer(socket: Socket): string {
  if (!socket.data.playerId) throw new G.GameError('No estás en la partida');
  return socket.data.playerId;
}

io.on('connection', (socket) => {
  socket.on('room:create', (p, ack) => {
    try {
      const code = newCode();
      const r: Room = {
        code,
        hostToken: token(),
        state: G.newGame(p?.config ?? {}),
        history: [],
        tokens: {},
        lastActivity: Date.now()
      };
      rooms.set(code, r);
      dirty = true;
      ack({ ok: true, code, hostToken: r.hostToken });
    } catch {
      ack({ ok: false, error: 'No se pudo crear la sala' });
    }
  });

  socket.on('room:watch', (p, ack) => {
    const r = rooms.get(String(p?.code ?? '').toUpperCase());
    if (!r) return ack({ ok: false, error: 'No existe ninguna sala con ese código' });
    socket.data.code = r.code;
    socket.data.isHost = !!p.hostToken && p.hostToken === r.hostToken;
    socket.join(r.code);
    ack({ ok: true, isHost: !!socket.data.isHost });
    socket.emit('room:state', snapshot(r));
  });

  socket.on('room:join', (p, ack) => {
    try {
      const r = rooms.get(String(p?.code ?? '').toUpperCase());
      if (!r) throw new G.GameError('No existe ninguna sala con ese código');
      const isHost = !!p.hostToken && p.hostToken === r.hostToken;
      let playerId = p.token ? r.tokens[p.token] : undefined;
      let tk = p.token;
      if (playerId && !r.state.players.some((x) => x.id === playerId)) playerId = undefined; // expulsado
      if (!playerId) {
        if (!p.name) throw new G.GameError('Escribe tu nombre');
        if (r.state.phase !== 'lobby') throw new G.GameError('La partida ya ha empezado');
        playerId = 'p' + token().slice(0, 8);
        r.state = G.addPlayer(r.state, { id: playerId, name: p.name, avatar: p.avatar });
        tk = token();
        r.tokens[tk] = playerId;
      } else if (p.name && r.state.phase === 'lobby') {
        r.state = G.addPlayer(r.state, { id: playerId, name: p.name, avatar: p.avatar });
      }
      if (isHost) r.hostPlayerId = playerId;
      socket.data.code = r.code;
      socket.data.playerId = playerId;
      socket.data.isHost = isHost || r.hostPlayerId === playerId;
      socket.join(r.code);
      r.state = G.setPlayerFlag(r.state, playerId, { connected: true });
      ack({ ok: true, token: tk!, playerId, isHost: !!socket.data.isHost });
      broadcast(r);
    } catch (e) {
      ack({ ok: false, error: e instanceof G.GameError ? e.message : 'No se pudo entrar en la sala' });
      if (!(e instanceof G.GameError)) console.error(e);
    }
  });

  // --- anfitrión ---
  socket.on('host:config', guarded(socket, true, (r, _s, p: { config: Partial<G.GameConfig> }) => commit(r, G.setConfig(r.state, p.config), false)));
  socket.on('host:reorder', guarded(socket, true, (r, _s, p: { ids: string[] }) => commit(r, G.reorderPlayers(r.state, p.ids), false)));
  socket.on(
    'host:kick',
    guarded(socket, true, (r, _s, p: { playerId: string }) => {
      commit(r, G.removePlayer(r.state, p.playerId), false);
      for (const [t, id] of Object.entries(r.tokens)) if (id === p.playerId) delete r.tokens[t];
      for (const s of playerSockets(r, p.playerId)) {
        s.emit('room:kicked');
        s.data.playerId = undefined;
      }
    })
  );
  socket.on('host:deal', guarded(socket, true, (r) => commit(r, G.startDeal(r.state, G.cryptoRng, Date.now()), false)));
  socket.on(
    'host:start',
    guarded(socket, true, (r) => {
      r.history = [];
      commit(r, G.startPlaying(r.state, G.cryptoRng, Date.now()), false);
    })
  );
  socket.on('host:pause', guarded(socket, true, (r) => commit(r, G.pause(r.state, Date.now()), false)));
  socket.on('host:resume', guarded(socket, true, (r) => commit(r, G.resume(r.state, Date.now()), false)));
  socket.on(
    'host:undo',
    guarded(socket, true, (r) => {
      const prev = r.history.pop();
      if (!prev || r.state.phase !== 'playing') throw new G.GameError('No hay nada que deshacer');
      commit(r, G.restoreForUndo(prev, r.state, Date.now()), false);
    })
  );
  socket.on('host:end', guarded(socket, true, (r) => commit(r, G.endNow(r.state, G.cryptoRng, Date.now()))));
  socket.on(
    'host:rematch',
    guarded(socket, true, (r) => {
      r.history = [];
      commit(r, G.rematch(r.state), false);
    })
  );

  // --- jugador ---
  socket.on('game:roll', guarded(socket, false, (r, s) => commit(r, G.roll(r.state, needPlayer(s), G.cryptoRng, Date.now()))));
  socket.on('game:pass', guarded(socket, false, (r, s) => commit(r, G.pass(r.state, needPlayer(s), Date.now()))));
  socket.on(
    'game:target',
    guarded(socket, false, (r, s, p: { targetId: string }) => commit(r, G.chooseTarget(r.state, needPlayer(s), p.targetId, Date.now())))
  );
  socket.on(
    'game:direction',
    guarded(socket, false, (r, s, p: { dir: G.Direction }) => commit(r, G.chooseDirection(r.state, needPlayer(s), p.dir, Date.now())))
  );
  socket.on(
    'player:seatWarning',
    guarded(socket, false, (r, s) => commit(r, G.setPlayerFlag(r.state, needPlayer(s), { seatWarning: true }), false))
  );
  socket.on(
    'player:leave',
    guarded(socket, false, (r, s) => {
      const id = needPlayer(s);
      if (r.state.phase === 'lobby') {
        commit(r, G.removePlayer(r.state, id), false);
        for (const [t, pid] of Object.entries(r.tokens)) if (pid === id) delete r.tokens[t];
      }
      s.data.playerId = undefined;
    })
  );

  socket.on('disconnect', () => {
    const r = socket.data.code ? rooms.get(socket.data.code) : undefined;
    const pid = socket.data.playerId;
    if (!r || !pid) return;
    setTimeout(() => {
      if (playerSockets(r, pid).length === 0 && r.state.players.some((p) => p.id === pid)) {
        r.state = G.setPlayerFlag(r.state, pid, { connected: false });
        broadcast(r);
      }
    }, 1500);
  });
});

// ---------- reloj de partidas ----------

setInterval(() => {
  const now = Date.now();
  for (const r of rooms.values()) {
    if (r.state.phase === 'playing' && !r.state.paused) {
      try {
        commit(r, G.tick(r.state, G.cryptoRng, now));
      } catch (e) {
        console.error('[navidado] error en tick', e);
      }
    }
    if (now - r.lastActivity > ROOM_TTL_MS) {
      rooms.delete(r.code);
      dirty = true;
    }
  }
}, 250);

setInterval(save, 5000);

function shutdown() {
  save();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

load();
http.listen(PORT, HOST, () => console.log(`[navidado] escuchando en http://${HOST}:${PORT}`));
