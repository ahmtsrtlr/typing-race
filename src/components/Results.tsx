import { Trophy, RotateCcw, ArrowLeft, Medal } from 'lucide-react';
import { ranking } from '../../shared/race';
import type { Game } from '../hooks/useGame';
import { RunnerCharacter } from './RunnerCharacter';
export function Results({ game }: { game: Game }) {
  const room = game.room!;
  const players = ranking(room.players);
  const winner = players[0];
  const position = players.findIndex((p) => p.id === game.playerId) + 1;
  return (
    <section className="results-card">
      <div className="result-celebration">
        <span className="result-star star-one">✦</span>
        <span className="result-star star-two">✧</span>
        <Trophy size={34} />
        <h2>{players.length === 1 ? 'Güzel bir antrenmandı!' : `${winner.name} kazandı!`}</h2>
        <p>
          {players.length === 1
            ? 'Her turda biraz daha hızlan.'
            : `Pistte ${position}. oldun. Yeni bir tura hazır mısın?`}
        </p>
        <RunnerCharacter color={winner.color} />
      </div>
      <p className="score-rule">
        Net puan = doğru karakter − hata cezası. Eşit puanda önce bitiren öne geçer.
      </p>
      <div className="results-table">
        <div className="results-table-head">
          <span>KOŞUCU</span>
          <span>NET PUAN</span>
          <span>CEZA</span>
          <span>WPM</span>
          <span>DOĞRULUK</span>
          <span>İLERLEME</span>
        </div>
        {players.map((p, i) => (
          <div
            className={`results-table-row ${p.id === game.playerId ? 'is-self' : ''}`}
            key={p.id}
          >
            <span>
              <b>{i === 0 ? <Medal size={18} /> : i + 1}</b>
              {p.name}
              {p.id === game.playerId && <small>SEN</small>}
            </span>
            <strong data-label="Net puan">{p.score}</strong>
            <span className="result-penalty" data-label="Ceza">
              −{p.penalty}
            </span>
            <span data-label="WPM">{p.wpm}</span>
            <span data-label="Doğruluk">{p.accuracy}%</span>
            <span data-label="İlerleme">
              {p.progress}%{!p.connected && <small> · ayrıldı</small>}
            </span>
          </div>
        ))}
      </div>
      <div className="result-actions">
        {room.hostId === game.playerId ? (
          <button className="button primary" onClick={game.reset} disabled={game.pending}>
            <RotateCcw size={17} /> Bir tur daha
          </button>
        ) : (
          <span>Yeni tur için oda sahibi bekleniyor…</span>
        )}
        <button className="button subtle" onClick={game.leave} disabled={game.pending}>
          <ArrowLeft size={16} /> Ana sayfa
        </button>
      </div>
    </section>
  );
}
