import { Server } from 'socket.io';
import { createHttpServer } from './http';
import { registerGame } from './game';
import type { ClientToServerEvents, ServerToClientEvents } from '../shared/types';
const server = createHttpServer();
const origins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((s) => s.trim());
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: origins },
  maxHttpBufferSize: 4096,
});
const game = registerGame(io);
const port = Number(process.env.PORT ?? 3001);
server.listen(port, '0.0.0.0', () => console.log(`Typing Race server: http://localhost:${port}`));
function shutdown() {
  game.close();
  io.close();
  server.close();
}
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
