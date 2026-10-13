import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { io as client, type Socket } from 'socket.io-client';
import { registerGame } from '../server/game';
import type { Room, Reply, ClientToServerEvents, ServerToClientEvents } from '../shared/types';
type Client = Socket<ServerToClientEvents, ClientToServerEvents>;
async function waitFor(check: () => boolean, ms = 2000) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > ms) throw Error('Timed out waiting for game state');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
async function setup() {
  const http = createServer();
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(http);
  const game = registerGame(io, { countdownMs: 150, tickMs: 10, texts: ['İşık.'] });
  await new Promise<void>((r) => http.listen(0, '127.0.0.1', r));
  const address = http.address();
  assert.ok(address && typeof address !== 'string');
  const port = address.port;
  const sockets: Client[] = [];
  const states = new Map<Client, Room>();
  async function connect() {
    const socket: Client = client(`http://127.0.0.1:${port}`, {
      transports: ['websocket'],
      reconnection: false,
    });
    socket.on('room:update', (room) => states.set(socket, room));
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('connect_error', reject);
    });
    return socket;
  }
  async function close() {
    sockets.forEach((s) => s.disconnect());
    game.close();
    await new Promise<void>((r) => io.close(() => r()));
  }
  return { game, states, connect, close };
}
const create = (s: Client, name = 'Ahmet') =>
  new Promise<Reply<Room>>((r) => s.emit('room:create', { name, color: 0, duration: 60 }, r));
const join = (s: Client, code: string, name = 'Ada') =>
  new Promise<Reply<Room>>((r) => s.emit('room:join', { name, color: 1, code }, r));
const ready = (s: Client) => new Promise<Reply>((r) => s.emit('player:ready', true, r));
const start = (s: Client) => new Promise<Reply>((r) => s.emit('race:start', r));
const reset = (s: Client) => new Promise<Reply>((r) => s.emit('race:reset', r));

test('two real clients: create, join, readiness, countdown, error correction, finish, ranking, rematch', async () => {
  const env = await setup();
  try {
    const host = await env.connect();
    const guest = await env.connect();
    const created = await create(host);
    assert.ok(created.ok);
    const code = created.data.code;
    assert.match(code, /^[A-Z2-9]{6}$/);
    assert.ok((await join(guest, code.toLowerCase())).ok);
    await waitFor(() => env.states.get(host)?.players.length === 2);
    assert.equal((await start(guest)).ok, false);
    assert.equal((await start(host)).ok, false);
    await ready(host);
    await ready(guest);
    assert.ok((await start(host)).ok);
    await waitFor(() => env.states.get(host)?.phase === 'countdown');
    host.emit('race:type', 'İ');
    await waitFor(() => env.states.get(host)?.phase === 'racing');
    assert.equal(env.states.get(host)!.players[0].correct, 0);
    const late = await env.connect();
    assert.equal((await join(late, code)).ok, false);
    host.emit('race:type', 'X');
    await waitFor(() => env.states.get(host)?.players[0].attempts === 1);
    assert.equal(env.states.get(host)!.players[0].correct, 0);
    assert.equal(env.states.get(host)!.players[0].accuracy, 0);
    host.emit('race:type', '');
    host.emit('race:type', 'İşık.'); // Paste is rejected by the server.
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(env.states.get(host)!.players[0].correct, 0);
    let value = '';
    for (const c of 'İşık.') {
      value += c;
      host.emit('race:type', value);
    }
    await waitFor(() => env.states.get(host)?.players[0].finishedAt !== null);
    assert.equal(env.states.get(host)!.phase, 'racing');
    assert.equal(env.states.get(host)!.players[0].progress, 100);
    assert.equal(env.states.get(host)!.players[0].accuracy, 83);
    assert.equal(env.states.get(host)!.players[0].penalty, 2);
    assert.equal(env.states.get(host)!.players[0].score, 3);
    value = '';
    for (const c of 'İşık.') {
      value += c;
      guest.emit('race:type', value);
    }
    await waitFor(() => env.states.get(host)?.phase === 'finished');
    const players = env.states.get(host)!.players;
    assert.ok(players[0].finishedAt! <= players[1].finishedAt!);
    assert.equal((await reset(guest)).ok, false);
    assert.ok((await reset(host)).ok);
    await waitFor(() => env.states.get(guest)?.phase === 'lobby');
    assert.ok(
      env.states
        .get(host)!
        .players.every((p) => p.correct === 0 && !p.ready && p.finishedAt === null),
    );
  } finally {
    await env.close();
  }
});

test('unknown room, invalid identity, six-player limit and host migration', async () => {
  const env = await setup();
  try {
    const bad = await env.connect();
    assert.equal((await create(bad, 'A')).ok, false);
    assert.equal((await join(bad, 'XXXXXX')).ok, false);
    const host = await env.connect();
    const created = await create(host);
    assert.ok(created.ok);
    const clients: Client[] = [];
    for (let i = 0; i < 5; i++) {
      const s = await env.connect();
      clients.push(s);
      assert.ok((await join(s, created.data.code, `Runner ${i}`)).ok);
    }
    const overflow = await env.connect();
    assert.equal((await join(overflow, created.data.code)).ok, false);
    host.disconnect();
    await waitFor(() => env.states.get(clients[0])?.players.length === 5);
    assert.equal(env.states.get(clients[0])!.hostId, clients[0].id);
  } finally {
    await env.close();
  }
});

test('disconnect during countdown returns remaining players to lobby; empty rooms are cleaned up', async () => {
  const env = await setup();
  try {
    const host = await env.connect();
    const guest = await env.connect();
    const created = await create(host);
    assert.ok(created.ok);
    await join(guest, created.data.code);
    await ready(host);
    await ready(guest);
    await start(host);
    await waitFor(() => env.states.get(guest)?.phase === 'countdown');
    host.disconnect();
    await waitFor(
      () => env.states.get(guest)?.phase === 'lobby' && env.states.get(guest)?.hostId === guest.id,
    );
    assert.equal(env.states.get(guest)!.hostId, guest.id);
    assert.equal(env.states.get(guest)!.players[0].ready, false);
    guest.disconnect();
    await waitFor(() => env.game.rooms.size === 0);
  } finally {
    await env.close();
  }
});

test('race timeout and a mid-race disconnect retain partial results', async () => {
  const env = await setup();
  try {
    const host = await env.connect();
    const guest = await env.connect();
    const created = await create(host);
    assert.ok(created.ok);
    await join(guest, created.data.code);
    await ready(host);
    await ready(guest);
    await start(host);
    await waitFor(() => env.states.get(host)?.phase === 'racing');
    guest.emit('race:type', 'İ');
    await waitFor(() => env.states.get(host)?.players[1].correct === 1);
    guest.disconnect();
    await waitFor(() => env.states.get(host)?.players[1].connected === false);
    env.game.rooms.get(created.data.code)!.room.endAt = Date.now() - 1;
    await waitFor(() => env.states.get(host)?.phase === 'finished');
    assert.equal(env.states.get(host)!.players[1].progress, 20);
    await reset(host);
    await waitFor(() => env.states.get(host)?.phase === 'lobby');
    assert.equal(env.states.get(host)!.players.length, 1);
  } finally {
    await env.close();
  }
});

test('room isolation: progress in one race never appears in another room', async () => {
  const env = await setup();
  try {
    const a = await env.connect();
    const b = await env.connect();
    const ra = await create(a, 'Alpha');
    const rb = await create(b, 'Bravo');
    assert.ok(ra.ok && rb.ok);
    assert.notEqual(ra.data.code, rb.data.code);
    await ready(a);
    await start(a);
    await waitFor(() => env.states.get(a)?.phase === 'racing');
    a.emit('race:type', 'İ');
    await waitFor(() => env.states.get(a)?.players[0].correct === 1);
    assert.equal(env.states.get(b)!.code, rb.data.code);
    assert.equal(env.states.get(b)!.phase, 'lobby');
    assert.equal(env.states.get(b)!.players.length, 1);
    assert.equal(env.states.get(b)!.players[0].correct, 0);
  } finally {
    await env.close();
  }
});

test('an uncorrected mistake allows completion and later correct characters still score', async () => {
  const env = await setup();
  try {
    const host = await env.connect();
    await create(host);
    await ready(host);
    await start(host);
    await waitFor(() => env.states.get(host)?.phase === 'racing');
    let value = '';
    for (const c of 'Xşık.') {
      value += c;
      host.emit('race:type', value);
    }
    await waitFor(() => env.states.get(host)?.phase === 'finished');
    const p = env.states.get(host)!.players[0];
    assert.equal(p.correct, 4);
    assert.equal(p.typed, 5);
    assert.equal(p.errors, 1);
    assert.equal(p.penalty, 2);
    assert.equal(p.score, 2);
    assert.equal(p.progress, 100);
    assert.equal(p.accuracy, 80);
    assert.notEqual(p.finishedAt, null);
  } finally {
    await env.close();
  }
});
test('backspace keeps distance, does not refund penalty or duplicate points', async () => {
  const env = await setup();
  try {
    const host = await env.connect();
    await create(host);
    await ready(host);
    await start(host);
    await waitFor(() => env.states.get(host)?.phase === 'racing');
    host.emit('race:type', 'X');
    host.emit('race:type', 'Xş');
    await waitFor(() => env.states.get(host)?.players[0].typed === 2);
    const progress = env.states.get(host)!.players[0].progress;
    host.emit('race:type', 'X');
    host.emit('race:type', '');
    await waitFor(() => env.states.get(host)?.players[0].typed === 0);
    let p = env.states.get(host)!.players[0];
    assert.equal(p.progress, progress);
    assert.equal(p.score, -2);
    assert.equal(p.penalty, 2);
    host.emit('race:type', 'İ');
    host.emit('race:type', 'İş');
    await waitFor(() => env.states.get(host)?.players[0].typed === 2);
    p = env.states.get(host)!.players[0];
    assert.equal(p.progress, progress);
    assert.equal(p.score, 0);
    assert.equal(p.correct, 2);
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(env.states.get(host)!.players[0].progress, progress);
  } finally {
    await env.close();
  }
});
