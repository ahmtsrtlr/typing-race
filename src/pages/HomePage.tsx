import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, Plus, Users, Zap, Keyboard } from 'lucide-react';
import type { Game } from '../hooks/useGame';
import { RaceTrack } from '../components/RaceTrack';
import { RunnerCharacter } from '../components/RunnerCharacter';
import { Identity } from '../components/Identity';
import type { Player, RaceDuration } from '../../shared/types';
const demoPlayers: Player[] = ['Sen', 'Ada', 'Mert'].map((name, i) => ({
  id: `demo-${i}`,
  name,
  color: i,
  ready: false,
  connected: true,
  correct: 0,
  typed: 0,
  penalty: 0,
  score: 0,
  attempts: 0,
  errors: 0,
  accuracy: 100,
  progress: [38, 63, 22][i],
  wpm: 0,
  finishedAt: null,
}));
export function HomePage({
  game,
  name,
  color,
  setName,
  setColor,
}: {
  game: Game;
  name: string;
  color: number;
  setName: (v: string) => void;
  setColor: (v: number) => void;
}) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [code, setCode] = useState(new URLSearchParams(location.search).get('room') ?? '');
  const [duration, setDuration] = useState<RaceDuration>(60);
  useEffect(() => {
    if (code) setTab('join');
  }, []);
  return (
    <>
      <div className="page-heading home-heading">
        <div>
          <div className="eyebrow">
            <span /> ARKADAŞLARINLA AYNI PİSTTE
          </div>
          <h1>
            Klavyen hazırsa,
            <br />
            <span>yarış başlasın.</span>
            <svg viewBox="0 0 80 55" aria-hidden="true">
              <path d="M8 42Q38 42 52 17M42 14l15-4-1 17" />
            </svg>
          </h1>
          <p>
            Daha hızlı yaz, daha hızlı koş. Arkadaşlarını davet et,
            <br className="desktop-break" /> ritmini bul ve bitiş çizgisini ilk sen geç.
          </p>
          <div className="hero-tags">
            <span>
              <Users size={14} /> 2–6 oyuncu
            </span>
            <span>
              <Zap size={14} /> Gerçek zamanlı
            </span>
            <span>
              <Keyboard size={14} /> Türkçe metinler
            </span>
          </div>
        </div>
        <div className="hero-sticker">
          <RunnerCharacter color={color} />
          <span>
            HAYDİ,
            <br />
            BİR TUR DAHA!
          </span>
          <i>✦</i>
        </div>
      </div>
      <div className="home-grid">
        <div className="home-left">
          <RaceTrack players={demoPlayers} playerId="demo-0" phase="lobby" demo />
          <div className="how-strip">
            <div>
              <span>01</span>
              <p>
                <strong>Odanı oluştur</strong>Arkadaşlarını davet et.
              </p>
            </div>
            <ArrowRight size={16} />
            <div>
              <span>02</span>
              <p>
                <strong>Metni yaz</strong>Yaz, ilerle, puan topla.
              </p>
            </div>
            <ArrowRight size={16} />
            <div>
              <span>03</span>
              <p>
                <strong>Çizgiyi geç</strong>En iyi zamanını yap.
              </p>
            </div>
          </div>
        </div>
        <section className="entry-card">
          <div className="entry-heading">
            <span className="eyebrow">BAŞLANGIÇ NOKTASI</span>
            <h2>Pistte yerin hazır.</h2>
            <p>Bir oda, bir metin, bolca rekabet.</p>
          </div>
          <div className="entry-tabs" role="tablist" aria-label="Oda işlemi">
            <button role="tab" aria-selected={tab === 'create'} onClick={() => setTab('create')}>
              <Plus size={15} /> Oda oluştur
            </button>
            <button role="tab" aria-selected={tab === 'join'} onClick={() => setTab('join')}>
              <Users size={15} /> Odaya katıl
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (tab === 'create') game.create(name, color, duration);
              else game.join(name, color, code);
            }}
          >
            <Identity name={name} color={color} setName={setName} setColor={setColor} />
            {tab === 'create' ? (
              <>
                <label className="field-label">Yarış süresi</label>
                <div className="duration-options">
                  {([60, 90, 120] as RaceDuration[]).map((d) => (
                    <button
                      type="button"
                      key={d}
                      className={duration === d ? 'selected' : ''}
                      onClick={() => setDuration(d)}
                    >
                      {d}
                      <span>sn</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label className="field-label" htmlFor="room-code">
                  Oda kodu
                </label>
                <input
                  className="code-input"
                  id="room-code"
                  value={code}
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="ÖRN. AB3X7K"
                />
              </>
            )}
            <button
              type="submit"
              className="button primary full"
              disabled={
                !game.connected ||
                game.pending ||
                name.trim().length < 2 ||
                (tab === 'join' && code.length !== 6)
              }
            >
              {game.pending
                ? 'Bağlanıyor…'
                : tab === 'create'
                  ? 'Oluştur ve piste çık'
                  : 'Piste katıl'}
              <ArrowUpRight size={19} />
            </button>
          </form>
          <div className="entry-note">
            <span className="live-dot" /> Ücretsiz. Hesap açmana gerek yok.
          </div>
        </section>
      </div>
      <div className="practice-banner">
        <div className="practice-icon">
          <Zap size={22} />
        </div>
        <div>
          <h3>Önce biraz ısınmak ister misin?</h3>
          <p>Tek başına bir oda aç, hazır ol ve kişisel hızını ölç.</p>
        </div>
        <button
          className="button outline"
          disabled={!game.connected || game.pending || name.trim().length < 2}
          onClick={() => game.create(name, color, 60)}
        >
          Antrenman yap <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
