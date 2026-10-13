export type RoomPhase = 'lobby' | 'countdown' | 'racing' | 'finished';
export type RaceDuration = 60 | 90 | 120;
export interface Player {
  id: string;
  name: string;
  color: number;
  ready: boolean;
  connected: boolean;
  correct: number;
  typed: number;
  penalty: number;
  score: number;
  attempts: number;
  errors: number;
  progress: number;
  wpm: number;
  accuracy: number;
  finishedAt: number | null;
}
export interface Room {
  code: string;
  hostId: string;
  phase: RoomPhase;
  duration: RaceDuration;
  text: string;
  players: Player[];
  startAt: number | null;
  endAt: number | null;
  serverNow: number;
}
export type Reply<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
export type Ack<T = undefined> = (reply: Reply<T>) => void;
export interface ClientToServerEvents {
  'room:create': (
    data: { name: string; color: number; duration: RaceDuration },
    ack: Ack<Room>,
  ) => void;
  'room:join': (data: { name: string; color: number; code: string }, ack: Ack<Room>) => void;
  'room:leave': (ack: Ack) => void;
  'player:ready': (ready: boolean, ack: Ack) => void;
  'race:start': (ack: Ack) => void;
  'race:type': (value: string) => void;
  'race:reset': (ack: Ack) => void;
}
export interface ServerToClientEvents {
  'room:update': (room: Room) => void;
  'race:input': (value: string) => void;
  'race:error': (message: string) => void;
}
export const COLORS = ['#ef744e', '#9b83df', '#54bca2', '#eab653', '#65a7de', '#dc83a4'];
export const MAX_PLAYERS = 6;
