import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Room,
  Reply,
  RaceDuration,
} from '../../shared/types';
type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export function useGame() {
  const socketRef = useRef<GameSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState('');
  const [error, setError] = useState('');
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [clockOffset, setClockOffset] = useState(0);
  const phaseRef = useRef<Room['phase'] | null>(null);
  useEffect(() => {
    const socket: GameSocket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
      autoConnect: false,
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);
      setPlayerId(socket.id ?? '');
    });
    socket.on('disconnect', () => {
      setConnected(false);
      setRoom(null);
      setValue('');
      setError('Bağlantı kesildi. Yeniden bağlandığında odaya tekrar katılabilirsin.');
    });
    socket.on('connect_error', () => {
      setConnected(false);
      setError('Sunucuya ulaşılamıyor. Node.js sunucusunun çalıştığını kontrol et.');
    });
    socket.on('room:update', (next) => {
      setClockOffset(next.serverNow - Date.now());
      if (phaseRef.current !== next.phase && (next.phase === 'lobby' || next.phase === 'countdown'))
        setValue('');
      phaseRef.current = next.phase;
      setRoom(next);
    });
    socket.on('race:input', setValue);
    socket.on('race:error', setError);
    socket.connect();
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
  const run = (emit: (socket: GameSocket, done: (reply: Reply) => void) => void) => {
    const socket = socketRef.current;
    if (!socket?.connected || pending) {
      if (!socket?.connected) setError('Önce sunucu bağlantısını bekle.');
      return;
    }
    setPending(true);
    setError('');
    const timer = window.setTimeout(() => {
      setPending(false);
      setError('Sunucu yanıt vermedi. Tekrar dene.');
    }, 6000);
    emit(socket, (reply) => {
      clearTimeout(timer);
      setPending(false);
      if (!reply.ok) setError(reply.error);
    });
  };
  return {
    connected,
    room,
    playerId,
    error,
    value,
    pending,
    clockOffset,
    clearError: () => setError(''),
    create: (name: string, color: number, duration: RaceDuration) =>
      run((s, done) =>
        s.emit('room:create', { name, color, duration }, (reply) => {
          if (reply.ok) {
            setRoom(reply.data);
            setClockOffset(reply.data.serverNow - Date.now());
            setValue('');
            done({ ok: true, data: undefined });
          } else done(reply);
        }),
      ),
    join: (name: string, color: number, code: string) =>
      run((s, done) =>
        s.emit('room:join', { name, color, code }, (reply) => {
          if (reply.ok) {
            setRoom(reply.data);
            setClockOffset(reply.data.serverNow - Date.now());
            setValue('');
            done({ ok: true, data: undefined });
          } else done(reply);
        }),
      ),
    leave: () =>
      run((s, done) =>
        s.emit('room:leave', (reply) => {
          if (reply.ok) {
            setRoom(null);
            setValue('');
          }
          done(reply);
        }),
      ),
    ready: (ready: boolean) => run((s, done) => s.emit('player:ready', ready, done)),
    start: () => run((s, done) => s.emit('race:start', done)),
    reset: () => run((s, done) => s.emit('race:reset', done)),
    type: (next: string) => {
      setValue(next);
      socketRef.current?.emit('race:type', next);
    },
  };
}
export type Game = ReturnType<typeof useGame>;
