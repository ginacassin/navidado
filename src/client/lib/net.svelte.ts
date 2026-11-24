import { io, type Socket } from 'socket.io-client';
import type { GameConfig } from '../../shared/game';
import type { ClientToServer, RoomSnapshot, ServerToClient } from '../../shared/protocol';
import { clock } from './clock.svelte';

export const net = $state({
  connected: false,
  everConnected: false,
  snap: null as RoomSnapshot | null,
  offset: 0,
  me: null as string | null,
  isHost: false,
  kicked: false
});

type Sess = { token?: string; hostToken?: string };
const key = (code: string) => `navidado:room:${code}`;
export function session(code: string): Sess {
  try {
    return JSON.parse(localStorage.getItem(key(code)) ?? '{}');
  } catch {
    return {};
  }
}
function saveSession(code: string, patch: Sess) {
  localStorage.setItem(key(code), JSON.stringify({ ...session(code), ...patch }));
}
export function forgetPlayer(code: string) {
  const s = session(code);
  delete s.token;
  localStorage.setItem(key(code), JSON.stringify(s));
}

let socket: Socket<ServerToClient, ClientToServer> | null = null;
let ctx: { code: string; kind: 'watch' | 'player' } | null = null;

function sock() {
  if (!socket) {
    socket = io({ transports: ['websocket', 'polling'], reconnectionDelayMax: 3000 });
    socket.on('connect', () => {
      net.connected = true;
      net.everConnected = true;
      if (ctx) reattach();
    });
    socket.on('disconnect', () => (net.connected = false));
    socket.on('room:state', (snap) => {
      net.offset = snap.serverNow - Date.now();
      net.snap = snap;
    });
    socket.on('room:kicked', () => {
      if (ctx) forgetPlayer(ctx.code);
      net.kicked = true;
      net.me = null;
    });
  }
  return socket;
}

function call<T = {}>(ev: keyof ClientToServer, payload: object = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    (sock().timeout(8000) as any).emit(ev, payload, (err: unknown, res: any) => {
      if (err) reject(new Error('Sin conexión con el servidor'));
      else if (!res?.ok) reject(new Error(res?.error ?? 'Algo ha fallado'));
      else resolve(res as T);
    });
  });
}

async function reattach() {
  if (!ctx) return;
  const s = session(ctx.code);
  try {
    if (ctx.kind === 'player' && s.token) {
      const r = await call<{ playerId: string; isHost: boolean }>('room:join', { code: ctx.code, token: s.token, hostToken: s.hostToken });
      net.me = r.playerId;
      net.isHost = r.isHost;
    } else {
      const r = await call<{ isHost: boolean }>('room:watch', { code: ctx.code, hostToken: s.hostToken });
      net.isHost = r.isHost;
    }
  } catch {
    /* la pantalla mostrará el error en la siguiente acción */
  }
}

export function serverNow() {
  return clock.now + net.offset;
}

export async function createRoom(config: GameConfig): Promise<string> {
  const r = await call<{ code: string; hostToken: string }>('room:create', { config });
  saveSession(r.code, { hostToken: r.hostToken });
  return r.code;
}

export function reset() {
  net.snap = null;
  net.me = null;
  net.isHost = false;
  net.kicked = false;
}

/** Vista sin jugador (anfitrión en TV o portátil, o pantalla de solo lectura). */
export async function watch(code: string, asHost: boolean) {
  reset();
  ctx = { code, kind: 'watch' };
  const s = session(code);
  const r = await call<{ isHost: boolean }>('room:watch', { code, hostToken: asHost ? s.hostToken : undefined });
  net.isHost = r.isHost;
  // si este dispositivo ya se unió como jugador, recuperarlo
  if (asHost && s.token) await resume(code);
  return r.isHost;
}

export async function resume(code: string): Promise<boolean> {
  const s = session(code);
  if (!s.token) return false;
  try {
    const r = await call<{ playerId: string; isHost: boolean }>('room:join', { code, token: s.token, hostToken: s.hostToken });
    ctx = { code, kind: 'player' };
    net.me = r.playerId;
    net.isHost = r.isHost;
    return true;
  } catch {
    forgetPlayer(code);
    return false;
  }
}

export async function join(code: string, name: string, avatar: string, hostToken?: string) {
  if (hostToken) saveSession(code, { hostToken });
  const s = session(code);
  const r = await call<{ token: string; playerId: string; isHost: boolean }>('room:join', {
    code,
    name,
    avatar,
    token: s.token,
    hostToken: s.hostToken
  });
  saveSession(code, { token: r.token });
  ctx = { code, kind: 'player' };
  net.kicked = false;
  net.me = r.playerId;
  net.isHost = r.isHost;
}

export const send = {
  roll: () => call('game:roll'),
  pass: () => call('game:pass'),
  target: (targetId: string) => call('game:target', { targetId }),
  direction: (dir: 'left' | 'right') => call('game:direction', { dir }),
  seatWarning: () => call('player:seatWarning'),
  leave: () => call('player:leave')
};

export const host = {
  config: (config: Partial<GameConfig>) => call('host:config', { config }),
  reorder: (ids: string[]) => call('host:reorder', { ids }),
  kick: (playerId: string) => call('host:kick', { playerId }),
  deal: () => call('host:deal'),
  start: () => call('host:start'),
  pause: () => call('host:pause'),
  resume: () => call('host:resume'),
  undo: () => call('host:undo'),
  end: () => call('host:end'),
  rematch: () => call('host:rematch')
};
