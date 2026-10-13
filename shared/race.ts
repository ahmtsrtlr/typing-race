import type { Player } from './types';
export { TEXTS } from './texts';
export const ERROR_PENALTY = 2;
/** Each position is independent: one mistake does not block later characters. */
export function countCorrectCharacters(value: string, target: string): number {
  let correct = 0;
  for (let i = 0; i < value.length; i++)
    if (value[i] === target[i] && !/\s/.test(value[i])) correct++;
  return correct;
}
export function metrics(
  correct: number,
  attempts: number,
  errors: number,
  maxScore: number,
  elapsedMs: number,
  typed: number,
) {
  const penalty = errors * ERROR_PENALTY;
  const score = correct - penalty;
  return {
    typed,
    penalty,
    score,
    progress: maxScore > 0 ? Math.max(0, Math.min(100, Math.floor((score / maxScore) * 100))) : 0,
    wpm: elapsedMs > 0 ? Math.round(correct / 5 / (elapsedMs / 60000)) : 0,
    accuracy: attempts > 0 ? Math.round(((attempts - errors) / attempts) * 100) : 100,
  };
}
export function ranking(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.finishedAt !== null && b.finishedAt !== null) return a.finishedAt - b.finishedAt;
    if (a.finishedAt !== null) return -1;
    if (b.finishedAt !== null) return 1;
    return b.correct - a.correct || b.accuracy - a.accuracy || b.wpm - a.wpm;
  });
}
/** Allow one append or one backspace; prevent paste and fabricated progress. */
export function validEdit(previous: string, next: string): boolean {
  return (
    (next.length === previous.length + 1 && next.startsWith(previous)) ||
    (next.length === previous.length - 1 && previous.startsWith(next))
  );
}
