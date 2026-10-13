import { Trophy, Crown, Check, WifiOff, Zap, Target, Route, ShieldAlert } from 'lucide-react';
import { ranking } from '../../shared/race';
import { COLORS, type Room, type Player } from '../../shared/types';
import { RunnerCharacter } from './RunnerCharacter';
export function Stats({ player }: { player?: Player }) {
  return (
    <div className="stats-grid">
      <div>
        <Zap size={17} />
        <strong>
          {player?.wpm ?? 0}
          <small> WPM</small>
        </strong>
        <span>Yazma hızı</span>
      </div>
      <div>
        <Target size={17} />
        <strong>
          {player?.accuracy ?? 100}
          <small>%</small>
        </strong>
        <span>Doğruluk</span>
      </div>
      <div>
        <Route size={17} />
        <strong>
          {player?.progress ?? 0}
          <small>%</small>
        </strong>
        <span>İlerleme</span>
      </div>
      <div className="penalty-stat">
        <ShieldAlert size={17} />
        <strong>
          −{player?.penalty ?? 0}
          <small> puan</small>
        </strong>
        <span>Hata cezası · {player?.errors ?? 0} hata</span>
      </div>
    </div>
  );
}
export function RaceSidebar({ room, playerId }: { room: Room; playerId: string }) {
  return (
    <aside className="race-sidebar">
      <section className="leaderboard-card">
        <div className="panel-header">
          <span>
            <Trophy size={17} /> Canlı sıralama
          </span>
          <span className="live-pill">CANLI</span>
        </div>
        <div className="leaderboard-list">
          {ranking(room.players).map((p, i) => (
            <div className={`leaderboard-row ${p.id === playerId ? 'is-self' : ''}`} key={p.id}>
              <span className="rank">{i + 1}</span>
              <span className="mini-avatar" style={{ background: COLORS[p.color] + '25' }}>
                <RunnerCharacter color={p.color} />
              </span>
              <div>
                <strong>
                  {p.name} {p.id === room.hostId && <Crown size={11} />}
                </strong>
                <small>
                  {!p.connected
                    ? 'Bağlantı kesildi'
                    : p.finishedAt
                      ? 'Tamamladı'
                      : `${p.progress}% tamamlandı`}
                </small>
              </div>
              {!p.connected ? (
                <WifiOff size={15} />
              ) : p.finishedAt ? (
                <Check size={17} />
              ) : (
                <span className="row-wpm">
                  {p.score}
                  <small>PUAN</small>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="tip-card">
        <span className="tip-icon">✦</span>
        <h3>Ritmini bul.</h3>
        <p>
          Hata yaptığında geri dönme. Yazmaya devam et; her hata 2 ceza puanı getirir. En yüksek net
          puan kazanır.
        </p>
        <div className="key-row">
          <kbd>Q</kbd>
          <kbd>W</kbd>
          <kbd>E</kbd>
          <kbd>R</kbd>
          <kbd>T</kbd>
          <kbd>Y</kbd>
        </div>
      </section>
      <div className="room-note">
        ODA <strong>{room.code}</strong>
        <span>En fazla 6 koşucu · aynı metin</span>
      </div>
    </aside>
  );
}
