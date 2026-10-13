import { Check } from 'lucide-react';
import { COLORS } from '../../shared/types';
export function Identity({
  name,
  color,
  setName,
  setColor,
}: {
  name: string;
  color: number;
  setName: (name: string) => void;
  setColor: (color: number) => void;
}) {
  return (
    <>
      <label className="field-label" htmlFor="player-name">
        Pistteki adın
      </label>
      <div className="name-field">
        <input
          id="player-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="Adını yaz"
        />
        <span>{name.length}/20</span>
      </div>
      <div className="character-picker">
        <span>Rengini seç</span>
        <div>
          {COLORS.map((c, i) => (
            <button
              type="button"
              aria-label={`Koşucu rengi ${i + 1}`}
              aria-pressed={color === i}
              className={color === i ? 'selected' : ''}
              style={{ background: c }}
              onClick={() => setColor(i)}
              key={c}
            >
              {color === i && <Check size={15} />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
