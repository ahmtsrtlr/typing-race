import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Flag,
  Volume2,
  VolumeX,
  X,
  Wifi,
  WifiOff,
  BookOpen,
} from 'lucide-react';
import { useGame } from './hooks/useGame';
import { RunnerCharacter } from './components/RunnerCharacter';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { RacePage } from './pages/RacePage';
import { COLORS } from '../shared/types';
export default function App() {
  const game = useGame();
  const [name, setName] = useState(() => localStorage.getItem('typing-race-name') ?? 'Ahmet');
  const [color, setColor] = useState(() => {
    const v = Number(localStorage.getItem('typing-race-color'));
    return Number.isInteger(v) && v >= 0 && v < 6 ? v : 0;
  });
  const [sound, setSound] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    localStorage.setItem('typing-race-name', name);
    localStorage.setItem('typing-race-color', String(color));
  }, [name, color]);
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="nav-inner">
          <a className="brand" href="/" aria-label="Typing Race ana sayfa">
            <span className="brand-icon">
              <Flag size={22} />
            </span>
            typing<span>race</span>
            <small>⌁</small>
          </a>
          <nav>
            <button
              className={game.room ? '' : 'active'}
              onClick={() => {
                if (!game.room) window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Yarış pisti
            </button>
            <button onClick={() => setHelp(true)}>
              Nasıl oynanır? <ArrowUpRight size={13} />
            </button>
          </nav>
          <div className="nav-right">
            <span className={`connection-status ${game.connected ? '' : 'offline'}`}>
              {game.connected ? <Wifi size={13} /> : <WifiOff size={13} />}
              <span>{game.connected ? 'Sunucuya bağlı' : 'Bağlanıyor'}</span>
            </span>
            <button
              className="icon-button"
              aria-label={sound ? 'Sesi kapat' : 'Sesi aç'}
              aria-pressed={sound}
              onClick={() => setSound(!sound)}
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <span className="user-avatar" style={{ background: COLORS[color] + '28' }}>
              <RunnerCharacter color={color} />
            </span>
          </div>
        </div>
      </header>
      <main className="main-content">
        {game.error && (
          <div role="alert" className="error-banner">
            <span>{game.error}</span>
            <button aria-label="Uyarıyı kapat" onClick={game.clearError}>
              <X size={16} />
            </button>
          </div>
        )}
        {!game.room ? (
          <HomePage game={game} name={name} color={color} setName={setName} setColor={setColor} />
        ) : game.room.phase === 'lobby' ? (
          <LobbyPage game={game} />
        ) : (
          <RacePage game={game} sound={sound} />
        )}
      </main>
      <footer>
        <span className="footer-brand">
          <Flag size={13} /> typingrace
        </span>
        <span>Azıcık rekabet. Bolca eğlence.</span>
        <span>
          KLAVYE BAŞINDA, PİSTTE GİBİ. <span className="footer-spark">✦</span>
        </span>
      </footer>
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              autoFocus
              onClick={() => setHelp(false)}
              aria-label="Yardımı kapat"
            >
              <X size={20} />
            </button>
            <BookOpen size={28} />
            <h2 id="help-title">Bir metin. Bir pist.</h2>
            <ol>
              <li>Adını ve koşucu rengini seç. Oda oluştur ya da 6 karakterlik kodla katıl.</li>
              <li>Arkadaşlarınla hazır ol. Oda sahibi yarışı başlatsın.</li>
              <li>Geri sayımdan sonra metni yaz. Tüm metinler küçük harfli ve noktalamasızdır.</li>
              <li>
                Yanlış yazsan da devam et. Her doğru harf +1, her hata −2 puan. Boşluklar puan
                kazandırmaz; koşucunun konumu net puana göre değişir.
              </li>
              <li>En yüksek net puan kazanır. Eşit puanda önce bitiren öne geçer.</li>
            </ol>
            <p>
              WPM, beş doğru harfi bir kelime sayar. Doğruluk, tüm yazma denemelerindeki doğru
              karakter oranıdır; silinen hatalar da hesaba katılır.
            </p>
            <button className="button primary full" onClick={() => setHelp(false)}>
              Tamam, piste çıkalım <ArrowRight size={17} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
