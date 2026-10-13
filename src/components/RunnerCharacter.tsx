import type { CSSProperties } from 'react';
import { COLORS } from '../../shared/types';
interface Props {
  color: number;
  running?: boolean;
  wpm?: number;
  className?: string;
}
export function RunnerCharacter({ color, running = false, wpm = 35, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 100 108"
      aria-hidden="true"
      className={`runner ${running ? 'is-running' : ''} ${className}`}
      style={{ '--stride': `${Math.max(0.2, 0.85 - wpm / 160)}s` } as CSSProperties}
    >
      <ellipse cx="51" cy="101" rx="25" ry="4" fill="#27382b" opacity=".12" />
      <g
        className="runner-body"
        stroke="#293932"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g className="leg leg-back">
          <path d="M49 71 L35 85 L23 88" fill="none" strokeWidth="8" />
          <path d="M24 85 L17 88 Q14 95 22 95 L32 94" fill="#fff7e9" />
        </g>
        <g className="leg leg-front">
          <path d="M55 72 L68 86 L77 93" fill="none" strokeWidth="8" />
          <path d="M77 90 L85 93 Q92 98 84 100 L72 99" fill="#fff7e9" />
        </g>
        <path d="M44 44 L32 59 L21 51" fill="none" stroke="#e2a578" strokeWidth="8" />
        <path d="M45 41 Q59 40 62 56 L59 74 Q46 80 36 69 L40 53Z" fill={COLORS[color % 6]} />
        <path d="M43 68 L59 68 L58 78 L43 77Z" fill="#314a44" />
        <path d="M58 48 L68 61 L81 52" fill="none" stroke="#f1bb8c" strokeWidth="8" />
        <rect x="44" y="34" width="12" height="11" rx="5" fill="#f1bb8c" />
        <path
          d="M35 17 Q39 4 53 7 Q69 8 70 24 L75 29 L68 33 Q67 43 55 41 Q35 39 35 17Z"
          fill="#f1bb8c"
        />
        <path d="M34 22 Q27 6 45 3 Q58 -1 65 9 L60 15 L50 12 L43 24Z" fill="#3f4035" />
        <path d="M61 24 L63 24" />
        <path d="M60 34 Q64 36 67 32" fill="none" strokeWidth="2" />
        <path d="M38 17 Q43 12 48 13" fill="none" stroke={COLORS[color % 6]} strokeWidth="5" />
      </g>
    </svg>
  );
}
