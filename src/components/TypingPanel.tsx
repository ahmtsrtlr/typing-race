import { useEffect, useLayoutEffect, useRef } from 'react';
import { Keyboard, ShieldAlert, LockKeyhole } from 'lucide-react';
import { ERROR_PENALTY, validEdit } from '../../shared/race';
import type { RoomPhase } from '../../shared/types';
// Compare viewport rectangles; offsetTop can refer to different parent elements.
function followCursor(panel: HTMLDivElement | null, cursor: HTMLSpanElement | null) {
  if (!panel || !cursor) return;
  const panelRect = panel.getBoundingClientRect();
  const cursorRect = cursor.getBoundingClientRect();
  const lineTop = panel.scrollTop + cursorRect.top - panelRect.top - panel.clientTop;
  const top = Math.max(
    0,
    Math.min(panel.scrollHeight - panel.clientHeight, lineTop - panel.clientHeight * 0.25),
  );
  if (Math.abs(panel.scrollTop - top) > 1) panel.scrollTop = top;
}
interface Props {
  text: string;
  value: string;
  phase: RoomPhase;
  finished: boolean;
  onType: (value: string) => void;
}
export function TypingPanel({ text, value, phase, finished, onType }: Props) {
  const input = useRef<HTMLTextAreaElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const targetPanel = useRef<HTMLDivElement>(null);
  const disabled = phase !== 'racing' || finished;
  useEffect(() => {
    if (!disabled && window.matchMedia('(min-width: 761px)').matches) input.current?.focus();
  }, [disabled]);
  useLayoutEffect(() => {
    followCursor(targetPanel.current, cursor.current);
  }, [value, text]);
  useEffect(() => {
    const panel = targetPanel.current;
    if (!panel) return;
    const follow = () => followCursor(panel, cursor.current);
    const observer = new ResizeObserver(follow);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [text]);
  useEffect(() => {
    if (input.current) input.current.scrollTop = input.current.scrollHeight;
  }, [value]);
  return (
    <section className="typing-card">
      <div className="panel-header">
        <span>
          <Keyboard size={17} /> {finished ? 'Bitiş çizgisini geçtin!' : 'Sıra parmaklarında'}
        </span>
        <span className="small-label">KÜÇÜK HARF · İŞARETSİZ</span>
      </div>
      <div
        ref={targetPanel}
        className="target-text"
        style={{ scrollBehavior: 'auto' }}
        aria-label="Yazılacak metin"
      >
        {[...text].map((char, i) => (
          <span
            key={i}
            ref={i === Math.min(value.length, text.length - 1) ? cursor : undefined}
            className={
              i < value.length
                ? char === value[i]
                  ? 'char-correct'
                  : 'char-wrong'
                : i === value.length
                  ? 'char-cursor'
                  : ''
            }
          >
            {char}
          </span>
        ))}
      </div>
      {!disabled && (
        <button className="mobile-focus-button" onClick={() => input.current?.focus()}>
          <Keyboard size={16} /> Klavyeyi aç ve yazmaya başla
        </button>
      )}
      <label className="sr-only" htmlFor="race-input">
        Yarış metnini buraya yaz
      </label>
      <textarea
        id="race-input"
        ref={input}
        value={value}
        disabled={disabled}
        rows={2}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        inputMode="text"
        enterKeyHint="done"
        placeholder={
          phase === 'countdown'
            ? 'Hazırlan… yarış birazdan başlayacak.'
            : finished
              ? 'Harika! Diğer koşucular bekleniyor.'
              : 'Metni buraya yazmaya başla…'
        }
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
        onChange={(e) => {
          const next = e.target.value.normalize('NFC');
          if (next.length <= text.length && validEdit(value, next)) onType(next);
        }}
        onSelect={(e) => {
          const target = e.currentTarget;
          const end = target.value.length;
          if (target.selectionStart !== end || target.selectionEnd !== end)
            target.setSelectionRange(end, end);
        }}
      />
      <div className="typing-footer">
        <span>
          <ShieldAlert size={13} /> Hata −{ERROR_PENALTY} puan. Durmadan devam et.
        </span>
        <span>
          <LockKeyhole size={12} /> Yapıştırma kapalı
        </span>
      </div>
    </section>
  );
}
