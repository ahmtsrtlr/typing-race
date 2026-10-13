import { useState } from 'react';
import {
  Users,
  Plus,
  Crown,
  Check,
  Timer,
  Keyboard,
  Flag,
  LogOut,
  Copy,
  Sparkles,
} from 'lucide-react';
import type { Game } from '../hooks/useGame';
import { RaceTrack } from '../components/RaceTrack';
import { RunnerCharacter } from '../components/RunnerCharacter';
export function LobbyPage({ game }: { game: Game }) {
  const room = game.room!;
  const self = room.players.find((p) => p.id === game.playerId)!;
  const host = room.hostId === game.playerId;
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">
          <span /> YARIŞ LOBİSİ
        </div>
        <h1>
          Ekibini topla.
          <br />
          <span>Birlikte hızlan.</span>
        </h1>
        <p>Oda kodunu paylaş. Herkes hazır olduğunda yarış başlasın.</p>
      </div>
      <div className="game-grid">
        <div>
          <RaceTrack players={room.players} playerId={game.playerId} phase="lobby" />
          <section className="lobby-players">
            <div className="panel-header">
              <span>
                <Users size={17} /> Koşucular
              </span>
              <span className="small-label">{room.players.length}/6 OYUNCU</span>
            </div>
            <div className="lobby-player-grid">
              {room.players.map((p) => (
                <div className="lobby-player" key={p.id}>
                  <span className="lobby-avatar">
                    <RunnerCharacter color={p.color} />
                  </span>
                  <div>
                    <strong>
                      {p.name} {p.id === room.hostId && <Crown size={13} />}
                    </strong>
                    <small>{p.id === game.playerId ? 'Sen' : 'Koşucu'}</small>
                  </div>
                  <span className={p.ready ? 'ready-badge' : 'waiting-badge'}>
                    {p.ready ? (
                      <>
                        <Check size={12} /> Hazır
                      </>
                    ) : (
                      'Bekliyor'
                    )}
                  </span>
                </div>
              ))}
              {room.players.length < 6 && (
                <div className="empty-player">
                  <Plus size={18} /> Bir arkadaşını davet et
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="lobby-controls">
          <section className="invite-card">
            <span className="eyebrow">DAVET BİLETİN</span>
            <h2>Aynı kod, aynı pist.</h2>
            <p>
              Arkadaşların ana sayfadaki
              <br /> “Odaya katıl” alanını kullanabilir.
            </p>
            <button className="invite-code" onClick={copy} aria-label="Oda kodunu kopyala">
              <strong>{room.code}</strong>
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
            <span className="copy-note" aria-live="polite">
              {copied ? 'Kod kopyalandı!' : 'Kopyalamak için koda tıkla'}
            </span>
            <div className="lobby-details">
              <span>
                <Timer size={15} /> Yarış süresi<strong>{room.duration} saniye</strong>
              </span>
              <span>
                <Keyboard size={15} /> Metin dili<strong>Türkçe</strong>
              </span>
            </div>
            <button
              className={`button full ${self.ready ? 'ready-button' : 'primary'}`}
              disabled={game.pending}
              onClick={() => game.ready(!self.ready)}
            >
              {self.ready ? (
                <>
                  <Check size={17} /> Hazırım · değiştirmek için tıkla
                </>
              ) : (
                'Hazırım!'
              )}
            </button>
            {host ? (
              <button
                className="button dark full"
                disabled={game.pending || !room.players.every((p) => p.ready)}
                onClick={game.start}
              >
                Yarışı başlat <Flag size={17} />
              </button>
            ) : (
              <p className="waiting-note">Yarışı oda sahibi başlatacak.</p>
            )}
            <button className="button subtle full" disabled={game.pending} onClick={game.leave}>
              <LogOut size={15} /> Odadan ayrıl
            </button>
          </section>
          <div className="tip-card compact">
            <Sparkles size={19} />
            <p>
              {room.players.length === 1
                ? 'Tek başına da yarışabilirsin. Hazır ol ve başlat!'
                : 'Herkes aynı metni yazar. Doğruluk en az hız kadar önemli.'}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
