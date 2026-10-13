import { Flag, Crown } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Player, RoomPhase } from '../../shared/types';
import { COLORS } from '../../shared/types';
import { ranking } from '../../shared/race';
import { RunnerCharacter } from './RunnerCharacter';
function Scenery() {
  return (
    <svg
      className="scenery"
      viewBox="0 0 1000 180"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <rect width="1000" height="180" fill="#eaf4ed" />
      <circle cx="844" cy="48" r="27" fill="#f9d787" />
      <g fill="#fff" opacity=".88">
        <path d="M119 56a18 18 0 0133-10 24 24 0 0143 12h-80Z" />
        <path d="M603 38a15 15 0 0128-9 18 18 0 0132 11h-69Z" />
      </g>
      <path
        d="M0 150Q105 49 237 147Q391 41 541 155Q710 71 839 152Q926 104 1000 152V180H0Z"
        fill="#cbded0"
      />
      <path d="M0 174Q177 114 327 165Q580 105 747 170Q898 129 1000 164V180H0Z" fill="#b4d0b5" />
      <g stroke="#648c73" strokeWidth="4" fill="#8ab396">
        <path d="M64 160V115" />
        <path d="M37 125L64 72L91 125Z" />
        <path d="M916 164V115" />
        <path d="M887 128L916 65L944 128Z" />
        <path d="M955 174V134" />
        <path d="M934 142L955 96L977 142Z" />
      </g>
      <g stroke="#648b70" strokeWidth="2" opacity=".4">
        <path d="M137 170l5-10 6 10m638-5 5-10 7 10" />
      </g>
      <path d="M301 173V124m397 49V124M301 126H698" fill="none" stroke="#7f9b84" strokeWidth="3" />
      <path
        d="M307 128l13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18 13 18 14-18"
        fill="none"
        stroke="#e9ad61"
        strokeWidth="8"
      />
    </svg>
  );
}
export function TrackLane({
  player,
  index,
  self,
  phase,
  leader,
}: {
  player: Player;
  index: number;
  self: boolean;
  phase: RoomPhase;
  leader: boolean;
}) {
  const running =
    phase === 'racing' && player.finishedAt === null && player.connected && player.wpm > 0;
  return (
    <div className={`track-lane ${self ? 'my-lane' : ''}`}>
      <span className="lane-number">0{index + 1}</span>
      <div className="lane-road">
        <div className="runner-position" style={{ left: `${player.progress}%` } as CSSProperties}>
          <div
            className="runner-label"
            style={{ '--player-color': COLORS[player.color] } as CSSProperties}
          >
            {leader && player.correct > 0 && <Crown size={11} />} {player.name}
            {self && <span> SEN</span>}
          </div>
          <RunnerCharacter color={player.color} running={running} wpm={player.wpm} />
          {running && <span className="speed-lines">≋</span>}
        </div>
      </div>
      <span className="lane-stat">
        {player.progress}
        <small>%</small>
      </span>
    </div>
  );
}
export function RaceTrack({
  players,
  playerId,
  phase,
  demo = false,
}: {
  players: Player[];
  playerId: string;
  phase: RoomPhase;
  demo?: boolean;
}) {
  const leader = ranking(players)[0]?.id;
  return (
    <section className="track-card" aria-label="Koşu pisti">
      <div className="track-top">
        <span>
          <span className="live-dot" />
          {demo
            ? 'PİSTE BİR GÖZ AT'
            : phase === 'lobby'
              ? 'KOŞUCULAR YERİNİ ALIYOR'
              : phase === 'finished'
                ? 'BİTİŞ ÇİZGİSİ'
                : 'YARIŞ PİSTİ'}
        </span>
        <span>
          <Flag size={13} /> {demo ? 'Örnek görünüm' : `${players.length} koşucu`}
        </span>
      </div>
      <div className="stadium">
        <Scenery />
        <div className="stadium-sign">TYPE FAST. RUN FASTER.</div>
        <div className="finish-banner">
          FINISH <Flag size={12} />
        </div>
      </div>
      <div className="track-ground">
        <div className="finish-line" />
        {players.map((player, i) => (
          <TrackLane
            key={player.id}
            player={player}
            index={i}
            self={player.id === playerId}
            phase={phase}
            leader={player.id === leader}
          />
        ))}
      </div>
      <div className="track-bottom">
        <span>BAŞLANGIÇ</span>
        <span>DOĞRU HARFLER PUAN KAZANDIRIR.</span>
        <span>
          BİTİŞ <Flag size={12} />
        </span>
      </div>
    </section>
  );
}
