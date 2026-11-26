import type { GameConfig, GameState, Direction } from './game';

export interface RoomSnapshot {
  code: string;
  state: GameState;
  serverNow: number;
  hostPlayerId?: string;
  canUndo: boolean;
}

export type Ack<T = {}> = (res: ({ ok: true } & T) | { ok: false; error: string }) => void;

export interface ClientToServer {
  'room:create': (p: { config: Partial<GameConfig> }, ack: Ack<{ code: string; hostToken: string }>) => void;
  'room:watch': (p: { code: string; hostToken?: string }, ack: Ack<{ isHost: boolean }>) => void;
  'room:join': (
    p: { code: string; name?: string; avatar?: string; token?: string; hostToken?: string },
    ack: Ack<{ token: string; playerId: string; isHost: boolean }>
  ) => void;
  'host:config': (p: { config: Partial<GameConfig> }, ack: Ack) => void;
  'host:reorder': (p: { ids: string[] }, ack: Ack) => void;
  'host:kick': (p: { playerId: string }, ack: Ack) => void;
  'host:deal': (p: {}, ack: Ack) => void;
  'host:start': (p: {}, ack: Ack) => void;
  'host:pause': (p: {}, ack: Ack) => void;
  'host:resume': (p: {}, ack: Ack) => void;
  'host:undo': (p: {}, ack: Ack) => void;
  'host:end': (p: {}, ack: Ack) => void;
  'host:skip': (p: {}, ack: Ack) => void;
  'host:rematch': (p: {}, ack: Ack) => void;
  'game:roll': (p: {}, ack: Ack) => void;
  'game:target': (p: { targetId: string }, ack: Ack) => void;
  'game:direction': (p: { dir: Direction }, ack: Ack) => void;
  'player:seatWarning': (p: {}, ack: Ack) => void;
  'player:leave': (p: {}, ack: Ack) => void;
}

export interface ServerToClient {
  'room:state': (snap: RoomSnapshot) => void;
  'room:kicked': () => void;
}
