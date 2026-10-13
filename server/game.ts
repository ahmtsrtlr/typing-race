import { randomInt } from 'node:crypto';
import { createTextDeck } from './textDeck';
import type { Server, Socket } from 'socket.io';
import { countCorrectCharacters, metrics, TEXTS, validEdit } from '../shared/race';
import {
  MAX_PLAYERS,
  type Room,
  type Player,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type RaceDuration,
} from '../shared/types';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
interface InternalRoom {
  room: Room;
  inputs: Map<string, string>;
  nextText: () => string;
  ticker?: ReturnType<typeof setInterval>;
}
interface GameOptions {
  countdownMs?: number;
  tickMs?: number;
  texts?: string[];
  maxRooms?: number;
}

export function registerGame(io: GameServer, options: GameOptions = {}) {
  const rooms = new Map<string, InternalRoom>();
  const memberships = new Map<string, string>();
  const countdownMs = options.countdownMs ?? 3000;
  const tickMs = options.tickMs ?? 250;
  const texts = options.texts ?? TEXTS;
  const emitRoom = (entry: InternalRoom) => {
    entry.room.serverNow = Date.now();
    io.to(entry.room.code).emit('room:update', entry.room);
  };
  const stop = (entry: InternalRoom) => {
    clearInterval(entry.ticker);
    entry.ticker = undefined;
  };
  const finish = (entry: InternalRoom) => {
    entry.room.phase = 'finished';
    stop(entry);
    emitRoom(entry);
  };
  const find = (socket: GameSocket) => rooms.get(memberships.get(socket.id) ?? '');
  const zero = (player: Player) =>
    Object.assign(player, {
      ready: false,
      correct: 0,
      typed: 0,
      penalty: 0,
      score: 0,
      attempts: 0,
      errors: 0,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finishedAt: null,
    });
  const leave = (socket: GameSocket) => {
    const entry = find(socket);
    if (!entry) return;
    memberships.delete(socket.id);
    void socket.leave(entry.room.code);
    const room = entry.room;
    if (room.phase === 'racing' || room.phase === 'finished') {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) player.connected = false;
    } else room.players = room.players.filter((p) => p.id !== socket.id);
    const active = room.players.filter((p) => p.connected);
    if (!active.length) {
      stop(entry);
      rooms.delete(room.code);
      return;
    }
    if (room.hostId === socket.id) room.hostId = active[0].id;
    if (room.phase === 'countdown') {
      stop(entry);
      room.phase = 'lobby';
      room.startAt = null;
      room.endAt = null;
      room.players.forEach((p) => (p.ready = false));
    }
    if (room.phase === 'racing' && active.every((p) => p.finishedAt !== null)) finish(entry);
    else emitRoom(entry);
  };
  const identity = (data: unknown): { name: string; color: number } | null => {
    if (!data || typeof data !== 'object') return null;
    const v = data as Record<string, unknown>;
    if (
      typeof v.name !== 'string' ||
      !Number.isInteger(v.color) ||
      Number(v.color) < 0 ||
      Number(v.color) > 5
    )
      return null;
    const name = v.name.trim().normalize('NFC');
    if (name.length < 2 || name.length > 20 || /[\x00-\x1f\x7f]/.test(name)) return null;
    return { name, color: Number(v.color) };
  };
  const player = (socket: GameSocket, data: { name: string; color: number }): Player => ({
    id: socket.id,
    ...data,
    ready: false,
    connected: true,
    correct: 0,
    typed: 0,
    penalty: 0,
    score: 0,
    attempts: 0,
    errors: 0,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    finishedAt: null,
  });
  io.on('connection', (socket) => {
    // Per-connection burst limits. This MVP is not a competitive anti-cheat service.
    let tokens = 60;
    let lastRefill = Date.now();
    let lastAction = 0;
    const actionAllowed = () => {
      const now = Date.now();
      if (now - lastAction < 200) return false;
      lastAction = now;
      return true;
    };
    socket.on('room:create', (data, ack) => {
      if (typeof ack !== 'function') return;
      const who = identity(data);
      if (!who || ![60, 90, 120].includes(data.duration))
        return ack({ ok: false, error: 'Ad 2–20 karakter olmalı. Geçerli bir yarış süresi seç.' });
      if (!actionAllowed()) return ack({ ok: false, error: 'Biraz yavaş! Tekrar dene.' });
      if (rooms.size >= (options.maxRooms ?? 1000))
        return ack({ ok: false, error: 'Sunucu dolu. Biraz sonra tekrar dene.' });
      leave(socket);
      let code: string;
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      do {
        code = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
      } while (rooms.has(code));
      const room: Room = {
        code,
        hostId: socket.id,
        phase: 'lobby',
        duration: data.duration as RaceDuration,
        text: '',
        players: [player(socket, who)],
        startAt: null,
        endAt: null,
        serverNow: Date.now(),
      };
      const entry: InternalRoom = { room, inputs: new Map(), nextText: createTextDeck(texts) };
      rooms.set(code, entry);
      memberships.set(socket.id, code);
      void socket.join(code);
      ack({ ok: true, data: room });
      emitRoom(entry);
    });
    socket.on('room:join', (data, ack) => {
      if (typeof ack !== 'function') return;
      const who = identity(data);
      if (!who || typeof data.code !== 'string')
        return ack({ ok: false, error: 'Adını ve oda kodunu kontrol et.' });
      if (!actionAllowed()) return ack({ ok: false, error: 'Biraz yavaş! Tekrar dene.' });
      const entry = rooms.get(data.code.trim().toUpperCase());
      if (!entry) return ack({ ok: false, error: 'Bu kodla bir oda bulunamadı.' });
      if (entry.room.phase !== 'lobby')
        return ack({ ok: false, error: 'Yarış başladı. Sonraki tur için bekle.' });
      if (memberships.get(socket.id) === entry.room.code)
        return ack({ ok: true, data: entry.room });
      if (entry.room.players.length >= MAX_PLAYERS)
        return ack({ ok: false, error: 'Bu oda dolu. En fazla 6 kişi yarışabilir.' });
      leave(socket);
      entry.room.players.push(player(socket, who));
      memberships.set(socket.id, entry.room.code);
      void socket.join(entry.room.code);
      ack({ ok: true, data: entry.room });
      emitRoom(entry);
    });
    socket.on('room:leave', (ack) => {
      leave(socket);
      if (typeof ack === 'function') ack({ ok: true, data: undefined });
    });
    socket.on('player:ready', (ready, ack) => {
      if (typeof ack !== 'function') return;
      const entry = find(socket);
      if (!entry || entry.room.phase !== 'lobby' || typeof ready !== 'boolean')
        return ack({ ok: false, error: 'Lobiye dönüp tekrar dene.' });
      entry.room.players.find((p) => p.id === socket.id)!.ready = ready;
      ack({ ok: true, data: undefined });
      emitRoom(entry);
    });
    socket.on('race:start', (ack) => {
      if (typeof ack !== 'function') return;
      const entry = find(socket);
      if (!entry || entry.room.hostId !== socket.id || entry.room.phase !== 'lobby')
        return ack({ ok: false, error: 'Yarışı yalnızca oda sahibi başlatabilir.' });
      if (entry.room.players.some((p) => !p.ready))
        return ack({ ok: false, error: 'Önce tüm oyuncular hazır olmalı.' });
      const room = entry.room;
      room.phase = 'countdown';
      room.text = entry.nextText();
      room.startAt = Date.now() + countdownMs;
      room.endAt = room.startAt + room.duration * 1000;
      room.players.forEach(zero);
      entry.inputs.clear();
      ack({ ok: true, data: undefined });
      emitRoom(entry);
      entry.ticker = setInterval(() => {
        const now = Date.now();
        if (room.phase === 'countdown' && now >= room.startAt!) room.phase = 'racing';
        if (room.phase === 'racing') {
          room.players.forEach((p) => {
            if (p.finishedAt === null)
              Object.assign(
                p,
                metrics(
                  p.correct,
                  p.attempts,
                  p.errors,
                  room.text.replace(/\s/g, '').length,
                  now - room.startAt!,
                  p.typed,
                ),
              );
          });
          if (now >= room.endAt!) return finish(entry);
        }
        emitRoom(entry);
      }, tickMs);
    });
    socket.on('race:type', (value) => {
      const entry = find(socket);
      if (!entry || entry.room.phase !== 'racing') return;
      const room = entry.room;
      const now = Date.now();
      if (now >= room.endAt!) return finish(entry);
      const p = room.players.find((p) => p.id === socket.id)!;
      if (p.finishedAt !== null) return;
      const previous = entry.inputs.get(socket.id) ?? '';
      tokens = Math.min(60, tokens + (now - lastRefill) * 0.045);
      lastRefill = now;
      if (tokens < 1) {
        socket.emit('race:input', previous);
        return;
      }
      tokens--;
      if (
        typeof value !== 'string' ||
        value.length > room.text.length ||
        !validEdit(previous, value)
      ) {
        socket.emit('race:input', previous);
        socket.emit('race:error', 'Metni tek tek yaz. Yapıştırma bu yarışta kapalı.');
        return;
      }
      entry.inputs.set(socket.id, value);
      if (value.length > previous.length) {
        p.attempts++;
        if (value[value.length - 1] !== room.text[value.length - 1]) p.errors++;
      }
      p.correct = countCorrectCharacters(value, room.text);
      p.typed = value.length;
      Object.assign(
        p,
        metrics(
          p.correct,
          p.attempts,
          p.errors,
          room.text.replace(/\s/g, '').length,
          now - room.startAt!,
          p.typed,
        ),
      );
      if (p.typed === room.text.length) p.finishedAt = now;
      if (room.players.filter((p) => p.connected).every((p) => p.finishedAt !== null))
        finish(entry);
      else emitRoom(entry);
    });
    socket.on('race:reset', (ack) => {
      if (typeof ack !== 'function') return;
      const entry = find(socket);
      if (!entry || entry.room.hostId !== socket.id || entry.room.phase !== 'finished')
        return ack({ ok: false, error: 'Yeni turu oda sahibi açabilir.' });
      const room = entry.room;
      room.phase = 'lobby';
      room.text = '';
      room.startAt = null;
      room.endAt = null;
      room.players = room.players.filter((p) => p.connected);
      room.players.forEach(zero);
      entry.inputs.clear();
      ack({ ok: true, data: undefined });
      emitRoom(entry);
    });
    socket.on('disconnect', () => leave(socket));
  });
  return {
    rooms,
    close: () => {
      rooms.forEach(stop);
      rooms.clear();
      memberships.clear();
    },
  };
}
