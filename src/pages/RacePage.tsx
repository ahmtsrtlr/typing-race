import { useEffect } from 'react';
import { Timer, LogOut } from 'lucide-react';
import type { Game } from '../hooks/useGame';
import { useClock } from '../hooks/useClock';
import { useMobileKeyboard } from '../hooks/useMobileKeyboard';
import { playTone } from '../lib/audio';
import { RaceTrack } from '../components/RaceTrack';
import { RaceSidebar, Stats } from '../components/RaceSidebar';
import { TypingPanel } from '../components/TypingPanel';
import { Results } from '../components/Results';
export function RacePage({ game, sound }: { game: Game; sound: boolean }) {
  const keyboardOpen = useMobileKeyboard();
  const room = game.room!;
  const now = useClock() + game.clockOffset;
  const self = room.players.find((p) => p.id === game.playerId);
  const count = Math.max(1, Math.ceil(((room.startAt ?? now) - now) / 1000));
  const remaining = Math.max(0, Math.ceil(((room.endAt ?? now) - now) / 1000));
  const seconds = room.phase === 'countdown' ? room.duration : remaining;
  useEffect(() => {
    if (sound && room.phase === 'countdown') {
      try {
        playTone();
      } catch {
        /* Browser can block audio until user interaction. */
      }
    }
  }, [count, room.phase, sound]);
  return (
    <section className={`race-page ${keyboardOpen ? 'keyboard-open' : ''}`}>
      <div className="race-heading">
        <div>
          <div className="eyebrow">
            <span />{' '}
            {room.phase === 'countdown'
              ? 'YERİNİ AL'
              : room.phase === 'finished'
                ? 'YARIŞ TAMAMLANDI'
                : 'PİST SENİN'}
          </div>
          <h1>{room.phase === 'finished' ? 'Harika bir yarıştı.' : 'Ritmini bul. Çizgiyi geç.'}</h1>
        </div>
        <div className="race-timer">
          <Timer size={22} />
          <div>
            <span>KALAN SÜRE</span>
            <strong>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
            </strong>
          </div>
        </div>
      </div>
      <div className="game-grid">
        <div className="race-main">
          <div className="track-wrap">
            <RaceTrack players={room.players} playerId={game.playerId} phase={room.phase} />
            {room.phase === 'countdown' && (
              <div className="countdown-overlay" role="status">
                <span>PARMAKLAR KLAVYEYE!</span>
                <strong key={count}>{count}</strong>
                <p>Hazır… Dikkat…</p>
              </div>
            )}
          </div>
          <Stats player={self} />
          {room.phase === 'finished' ? (
            <Results game={game} />
          ) : (
            <TypingPanel
              text={room.text}
              value={game.value}
              phase={room.phase}
              finished={self?.finishedAt !== null && self?.finishedAt !== undefined}
              onType={game.type}
            />
          )}
        </div>
        <RaceSidebar room={room} playerId={game.playerId} />
      </div>
      <div className="race-exit">
        <button className="button subtle" onClick={game.leave} disabled={game.pending}>
          <LogOut size={14} /> Yarıştan ayrıl
        </button>
        <span>WPM = doğru harf / 5 / geçen dakika</span>
      </div>
    </section>
  );
}
